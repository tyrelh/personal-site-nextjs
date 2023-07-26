---
title: "Deploy a Next.js Static Site to GitHub Pages"
date: "July 23, 2023"
author: "Tyrel Delaney"
excerpt: "I cover the config and deployment steps necessary to easily deploy a static site built with Next.js to GitHub Pages."
hero: "/images/posts/NextJSGitHubPagesHero.png"
tags: "github-pages nextjs react static-site-generators typescript"
---

Let's say you've built an nice new static site using Next.js and you want to host it on GitHub Pages. Well there's a few steps to get it working, but it isn't too hard.

![next js logo and github logo](./NextJSGitHubPagesHero.png)

This article assumes you already have a website built locally and you're just looking to host it on [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages). In the future I may write some how-tos for creating a blog using markdown and Next.js.

In this example I'm going to outline how I deploy to my main GitHub Pages repo for [superflux.dev](https://superflux.dev). It's hosted in my GitHub account's [main Pages repository](https://github.com/tyrelh/tyrelh.github.io). Everyone has access to this special repo. Just create a new repo with the title _your-github-username.github.io_. GitHub will serve the static content there on your own subdomain `https://your-github-username.github.io`. You can even connect a custom domain like I did, I'll talk about that optionally at the end.

You can also use this tutorial to push repo-specific pages. Google for that if your unfamiliar.

## Tl;dr

* [Static content](#static-content): A quick overview of how to build static assets for a Next.js site.
* [Install gh-pages package](#install-gh-pages-package): There's a lovely NPM package that makes it very simple to deploy static assets to GitHub Pages.
* [Branch setup](#branch-setup): I use two repositories on GitHub, one for my source code and one that is the Pages repository that gets hosted under your username.
* [Deploy script](#deploy-script): The deploy script uses the *gh-pages* package.
	* [Static content directory](#static-content-directory): Set the *out* directory in the deploy script that Next.js outputs static assets to when building and exporting.
	* [Remote & branch](#remote--branch): Set the remote and the branch that you want *gh-pages* to push your static assets to.
	* [Force push to remote](#force-push-to-remote): Allow the deploy script to force-push changes to your GitHub Pages repo.
	* [\_next hidden folder](#_next-hidden-folder): Some tweaks to make GitHub Pages play nicely with Next.js
* [\[Optional\] Configure a custom domain](#optional-configure-a-custom-domain): Allow a GitHub Pages site to be served over a custom domain name.
* [Resources](#resources)
* [Conclusion](#conclusion)

## Static content

GitHub Pages can only serve static content. You need to be able to export your Next.js project to static code. You can do this by running

```shell
next build && next export
```

`next export` will export the static code for your project to the _out/_ directory. This is the code we're going to want to host on GitHub Pages.

To simplify and make it easy to remember I added this as a `build` script in my *package.json*. Add/edit the `build` script:

```json
"build": "next build && next export"
```

## Install gh-pages package

I've used this package in the past and it works well for GitHub Pages websites. *[gh-pages](https://github.com/tschaub/gh-pages)* is a simple little tool that makes it easy to push projects to GitHub Pages repos or branches.

```shell
npm install gh-pages --save-dev
```

## Branch setup

I store my website source in a separate repository, in my case a repo called [personal-site-nextjs](https://github.com/tyrelh/personal-site-nextjs). By default *gh-pages* will deploy your static site to the `origin` remote. But we can change that. I like to keep the `origin` for my source repo pointing to the source remote.

* `personal-site-nextjs`: repo containing the source code for my website. I do development here
* `tyrelh.github.io`: my main GitHub Pages repo. This is were the compiled static assets are served from

You can also just use separate branches in the same GitHub Pages repository if you prefer. One for the source and one for the public assets. That feels messy to me so I prefer to keep them separate.

## Deploy script

Next we'll setup a deploy script in our _package.json_ to deploy our static content!

In your _package.json_ create a new script. Remember it should be on the same level as the other scripts, in the `"scripts"` block:

```json
"deploy": "gh-pages"
```

Now this by itself wont work yet, but I'm going to step you through each additional step to get the `gh-pages` command working. If you want to [skip to the end and just see the final script](#conclusion), go ahead!

### Static content directory

First you want to tell it what directory that your static assets are in. Remember this is the directory that `next export` in your `build` script outputs to. By default this is the _out/_ directory in your project. Make sure you run your build script first so that your static files are here.

Use the `-d` flag to set the directory.

```json
"deploy": "gh-pages -d out
```

### Remote & branch

We want to make sure `gh-pages` knows where it should push our static code to for hosting. It's good to set this up first so you don't accidentally push code somewhere you don't intend to.

For the `gh-pages` command, you can use the `-b` flag to tell it the remote branch you want to push to. Whatever the default branch of your _username.github.io_ repo is will work. `main` or `master` for example.

```json
"deploy": "gh-pages -d out -b main"
```

Next you'll want to set the remote. I like to hard code this in the script itself. Since it's going to be static for this project I don't see any reason not to. You can use the `-r` flag to set a remote URL. Copy the remote URL from your _username.github.io_ repo.

```json
"deploy": "gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git"
```

### Force Push to Remote

When deploying new static content to your GitHub Pages repo, generally you're going to want to overwrite what is there. At least this is the simplest way to do it. Before setting this just double check that your branch and remote are set correctly. You don't want to overwrite anything you don't intend to!

Use the `-f` flag to force the push to the remote, overwriting files and changes that may exist on the remote.

```json
"deploy": "gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git -f"
```

Ok! We're almost there! If this was a Jekyll project, or maybe a standard React project this would probably be all you need. But since we're using Next.js there is one more piece of config we need to do.

### \_next Hidden Folder

In your _out/_ directory of static assets, you should see a folder called _\_next/_. This is where Next.js puts your compiled JavaScript and CSS.

By default, GitHub pages actually ignores folders beginning with a \_. This is because GitHub Pages is setup to use Jekyll. Jekyll considers folders beginning with \_ to be hidden folders, so GitHub Pages just doesn't serve them.

You can deploy the code as is, and it will look like it worked since you can see the _\_next/_ directory in you _username.github.io_ repo. But any requests to those assets when you visit your website will result in a 404 not found error.

To fix this you need to add a file named _.nojekyll_ to the root of your _username.github.io_ repo. You can do this right on the GitHub website to test it out. Once that file is there and you give it a couple minutes to take effect, your website should work without 404 errors!

But now if you deploy your static code again that file will get erased, breaking your website. We need to incorporate this file into our deploy or build scripts. I put it at the beginning of my deploy script, but you could also put it at the end of your build script too if that makes more sense to you.

We want to create that `.nojekyll` file in our _out/_ directory after our code is built, but before we deploy it using `gh-pages`.

At the beginning of your deploy script, add an `echo` command to create the file. The file can contain anything, I just echo the string `true`. Use the `&&` between the `echo` and `gh-pages` commands so that they will run sequentially.

```json
"deploy": "echo 'true' > ./out/.nojekyll && gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git -f"
```

This wont quite work, because by default `gh-pages` ignores hidden dotfiles! To tell `gh-pages` you want to include dotfiles (that's files beginning with a .), use the `-t` flag on the `gh-pages` command.

```json
"deploy": "echo 'true' > ./out/.nojekyll && gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git -f -t"
```

And that's basically it!

## Configure your repo for GitHub Pages

You'll need to make sure your repo is configured for Pages. Go to your repo, click on the repo _Settings_, and click _Pages_ on the settings side bar. See the [GitHub Pages docs](https://docs.github.com/en/pages/getting-started-with-github-pages) for more general info about hosting static content.

## \[Optional\] Configure a custom domain

After you follow the [instructions here](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) to setup your custom domain with your GitHub Pages website, you'll notice that you need a _CNAME_ file in the root of your repo for the domain to map correctly.

Since our deploy process overwrites all the files in our GitHub Pages repo on each deploy, we need to add this file to our deploy/build process so it will be included each time. This is similar to what we needed to do for the _.nojekyll_ file.

At the beginning of your deploy script, add another `echo` command. You want to output the root domain for your website to a file called _CNAME_. In my case my root domain is `superflux.dev`.

```json
"deploy": "echo 'superflux.dev' > ./out/CNAME && echo 'true' > ./out/.nojekyll && gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git -f -t"
```

Make sure to include the `&&` between each command so they run sequentially!

## Resources

* Allow the _\_next_ folder to get picked up in repo: https://github.blog/2009-12-29-bypassing-jekyll-on-github-pages/
* `gh-pages` package to easily deploy to GitHub Pages repositories: https://github.com/tschaub/gh-pages
* GitHub Pages docs: https://docs.github.com/en/pages/getting-started-with-github-pages
* GitHub Pages custom domain docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Conclusion

And now that's it! To summarize we built a deploy script in our _package.json_ that looks like this

```json
"deploy": "echo 'true' > ./out/.nojekyll && gh-pages -d out -b main -r https://github.com/tyrelh/tyrelh.github.io.git -f -t"
```

You'll want to make sure your `-b` branch is pointing to the branch being served on your GitHub Pages repo, and that the `-r` remote is the URL of your GitHub Pages repo.

After building your website locally just run `npm run deploy` to push your static code to your GitHub Pages site! Remember the `gh-pages` package uses _git_ to push code to the remotes, so you'll need to configure your username, email, and credentials to authenticate the push to your GitHub Pages repo.

Reach out to me on Twitter [@tyreldelaney](https://twitter.com/tyreldelaney) if you have any questions, comments, or suggestions!

*Note: this article was written in April 2022. It sat for a while in my queue of articles as we were gearing up to have our first child. Hopefully nothing has changed drastically with Next.js and GitHub Pages that renders this info unusable.*