# Personal blog source of Tyrel Delaney

This is the Next.js source code for my personal blog hosted on GitHub Pages at https://superflux.dev.

## Development and deployment

See _package.json_ for the current scripts available to interact with this project.

## Articles

Articles live in _posts_ as markdown. The usual way one gets there is `npm run import-post`, which
copies a note out of my Obsidian vault, copies its images into _public/images/posts/_, and rewrites
the image references:

```shell
npm run import-post "$OBSIDIAN_VAULT_PATH/projects/superflux.dev/My Post.md" [--slug my-post] [--dry-run] [--force]
```

It refuses to overwrite an existing post or a differently-named image without `--force`, and aborts
rather than writing a post whose images it could not find. The one manual step left afterwards is
**alt text** — the script prints a warning listing every image it imported with an empty alt.

Frontmatter:

```yaml
---
title: Title of the article
date: April 12, 2024
author: Tyrel Delaney
tags: tag1 tag2 tag3
hero: /images/posts/heroimage.png
excerpt: A synopsis of the article in 1-3 short sentences.
---
```

- `date` — required. Either display text (`April 12, 2024`) or an ISO date (`2024-04-12`, which is
  what Obsidian writes for a Date property). Both render as `April 12, 2024`.
- `tags` — required, 2 to 10 tags. Either a space-separated string or a YAML list; both are
  accepted. Tags should reference languages talked about in the post, packages and tools used, and
  any other relevant topics. Check tags in other posts to find overlap.
- `title` — optional. Falls back to the body's `# H1`, then the filename.
- `excerpt` — optional. Falls back to the first prose paragraph of the body.
- `hero` — every post needs one for the homepage preview. Leave it empty and the import script
  fills it with the first image in the body. For a post with no body images, name a vault image
  (`hero: My Hero Shot.png`, or the `[[My Hero Shot.png]]` wikilink Obsidian's property editor
  writes) and the script copies it into _public/images/posts/_ like any other image. An
  already-in-repo `/images/posts/filename.png` path is used as-is and checked for existence; an
  external URL is left alone. The import aborts if there is no hero and no body image.
- **No `id`.** It is derived at build time from the filename-sorted post list. Any `id` left in an
  old post's frontmatter is ignored.

The body **starts with** `# Title`, matching how the note reads in Obsidian. That heading is
hoisted into the page header rather than rendered, so the page shows exactly one H1. A frontmatter
`title` wins over it when both are present.

In-body images are referenced by bare filename (`![alt](my-post-screenshot.png)`), resolved
against _/images/posts/_. Absolute and external URLs are used as-is.

Posts are listed on the homepage sorted by `date` descending.
