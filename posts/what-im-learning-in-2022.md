---
title: "What I'm Learning in 2022"
date: "March 23, 2022"
author: "Tyrel Hiebert"
excerpt: "Here is a rundown of what I'm learning in 2022, what I'd like to learn in 2022, and some things I know I just wont have time for in 2022."
hero: "/images/posts/what-im-learning-in-2022.jpg"
tags: "docker github-actions neovim vpn synology ssl static-site-generators"
---
# What I'm Learning in 2022
#### March 23, 2022

Here are some things that I'd like to learn more about in 2022. This is kindof a reference for myself. So I can look back at this next year and reflect on what I learned and what I wanted to learn. [Let me know on twitter](https://twitter.com/tyreldelaney) if you are learning these same things or you have any tips or resources to share!

![Logo montage of all the technologies outlined in this article](what-im-learning-in-2022.jpg)

## Index

[Learning from scratch](#learning-from-scratch)

* [Docker](#docker)
* [Vim/NeoVim](#vimneovim)

[Learning more of](#learning-more-of)

* [Github Actions](#github-actions)
* [AWS DynamoDB](#aws-dynamodb)
* [AWS Client VPN, VPNs in general, and SSO](#aws-client-vpn-vpns-in-general-and-sso)
* [SSH](#ssh)
* [HTTPS/SSL](#httpsssl)
* [Raspberry Pi](#raspberry-pi)
* [Home Network](#home-network)

[Things I'm interested in but might not get to this year](#things-im-interested-in-but-might-not-get-to-this-year)

* [A better static site generator / CMS](#a-better-static-site-generator--cms)
* [Webhooks](#webhooks)

## Learning from scratch

### Docker
Docker really feels like one of those technologies that I've been conveniently ignoring for a little too long. I think what I'll do to start is simply try to containerize some smaller projects I'm working on this year to dip my toes in.

I acquired a handful of second-hand Raspberry Pis not long ago and I've got a few ideas for some small home automation & monitoring projects that might be perfect simple projects to dockerize.

A stretch goal would be to work up to containerizing our monolithic app at my day job.

### Vim/NeoVim
I've always just barely snuck by with my fluency in the terminal. The more I get into networking and Dev Ops the more this deficiency is showing. In general I'd just like to work in the terminal a bit more this year.

Specifically I'm going to try to develop a couple Node and Python projects I'm cooking up remotely on the Raspberry Pis I hope to run them on.

Really two main goals I'd like to accomplish with this practice:
1. Get proficient and comfortable using vim.
2. Learn more about making a portable and lightweight dev environment. Something that I can easily spin up on a Raspberry Pi or AWS EC2 instance over SSH and feel comfortable doing real work in.

## Learning more of

### Github Actions
Automation is a big focus for me this year. And really just because I rely on Github both personally and professionally, Github Actions is a natural choice to skill up in.

We're now looking into automating and outsourcing our test suite at work and since we use Github for source control and code reviews/pull requests it makes total sense to use Github Actions.

I've automated a few things using Github Actions already, namely [tests and deployment of my](https://github.com/tyrelh/battlesnake-typescript-node) [Battlesnake](https://play.battlesnake.com/) to AWS Elastic Beanstalk. Automating even just tests for our app at work will be a bit more of a challenge since it's a much older stack and has many more moving parts.

### AWS DynamoDB
I wasn't actually planning on learning DynamoDB at the start of the year. But a project idea came to mind and the possibility of using Dynamo to store data rather than something like S3 sounded intriguing.

Essentially what I'm planning is building out a few Raspberry Pi temperature sensors for my house. Maybe 4 or 5 in total monitoring a few rooms in the house as well as the outdoor temperature.

The idea would be to collect data from all these sensors using Raspberry Pis maybe every 5 mins or so, and ship that data off to Dynamo. Then building an infrastructure to rotate through tables. Basically make a new table each day with a high write provision, and rotate down the previous days tables read and write provisions. Maybe after some period archive the data in S3.

Might be over engineering for the task, but it's for learning.

[Best Practices for Handling Time Series Data in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-time-series.html)

### AWS Client VPN, VPNs in general, and SSO
With my day job going fully remote this year, setting up secure remote tools has been high on our priority list. Part of that will be learning about AWS Client VPN which we may use to grant our devs access to some of our AWS infrastructure.

Part of this work is also moving to more zero trust architecture, and leaning into SSO for authentication.

Also I recently acquired a Synology NAS for my home (which we actually use to use in our office before we gave that space up). I'm looking to centralize alot of my personal cloud use to the Synology and move away from services like Google Drive (office and documents), iCloud (photos), and Notion (notes). Part of that will be to setup a VPN at home so that I can use those services hosted in my home from anywhere. As well as accessing some of my Raspberry Pis for remote development.

### SSH
Learning more about SSH and tunneling goes hand-in-hand with a few other learning priorities I have. Learning best practices for connecting securely and crafting secure infrastructure. Also using SSH to practice remote development and learning terminal based tools.

### HTTPS/SSL
Same as above. Learning more about best practices around secure remote communication. Getting more confident understanding certs and how they work.

### Raspberry Pi
I've owned a Raspberry Pi 3 for a handful of years now, but I've never really had a project for it. I experimented a bit with retro game emulation on it, but those projects are pretty trivial to setup.

Now I have a handful of Raspberry Pi 2s and 3s and I have some plans for some smaller single purpose projects for the house that will be perfect for them.

### Home network
This kinda just happened organically, but I have a lot of computers in my house now! What I'd like to do is centralize a bunch of things into a proper rack. I have a few computers that are mining cryptocurrency that I'd like to transfer to rack-mountable server cases. Along with my new Synology NAS and a few Raspberry Pis.

Wiring my house with Cat-6 probably won't happen any time soon, but centralizing a bunch of things in a rack will let me hard-wire them all to a small switch without needing to run cables through all my walls.

Like I mentioned above, also setting up network storage and remote access for my home network.

## Things I'm interested in but might not get to

### A better static site generator / CMS
My website currently is hand-built in Javascript and React with a few plugins that let me render my articles from markdown. There is still a fair amount of manual process to get each markdown file wired up to display as a page and route, but at least I don't need to reformat the article. I can just paste it in from my notes app and then wire it up.

Ideally I'd like to learn a better static site generator to simplify this process even more. I've been thinking of learning [Gatsby](https://www.gatsbyjs.com/) for a while now, but I've just found it a bit cumbersome and hard to get into.

Some alternatives I'm considering learning instead of Gatsby are [Jeckyll](https://jekyllrb.com/) or [Hexo](https://hexo.io/).

### Webhooks
Just something I'm interested in learning more about.

## End

[@ me on twitter](https://twitter.com/tyreldelaney) if you are learning these same things or you have any tips or resources to share!