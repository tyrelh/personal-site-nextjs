---
title: "Dark Mode React Toggle"
date: "June 28, 2020"
author: "Tyrel Hiebert"
excerpt: "I developed a dark and light theme for this site and built a toggle to switch between them. Also I used media queries to set the default theme to match the visitors operating system choice."
hero: "/images/posts/DarkModeToggle-1.svg"
tags: "react dark-mode javascript webdev"
---
# Dark Mode React Toggle
#### June 28, 2020

I developed a dark and light theme for this site and built a toggle to switch between them. Also I used media queries to set the default theme to match the visitors operating system choice.

![Sun and moon icons](DarkModeToggle-1.svg)

## Tl;dr
* [Introduction](#introduction): I am dark mode obsessed. Every app I use I attempt to make it dark themed. 😎
* [Theme Switch](#theme-switch): I built a switch to allow a visitor to toggle between light and dark theme.
* [Styles](#styles): I nested the styles for both light and dark theme together. You may want to separate them so that you can selectively download.
* [Media Query](#media-query): You can set the theme based on the visitor's operating system choice!
* [React Component](#react-component): Bundling everything up into a nice component.
* [Github Repo](#github-repo): You can roll your own dark theme using my toggle.

## Introduction
I've been obsessed with dark themes for a while now. To the point were I will essentially boycott an app or service if I cannot find a way to theme it dark. Just the thought of staring into a blinding white screen is giving me a headache right now.

Ever since a very early iteration I have had my personal website styled with a dark theme. But as I get further into my career as a software developer the thought that anyone but myself might actually look at my website is a looming fear. Is it ready for that? Perhaps in software development this may be skewed just a bit but I think in general people prefer the more expected light colours of the internet. Google is light, Amazon is light, nothing popular is dark.

## Theme Switch
I decided to implement a theme switch. After reading a bit into how others accomplished this it turned out to be quite simple. The hard part is actually designing a light theme for my site.

Essentially all you need to do is create a toggle, checkbox, or button that will apply or remove a class from the HTML `body`. Depending on how your site (or app) is designed you could apply this class to some other parent component, but since I was using the body background I decided to just use the body.

I built a button based toggle switch. The onClick method will do

```javascript
document.body.classList.toggle("dark-mode");
```

## Styles
Now, in your CSS, whatever styles you want overridden when this theme is toggled just add the `dark-mode` class selector.

For example

```css
body {
  background-color: #fff;
  color: #222;
}

body.dark-mode {
  background-color: #333;
  color: #eee;
}
```

or some SCSS

```scss
h1 {
  color: #222;
}

.dark-mode {
  h1 {
    color: #eee;
  }
}
```

I prefer having the dark and light styles right next to each other in the file, but some might notice that you are always downloading both styles even if only one is being used. Maybe if I ever decide to separate them I'll write another article about how that worked.

## Media Query
A piece of functionality I really wanted was rather than choosing light or dark as the default for everyone and forcing them to press the switch I wanted to default to their OS theme choice. MacOS, Windows 10, iOS, and Android all have dark-mode support so wouldn't it be nice if you could just set the theme based on that? You can!

```css
@media (prefers-color-scheme: dark) {
  // styles
}
```

You can query for either `dark` or `light`. You can use this media query directly in your styles to make your site completely reactive to the user OS choice. The issue with that is that it greatly complicates being able to switch between the themes.

I opted to just write my styles around the theme class I created for `body`. Then in my javascript I use the media query to set the initial mode of my switch component.

```javascript
componentDidMount() {
  const userPrefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (!userPrefersDarkMode && !this.state.darkMode) {
    this.themeToggleOnClick()
  }
}
```

If your default theme is light, this `componentDidMount` will automatically switch it to dark on page load if the user has their OS set to dark.

## React Component
Since I a working in React I bundled the logic and layout for the switch into a `ThemeToggle` component. I personally used the Icon and Tooltip components from the [Ant Design](https://ant.design) library to simplify a few things and provide a nice tooltip if someone doesnt understand what the icon represents.

```jsx
import React from "react";
import "./themeToggle.scss";
import { Tooltip, Icon } from "antd";

export default class ThemeToggle extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lightMode: false
    };
  }
  
  componentDidMount() {
    const userPrefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (!userPrefersDarkMode && !this.state.lightMode) {
      this.toggleTheme()
    }
  }

  toggleTheme = async () => {
    await this.setState({
      lightMode: !this.state.lightMode
    });
    document.body.classList.toggle("light-mode");
  };

  MoonSvg = () => {
    return (
      <svg className="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
        <path className="moon-icon"/> // EXCLUDED SVG PATH FOR BREVITY
      </svg>
    )
  };

  SunSvg = () => {
    return (
      <svg className="toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <path className="sun-icon"/> // EXCLUDED SVG PATH FOR BREVITY
      </svg>
    )
  };

  render() {
    return (
      <Tooltip
        title={`Toggle ${!this.state.lightMode ? "Light" : "Dark"} Mode`}
        placement="bottomRight"
        arrowPointAtCenter
        mouseEnterDelay={0.2}
      >
        <div className="toggle-container">
        {
          (this.state.lightMode) ?
            <Icon component={this.MoonSvg} onClick={this.toggleTheme} />
            :
            <Icon component={this.SunSvg} onClick={this.toggleTheme} />
        }
        </div>
      </Tooltip>
    );
  }
}
```

And here are the styles I used for this button

```scss
@import "../../colors.scss";

.toggle-container {
  width: 60px;
  height: 60px;
  font-size: 40px;
  line-height: 66px;
  top: 16px;
  right: 21px;
  position: fixed;
  z-index: 3;
  border-radius: 30px;
  background-color: rgba($color-main-bg, 0.9);
  text-align: center;

  @media (min-width: 375px) and (max-width: 812px) {
    line-height: 64px;
  }

  .toggle-icon {
    width: 1em;
    height: 1em;

    .sun-icon {
      fill: $color-main-text;
    }

    .moon-icon {
      fill: $color-main-text-light-theme;
    }
  }
}

.light-mode {
  .toggle-container {
    background-color: rgba($color-main-bg-light-theme, 0.9);
  }
}
```

You can see I ended up also storing the toggle state in the component state. That way I can easily conditionally switch between the sun and moon icon.

Also switched things around a bit. For my website I still treat the dark theme as default and the light theme as the exception. Therefore I am tracking the state as lightTheme = true/false rather than darkTheme. Same thing, just do whatever works best in your brain.

## Github Repo
In addition to the source here which is specific to my implementation and also uses Ant Design I have posted a [Github repository](https://github.com/tyrelh/dark-mode-react-toggle) with a more generic React component that lets you have theme switch.

All you need to do is include the component and then create your own styles for a dark theme nested within a `.dark-theme` class on the `body`.

Have a nice day! 😎