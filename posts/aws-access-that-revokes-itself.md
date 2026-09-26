---
title: AWS access that revokes itself
date: 2026-05-09T00:00:00.000Z
author: Tyrel Delaney
tags:
  - aws
  - iam
  - security
  - lambda
  - python
  - terraform
  - infrastructure-as-code
  - access-control
hero: >-
  /images/posts/aws-access-that-revokes-itself-hero-aws-access-that-revokes-itself.png
excerpt: >-
  How I built a system that automatically revokes access to AWS Roles after a period. This replaces me having to remember to manually revoke access when it's no longer needed, reducing toil.
project: '[[superflux.dev]]'
outline: '[[Blog outline - AWS self-expiring role access]]'
---

# AWS access that revokes itself

## Tl;dr

- [The admin role everyone had](#the-admin-role-everyone-had): Every engineer had standing admin access in every AWS account, so nobody could say who should have been able to reach our secrets.
- [What we wanted](#what-we-wanted): Remove standing admin access without making anyone's day slower. Admins still grant elevated access, and all of it lives in Terraform.
- [Step one: find out what people actually use](#step-one-find-out-what-people-actually-use): We listed every workflow that used the admin role and found most daily work needed very little of it.
- [Step two: scoped roles for the 95%](#step-two-scoped-roles-for-the-95): Everyday work moved to a developer group and a few dedicated roles, and local dev stopped needing admin.
- [Step three: a grant Lambda with an expiry date](#step-three-a-grant-lambda-with-an-expiry-date): An admin runs a Lambda that adds someone to an elevated IAM group and tags them with the date it expires.
- [Step four: the revoke Lambda](#step-four-the-revoke-lambda): A second Lambda runs daily and removes anyone whose expiry date has passed.
- [Step five: the Terraform](#step-five-the-terraform): Both functions and their daily schedule, with an execution role that can only change group memberships and user tags.
- [Rolling it out without a fire](#rolling-it-out-without-a-fire): We deployed the new permissions first, moved the repos off the old role, and only then revoked standing access. Nobody's workflow broke.
- [How it turned out](#how-it-turned-out): The audit question has an answer now and engineers hit fewer MFA prompts. The catch is that every grant still waits on an admin.

![Simple visual with the title of the article on the left and a id access badge with a ticking clock on the right](aws-access-that-revokes-itself-hero-aws-access-that-revokes-itself.png)

## The admin role everyone had

During an internal review, someone asked a simple question: what role was used to access our secrets, and should the person who used it have had it?

We couldn't answer it. Every engineer on the team had standing access to a broad admin role, `AdminRole`, in every AWS account we run: local, staging, and production. The answer to "which role" was always the same one, and the answer to "should they have it" was "well, everyone does."

The admin role was the path of least resistance. Local dev scripts, secrets management, and one-off fixes all relied on assuming it. It worked, which made it easy to leave alone.

We require MFA to assume these roles in production, but with every engineer holding admin everywhere, a compromised laptop made a compromised production account a lot more likely.

Granting someone access by hand in the console is easy. Remembering to take it away again is much harder.

## What we wanted

We set a few goals before changing anything.

The biggest one was to not slow anyone down. The goal I wrote in a standup note early on was that the transition should be invisible, or that the dev experience should be better.

We weren't getting rid of the admin role itself. `AdminRole` still exists as a privileged role. What we wanted to remove was standing access to it, so that most people don't have it, and don't need it, for their daily work.

When someone does need elevated access, an admin should be able to grant it quickly. Granting stays with admins who have elevated IAM access. I wanted less toil, and the approval model was fine as it was.

Everything had to live in Terraform so it's auditable in git.

And it had to work across our multi-account AWS Organization. Ideally you could get access to one account without getting all of them.

## Step one: find out what people actually use

Before touching a single permission, we documented every workflow that used the admin role: local dev, integration tests, ECR pushes, bastion host access, and secrets creation and rotation.

Most daily work needed only a small fraction of what the admin role allowed. That isn't surprising in hindsight, but you can't scope roles you haven't measured, and this audit ended up being most of the work.

## Step two: scoped roles for the 95%

With the list in hand, the everyday work got its own permissions. Engineers got an initial set of `DeveloperGroup` permissions for day-to-day work, and each concern got a dedicated role: a bastion host access role, a secrets admin role (`SecretsAdminRole`), and per-service ECS roles.

Then we refactored the app repos, API and frontend, so local development no longer needed the admin role at all.

That covers most days. The rest of this post is about the other days, when someone legitimately needs more access.

## Step three: a grant Lambda with an expiry date

An admin still grants every elevation. That didn't change, and it isn't meant to. What changed is how. Instead of clicking through the console, the admin invokes a Lambda function, and one invocation adds the user to an elevated IAM group and records when that membership expires.

### How access is structured

Roles carry the privileged policies. Each elevated group grants `sts:AssumeRole` on one or more of those roles, so joining a group is what lets you assume them.

Groups are scoped to specific sub-accounts. You can be granted secrets access in staging without getting it in production, or the other way around. The IAM users, the groups, and both Lambdas live in one account, and the groups reach into the other accounts through the roles they can assume.

### How a grant is stored

A grant is two things in IAM:

- A group membership, visible in the AWS console like any other.
- A tag on the IAM user in the form `GroupExpiry-<group-name>: <expiry-date>`, one per elevated group.

There's no database or other state to keep in sync. IAM holds all of it.

### Invoking it

The function takes three inputs: `user_name`, `group_name` (the group, which decides which roles the user can assume), and `expiry_date`. Only our admin roles are allowed to invoke it, which you'll see in the Terraform below.

We have a small helper script in our infrastructure repo, next to the role and policy definitions, that makes the call easier. The grant still runs in AWS; the script only triggers it. Without the helper, a grant looks like this:

```bash
aws lambda invoke \
  --function-name <project>-grant-group-membership \
  --cli-binary-format raw-in-base64-out \
  --payload '{"user_name": "jane", "group_name": "StagingSecretsAdminGroup", "expiry_date": "2026-10-03"}' \
  response.json
```

In practice, engineers ask for privileged access in a dedicated Slack channel, and an admin runs the grant. Durations range from a couple of days to a month or more, depending on the project work that needs it.

This isn't self-serve, and that's on purpose. A person with IAM rights stays in the loop for every grant. The function removes the toil of granting, and the expiry removes the need to remember to revoke. Access decays by default instead of accumulating by default.

### The grant function

The function validates its inputs (date format, a date in the future, and that the user and group exist), tags the user, then adds them to the group. Granting again to someone who's already a member just moves their expiry date.

```python
import datetime
import os
import boto3

TAG_PREFIX = os.environ["TAG_PREFIX"]
iam = boto3.client("iam")

def handler(event, context):
    user_name = event.get("user_name")
    group_name = event.get("group_name")
    expiry_date_str = event.get("expiry_date")

    if not all([user_name, group_name, expiry_date_str]):
        raise ValueError(
            "Missing required fields. Expected: user_name, group_name, expiry_date"
        )

    try:
        expiry_date = datetime.date.fromisoformat(expiry_date_str)
    except ValueError:
        raise ValueError(
            f"Invalid date format: {expiry_date_str}. Use YYYY-MM-DD"
        )

    today = datetime.date.today()
    if expiry_date <= today:
        raise ValueError(
            f"Expiry date {expiry_date_str} must be in the future (today is {today})"
        )

    try:
        iam.get_user(UserName=user_name)
    except iam.exceptions.NoSuchEntityException:
        raise ValueError(f"IAM user '{user_name}' does not exist")

    try:
        iam.get_group(GroupName=group_name)
    except iam.exceptions.NoSuchEntityException:
        raise ValueError(f"IAM group '{group_name}' does not exist")

    user_groups = iam.list_groups_for_user(UserName=user_name)["Groups"]
    already_member = any(g["GroupName"] == group_name for g in user_groups)
    tag_key = f"{TAG_PREFIX}{group_name}"
    iam.tag_user(
        UserName=user_name,
        Tags=[{"Key": tag_key, "Value": expiry_date_str}],
    )

    iam.add_user_to_group(GroupName=group_name, UserName=user_name)

    action = "Updated" if already_member else "Added"
    message = (
        f"{action} user '{user_name}' in group '{group_name}' "
        f"with expiry {expiry_date_str}"
    )
    print(message)

    return {
        "statusCode": 200,
        "message": message,
        "user_name": user_name,
        "group_name": group_name,
        "expiry_date": expiry_date_str,
        "was_already_member": already_member,
    }
```

## Step four: the revoke Lambda

A second Lambda does the revoking, and EventBridge runs it once a day.

It lists every IAM user and looks for tags starting with `GroupExpiry-`. If a tag's date is today or earlier, it takes the group name from the tag key and removes the user from that group. Then it deletes the tag so the next run doesn't process it again.

It also handles two messy cases. If an admin already removed the user by hand, the function logs it, cleans up the tag, and moves on. A tag with a malformed date gets logged and skipped, so one bad tag doesn't stop the whole run.

```python
import datetime
import os
import boto3

TAG_PREFIX = os.environ["TAG_PREFIX"]
iam = boto3.client("iam")

def handler(event, context):
    today = datetime.date.today()
    results = {"revoked": [], "errors": [], "checked_users": 0}

    paginator = iam.get_paginator("list_users")
    for page in paginator.paginate():
        for user in page["Users"]:
            user_name = user["UserName"]
            results["checked_users"] += 1
            tags_response = iam.list_user_tags(UserName=user_name)
            tags = tags_response["Tags"]

            for tag in tags:
                if not tag["Key"].startswith(TAG_PREFIX):
                    continue

                group_name = tag["Key"][len(TAG_PREFIX):]
                expiry_date_str = tag["Value"]

                try:
                    expiry_date = datetime.date.fromisoformat(expiry_date_str)
                except ValueError:
                    print(
                        f"WARNING: Invalid expiry date tag on user "
                        f"'{user_name}': {tag['Key']}={tag['Value']}"
                    )
                    results["errors"].append({
                        "user": user_name,
                        "tag": tag["Key"],
                        "error": "invalid date format",
                    })
                    continue

                if expiry_date <= today:
                    try:
                        iam.remove_user_from_group(
                            GroupName=group_name,
                            UserName=user_name,
                        )
                        print(
                            f"REVOKED: Removed user '{user_name}' from group "
                            f"'{group_name}' (expired {expiry_date_str})"
                        )
                    except iam.exceptions.NoSuchEntityException:
                        print(
                            f"INFO: User '{user_name}' was not in group "
                            f"'{group_name}' (already removed)"
                        )

                    iam.untag_user(
                        UserName=user_name,
                        TagKeys=[tag["Key"]],
                    )
                    print(
                        f"CLEANUP: Removed tag '{tag['Key']}' from user "
                        f"'{user_name}'"
                    )
                    results["revoked"].append({
                        "user": user_name,
                        "group": group_name,
                        "expired": expiry_date_str,
                    })

    print(
        f"SUMMARY: Checked {results['checked_users']} users, "
        f"revoked {len(results['revoked'])} memberships, "
        f"{len(results['errors'])} errors"
    )

    return results
```

## Step five: the Terraform

All of this lives in the same infrastructure repo as our roles and policies, so adding a new elevated role is a pull request.

The Terraform creates:

- The grant and revoke Lambdas, each packaged from a single Python file with `archive_file`.
- One execution role and policy, shared by both functions.
- Resource-based permissions that let `IAMManagementRole` and `AdminRole` invoke both functions.
- An EventBridge rule that runs the revoke Lambda daily.

The execution role can only manage group memberships and user tags. It can't create users, edit policies, or touch roles.

```hcl
data "aws_caller_identity" "current" {}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.project}-lambda-policy"
  description = "Permissions for IAM group expiry Lambda functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "IAMGroupMembershipManagement"
        Effect = "Allow"
        Action = [
          "iam:AddUserToGroup",
          "iam:RemoveUserFromGroup",
          "iam:ListGroupsForUser",
          "iam:GetUser",
          "iam:GetGroup"
        ]
        Resource = "*"
      },
      {
        Sid    = "IAMUserTagManagement"
        Effect = "Allow"
        Action = [
          "iam:TagUser",
          "iam:UntagUser",
          "iam:ListUserTags"
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/*"
      },
      {
        Sid    = "IAMListUsers"
        Effect = "Allow"
        Action = [
          "iam:ListUsers"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}
```

Next is the grant function and the roles allowed to invoke it. This is what "only admins can grant" means in practice: if you can't assume one of these roles, you can't call the function.

```hcl
data "archive_file" "grant_lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/grant_group_membership.py"
  output_path = "${path.module}/.build/grant_group_membership.zip"
}

resource "aws_lambda_function" "grant_group_membership" {
  function_name    = "${var.project}-grant-group-membership"
  role             = aws_iam_role.lambda_role.arn
  handler          = "grant_group_membership.handler"
  runtime          = var.lambda_runtime
  timeout          = 30
  filename         = data.archive_file.grant_lambda.output_path
  source_code_hash = data.archive_file.grant_lambda.output_base64sha256

  environment {
    variables = {
      TAG_PREFIX = var.tag_prefix
    }
  }
}

locals {
  invoke_roles = [
    "IAMManagementRole",
    "AdminRole",
  ]
}

resource "aws_lambda_permission" "grant_invoke" {
  for_each = toset(local.invoke_roles)

  statement_id  = "Allow${each.value}Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.grant_group_membership.function_name
  principal     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${each.value}"
}
```

Last is the revoke function and its daily schedule. The same admin roles can invoke it by hand too, which is handy for testing. Set a user's expiry tag to today, invoke the function, and watch the access disappear.

```hcl
data "archive_file" "revoke_lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/revoke_expired_memberships.py"
  output_path = "${path.module}/.build/revoke_expired_memberships.zip"
}

resource "aws_lambda_function" "revoke_expired_memberships" {
  function_name    = "${var.project}-revoke-expired-memberships"
  role             = aws_iam_role.lambda_role.arn
  handler          = "revoke_expired_memberships.handler"
  runtime          = var.lambda_runtime
  timeout          = 120
  filename         = data.archive_file.revoke_lambda.output_path
  source_code_hash = data.archive_file.revoke_lambda.output_base64sha256

  environment {
    variables = {
      TAG_PREFIX = var.tag_prefix
    }
  }
}

resource "aws_cloudwatch_event_rule" "daily_revoke" {
  name                = "${var.project}-daily-revoke"
  description         = "Daily trigger to revoke expired IAM group memberships"
  schedule_expression = var.revoke_schedule
}

resource "aws_cloudwatch_event_target" "revoke_lambda_target" {
  rule = aws_cloudwatch_event_rule.daily_revoke.name
  arn  = aws_lambda_function.revoke_expired_memberships.arn
}

resource "aws_lambda_permission" "revoke_invoke" {
  for_each = toset(local.invoke_roles)

  statement_id  = "Allow${each.value}Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.revoke_expired_memberships.function_name
  principal     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${each.value}"
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.revoke_expired_memberships.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_revoke.arn
}
```

## Rolling it out without a fire

The order mattered. We deployed the new permissions to staging, and production first and let them settle for a few days. Then we refactored the repos off the old role. Only after that did we revoke the old standing access. Once everything checked out, we applied the role changes across all the accounts in one pass.

The goal held. Nobody's workflow broke, and the only change anyone noticed was fewer MFA prompts because they didn't need to assume a privileged role any longer to do their normal work.

## How it turned out

The question from that internal review, which role was used to access secrets and whether that person should have had it, is answerable now.

Fewer standing credentials means a smaller blast radius when a machine is compromised. Grants and revocations are consistent too. Every one goes through the same function and the same tag format, where before it was ad hoc console clicks.

The trade-off is that every grant still needs an admin, and with a small pool of admins, that can be a bottleneck when one of them is out.

Also there's a net benefit to developer experience. Folks can still do the same work they could before but since they're not relying on privileged roles they don't constantly hit MFA requests.

Some things I'd like to try next: automating access reviews, tying just-in-time elevation to on-call, and alerting on grants and role assumptions.
