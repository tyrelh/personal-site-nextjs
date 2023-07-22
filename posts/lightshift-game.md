---
title: "Lightshift Game"
date: "Feb 1, 2020"
author: "Tyrel Hiebert"
excerpt: "I started this project in 2018 to help teach myself better object-oriented programming structure, game update/draw loops, and JavaScript in general. Implemented using the P5.js framework for the draw loop and canvas drawing functionality with nothing else but vanilla JavaScript."
hero: "/images/posts/lightshift-game-2.png"
tags: "javascript game-dev p5js"
---

I started this project in 2018 to help teach myself better object-oriented programming structure, game update/draw loops, and JavaScript in general.

Implemented using the P5.js framework for the draw loop and canvas drawing functionality with nothing else but vanilla JavaScript.

[![Screenshot of game with triangle representing the ship in the center and white asteroids all around](lightshift-game-2.png)](https://tyrelh.github.io/lightshift-game/)

You can [play the game](/lightshift-game/index.html) right now!

Controls:

* Left & Right Arrows: Turn
* Up & Down Arrows: Boost
* Shift: Shoot
* Control: Jump

## Basic Overview

Overall there is a game object that contains many layers of the game for title screen, end screen, and game functionality.

Each game layer contains objects associated with its purpose. For example the game layer contains a ship object representing you and an asteroids layer which itself contains many asteroid objects.

All layers and objects implement `update` and `draw` methods. The `update` method will update the state of a particular object for that frame, and then the `draw` method will draw it with the new state.

The layers serve to group similar objects as well as delegate calls to `update` and `draw`. For example each frame `game.update()` is called. This call simply causes `game` to loop through all the layers it contains and call `update` on them, and so forth. Until finally a layer calls `update` on a base object that contains state. That state is then updated!

## Future Updates

1. A couple portions of spaghetti code associated with collisions that needs to be cleaned up.
2. AI ships that maybe enter after a particular point  and try to ruin your day. A simple following mechanism with collision avoidance for the asteroids seems sufficient enough to start.
3. New items that allow for ship upgrades like weapons or shields. Currently every 1000 pts a one-time use shield drops from an asteroid. Perhaps it would make more sense to have the items drop from enemy ships rather than asteroids.
4. The lightshift RGB effect on all the assets isnt being drawn very efficiently. Improvements could be made.
5. Touch controls for mobile.

## Github Repo

The code for this is available on [Github](https://www.github.com/tyrelh/lightshift-game).

Any feedback or comments are welcome! This is very much in an alpha state.

