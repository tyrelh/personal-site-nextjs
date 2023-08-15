---
title: "How I use my Synology NAS as my personal cloud"
date: "August 15, 2023"
author: "Tyrel Delaney"
excerpt: "This is a follow-up to my previous post describing what a Synology NAS is. In this post I describe some of the more interesting functionality that I use every day."
hero: "/images/posts/synology-dsm-desktop.png"
tags: "synology nas data-ownership hardware photos note-taking obsidian plex"
---

This is a follow-up to my [previous post describing what a Synology NAS is](https://superflux.dev/blog/synology-nas-what-is-it). In this post I describe some of the more interesting functionality that I use every day.

## Tl;dr

[What I do with my Synology NAS](#what-i-do-with-my-synology-nas)
[Apps](#apps): The apps and services I use most often on my Synology.
	[Photo Library](#photo-library-think-icloud-photos-or-google-photos): Think iCloud Photos or Google Photos. A great photo library app that also syncs your phones camera roll.
	[Lightroom](#lightroom): I store my Lightroom catalogs on my NAS.
		[Storing photos on your network drive](#storing-lightroom-raw-files-on-your-synology-nas)
		[Storing Lightroom catalog files on your Synology](#storing-lightroom-catalog-files-on-your-synology)
	[File storage](#file-storage): I do also use my NAS as a normal NAS.
	[Obsidian](#obsidian-think-notion-or-apple-notes): Obsidian is a markdown notetaking app. I use the Synology Drive app to sync my notebooks across all devices, even over the internet. Think Notion, or Apple Notes.
	[Video](#video-plex): I use Plex to watch some movies and TV shows on my TV.
[Backups](#backups): Most of the data I store on my Synology NAS is only stored there. So although the RAID array gives some piece of mind, I also do full volume backups to AWS S3.
[RAM upgrade](#ram-upgrade): I upgraded from 1GB to 8GB of RAM.
[Conclusion](#so-what-do-i-think-about-my-synology-nas): I couldn't live without it now. It is my personal cloud that stores and lets me access my photos and notes amongst other things, in a platform and OS agnostic way.
[Resources and links](#resources-and-links)

## What I do with my Synology NAS

Like I mentioned in [my previous post](https://superflux.dev/blog/synology-nas-what-is-it), you can use a Synology NAS as a NAS... but where's the fun in that?

For myself the power of my Synology and DSM comes from it's Package Center. You can download many of Synology's great proprietary apps as well as some community apps.

## Apps

The apps I find myself using all the time, and couldn't really live without now, are [Synology Photos](https://www.synology.com/en-global/dsm/feature/photos) and [Synology Drive](https://www.synology.com/en-global/dsm/feature/drive).

Other apps I use are Plex Media Server, [Synology Cloud Sync](https://www.synology.com/en-global/dsm/feature/cloud_sync), and [Synology Hyper Backup](https://www.synology.com/en-global/dsm/feature/hyper_backup).

![web interface for synology dsm showing a copmuter desktop interface thats similar to windows or macos with desktop icons of apps and a desktop wallpaper](./synology-dsm-desktop.png)

### Photo Library (think iCloud Photos or Google Photos)

The [Synology Photos](https://www.synology.com/en-global/dsm/feature/photos) app has been a game-changer. It's quite a robust replacement or alternative to Apple iCloud Photos or Google Photos. And it has the benefit of being operating system agnostic.

![web interface for synology photos showing a grid of family photos](./synology-photos.png)

Synology has a mobile app for iOS and Android. The mobile app not only lets you view your photo library over the internet (using QuickConnect ID), but it also lets you automatically backup your photos taken on your phone to your Synology.

You can also access a web-based interface for your photo library by logging into your Synology and opening the Photos app. If connecting over the internet through QuickConnect, you can access your photo library from any computer!

If you have multiple users in DSM, they can each have their own private photo storage. You can also create a shared library that all users can see. This is ideal for family photos. My partner and I both have our private photo libraries that our phones upload to automatically, and then we move any family photos to the shared library so we can both access them.

### Lightroom

In addition to storing photos I've exported from Lightroom in the Synology Photos app, I can also store my entire Lightroom catalog and raw files on it.

This took me a bit to figure out as it's not as simple to setup as the Photos app, but there are a couple benefits of using the two together:

* Get the large library of raw files off of my computer which has limited storage and onto the NAS which has lots of storage.
* Share a Lightroom catalog between multiple computers without using Adobe Cloud.

[Spacerex](https://www.youtube.com/@SpaceRexWill/featured) does [a great tutorial on this setup](https://youtu.be/knP9GiE8IFk), but here are the highlights:

### Storing Lightroom raw files on your Synology NAS

First you'll need to [enable SMB from within the Control Panel in DSM](https://kb.synology.com/en-ca/DSM/help/SMBService/smbservice_smb_settings?version=7). This will allow you to access your Synology as a network drive natively in Windows and MacOS.

Then on your computer you run Lightroom, map your network drive using your Synology's name you gave it during setup. Google "[map network drive](https://www.google.com/search?q=how+to+map+a+network+drive&oq=how+to+map+a+network+drive&aqs=chrome..69i57.5388j0j4&sourceid=chrome&ie=UTF-8)" + your operating system to learn how to do that.

Now in Lightroom you should be able to see your network drive just like you do your hard drive or USB drives. You can then copy your library over there and import new photos directly there.

Remember, if you are just moving your photos to your Synology, then it's not a backup. With this setup I only have my photos on my Synology, not on my laptop. So you'll want to make sure you're backing up your Synology somewhere else. See my [previous post]() where I talked about backups.

So now your photos are on your Synology, and really that's the most important thing. But your Lightroom catalog files are still on your computer. This might be fine for you, but if you want to go one step further you van sync those files to your Synology using [Synology Drive](https://www.synology.com/en-global/dsm/feature/drive).

### Storing Lightroom catalog files on your Synology

I'm specifically talking about Lightroom Classic here. I like to avoid using Adobe's online services whenever I can as I don't want to loose access to my Lightroom library. Whenever I say "Lightroom" I mean Lightroom Classic.

Lightroom does essentially require you to have the catalog files on the same computer you're running Lightroom on. If you try to stick them on a network drive the same way you did your photos, Lightroom will be so slow it will be essentially unusable.

So instead you can leave the file on your computer, but use [Synology Drive](https://www.synology.com/en-global/dsm/feature/drive) to sync the file to your Synology.

Install the [Synology Drive Server](https://kb.synology.com/en-nz/DSM/help/SynologyDrive/drive_desc?version=7) on your Synology, and the Synology Drive app on your computer. Run through the step of the server from within DSM, essentially you'll want to make a folder that you'll sync stuff to.

On your computer in the Drive app log into your Synology. Then create a new *Sync Task* for the directory your Lightroom catalog lives in. Make sure to disable *On Demand Sync* for this particular task (maybe not necessary, but might speed up Lightroom a bit). And there you go, your catalog files are being synced to your Synology!

A benefit of all this is that you can now access the same Lightroom catalog from multiple computers. Just setup the same network drive and the same Synology Drive *Sync Task* for your catalog, then in Lightroom just open that synced catalog file! Keep in mind you cannot be editing or uploading photos to the same catalog from multiple computers **at the same time**. This will create file conflicts and break things.

### File storage

I do use my Synology for general file storage, but not as much as I'd like to. I use a combination of mapped network drives and Synology Drive *Sync Tasks*.

I'm slowly trying to move away from Google Drive as much as I can, but it's been a slow process.

The main things I store on there, which I talk about in this article, are my Photos, Lightroom catalogs, my notes, and video for Plex so I can watch it on my TV.

### Obsidian (think Notion or Apple Notes)

I'm going to cover my [Obsidian](https://obsidian.md/) setup and workflow more in a future post, but I'll give an overview here.

Obsidian is a note-taking app. It uses standard [markdown](https://en.wikipedia.org/wiki/Markdown) files, which means my notes are portable and not in some proprietary format. 

I really prefer taking notes and writing documentation in markdown over a proprietary system like Notion, Apple Notes, or Google Docs. Markdown can be edited on basically any device or OS. It's also very easy to convert to HTML, hence why my blog articles are written in markdown! I've also been thinking a lot about the longevity of the notes and articles I write. I'd like them to be in a format that will be accessible decades from now (like a paper notebook would), and I don't think something like Notion, Apple Notes, or Google Docs will be around in 30 or 40 years. 

Obsidian has an optional paid upgrade that lets you sync your notes across devices. But instead I use my Synology and [Synology Drive](https://www.synology.com/en-global/dsm/feature/drive).

I created a *Sync Task* in Synology Drive to sync my notes folder (or vault as Obsidian calls it). Then on whatever device I want to install Obsidian on to edit my notes, I also install Synology Drive and setup that same *Sync Task*. I currently have it syncing between my personal Windows desktop and laptop, my work Macbook, and my personal Android phone.

Not only are my notes synced, but I own my notes, they're stored on my Synology in my house. And they get backed up when my Synology gets backed up.

### Video (Plex)

I don't use [Plex](https://www.plex.tv/en-ca/) very often, just occasionally for the odd legally acquired TV series or movie that isn't available on Netflix.

The Plex Media Server app is available from the Package Center in DSM. Install it and set it up. You basically just point it to a directory on your Synology where you store your video files.

Then on whatever device you want to watch those videos, install the Plex app. It's available on my Samsung TV. Somewhere in a weird spot in the settings there's an option to connect to a local Plex server (you might need to Google how to connect to a local server). You put in your Synology's IP address and then you can stream your video content over your local network to your TV.

This doesn't work by default over the internet. You'll likely need to [setup a VPN for that](https://www.google.com/search?q=how+to+setup+a+VPN+with+DSM+7&oq=how+to+setup+a+VPN+with+DSM+7&aqs=chrome..69i57.7403j0j1&sourceid=chrome&ie=UTF-8).

## Backups

One very important thing to keep in mind if you are putting tons of your valuable pictures, notes, and data in one place is to make sure you have a backup of it.

Synology's generally run some kind of RAID array of hard drives, so there is a bit of protection from failure built into that. But still something could go terribly wrong and then all your family pictures are gone forever.

So I use [Synology Hyper Backup](https://www.synology.com/en-global/dsm/feature/hyper_backup) to do full disk backups to AWS S3. S3 is a pretty cheap easy to use cloud storage service that you only pay for what you use.

Hyper Backup will only store encrypted backups. So the files you're backing up can't be directly accessed, only restored through Hyper Backup.

## Cloud Sync

One very minor thing I do is use [Synology Cloud Sync](https://www.synology.com/en-global/dsm/feature/cloud_sync) to backup the contents of my Google Drive to my NAS.

I still use Google Drive for some things and this way I can have those files backed up on my NAS as was as on my NAS's full-disk backup in AWS S3.

## RAM upgrade

I don't think this was strictly necessary, but I upgraded the RAM from the included 1GB to 8GB. I was noticing %3E80% memory usage with 1GB when logged into the web interface of the operating system. 8GB is quite a substantial increase, although I don't really notice the difference in day-to-day use.

If you want to upgrade the RAM in your Synology DiskStation make sure you google the model to figure out exactly what type of RAM it takes and which speed and capacity it supports.

My model takes a single SODIMM DDR3L module with a maximum speed of 1600MHz and 8GB capacity. I purchases [this Silicon Power 8GB module from Amazon](https://www.amazon.ca/dp/B07L89T9HQ?psc=1&ref=ppx_yo2ov_dt_b_product_details) for $15 and it works great. The OS correctly reports the new 8GB memory capacity, and average memory usage is down to a comfortable 10-20% normally.

## So what do I think about my Synology NAS?

Frankly I couldn't live without a Synology NAS now. I've really tried hard to steer away from a lot of the subscription cloud services (like Google Drive), especially ones that tie you to specific operating systems (like Apple iCloud). A Synology NAS is a powerful way to take back some control over your data without sacrificing much in the way of user experience.

It's my personal cloud that stores and lets me access my photos and notes, amongst other things.

## Resources and links

* [Synology Photos](https://www.synology.com/en-global/dsm/feature/photos)
* [Synology Drive](https://www.synology.com/en-global/dsm/feature/drive)
* [Synology Hyper Backup](https://www.synology.com/en-global/dsm/feature/hyper_backup)
* [Spacerex YouTube channel](https://www.youtube.com/@SpaceRexWill/featured)
	* [Photography workflow with Lightroom](%3C(https://youtu.be/knP9GiE8IFk%3E)
* [Obsidian](https://obsidian.md/)
* [8GB SODIMM memory module I purchased](https://www.amazon.ca/dp/B07L89T9HQ?psc=1&ref=ppx_yo2ov_dt_b_product_details)