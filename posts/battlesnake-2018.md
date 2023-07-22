---
title: "Battlesnake Programming Competition 2018"
date: "June 11, 2018"
author: "Tyrel Hiebert"
excerpt: "Battlesnake is a programming competition where participants create an AI server that acts as the brain of a snake in the classic game Snake. Participants compete in a round-robin tournament played out live in front of an audience of roughly 1000 people. The winner takes home up to $4,000!"
hero: "/images/posts/Battlesnake2018-1.jpg"
tags: "python ai events battlesnake"
---

![Battle snake logo on purple background](Battlesnake2018-1.jpg)

## Tl;dr
* [Background](#background): Battlesnake is a programming competition where students and industry professionals develop an AI to play a multiplayer version of the classic game Snake.
* [First Year Competing](#first-year-competing): I was very excited to discover this competition and thought it would be a great way to learn Python.
* [Getting Started](#getting-started): Set up a basic "starter snake" provided by sendwithus.
* [Learning the A* Algorithm](#learning-the-a-algorithm): After getting use to Python and concept of Battlesnake, I needed to give my snake some smarts.
* [Building a Flood Fill Algorithm](#building-a-flood-fill-algorithm): Now that my snake could find its way around, it needed to see beyond its target.
* [Basic Behaviour Switching](#basic-behaviour-switching): With a few basic behaviors coded, I needed to be able to switch between them given some parameters.
* [Aggressive Behaviour](#aggressive-behaviour): Basic survival is taken care of. Now I wanted to be able to hunt my opponents.
* [The Event](#the-event): The competition consists of a "Bounty Snake" section where you can challenge the sponsors to duels. After that is the tournament itself composed of beginner, intermediate, and expert divisions.
* [Conclusion](#conclusion): Super fun event! You should go!
* [Code](https://github.com/tyrelh/battlesnake2018) for my 2018 entry is on Github.

## Background

[Battlesnake](https://www.battlesnake.io/) is a programming competition where competitors develop an AI to play a multiplayer version of the classic game [Snake](https://en.wikipedia.org/wiki/Snake_(video_game_genre)). Competitors can be individuals or groups; they are mainly students and industry professionals.

My first time entering the competition was this year, but the first version of the event was in 2013; it began as a small, friendly programming competition between a few colleagues at sendwithus (now [Dyspatch](https://www.dyspatch.io/sendwithus/)).

A “snake” is essentially an API (Application Program Interface). This API has several required endpoints such as `start` and `move`. For every move, the game server will send a POST request to each snake's `move` endpoint, with the entire game state in the body of the request. You have 250ms (including your network transit time) to respond with a move, either “up”, “down”, “left”, or “right”.

Once each snake has responded, the moves are played out on the board simultaneously. If a snake hits a wall or another snake's body, it dies. If a snake eats food, it grows by one segment. If two snakes collide head-on the smaller snake will die. The object of the game is to be the last snake alive.

The competition is divided into three categories: beginner, intermediate, and expert. Within each bracket there is a round-robin tournament to determine the winners.

During the day-long event there are many different activities. Early in the day there is the opportunity for newcomers to set up and begin developing their AI from scratch. Experienced developers are there to provide assistance in developing and deploying fresh snakes. Midway through the day are the bounty snake challenges; sponsors of the event challenge participants to duel their snakes for prizes. Sponsors with bounty snakes can opt to have their own unique rules to the game, forcing challengers to adapt their strategies the day of the event. Prizes for besting a bounty snake vary from t-shirts and stickers, to entries into a raffle for bigger prizes. Around 4pm, the main tournament begins. Starting with the beginner division, each tournament is played out on a big screen for all the participants to watch. The whole thing is also [streamed on Twitch](https://www.twitch.tv/battlesnakeofficial). Prizes of up to $4,000 are awarded for a podium placing.

![Conference room full of people working on their laptops during the event](Battlesnake2018-2.jpg)

## First Year Competing

Going into this I wasn’t sure what to expect. I just just really getting into the idea of software development in my second year of a Computer Science degree and was eager to try out some of my new skills.

One of the great (and overwhelming!) things about a competition like this is that there are essentially infinite ways of approaching the task. Some people do tree searches through the possible board states, some people build a more specific AI architecture, some even have started incorporating machine learning into their snakes. I’m not sure if any strategy is the best strategy, and this is just me documenting my journey and particular strategies as I became fascinated with this game.

## Getting Started

I decided to write my first entry in Python. I had been into Java for a while with school and was excited to learn Python; and what a better opportunity. I began with one of the [provided “starter snakes”](https://github.com/BattlesnakeOfficial/starter-snake-node) which are basic repositories with a simple server setup with the required endpoints, but no logic within those endpoints. Generally the starter snakes just `move` up upon a move request.

With the starter snake as a base, my first goal was to get the snake to chase its tail. Circling on your own tail seems to be a tried-and-tested method for basic survival so that seemed like a good place to start. Looping over an array of directions and returning a new one each time lets you blindly return a new direction each time. This sort of works, but the snake is still unaware of its surroundings and will still bump into walls, other snakes and even itself occasionally. The snake really needs some eyes so it can see if the next move is deadly or ok.

I decided the simplest was to do this was to build myself a representation of the board. Each turn you are sent the board dimensions (which don’t change during the course of a round, but could change round-to-round), locations of all the snakes (for each snake a list of the positions of each body segment), and a list of food locations. At the start of each turn, I build a 2-dimensional array representing the game board, and plot all the snakes and food on it. I set up a simple numbering system representing the different possible board cells in a sort of increasing danger rating. 0 for space, 1 for food, 2 for snake body, and out of bounds represents the board edges. Now, after I pick a move, I can determine what the x, y coordinates of that move will be based on my current location, and I can check if that move will kill me or not based on the current board state. If it is deadly, pick another move. Basic sight!

With just this simple start your snake can spin around in a circle and survive for a while. The problem now is that you have an ever decreasing amount of health, and you need to eat food to replenish it. You begin with 100 health, and each move you take this is decremented by 1. If you reach 0 you die. So you have to eat! But in order to find food reliably when you are getting hungry, your snake will need more smarts that just its basic sense of sight.

## Learning the A* Algorithm

In order to choose a move that will get you closer to a particular destination, you will need to implement some form of pathfinding. When looking into pathfinding algorithms, [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) almost always comes up at the top of the list. I would struggle to explain A*, but the resource I used to initially learn and implement the algorithm was a video from [Daniel Shiffman](https://shiffman.net/) titled [A* Pathfinding Algorithm](https://www.youtube.com/watch?v=aKYlikFAV4k). He guides you through the algorithm and you can follow along and implement it in JavaScript with the [p5.js](https://p5js.org/) library. You can find my original implementation on [Github](https://github.com/tyrelh/a-star-p5.js). Also if you are building your snake with JavaScript and NodeJS, you can just reuse this code! For my first snake I translated this code into Python.

With this algorithm you can find the shortest path between a start point and a destination. Your start point will likely be your current head location, and the first destination point I choose was the closest food. I originally wrote this algorithm with my snake’s head and the closest food sort of hard-wired in, but later refactored it so that I can pass in any arbitrary start and destination points I want. Also within the algorithm you want to tell it to treat out of bounds as well as all snake body segments as “no go” areas. Basically the walls or obstacles that you are finding a path around. Within the search function I wrote, once you have found the optimal path to your destination, what you actually need from it is which direction to go next. Basically every turn you will be doing this search and just moving whatever it tells you the next move should be. There is no sense in recording or remembering the whole path as the game is filled with other snakes that are also moving every turn, so the optimal path may change from turn to turn.

One other thing to note is that there is often no path to where you want to go. Maybe a food exists on the board but is completely blocked from you on the current turn by other snakes. You just want to make sure you are handling situations like this gracefully and avoiding exceptions or other “panic” behaviour that might creep up. Develop a strategy for when you are unsure which move will get you closer to your destination.

An optimisation to the earlier tail-following behavior is that you can now use this A* algorithm to find the best move that brings you closer to your tail! You can just pass your tail location to the algorithm rather than a food location as the destination. This is a more robust way to follow your tail rather than looping through a series of moves as I initially implemented. Using the A* search allows you to be any size and anywhere on the board. It also makes it so you can follow yourself clockwise or counter-clockwise depending on which is better given the board state, as well as navigate effectively if you are touching other snakes.

Now that my snake could find food it could survive much longer than 100 turns! At this level you could be well into the beginner category. Unfortunately every time you improve your snakes smarts and survivability, new problems pop up. The next glaring issue that I began to notice is that my snake loved to travel down dead ends. The snake was smart enough to find a food and seek it out, but not to plan for what would happen after it got to it.

## Building a Flood Fill Algorithm

The behaviour I thought of to combat this tendency was an algorithm to measure how large a space was. If the space is too small to fit, or if another direction would lead to a large open area, the snake would take that into account when choosing the next move.

Sidenote: This was the moment when I should have realized that a move scoring system was the way to go. Next year I would implement this with great success, but this first year I basically stuck to a bunch of `if`/`else` statements. It is really difficult to balance the importance of different signals if you don’t have some kind of weights on them that you can tune. For example, if you have two possible moves, left and right, and there is food to the left, but much more space to the right, how do you value them? Which move do you choose? With a scoring system, you can apply a score to each move and sum them up in the end, choosing the move with the highest score. This is what I went on to build next year, but more on that in a different post.

I believe what I was doing last year was testing to see if my snake length could fit into the area accessible by my next move. I would do my A* search first to see which direction I would prefer to go, and then do the flood fill on that move to see if I can fit. If I couldn’t fit I would choose a different move, abandoning my pursuit of food. This approach helps you to avoid these small areas that will easily trap you, but tramples over a lot of subtlety. For example, if there are snake tails within the area, that area will be expanding, so it is much more strategic for you to move into it. In the same vein, if there are snake heads within the area, the space will fill up as the game progresses. Taking these into consideration is a really good idea.

A great tip for beginner programmers is that when you are developing and writing these algorithms, try to write them in reusable ways. Avoid hard-coding your snake to behave in one way.

## Basic Behaviour Switching

My snake at this point has two different behaviors available to it. The first is to follow its own tail and the second is to seek out food. So long as you wrote your search algorithms in a way that you can pass any destination to them, it is pretty trivial to switch between these behaviours.

All I did to start was to switch between them based on my health level. If my health remaining was high, I would follow my tail. If my health was low, I would seek out food. This behaviour is what has become known as “chicken-snake” behaviour. Before I learned about Battlesnake, a now infamous player first developed this basic strategy to much success (coming in 2nd overall I believe). I guess people thought it looked like a chicken running around with it’s head cut off (sorry for the imagery).

So long as your algorithms are robust, and your snake doesn't make very many mistakes, this technique can still get you pretty far, perhaps even into the expert bracket. But because this behaviour became so popular, I decided I would actually see if I could build my snake to counter it.

## Aggressive Behaviour

Now that my snake had some basic survival skills, I wanted to try to do something a little different. I got the idea of trying to make my snake actively aggressive towards its opponents.

When two snakes move in to the same space it is a head-on collision, and the rules state that if one snake is larger than the other the smaller snake will die. When a snake dies in the game all of its body segments are immediately removed from the board.

So my plan was to use my A* algorithm to seek out other snake heads. Strictly speaking, I would not target their head, but target the next move that then can make. So I altered my initial board state creation to mark `KILL_ZONE` for spaces a smaller snake than me could move next, and `DANGER_ZONE` for spaces a larger or equal size snake than me could move next. So now my board had these possible cell states:

1. `SPACE`
2. `KILL_ZONE`
3. `FOOD`
4. `DANGER_ZONE`
5. `SNAKE_BODY`

I ranked them in order of danger so that in my A* algorithm when testing if a cell is a valid spot for a path I can simply test if its board value is < `SNAKE_BODY`.

Now with the `KILL_ZONE` markings available, I could simply find the one closest to myself and use my A* to target it.

The next thing I wanted to do was to insure I was the biggest snake on the board, so that I could aggress any other snake I wanted. In the section of my code where I was determining which behaviour to use, I would not only test to see if I needed to eat because of hunger, but also if I needed to eat because I wasn’t the longest snake on the board. This behaviour works well sometimes but it has the fatal flaw that there can be other snakes with the same behaviour. You both can get into a feeding frenzy where you are always trying to get bigger than the other snake. You end up getting really long and it is only a matter of time before one of you makes a mistake and gets trapped. I did not fix this issue for this year and it seemed alright, just something to keep in mind.

So now my snake will eat if it is hungry or if there are any larger snakes, and it will target the nearest smaller snake if it is the largest on the board. I actually found that this simple behaviour has some really interesting and powerful emergent behaviours that I didn’t code for.

The first that I noticed is that it is very effective at dealing with the “chicken-snake” strategy. As a chicken snake is spinning away, minding its own business, my snake would be targeting its head. Since the other snake is smaller and spinning in a ball, my snake would wrap around it, trapping it. When the “chicken-snake” decided it had been spinning for long enough and it was time to eat, there was nowhere to go. Chances were that it might not be able to escape and get to food. If I didn’t kill it first by a head-on collision, I might be able to starve it.

The other interesting behaviour I noticed is similar to above, but instead of surrounding the opponent snake, I would block it against a wall. My snake wasn’t smart enough to notice if it could create a dead end for the other snake, but it could keep it against the wall for a long time, starving it.

This aggressive behaviour actually seemed to work very well. 1-1 my snake was quite strong at this point (a friend of mine who went on to win 2nd place in the intermediate division I could defeat almost all the time 1-1).

There are a few oversights in my strategy up to this point that I was aware of, but had run out of time to address. One was the eating behaviour that could lead to me getting very big and potentially kill myself. Another was that I didn’t necessarily need to be the biggest snake on the board at all times. There are plenty of opportunities to act aggressive to larger snakes while staying small. And lastly, but more importantly, there were still tons of small bugs and edge cases that I just wasn’t accounting for. There were still cases where given two possible moves, my snake was unable to see far enough ahead, or see in enough detail, to choose the best one. Building a robust logging solution is a must so that you can look back one a game to the move where your snake made a vital decision and you can debug why it may have made the wrong one. I had some basic console logging at this point but nothing nearly good enough.

But time to work on it was winding down, and the event was coming up.

## The Event

In the morning people can converse and mingle, and newcomers can get help on getting their snakes setup and working. It’s great to hang out with your friends and work through some of your last bugs. Then lunch is provided by a bunch of great food trucks from around town. [Dead Beetz](https://www.deadbeetz.com/) is definitely my favorite go-to burger!

After lunch the Bounty Snake challenge opens to everyone. This part is a lot of fun. You are able to visit each sponsor’s booth where they usually have some free swag. But also, more crucially, they have a snake of their own that you can challenge to a dual. Each sponsor has different prizes available to competitors who can defeat their snake. This year I actually won a terrific prize of $1000 from the local company [Rooof](https://www.rooof.com/)!

Around 4:00 is when the actual competition begins. The setup this year was fantastic. They had two projectors showing the live games to an audience of around 800 people. They had live commentary and were also streaming the entire event live on [Twitch](https://www.twitch.tv/battlesnakeofficial). They do each bracket separately moving from Beginner to Intermediate and then Expert.

I participated in Beginner this year as it was my first event. I was actually a little worried that my snake was too strong for beginner as I knew that some people entering had only started on their AI that day. Well I would be proven very wrong on that front. I won the first round I played and made it to the next head which was very exciting indeed. But alas I was knocked out in the next round, seemingly to some kind of bug (my snake hit another snake with possible move to avoid it existing). Oh well! It was so much fun to watch all the other snakes compete and to see everyones interesting and novel strategies. The top player in the expert division won $5,000, and in his little acceptance speech he said he was very glad to win as this money will partly cover his AWS bills for his snake! Holy cow!

During the tournament, the music playlist left much to be desired. This gem came on part way through the night and everyone thought it was a custom "Battlesnake" theme song and loved it! Only later did we learn they were saying "rattlesnake" not "battlesnake".

<div className="video-container">
    <iframe
        width="853"
        height="480"
        title="King Gizzard and The Lizard Wizard - Rattlesnake"
        src="https://www.youtube.com/embed/Q-i1XZc8ZwA"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
    />
</div>

## Conclusion
I think this is such a great event to participate in. The challenge itself of creating an AI to play this game a great way to practice and build your coding skills. Everyone has the same 250ms to respond to each move request, but what you do in that time is all up to you. It is accessible to beginner programmers, but still an interesting challenge for a seasoned professional. I had a great time connecting with other students and industry professionals. I see myself participating every year that I can!

My code for 2018 is available on [Github](https://github.com/tyrelh/battlesnake2018).

I'll see you next year,
ZeroCool