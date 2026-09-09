# Personal blog source of Tyrel Delaney

This is the Next.js source code for my personal blog hosted on GitHub Pages at https://superflux.dev.

## Development and deployment

See _package.json_ for the current scripts available to interact with this project.

## Articles

New markdown articles are added to _posts_.

Each contains frontmatter with metadata in the following format:

```yaml
---
title: Title of the article
date: Dec 24, 2024
author: Tyrel Delaney
tags: tag1 tag2 tag3
hero: /images/posts/heroimage.png
excerpt: A synopsis of the article in 1-3 short sentences.
id: 99
---
```

The `id` should iterate up from the highest existing `id` in the _posts_ directory.

`tags` should be a space-separated list of 2 to 10 tags. Tags should reference languages talked about in the post, packages and tools used, and any other relevant topics. Check tags in other posts to find overlap.

Each post should at least have a `hero` image. These are stored in _public/images/posts/_ and referenced here by _/images/posts/filename.png_.

Posts added in this way will be automatically listed on the homepage sorted by their `id` descending.
