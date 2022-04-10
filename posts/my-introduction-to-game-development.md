---
title: "My Introduction to Game Development"
date: "Mar 25, 2021"
author: "Tyrel Hiebert"
excerpt: "In 2020 I began learning game development as a hobby. Now in the beginning of 2021 it is taking up most of my free time. This is a little intro into how I got started and the tools I learned"
hero: "/images/posts/game-dev-godot.jpg"
tags: "game-dev unity godot pixel-art"
---
# My Intro&shy;duction to Game Develop&shy;ment
#### Mar 25, 2021

I've been spending a lot of my free time recently on a new hobby. Pixel style 2D game development. Here is a little intro to my dive into 2D game development.

![Logos for the Unity game engine on the left and the Godot game engine on the right on a plain white background](game-dev-unity-godot-title-card.jpg)

## Tl;dr
* [Unity](#unity): I first chose to start learning Unity in 2020 as it seemed to be the industry standard tool for game development.
* [Godot](#godot): In 2021 I decided to switch from Unity to Godot. Partly because Godot is shiny and new but also because it has a growing devoted indie developer community around it that was very inviting.
* [GDScript](#gdscript): The native scripting language of Godot. It's easy to pick up and well documented.
* [Pixaki](#pixaki): A pixel art editor specifically for the iPad and Apple Pencil
* [Aseprite](#aseprite): "The" pixel art editor for PC/Mac/Linux. Very large feature set and widely used for pixel art.
* [Art Creation](#art-creation): I am still very much in the prototyping phase of development so I am trying to not get too detailed with the art yet.
* [Going Forward](#going-forward): Follow my game development progress on my project on Twitter and Instagram. Playable alpha demo coming to Itch.io soon!

## Unity
Around mid last year I began following some tutorials on Youtube to learn Unity. Particularly this lengthy, albeit a little scattered at times, tutorial from [MrTaft](https://www.youtube.com/playlist?list=PL4vbr3u7UKWp0iM1WIfRjCDTI03u43Zfu) to create a top-down RPG with basic combat and loot elements.

That tutorial series was a really great learning experience. It taught me a lot of important concepts for 2D top down adventure games like colliders, physics, sprite sheets, and sprite animations.

I choose to start learning Unity and C# as together they seemed like the industry leading platform outside large AAA game studios and thus the most valuable skill to learn as a generalist software developer. The other option I considered at the time was Godot, but I hadn't heard about it as much, and at the time the thought of learning a more proprietary language like GDScript didn't appeal to me.

After completing that tutorial series I actually put game dev aside for a while. Work was busy and my partner and I were moving house so some hobbies got left untouched.

## Godot
At the start of 2021 we were quite settled into our new house and I decided to get back into learning game development.

In the several months I wasn't doing game development I started following quite a few independent game developers on YouTube, Twitter, and Instagram. Notably I drew lots of inspiration from [DevDuck](https://www.youtube.com/channel/UCKCTmact-90hXpV2ns8GSsA). I still look forward to his devlogs and really enjoy some of his videos where he talks about other aspects of game development apart from code or art, such as managing time and money/tax considerations.

Something I was seeing more and more among independent game developers was the popularity of Godot, the up-and-coming open-source game engine. I decided I would give it a shot, instead of continuing learning Unity. I could see that Unity would be fine for what I wanted to learn but I wanted to see what else was out there before getting too deep.

![The Godot editor showing a sample scene in the middle and all the menus and options around the perimeter](game-dev-godot.jpg)

Godot is free to download from their website, but I actually ended up downloading it on Steam for some reason. Maybe just the novelty of downloading non-game software from Steam appealed to me.

Godot has a very clean and polished feeling interface on first glance. Far nicer and more intuitive than Unity. Since Godot is quite a bit newer (from my understanding) I assume that they were able to be a bit more thoughtful and learn from Unity's shortcomings. Godot also makes 2D development first class and not an afterthought like Unity. But on that note, if you are doing 3D development, my understanding is that Unity is still more developed in that area.

Godot's Node and Scene system is a bit different that Unity's prefab system but it's easy to grasp. Godot is very object-oriented and relies heavily on inheritance in it's Node system, which feels very comfortable to me. Everything is a node and every node can be a scene and every scene can be a node, it all makes sense once you get into it.

## GDScript
Godot now supports other languages other than GDScript, but I decided I would learn GDScript anyway as it still has the best documentation and support. GDScript has actually been a joy to work with!

![Some sample code written in GD script](game-dev-gdscript.jpg)

I like the small things like being able to say `onready var` instead of just `var` to denote variables that will be instantiated asynchronous. `_` naming convention for private variables is nice since you always understand you are using a private variable at every reference, not just at declaration.

There are a couple negatives I've run into though. It's typing system is a bit weak and underdeveloped. You cannot use `ENUM`s as types apart from their underlying `int` data structure, and you cannot easily build custom types or interfaces from objects, everything has to just be typed as a `Dictionary` which is a bit unsettling. And there is a bit of oddity with all the different types of optimized `Array`s (such as `PoolStringArray` which I am using frequently), something that could be abstracted into the centralized `Array` class.

All-in-all it's been a joy to use. Some say it's not as performant as other languages in Godot but I think my 2D game wont really hit those barriers with what I have planned.

## Pixaki
I own an iPad Pro with an Apple Pencil and I wanted to use that for pixel art. Even though I am no artist I do spend some time sketching things with pencil and paper and I feel more comfortable drawing with a pencil than with a mouse.

![Pixaki app running on an iPad. Image taken from pixaki.com and owned by Pixaki](game-dev-pixaki.jpg)

The best pixel-art specific app for the iPad is [Pixaki](https://pixaki.com/). It is a polished and actively developed art app with most of the features you would want. I found it very intuitive to use it with the pencil.

Pros:

* • It's drawing and layering functionality are great.
* • Menu navigation and UI work great.
* • It hooks into the Files app and lets you export to any app you want, I used Google Drive to transfer images to my PC.
* • It is able to export in PSD format, useful if you use Photoshop or another app that can handle PSD.

Cons:

* • It's quite expensive at $27 USD.
* • Transferring files to your PC is a bit cumbersome. It might be smoother if you use a Mac and iCloud but I haven't tried that. Google Drive got the job done but there is a lot of navigating menus every time you want to transfer a file.
* • It has no file format compatible with Aseprite (that contains all the layer information).
* • Animation felt a little clunky.

If you are really looking for an app to use on your iPad Pro and you have an Apple Pencil then this is a great option. Otherwise I would stick to Aseprite. Since I have it I still occasionally sit back on the couch or in bed with it to do some sketching, but for that amount of use it's not worth the price tag.

## Aseprite
Actually before I purchased Pixaki I purchased a license for [Aseprite](https://www.aseprite.org/). My partner was learning pixel art and I bought this license to share with her. It wasn't until earlier this year and after playing around with Pixaki for a while that I decided to try Aseprite on my PC.

![Aseprite logo taken from their website aseprite.org. Image owned by Aseprite](game-dev-aseprite.jpg)

Aseprite is exactly what you need when it comes to creating pixel art for games.

What really stands out to me is the layers and timeline UI. Aseprite combines these into a really great system that maybe slightly favours animation over complex pieces with many layers, but it strikes a good balance.

Pros:

* • Great UI.
* • Fantastic animation tools and timeline.
* • Has all the drawing features I want.
* • Great export options for animations, sprite sheets, and single images.
* • $20 USD is a reasonable price tag for the features you get. You also get access to all their installers and platforms with a single purchase including a Steam key to add it to your steam library.
* • Available on Windows, MacOS, Linux, and Steam.

Cons:

* • There seems to either be some bugs or just some nuance with selections that I am missing. I find it very unintuitive to copy pieces of artwork to new files sometimes. Might just be something I am missing though.
* • Themes don't seem to work for me. After installing some themes they show in the settings panel but selecting them has no effect, even after restarting the app. 🤷🏻‍♂️

This is the go-to app for getting started with pixel art. If you already have access to something like Photoshop you can likely do everything you want in that as well. But even in that case if you want to focus on pixel art Aseprite is a really good option.

## Art Creation
At first I was going to focus on the engine and code side of development and my partner wanted to learn the art side, but this year I ended up taking on all of these aspects. So I've also been doing all my own art! I haven't followed any real tutorials or guides, I've been trying to progress my drawing skills naturally through practice. I have taken a lot of inspiration and general guidance from [Adam C Younis's](https://www.youtube.com/channel/UC08QfQDLAd9D7aYPFgBUIng) videos and recorded streams.

My methodology has been to put in like a 50% effort into each sprite I am making. The idea being that I don't want to spend too much time perfecting any individual piece since my skills aren't that great yet. Getting sprites into Godot and working in-game is a high priority. As time goes on I can circle back on sprites created a while ago that could use some more work. So far this has been working great. It took me a little while to get comfortable with that amount of effort but it has been a great exercise to tamp down my perfectionism.

Some basic aspects of pixel art I have been learning are perspective, walking animations, and colour palette creation.

## Going Forward
So here is where I am now. I've got a handle on the basics of Godot and GDScript and I have been creating my own artwork in Aseprite.

I am now working on a little project that maybe one day might turn into something. Check back for a new post when I have more to say about it. In the meantime you can follow my progress on Twitter [@wolfpeachgames](https://twitter.com/WolfPeachGames) and on Instagram [@wolfpeachgames](https://www.instagram.com/wolfpeachgames/)!