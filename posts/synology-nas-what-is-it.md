---
title: "What is a Synology NAS?"
date: "July 18, 2023"
author: "Tyrel Delaney"
excerpt: "I recently got myself a Synology NAS. What does that even mean? In this part one of two, I talk a bit about what a Synology NAS is. In part two, I'll talk about the cool things I do with mine."
hero: "/images/posts/synology-nas.png"
tags: "synology nas data-ownership hardware"
---

## Tl;dr

* [Preamble](#preamble): I got a Synology NAS.
* [What is a Synology NAS?](#so-what-is-it): Synology is a brand of NAS (network attached storage) devices that have a whole suite of great software that extend their capabilities.
* [DSM (DiskStation Manager)](#dsm-diskstation-manager): The operating system that Synology NAS's use.
* [Online access](#online-access): There are a couple ways you can securely connect to your home or office NAS over the internet, but I use Synology QuickConnect because it's easy to use and secure enough for me.
* [What I do with my Synology NAS](#what-i-do-with-my-synology-nas): I'm writing a follow-up article to describe all the things I do with my Synology NAS.
* [Resources and links](#resources-and-links)

## Preamble

I recently got a [Synology DS416play](https://www.google.com/search?sxsrf=AB5stBhZ_2DvwOiqGrHwxnOJYVgTYOSiHQ:1689739870654&q=synology+ds416play&tbm=isch&sa=X&ved=2ahUKEwjM6YLG85mAAxWMDEQIHS_wDRgQ0pQJegQICxAB&biw=855&bih=986&dpr=1.75) second-hand when my employer decided to give up our physical office space and go fully remote. My device is around 7 years old, but equivalent modern devices from Synology will run between $250 - $800 without hard drives depending on how many drive bays you want. This model has four 4TB drives, which gives me around 11TB of usable space with the RAID version I chose.

![](./synology-nas.png)

## So what is it?

[Synology](https://www.synology.com/en-us) offers a wide range of devices such as surveillance cameras, networking equipment, and NAS devices. In this post I specifically focus on [Synology NAS devices](https://www.synology.com/products?product_line=ds_j%2Cds_plus%2Cds_value%2Cds_xs), or Network Attached Storage. These devices are essentially boxes that house multiple hard drives and can be connected to your local network, enabling access to stored data from other computers within your home or office.

The primary function of a Synology NAS device is to provide centralized storage for your data. By connecting the device to your local network, you can easily store and retrieve files from any computer within the network.

However, what sets Synology NAS devices apart is their proprietary software, which transforms these devices into versatile computing platforms.

## DSM (DiskStation Manager)

[DSM](https://www.synology.com/en-ca/dsm), or DiskStation Manager, is the operating system that Synology devices use (at least the at-home/small-office variants). It has a nice web-based desktop interface that is familiar and easy to use.

![](./synology-dsm-desktop.png)

When setting up for the first time, you choose what kind of file system and RAID type you want to use. I used Synology Hybrid RAID and [Btrfs](https://en.wikipedia.org/wiki/Btrfs). Btrfs is generally recommended for it's features and performance, although I don't really know more about it. And the RAID type was the suggested type when setting it up I believe, it gives 1 drive fault tolerance according to the Storage Manager.

You also create users within DSM. This is particularly important if you'll be having multiple family members (or employees of your business) using the device for various services. You can grant quite granular permissions to the file system and services per user.

## Online access

While this device lives in your home or office, you can still access it from the internet in various ways.

[Spacerex](https://www.youtube.com/@SpaceRexWill/featured) does a [great video on youtube](https://youtu.be/o2ck1g3_k3o) covering all the ways to access your Synology over the internet.

I personally just use Synology's [Quick Connect](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/connection_quickconnect?version=7). It's really simple to setup and use, and it's secure (secure enough for me anyway). Once you're setup with DSM's settings, you simply visit `<your QuickConnect ID>.quickconnect.to` and log in to your DSM user. The QuickConnect service will automatically route you over the local network if it detects you're on the same network of your Synology device, or though Synology's servers if you're on the internet.

![](./synology-quickconnect.png)

QuickConnect also works great with other apps and services from Synology, like Photos and Drive. So it makes it really easy to use those services on the internet as well.

## What I do with my Synology NAS

With the basic setup you can store files on your Synology NAS just like you can with any other brand of NAS.

The real power of a Synology NAS comes from the fantastic apps they provide. They have a whole suite of apps from an iCloud Photo alternative, Google Drive and Docs alternatives, and tons more. You can essentially setup your own cloud, but the data is stored in your house rather than on some data center somewhere.

I don't use all the apps available, but I make heavy use of Synology Photos and Synology Drive.

Check out my follow up post (when it comes) to see the details of how I use my Synology NAS.

## Resources and links

* [Synology](https://synology.com)
* [DSM (DiskStation Manager) OS]()
* [Synology QuickConnect](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/connection_quickconnect?version=7)
* [Spacerex YouTube channel](https://www.youtube.com/@SpaceRexWill/featured)
	* [Access your Synology NAS over the internet](https://youtu.be/o2ck1g3_k3o)
* [Btrfs wikipedia](https://en.wikipedia.org/wiki/Btrfs)