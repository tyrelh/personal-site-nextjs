---
title: "What is DevOps?"
date: "April 10, 2022"
author: "Tyrel Hiebert"
excerpt: "In my role as a software engineer at my day job, I’ve been getting more interested in DevOps as a career trajectory. But what does that even mean? Do I even know? This is a brief exploration into what DevOps is and how I see it relating to a small development team."
hero: "/images/posts/development-cycle.jpg"
tags: "devops automation github-actions"
---
# What is DevOps?
#### April 10, 2022

In my role as a software engineer at my day job, I’ve been getting more interested in DevOps as a career trajectory. But what does that even mean? Do I even know?
  
This is a brief exploration into what DevOps is and how I see it relating to a small development team.

![DevOps Cycle from Atlassian](development-cycle.jpg)

## Index

* [Tl;dr](#tldr)
* [Initial Assumptions](#initial-assumptions)
* [Operations & Facilitators](#operations--facilitators)
* [Agile Development](#agile-development)
	* [Quick Iteration](#quick-iteration)
	* [Feedback & Data](#feedback--data)
* [Automation](#automation)
* [Not Only Software Development](#not-only-software-development)
* [Conclusion](#conclusion)
* [Resources](#resources)

## Tl;dr
Here are a few key ideas that I think define what DevOps is and what someone in a DevOps position should focus on:

* Automate things like dev environment setup and employ tools to make writing code simple. Make it easy and painless to write code.
* Automate testing so developers and teams are confident in the code being produced. Developers shouldn't have to "remember" to run tests.
* Automate infrastructure provisioning and blue/green deployments. Code that's reviewed and ready to go should be able to reach customers with a single click (with proper authentication). Make deploying new code trivial.
* Automate data collection and illumination for the dev team primarily but also for the business side depending on the size of your company.
* And I think in general, a DevOps role should facilitate software development by increasing confidence in work being done by both engineers and product managers.

## Initial Assumptions

Earlier on in my career and in university, DevOps was a buzz word that was thrown around all the time. When I heard the term DevOps I associated that with “cloud infrastructure”. I was connecting the idea of “building things on cloud infrastructure” to the role of DevOps.
  
While using cloud infrastructure might be one aspect of the tools and responsibilities of a DevOps role, it doesn’t get to the root of what the role is about.

## Operations & Facilitators

Within a software company, big or small, there are various so-called “Operations” roles. Business Operations, Customer Operations, Insert Anything Operations. My perspective on these roles in general is that they are facilitator roles rather than managerial roles. “Managers” may often have an Officer title, while “facilitators” may have an Operations title.

What do I mean by Facilitators? These are roles that essentially amplify the work in a given area or team. Their job is to ensure process and procedure are in place so that work can get done effectively, impactfully, and efficiently. It’s not necessarily their job to oversee the work being done, but to boost the impact and productivity of the work being done.

DevOps is short for Development Operations. And in my context as a software engineer, Development is actually short for Software Development (Development can mean many different things in different fields).
  
So in more plain language, the role of DevOps is related to the operations of the development team and the development lifecycle. Ok, so that sounds more appropriate than just “cloud infrastructure”, but what is involved in the operations of those things?

## Agile Development

While I’m no expert on Agile development practices, I’ve been working with variations of it for my entire software development career thus far.

In essence, Agile (with a capital A) is intended to make the development process more iterative and quick to react to user feedback. Rather than blocking out big periods of time for large projects that overhaul huge portions of the customer experience, we attempt to release work quicker and in smaller pieces to get feedback on particular features sooner.

This allows us to not waste time perfecting features that our customers don’t want or won’t use. Instead we can focus more directly on things that are impactful for our customers and our bottom line. Therefore, one aspect of a DevOps role is facilitating the Agile development process.

### Quick Iteration

Getting code written, reviewed, and deployed quickly helps you then iterate on that code sooner, leading to better experiences for the customer over time. Building and improving processes around code testing, review, and deployment is a key facilitator opportunity for a DevOps role. This can cover many different things, from automating testing and deployments to improving code review process.

### Feedback & Data

Timely feedback is also vital to the Agile development process. Both user experience feedback and systems operation feedback (through statistics and error reporting). This feedback informs subsequent development cycles and how features, tweaks, and bug fixes are prioritized against each other for the greatest impact. Developing systems to effectively and concisely collect and relay feedback to the appropriate developers and project leads allows for more informed decision making, and thus is another key responsibility of a DevOps role.

## Automation

There are many pieces of manual work and human intervention in the software development cycle, and the level of automation in place can vary wildly between different teams and companies. I entered my software development career from essentially a cloud-native perspective, having little to no experience deploying code in a different paradigm.

But today, with things like IaC (infrastructure as code) and remote dev environments being the norm, every aspect of the developer experience can be automated in some way. Including writing code believe it or not.

* __Dev environment setup can be automated with old tools like Docker, or emerging tools like [JetBrains Space](https://www.jetbrains.com/space/).__ Space is essentially a remote dev environment that helps teams standardize their development environments across a team. Space is in closed beta as of the writing of this article. GitHub & Microsoft are working on similar tools with GitHub Codespaces and VS Code.
* __Writing code can be automated with new tools like [GitHub Copilot](https://copilot.github.com/).__ Copilot is a machine learning tool that has learned how to write code in many popular languages. While it can't directly replace a human developer yet, it can greatly speed up the process of writing code from scratch.
* __Reviewing, unit-testing, and merging code can be automated with tools like GitHub and [GitHub Actions](https://github.com/features/actions).__ There is still a bit of human touch needed in the review process to ensure features are truly meeting the business needs of the brief, but reviewing security and dependencies for example can be greatly sped up with the help of automation tools. Running tests can be automated with a variety of CI tools. Merging code and resolving merge conflicts has become downright trivial with tools like git and GitHub.
* __Deploying code to infrastructure can be automated with a variety of CD tools.__ I've been mainly interested in GitHub Actions and automating deployments to AWS. But I'm now also interested in learning more about AWS CDK (cloud development kit). [This blog post from GitHub](https://github.blog/2021-01-25-improving-how-we-deploy-github/) has been quite influential in my current thinking about automated deployments.
* __App stats and error monitoring can be automated with tools like Sentry, Datadog, and NewRelic.__ Those stats can be viewed through there respective dashboards or made more accessible through things like Slack bots.

## Not Only Software Development

In a small company or on a small team, often certain roles wear many hats. In our case, business operations bleed into the development team all the time. People working with clients, company finances, product managers, or even the CEO, will often have inquiries for data about various aspects of our business operations.

Without adequate access to that data, requests can sometimes fall on developers who are familiar with the system and the data. Ad-hoc SQL queries to our database can sometimes be the norm, but this isn’t an efficient use of anyone's time.

Building systems and interfaces to our company’s data can be integral to operations and development. Depending on the size of the company and the other roles there, this idea of data illumination could fall on a Business Operations role, but often it can require integration and understanding of the technical stack that is foundational to your application. Therefore that responsibility can fall on a DevOps role, to build digestible interfaces and secure pipelines to get the relevant data to the team members that need it.

## Conclusion

In summary, I see DevOps as primarily a facilitator and multiplier role. Depending on the size of the team they could be simultaneously doing development themselves, but the focus is on how to make the development team more productive.

Facilitating the development team to be more productive means a few things:

* Make code easy and painless to write. Automate environment setup.
* Make code simple to test. Automate tests.
* Make code trivial to deploy when ready. Automate infrastructure and blue/green deployments.
* Make data about development, testing, and deployment visible to the team. Automate data collection and illumination with tools like Datadog.

My summary and this article represents my understanding and opinions right now (Spring 2022). I am constantly learning and improving on my career journey and my knowledge and opinions will undoubtedly change over time.

If you have any comments or suggestions please feel free to reach out to me on Twitter! 👋🏻

## Resources

* [The Phoenix Project](https://itrevolution.com/the-phoenix-project/) - Gene Kim, Kevin Behr, and George Spafford
* [Improving how we deploy GitHub](https://github.blog/2021-01-25-improving-how-we-deploy-github/) - GitHub Blog
* [DevOps principles](https://www.atlassian.com/devops/what-is-devops) - Atlassian