---
title: AWS Solutions Architect Associate Certification
date: 2025-01-20T00:00:00.000Z
tags:
  - aws
  - certification
  - solutions-architect
  - udemy
related:
  - '[[AWS Certified Solutions Architect Associate prep course]]'
hero: >-
  /images/posts/aws-solutions-architect-associate-certification-awssolutionsarchitecthero.png
author: Tyrel Delaney
excerpt: >-
  After abandoning an AWS cert prep course in 2020, I came back four years later
  with five years of hands-on AWS experience and passed the Solutions Architect
  Associate on the first try. Here's the course, the exam format, and the three
  technical failures that nearly derailed my remote test.
---
# AWS Solutions Architect Associate Certification

## Backstory
I've worked with AWS professionally for around 5 years. I haven't touched most of what AWS offers, but I know a handful of services well.

I'd wanted an AWS certification for a while. In 2020, early in my career, I started a prep course for the AWS Certified Developer Associate. I'd only been working with AWS for a year and had neither the hands-on experience nor the time to devote to it. I spent several months on the Udemy course, made it 20-30% of the way through, and abandoned it. The content was just too much for me at the time.

Fast forward 4 years to September 2023. I'd been working with AWS that entire time and had a ton of hands-on experience: EC2, Elastic Beanstalk, Load Balancers and Auto Scaling, RDS & Aurora, CloudFront & WAF, Route53 & DNS, Security Groups & IAM. It felt like a good time to reattempt certification.

![AWS solutions architect title on a dark background](aws-solutions-architect-associate-certification-awssolutionsarchitecthero.png)
## Preparation
Folks online heavily recommend Stephane Maarek's AWS certification prep courses on Udemy. He has them for most if not all AWS certificates.

In 2020 I attempted his [prep course for the AWS Certified Developer Associate exam](https://www.udemy.com/course/aws-certified-developer-associate-dva-c01)) and only made it 22% of the way through according to Udemy.

This time, focusing more on Platform and Infrastructure professionally, I pursued Solutions Architect instead of Developer, and bought his [Ultimate AWS Certified Solutions Architect Associate SAA-C03](https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/) in October 2023.

### Stephane Maarek's AWS Certification prep course

Stephane's courses are good and very thorough. The AWS Solutions Architect certification covers a wide array of topics and the questions vary, so a prep course needs to cover a lot.

27.5 hours of lectures in total, covering services at roughly 3 levels: in-depth, general, and surface-level.

**In-depth:**

- S3 (Simple Storage Service)
- EC2 (Elastic Compute Cloud)
- IAM (Identity and Access Management)
- VPC (Virtual Private Cloud) & Networking
	- Internet & NAT Gateways, NAT Instances
	- Subnets
	- Bastion Hosts
	- NACL & Security Groups
	- VPC Peering
	- VPC Endpoints
	- VPC Flow Logs
	- and more
- Route53

**General:**

- AWS CLI
- EBS (Elastic Block Store)
- AMI (Amazon Machine Image)
- EFS (Elastic File System)
- ALB (Application Load Balancer)
- NLB (Network Load Balancer)
- ASG (Auto Scaling Groups)
- ELB (general Elastic Load Balancing)
- RDS (Relational Database Service)
- Aurora
- CloudFront
- SQS (Simple Queue Service)
- Kinesis Data Streams and Data Firehose
- ECS (Elastic Container Service)
- Lambda
- CloudWatch
- KMS (Key Management Service)

**Surface-level:**

- GWLB (Gateway Load Balancer)
- ElastiCache
- Global Accelerator
- Snow Family
- FSx
- Storage Gateway
- Transfer Family
- DataSync
- SNS (Simple Notification Service)
- MQ (Apache ActiveMQ & RabbitMQ)
- ECR (Elastic Container Repository)
- EKS (Elastic Kubernetes Service)
- App Runner
- DynamoDB
- API Gateway
- Step Functions
- Cognito
- Document DB
- Neptune
- Keyspaces
- QLDB
- Timestream
- Athena
- Redshift
- OpenSearch
- EMR (Elastic MapReduce)
- QuickSight
- Glue
- Lake Formation
- Kinesis Data Analytics
- Rekognition
- Transcribe
- Polly
- Translate
- Lex & Connect
- Comprehend
- SageMaker
- Forecast
- Kendra
- Personalize
- Textract
- EventBridge
- CloudTrail
- Config
- Organizations
- Control Tower
- SSM (Systems Manager)
- Secrets Manager
- ACM (AWS Certificate Manager)
- WAF (Web Application Firewall)
- Shield
- Firewall Manager
- GuardDuty
- Inspector
- Macie
- DMS (Database Migration Service)
- Backup
- CloudFormation
- SES (Simple Email Service)
- Pinpoint
- Cost Explorer
- Batch
- AppFlow
- Amplify
- ElasticBeanstalk

Yes. There is a lot of different AWS services.

A few concepts are covered separate from individual services:

- High Availability
- 3-tiered Web Applications (Frontend, Backend, Database)
- Serverless
- Decoupling Applications
- Choosing the right database for the kind of data you have
- Disaster Recovery
- Caching Strategies
- Data & Event Processing

The course frames these services and topics through the AWS Well Architected Framework and its 6 pillars:

- Operational excellence
- Security
- Reliability
- Performance efficiency
- Cost optimization
- Sustainability

https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html

**Course structure**

Each unit ends with a quiz, and about half the lectures include a "hands-on" video where the instructor uses the service in the AWS web console, noting what the free tier covers and what will cost you.

Working a few hours each week it took me about 4 months to complete.

The course includes a repeatable 65-question practice test. I took it after finishing and failed at about 65%. It gives you the results, which answers were correct, and a thorough description of each correct answer, which made great study material. I studied my weak areas for 2 weeks and retook it, passing at about 95%. Same test, so a better score was expected.

## The exam

I felt ready to attempt the certification exam at this point.

### Scheduling the exam

You can schedule the exam in-person or online these days. A few years ago my only option was an in-person exam in Vancouver, 4 hours away; there's a Victoria facility now, but I took mine online.

AWS uses the Pearson Vue platform for online tests. First time I'd used it, but I suspect it's common in this remote era.

Scheduling and paying was simple. Your first AWS exam costs $157.50 USD (~$215 CAD). Each one you complete earns a 50% voucher for the next, so only the first is full price.

Pearson Vue asks you to run a system test beforehand. Their proprietary software runs on your machine doing some kind of logging and surveillance, attempts to lock your screen to the test, and records your webcam for the entire exam. The system test checks compatibility and that your connection can stream video.

They want a private space and a reliable connection, and advise against a work laptop since MDM software and corporate firewalls interfere with the testing software. I only have wifi at home and my space isn't private, so I booked a booth at a co-working space with a wired connection and used my personal Windows 11 laptop.

### Taking the exam

The basic structure of taking an AWS certification exam remotely is:
- Check in 15 mins before
- Start the exam
- No breaks
- You have 2:10 to finish 65 questions
- You can mark questions for review to return to later

I hit a fair number of technical difficulties. I'm grateful the invigilators and I solved them ad-hoc and I wasn't disqualified.

**Technical difficulties**

First, signing in on my phone (you scan a QR code). The site asks for photos of your ID and of the room from several angles. Uploading them crashed the site and dumped me back to a login screen. Stressful, since I didn't know how strict the start time was. Luckily an identifier given to me by the software on my computer let me rejoin the check-in already in progress.

In the second part of check-in an invigilator gets on a call with you through the software on your computer. Fairly standard questions, then they ask you to show them your testing space by webcam. Using my laptop webcam meant picking up the laptop, at which point the janky USB-C Ethernet adapter from the co-working space disconnected and I lost internet. I was mortified, and swapped in my own adapter as fast as I could. The video chat never came back but the text chat did, and I was re-queued and picked up by a different invigilator. Same questions again, but this time I held the dongle in place while showing them around the room.

The last difficulty was quick to resolve but still stressful: about 4 questions in, the application crashed to a red warning message. I could still call the invigilator, they reset the system, my progress was intact and I lost a minute or two.

### The exam itself

There were 65 multiple choice questions with 3-6 possible answers given.

I'm not supposed to share the exam questions, and don't remember them that precisely anyway. But I do remember a few question types and the style in which they were asked.

I took the Solutions Architect certification exam, so the questions were heavily slanted that way.

The general format was "given this scenario/client/task, how would you solve it in the most high availability/redundant/lowest initial cost/lowest ongoing cost/most automated way". They'd present something like "a client would like to transfer 50 petabytes of time-series financial records from their on premises servers", then ask for the solution matching a qualifier: cheapest, most highly available, least operational overhead.

Most questions had multiple "correct" answers, meaning several would accomplish the task. But only 1 was "most correct" and also met the qualifier.

So the exam tests not just knowing what most AWS services do, but knowing precisely when you'd use one over another. NAT instances vs managed NAT Gateways, for example. Both have pros and cons.

A lot of questions focused on VPCs, particularly connecting multiple VPCs, and on transferring data in and out of AWS.

If I remember correctly you need 70% to pass. The exam is pass or fail, but you get a score at the end you can use to calculate how many questions you got right.

You can retake an failed exam after 2 weeks at the full cost.

## Takeaways

Obviously all the learning was done up front; the certification exam is just a goal to shoot for. Stephane Maarek's course was thorough and well laid out and I learned a lot from it, albeit mostly at a surface level. Actively using AWS since starting at Giftbit helped just as much.

I really enjoyed having the certification as a north star. It was a great motivator to study regularly and use my pro-d time at work (I also studied a bunch outside of work).

This exam was fairly difficult, but having experience with AWS and completing that prep course gave me what I needed to be successful.
