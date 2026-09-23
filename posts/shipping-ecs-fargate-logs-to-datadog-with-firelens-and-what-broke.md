---
title: Shipping ECS Fargate logs to Datadog with FireLens (and what broke)
date: 2025-10-20T00:00:00.000Z
author: Tyrel Delaney
tags:
  - aws
  - ecs
  - fargate
  - datadog
  - firelens
  - fluent-bit
  - logging
  - observability
  - platform
hero: >-
  /images/posts/shipping-ecs-fargate-logs-to-datadog-with-firelens-and-what-broke-ecs-fargate-logs-hero.png
excerpt: >-
  Getting logs out of ECS Fargate and into Datadog with FireLens took about
  twenty lines of Terraform and worked on the first deploy. Then every log
  arrived as INFO and I couldn't find our tags anywhere. A week to sort both
  out. One was a real bug, one was me, and for months I gave the credit to the
  wrong fix.
project: '[[superflux.dev]]'
draft: true
outline: '[[Article outline - ECS Fargate logs to Datadog with FireLens]]'
---
# Shipping ECS Fargate logs to Datadog with FireLens (and what broke)

This past June I set up log shipping from ECS Fargate to Datadog using FireLens. It worked on the first deploy. Then I spent a week chasing two problems with it, and months later I found out I'd been wrong about what fixed one of them.

![Shipping ECS Fargate logs to Datadog with FireLens heading on a dark background](shipping-ecs-fargate-logs-to-datadog-with-firelens-and-what-broke-ecs-fargate-logs-hero.png)

## Tl;dr

[The setup](#The%20setup): A new Go API on ECS Fargate, and three ways to get its logs into Datadog.
[The happy path](#The%20happy%20path): About twenty lines of Terraform for the log router and the app's log config.
[Breakage #1: our tags weren't applied (except they were)](#Breakage%20%231%3A%20our%20tags%20weren't%20applied%20(except%20they%20were)): I filed a bug on myself for mixing up tags and attributes.
[Breakage #2: every log is INFO](#Breakage%20%232%3A%20every%20log%20is%20INFO): We logged the HTTP status code as `status`, which is a reserved attribute. Datadog read `200` as a severity.
[What I'd do differently](#What%20I'd%20do%20differently): Grep for reserved attribute names, and prove each log level on day one.
[So what did I learn?](#So%20what%20did%20I%20learn%3F)
[Resources and links](#Resources%20and%20links)

## The setup

I was standing up the platform side of a new Go API on ECS Fargate. Small team, SOC2 coming up, and we needed to see what the thing was doing in production. We already used Datadog, so the only question was how to get the logs there:

* Run the Datadog agent as a sidecar in every task. Well documented, but it's a second container to size, patch, and pay for in every task definition.
* Ship logs straight from our custom logger to [Datadog's HTTP intake endpoint](https://docs.datadoghq.com/logs/log_collection/?tab=http#additional-configuration-options). Tempting, but then our code owns retries, batching, and backpressure to a third party, and logging is the thing you want working *most* when everything else is broken.
* Use [AWS FireLens](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html), ECS's built-in log routing on Fluent Bit, with Datadog as the output plugin.

We went with FireLens. [AWS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html) and [Datadog](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#log-collection) both point you at it for Fargate, it lives entirely in the task definition (so it's Terraform, not application code), and the application keeps writing JSON to stdout.

Logs were flowing on a Wednesday. That Saturday I filed two bugs against my own setup, and both were closed the following Thursday, so about a week from "it works" to "it actually works". Understanding why took a few more months.

## The happy path

FireLens is a log *router*. You add an `aws-for-fluent-bit` container to your task definition, mark it as the FireLens container, and point your application container's log driver at it. Your app keeps writing to stdout, and Fluent Bit forwards it to Datadog's intake.

The log router container, in Terraform:

```hcl
{
  name              = "datadog_log_router"
  image             = var.aws_for_fluent_bit_image   # pinned to a specific tag
  essential         = true
  cpu               = floor(var.cpu * var.log_router_container_resource_ratio)
  memoryReservation = floor(var.memory * var.log_router_container_resource_ratio)
  firelensConfiguration = {
    type    = "fluentbit"
    options = { enable-ecs-log-metadata = "true" }
  }
  user = "0"
}
```

`enable-ecs-log-metadata` attaches the ECS context (cluster, task ARN, task definition family, container name) to every log line. It defaults to on, but I'd rather state that default than rediscover it when it's missing.

The resource ratio is the part I couldn't find in any of the docs, which happily show a FireLens container with no CPU or memory on it at all. We give the log router a fixed fraction of whatever the main container gets, so a beefy task gets a beefy log router and a small one doesn't waste reservation. It's not sophisticated, but we never had to think about it again.

The app container's log configuration is where the Datadog behaviour lives:

```hcl
logConfiguration = {
  logDriver = "awsfirelens"
  options = {
    "Name"           = "datadog"
    "Host"           = var.datadog_host
    "dd_service"     = var.dd_service
    "dd_source"      = "ecs-task"
    "dd_tags"        = "environment:${terraform.workspace},stack:platform"
    "dd_message_key" = "log"
    "TLS"            = "on"
    "provider"       = "ecs"
  }
  secretOptions = [
    {
      name      = "apikey"
      valueFrom = "${local.datadog_api_key_secret_arn}:api_key::"
    }
  ]
}
```

The API key lives in Secrets Manager and ECS injects it through `secretOptions`, so it never lands in the task definition JSON or in state. The `:api_key::` suffix pulls a single key out of a JSON secret: the format is `<arn>:<json-key>:<version-stage>:<version-id>`, and the trailing colons are the empty version fields. It's in the [AWS docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html), but it's easy to skim past, and getting it wrong gives you a container that won't start with a message about the secret, not the format.

Logs showed up in Datadog within minutes. It really was that easy, until Saturday.

## Breakage #1: our tags weren't applied (except they were)

`dd_tags` was setting `environment:<workspace>` and `stack:platform` on every log, and as far as I could tell in the Datadog UI, neither was there. We run two products in one Datadog org, and tags were how we'd separate them in dashboards, monitors, and eventually access. If tags didn't work, the whole logging story was blocked.

So I filed a bug. I was looking at the *Attributes* section of the log side panel, and tags are in the *Tags* section. They'd been applied the whole time. Five days later I closed it with a comment that amounts to "oh, this already works, I was looking at the wrong panel."

Datadog does make this easy to get wrong, because it splits log metadata into two things that look identical when you're new to it.

Tags are infrastructure-level metadata: `dd_tags`, the ECS metadata from `enable-ecs-log-metadata`, `service`, `source`, `env`. They share a namespace with your metrics and traces, which is what lets you pivot from a log to a dashboard. You query them bare, like `env:prod`.

Attributes are the parsed contents of your JSON log body, whatever your logger emitted. You query them with an `@` prefix, like `@env:prod`.

Ten minutes of poking at the log panel would have saved me the ticket.

## Breakage #2: every log is INFO

Every log line arrived in Datadog as INFO, warnings and errors included. The status facet showed exactly one value, no monitor on `status:error` could fire, and the error rate graph was a flat line at zero, which looks like good news right up until you find out what it means.

My hunch, written into the ticket, was that Datadog reads severity from an attribute called `status`, while Go's `slog.NewJSONHandler` emits `"level":"INFO"`. Different key, so everything defaults to INFO. We renamed the key, the severities came back, I closed the ticket, and that was the week.

That explanation is wrong, and I only found out months later while writing this up.

### What the docs actually say

Datadog [preprocesses JSON logs](https://docs.datadoghq.com/logs/log_configuration/pipelines/#preprocessing) before your pipelines see them. On status, it says:

> if a JSON formatted log file includes one of the following attributes, Datadog interprets its value as the log's official status: `status`, `severity`, `level`, `syslog.severity`

`level` is in that list, and it was before our incident. Our preprocessing config is stock, so Go's default `slog` output was always going to be read correctly. What actually made everything INFO is in two details of the docs that are easy to read past.

First, the list is ordered, and the order *is* the precedence. I'd read it as a set. Preprocessing takes the *first* of those attributes it finds, so with both `status` and `level` present, `level` is never consulted.

Second, unrecognized values don't fail, they become INFO. From the [Log Status Remapper docs](https://docs.datadoghq.com/logs/log_configuration/processors/log_status_remapper/), integers 0 through 7 map to Syslog severities, and "All others map to info (6)." A *missing* `status` sends the search on to `severity`, then `level`. A `status` that's present but unreadable ends the search right there, at INFO. Nothing errors, and nothing tells you Datadog didn't understand your value.

### The actual root cause

Our HTTP request logger did this:

```go
slog.Int("status", 200)
```

That's the HTTP status code, in the reserved attribute, on every request log. Preprocessing found `status`, read `200`, which isn't in 0-7, mapped it to INFO, and stopped looking. `level` was sitting right there in the same log line, correctly populated, and never got read.

It stayed quiet because an HTTP status code is a *plausible* integer, just never a valid Syslog severity. `200`, `404`, and `500` all map to INFO, so a 500 logged at the same severity as a 200, and a 500 is exactly what you'd want to alert on.

### The fix, and the half of it that did nothing

The PR shipped two changes:

```go
// The change we credited: rename slog's severity key to `status`.
stdoutHandler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
		if a.Key == slog.LevelKey {
			a.Key = "status"
		}
		return a
	},
})

// The change that actually fixed it: stop squatting on the reserved attribute.
slog.Int("status_code", 200)   // was: slog.Int("status", 200)
```

The second one is the fix. With the HTTP code moved to `status_code`, preprocessing found no `status`, fell through to `level`, and read `"INFO"` / `"WARN"` / `"ERROR"` exactly as documented.

The `ReplaceAttr` block does nothing, because `level` was already supported, and it makes our output less portable by emitting a non-standard severity key. It's eight lines that should be deleted.

Both changes shipped together, the symptom went away, and the rename got the credit for months because it was the more interesting-looking change. We had a working fix and a wrong mental model, and nothing in the system was ever going to correct us.

We also considered a Datadog Status Remapper processor pointed at `level`, or a Fluent Bit filter renaming the key before it ships. Both add configuration to work around a problem we created in the application, while fixing the squatted attribute is one line.

### Grep your logger for these

Datadog reserves these attribute names and aliases, and silently prefers them over whatever you meant:

| Reserved | Aliases it also reads |
| --- | --- |
| `status` | `severity`, `level`, `syslog.severity` |
| `message` | `msg`, `log` |
| `service` | `syslog.appname`, `dd.service` |
| `host` | `syslog.hostname`, `dd.host` |
| `timestamp` | `date`, `_timestamp`, `published_date` |
| `trace_id` | `dd.trace_id`, `contextMap.dd.trace_id` |

`status` is the one that bites, because it's the obvious name for an HTTP status code. But `message`, `host`, and `date` are all names a reasonable logger emits for reasonable reasons. Grep your logging code for every one of these before your first deploy. It takes two minutes, and the alternative is a monitor that silently never fires.

If you got here from the symptom, Datadog has a guide: [Logs show INFO status for warnings or errors](https://docs.datadoghq.com/logs/guide/logs-show-info-status-for-warnings-or-errors/). It states the default: "By default, when Datadog's Intake API receives a log, an `INFO` status generates and appends itself as the `status` attribute."

## What I'd do differently

* Grep for reserved attribute names before the first deploy. It's the highest-value thing on this list.
* Verify every log level on day one. Emit a DEBUG, INFO, WARN and ERROR as soon as logs flow, and confirm all four in the UI. I found this three days late because "logs are showing up" felt like done.
* Decide your retention before you need it. We dual-wrote to CloudWatch and Datadog at first, paying twice for the same lines, and landed on 30 days in Datadog. That window is also why I couldn't audit this later: by the time I checked whether the rename had done anything, the original logs were gone, and I had to reconstruct it from the diff and the docs.
* Know when direct HTTP is the better answer. FireLens is the right default for Fargate because it's declarative and lives outside your application. If you're somewhere ECS doesn't reach, or need something a Fluent Bit output plugin doesn't support, Datadog's HTTP intake is right there. Just know your application now owns log delivery.

## So what did I learn?

The integration was twenty lines of config. The hard part was the semantics: which metadata is a tag and which is an attribute, and who owns the word `status`. Datadog won't tell you it preferred a different attribute than the one you meant, and a fix that ships next to the real one will take the credit for months, because the symptom went away and nobody had a reason to look closer.

So distrust the pipeline until you've personally seen one WARN and one tag in the UI. And when the symptom clears, make sure you know *which* change cleared it.

## Resources and links

* [Datadog: ECS Fargate log collection](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#log-collection)
* [AWS: Custom log routing with FireLens](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html)
* [AWS: Specifying sensitive data with Secrets Manager](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html)
* [Datadog: Preprocessing for JSON logs](https://docs.datadoghq.com/logs/log_configuration/pipelines/#preprocessing)
* [Datadog: Log Status Remapper](https://docs.datadoghq.com/logs/log_configuration/processors/log_status_remapper/)
* [Datadog: Logs show INFO status for warnings or errors](https://docs.datadoghq.com/logs/guide/logs-show-info-status-for-warnings-or-errors/)
* [Datadog: Log collection over HTTP](https://docs.datadoghq.com/logs/log_collection/?tab=http#additional-configuration-options)
