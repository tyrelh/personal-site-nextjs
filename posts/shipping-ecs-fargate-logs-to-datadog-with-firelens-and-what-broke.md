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

This past June I set up log shipping from ECS Fargate to Datadog using FireLens. The config worked on the first deploy. Then I spent a week chasing two problems with it, and months later I found out I'd been wrong about the cause of one of them.

![Shipping ECS Fargate logs to Datadog with FireLens heading on a dark background](shipping-ecs-fargate-logs-to-datadog-with-firelens-and-what-broke-ecs-fargate-logs-hero.png)

## Tl;dr

[The setup](#The%20setup): A new Go API on ECS Fargate, and three ways to get its logs into Datadog.
[The happy path](#The%20happy%20path): The Terraform for the FireLens log router and the app container's log config. About twenty lines.
[Breakage #1: our tags weren't applied (except they were)](#Breakage%20%231%3A%20our%20tags%20weren't%20applied%20(except%20they%20were)): I filed a bug on myself. Tags and attributes are two different things in the Datadog log panel.
[Breakage #2: every log is INFO](#Breakage%20%232%3A%20every%20log%20is%20INFO): We logged the HTTP status code as `status`, which is a reserved attribute. Datadog read `200` as a severity and gave up.
[What I'd do differently](#What%20I'd%20do%20differently): Grep your logger for reserved attribute names, and prove each log level works on day one.
[So what did I learn?](#So%20what%20did%20I%20learn%3F)
[Resources and links](#Resources%20and%20links)

## The setup

In June I was standing up the platform side of a new Go API running on ECS Fargate. Small team, SOC2 coming up, and we needed to see what the thing was doing in production.

We were already using Datadog, so the destination was decided. The question was how to get the logs there. There were three options on the table:

* Run the Datadog agent as a sidecar in every task. This works and is well documented, but it means a second container to size, patch, and pay for in every single task definition.
* Ship logs directly from our own logger over [Datadog's HTTP intake endpoint](https://docs.datadoghq.com/logs/log_collection/?tab=http#additional-configuration-options). We have a custom logger, so this was tempting. It also means our application code owns retries, batching, and backpressure to a third party. Logging is the thing you want working *most* when everything else is broken.
* Use [AWS FireLens](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html), which is ECS's built-in log routing built on Fluent Bit, with Datadog as the output plugin.

We went with FireLens. It's what both [AWS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html) and [Datadog](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#log-collection) point you at for Fargate, it's configured entirely in the task definition (so it's Terraform, not application code), and the application just writes JSON to stdout like it always did.

Logs were flowing on a Wednesday in June. I filed two bugs against my own setup that Saturday, and both were closed the following Thursday, so it took about a week to get from "it works" to "it actually works". Understanding why took a few more months.

## The happy path

FireLens is a log *router*. You add a second container to your task definition running the `aws-for-fluent-bit` image, mark it as a FireLens container, and then point your application container's log driver at it. ECS wires the two together. Your app keeps writing to stdout, and Fluent Bit picks it up and forwards it to Datadog's intake.

Here's the log router container, in Terraform:

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

Two things worth calling out there.

`enable-ecs-log-metadata` is what attaches the ECS context (cluster, task ARN, task definition family, container name) to every log line. It defaults to on, but it's the kind of default I'd rather state explicitly than rediscover when it's missing.

The resource ratio is the part I didn't find in any of the docs. They'll happily show you a FireLens container with no CPU or memory on it at all. We give the log router a fixed fraction of whatever the main container gets, so a beefy task gets a beefy log router and a small one doesn't waste reservation. It's not a sophisticated model, but it means we never had to think about it again.

And here's the application container's log configuration, which is where all the actual Datadog behaviour lives:

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

The API key goes in Secrets Manager and gets injected by ECS through `secretOptions`, so it never lands in the task definition JSON or in state. Note the `:api_key::` suffix on the ARN. That's ECS pulling a single key out of a JSON secret. The format is `<arn>:<json-key>:<version-stage>:<version-id>`, and the trailing colons are the empty version fields. It's in the [AWS docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html), but it's easy to skim past and hard to debug when you get it wrong, because the failure mode is a container that won't start with a message about the secret, not about the format.

I deployed this on the Wednesday and logs showed up in Datadog within minutes. It really was that easy, right up until Saturday, when I filed two bugs.

## Breakage #1: our tags weren't applied (except they were)

The symptom: I couldn't find my tags. `dd_tags` in the FireLens config was setting `environment:<workspace>` and `stack:platform` on every log, and as far as I could tell in the Datadog UI, neither was there.

This mattered more than a missing tag sounds like it should. We run two products in one Datadog org, and tags were the separation strategy, how we'd scope dashboards, monitors, and eventually access. If tags didn't work, the whole logging story was blocked.

So I filed a bug. The root cause: I was looking at the *Attributes* section of the log side panel, and tags are in the *Tags* section. The tags had been applied the whole time. The ticket got closed five days later with a comment from me that amounts to "oh, this already works, I was looking at the wrong panel."

I'm including this because the confusion underneath it is real even if the bug wasn't. Datadog splits log metadata into two things that look identical when you're new to it.

Tags are infrastructure-level metadata. `dd_tags`, the ECS metadata that `enable-ecs-log-metadata` attaches, `service`, `source`, `env`. They're the same tag namespace your metrics and traces use, which is the whole point, because it's what lets you pivot from a log to a dashboard. You query them bare, like `env:prod`.

Attributes are the parsed contents of your JSON log body. Whatever your logger emitted. You query those with an `@` prefix, like `@env:prod`.

So there are two panels and two query syntaxes, and a config that's working perfectly can look broken if you're reading the wrong one. That's a UI thing rather than anything to do with FireLens, and ten minutes of poking at the log panel would have saved me the ticket.

## Breakage #2: every log is INFO

Every log line arriving in Datadog had a status of INFO. Warnings, errors, all of them. The status facet showed exactly one value. Any monitor on `status:error` would never fire, and the error rate graph on our dashboard was a flat line at zero, which looks like good news right up until you find out what it means.

My hunch at the time, written directly into the ticket, was that Datadog reads severity from an attribute called `status`, and Go's `slog.NewJSONHandler` emits `"level":"INFO"`. Different key, so Datadog ignores it, so everything defaults to INFO. Rename the key and we're done.

We renamed the key, the logs came back with the right severities, I closed the ticket, and that was the week.

That explanation is wrong. I only found out much later, when I went back through this to write it up.

### What the docs actually say

Datadog runs a [preprocessing step for JSON logs](https://docs.datadoghq.com/logs/log_configuration/pipelines/#preprocessing) before any of your pipelines see them. On status, it says:

> if a JSON formatted log file includes one of the following attributes, Datadog interprets its value as the log's official status: `status`, `severity`, `level`, `syslog.severity`

`level` is in that list. It was in that list before our incident. Our org's preprocessing config is stock and unmodified. So Go's default `slog` output, `"level":"INFO"`, was always going to be read correctly by Datadog with no configuration on our part at all.

So why was everything INFO?

Two things in the docs explain it, and both are easy to read straight past.

First, the list is ordered. Preprocessing takes the *first* of those attributes it finds. `status` is first and `level` is third, so if both are present, `level` is never consulted.

Second, unrecognized values don't fail, they become INFO. From the [Log Status Remapper docs](https://docs.datadoghq.com/logs/log_configuration/processors/log_status_remapper/), integers 0 through 7 map to Syslog severities, and "All others map to info (6)." Note that this is different from the attribute being missing. A missing `status` means the search continues down the list to `severity`, then `level`. A `status` that's present but holds a value Datadog can't read ends the search right there, at INFO. You get no error and no fallback, and nothing anywhere tells you Datadog looked at your value and didn't understand it.

### The actual root cause

Our HTTP request logger did this:

```go
slog.Int("status", 200)
```

That's the HTTP status code, in the reserved attribute, on every single request log.

So preprocessing found `status`, which is first in the list. It read `200`, which is not in 0-7. It mapped that to INFO and stopped looking. `level` was sitting right there in the same log line, correctly populated, and never got read.

This was so quiet because an HTTP status code is a *plausible* integer. Datadog has no reason to think anything is wrong with it, it just happens to never be a valid Syslog severity. `200`, `404`, and `500` all map to INFO identically, so a 500 response and a 200 response produced log lines with the same severity, and a 500 is exactly the case you'd want to alert on.

### The fix, and the half of it that did nothing

The PR that fixed this shipped two changes:

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

The second one is the fix. Once the HTTP status code moved to `status_code`, preprocessing no longer found a `status` attribute, fell through to `level`, and read `"INFO"` / `"WARN"` / `"ERROR"` exactly as documented.

The `ReplaceAttr` block does nothing useful, because `level` was already supported. It also makes our log output slightly less portable, since we're now emitting a non-standard key name for severity to satisfy a requirement that was never real. It's eight lines that should be deleted.

Both changes shipped together, the symptom went away, and the rename got the credit for months because it was the more interesting-looking change. We had a working fix and a wrong mental model at the same time, and nothing in the system was ever going to correct us.

We did consider a couple of cheaper fixes that we didn't end up needing: a Datadog Status Remapper processor pointed at `level`, or a Fluent Bit filter renaming the key before it ships. Both of those are configuration added to work around a problem we created in the application. Fixing the squatted attribute is one line and no new moving parts.

### Grep your logger for these

Datadog reserves a set of attribute names, each with its own alias list, and silently prefers them over whatever you intended:

| Reserved | Aliases it also reads |
| --- | --- |
| `status` | `severity`, `level`, `syslog.severity` |
| `message` | `msg`, `log` |
| `service` | `syslog.appname`, `dd.service` |
| `host` | `syslog.hostname`, `dd.host` |
| `timestamp` | `date`, `_timestamp`, `published_date` |
| `trace_id` | `dd.trace_id`, `contextMap.dd.trace_id` |

`status` is the one that bites, because it's such an obvious name for an HTTP status code that you'll write it without thinking. But `message`, `host`, and `date` are all names a reasonable logger emits for reasonable reasons.

Grep your logging code for every one of these before your first deploy. It takes two minutes, and the alternative is a monitor that silently never fires.

If you land here from the symptom rather than the cause, Datadog has a guide for exactly this: [Logs show INFO status for warnings or errors](https://docs.datadoghq.com/logs/guide/logs-show-info-status-for-warnings-or-errors/). It states the default plainly: "By default, when Datadog's Intake API receives a log, an `INFO` status generates and appends itself as the `status` attribute."

## What I'd do differently

* Grep for reserved attribute names before the first deploy. I covered this above, but it's the single highest-value thing on this list.
* Verify on day one with one log line at each level. Emit a DEBUG, an INFO, a WARN and an ERROR from the application as the very first thing after logs start flowing, and confirm all four in the UI. I found this three days late because "logs are showing up" felt like done.
* Learn the tags versus attributes split before filing a bug against yourself. It would have spared me some embarrassment.
* Read past the attribute list to the attribute order. The documentation is correct and complete. It lists the four attributes, and the order *is* the precedence. I read that list as a set.
* Decide your retention before you need it. We were dual-writing to CloudWatch and Datadog for a while, paying twice for the same lines, and landed on a 30-day Datadog retention. That retention window is also why I couldn't audit this later. By the time I went back to check whether the rename had actually done anything, the original logs were long gone and I had to reconstruct it from the diff and the docs.
* Know when direct HTTP is the better answer. FireLens is the right default for Fargate because it's declarative and lives outside your application. But if you're running somewhere ECS doesn't reach, or you need to do something at ship time that a Fluent Bit output plugin doesn't support, Datadog's HTTP intake is right there. Just keep in mind that "our application now owns log delivery" is a real cost, and you should be taking it on deliberately.

## So what did I learn?

The integration itself is about twenty lines of config and it worked on the first deploy. The hard part was the semantics: which metadata is a tag and which is an attribute, and who owns the word `status`.

Only one of the two was a real failure, and it was silent: Datadog doesn't tell you it preferred a different attribute than the one you meant, or that it read a value it didn't understand. The other was me reading the wrong panel while the config worked fine. And a fix that ships next to the real fix will happily take the credit for months, because the symptom went away and nobody had a reason to look closer.

So distrust the pipeline until you've personally seen one WARN and one tag in the UI. And when the symptom clears, make sure you know *which* change cleared it.

## Resources and links

* [Datadog: ECS Fargate log collection](https://docs.datadoghq.com/integrations/ecs_fargate/?tab=webui#log-collection)
* [AWS: Custom log routing with FireLens](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_firelens.html)
* [AWS: Specifying sensitive data with Secrets Manager](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html)
* [Datadog: Preprocessing for JSON logs](https://docs.datadoghq.com/logs/log_configuration/pipelines/#preprocessing)
* [Datadog: Log Status Remapper](https://docs.datadoghq.com/logs/log_configuration/processors/log_status_remapper/)
* [Datadog: Logs show INFO status for warnings or errors](https://docs.datadoghq.com/logs/guide/logs-show-info-status-for-warnings-or-errors/)
* [Datadog: Log collection over HTTP](https://docs.datadoghq.com/logs/log_collection/?tab=http#additional-configuration-options)
