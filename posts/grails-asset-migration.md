---
title: "Migrating Frontend Assets During Grails 2 → 3 Upgrade"
date: "Dec 15, 2019"
author: "Tyrel Hiebert"
excerpt: "Upgrading our application from Grails 2 to Grails 3 has been a long process. Migrating our static frontend assets is just one piece of that process."
hero: "/images/posts/GrailsAssetMigration.svg"
tags: "grails"
---

Upgrading our application from Grails 2 to Grails 3 has been a long process. This is just one piece of that process.

## Tl;dr

* [Asset-Pipeline Plugin](#asset-pipeline-plugin): Grails 3 uses a new plugin by default to render static assets within GSPs.
* [Frontend Modules](#frontend-modules): Frontend module structure has changed between the old Resources plugin and the new Asset-Pipeline plugin.
* [Including Modules](#including-modules): There are new tags to use within GSPs.
* [Serving Assets from an External Source](#serving-assets-from-an-external-source): You can easily serve static assets from any URL without changing any asset references.

![](GrailsAssetMigration.svg)

## Asset-Pipeline Plugin

The main change when dealing with non-GSP frontend assets like stylesheets, javascript, and images is the plugin you use to insert those assets into your GSPs. The new plugin Asset-Pipeline replaces the old Resources plugin standard in Grails 2.

The first difference is the Tag-lib has changed. All `<r:require modules="module1"/>` tags must be converted into corresponding `<asset:javascript src="module1.js"/>` and `<asset:stylesheet src="module1.css"/>` tags.

The second change is you will need to remove any `<r:layoutResources/>` from within `<head> </head>` and also replace any `<r:layoutResources/>` at the bottom of pages with the new `<asset:deferredScripts/>` tag.

## Frontend Modules

As you may have noticed in the previous section, the original `module1` turned from one `r:require` tag to two `asset` tags, one for javascript and one for css. 🤯 This turned out to be a big pain.

Previously, the Resources plugin relied on a *Resources.groovy* file where modules were defined. Since this was a groovy file these modules could be defined in any manner of ways. We built modules containing javascript and css, and that had dependencies that contained javascript or css or both.

This allowed us to do something like `<r:require modules="auth-layout"/>` which had auth-specific styles, but also depended on our "modular-layout" module, which had certain base styles. This depended on our "global-styles" module which depended on our "core-js" module and "fonts" module. Somewhere in this tree something depended on jQuery and also a slimmed down Bootstrap stylesheet. So really there could be a dozen or more imports that were compiled from that single tag-lib.

With the new Asset-Pipeline plugin, all assets are expected to be in the *grails-app/assets* directory with subdirectories for *javascripts*, *stylesheets*, and *images*. This means separating modules into javascript and css modules. In the root of the *javascripts* and *stylesheets* directories exist css and javascript files that act as "modules". These files can `require` other files to form modules. During a production build the required files will get flattened into these module files.

I structured these directories as such: each of the *javascripts* and *stylesheets* directories has a *js* and *css* subdirectory respectively. These subdirectories contain our transpiled javascript and css. In the root of the *javascripts* and *stylesheets* directories are the module files that `require` files contained in the subdirectory. I used the naming convention `<name of module>[Layout][React]Module.<js|css>`. For example: `quickLinksReactModule.js` or `appLayoutModule.css`. This naming scheme is just something I created and is not Grails or Asset-Pipeline specific. The Module keyword tells the developer this is not a source file, the React keyword differentiates this module from our legacy assets, and the Layout keyword tells the developer this is the styles for a Grails layout.

I was able to group a reasonable amount of our global assets into what I called our `coreModule` and `coreReactModule`. These modules are essentially included in every layout module.

## Including Modules

With all of the module created the way we liked, we can now just add the appropriate `<asset:javascript src="nameOfModule.js"/>` and `<asset:stylesheet src="nameOfModule.css"/>` tags into our layouts and pages.

Ensure you are including files in the appropriate dependency order. If you have a layout module that includes jQuery and then a later module that relies on jQuery ensure you are midnful of this! You can also include the `asset-defer="true"` flag on the asset tag to defer the loading of assets to where you include the `<asset:deferredScripts/>` tag.

```
<asset:javascript src="contactsReactModule.js" asset-defer="true"/>
```

## Images

The Asset-Pipeline plugin also has default support for images. The true benefit of this I will describe in the next section, but I'll describe how it works here.

Alongside the *javascripts* and *stylesheets* directories within the *assets* directory you can create an *images* directory. Create any organizational subdirectories in here that make sense for your project and place your static images within.

In your GSP you can include an image using the Asset-Pipeline tag `<asset:image src="brand/logo.svg" alt="Company X wordmark"/>` This tag essentially just compiles into the html tag `<img src="assets/brand/logo.svg" alt="Company X wordmark"/>`, so why not just type that? Also is it a good idea anyway to be referencing static assets within your Grails application?

## Serving Assets from an External Source

I haven't tried this as of writing this article as we haven't quite got to the stage of deployment for our Grails 2 -> 3 upgrade, but we are very exited about it.

Within your *application.groovy* (or I believe your *application.yml* as well but the syntax will differ) you can add a config option to direct the Asset-Pipeline plugin to where your *assets* folder is stored.

```
environments {
    production {
        grails.assets.url = "https://s3.amazonaws.com/some-bucket/assets"
    }
}
```

This location could be a different directory within your application, or what we are interested in is using S3 to completely separate our static assets from our application.

This will cause any `<asset:image src=”brand/logo.svg” alt=”Company Wordmark”/>` asset tag to render as a `<img src=”http://s3.amazonaws.com/asset-pipe/assets/brand/logo.svg” alt=”Company Wordmark”/>` html tag. This way if you have used the asset tags for all of your js, css, and images you can change the location of these without updating your source!

This lets you remove requests for static assets off of your application and onto some other CDN, reducing load on your application.

In the future we are interested in the ability to push frontend static asset changes separate from an application deploy, but by default I am not sure this is possible using the standard Asset-Pipeline plugin. Production compiled assets have unique hashes in their filenames to bust caches which renders a redeploy of our application necessary to update the server side with those unique filenames.

Stay dialed in for more Grails 2 → 3 posts.