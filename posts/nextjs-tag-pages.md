---
title: "Next.js Tag Pages"
date: "March 25, 2024"
author: "Tyrel Delaney"
excerpt: "My goal with this project was to make the tags I'm already displaying alongside articles to be clickable links that filter my posts by that tag. Try to click one!"
hero: "/images/posts/tag-page-screenshot.png"
tags: "nextjs javascript typescript webdev static-site-generators"
id: 19
---
This article was written around July 2023.

If you'd like to learn how to deploy a static site using Next.js to GitHub Pages, [check out a previous article of mine on the topic](https://superflux.dev/blog/github-pages-using-nextjs).

This functionality for my website was heavily inspired by [Bionic Julia's post on the same topic](https://dev.to/bionicjulia/creating-dynamic-tag-pages-with-nextjs-nested-routes-nah).

![black next js logo on a plain white background](next-js-logo.png)

## Tl;dr
- [Goal](#goal): To make tag pages that filter my articles by a tag
- [Get tags from posts](#get-tags-from-posts): First step is to collate all the unique tags from my markdown article files.
- [Build the pages for tags](#build-the-pages-for-tags)
	- [getStaticPaths](#getstaticpaths): Get the unique list of tags to build the routes for.
	- [getStaticProps](#getstaticprops): For each tag, get the filtered list of posts.
	- [Tags page template](#tags-page-template): Render the filtered list of posts on a new page.
- [Link to tag pages](#link-to-tag-pages): I altered my hashtag component to link to the appropriate tag route.
- [Small gotcha](#small-gotcha): Need to strip some character from tags since they need to be URL safe now.
- [Conclusion](#conclusion)
- [Resources](#resources)

## Goal

My goal with this project was to make the tags I'm already displaying alongside articles to be clickable links that filter my posts by that tag.

My markdown posts already contain metadata that includes tags, so luckily I don't need to go back and tag all my posts.

## Get tags from posts

The first step is to get a list of the tags from our posts. This is so we can build the pages for each.

I built a function to read the tags from all my post markdown files. The tags are contained in their frontmatter. I use a `Set` to only get the unique tags with no duplicates.

```tsx
import { PostData } from "../dtos/PostData";

export const getTagsFromPostDataList = (postData: PostData[]): string[] => {
  const tags = new Set<string>(); // Set forces only unique tags
  postData.forEach(function (postDatum) {
    postDatum.tags.forEach(function (tag) {
      tags.add(tag);
    });
  }); 
  return Array.from(tags);
}
```

And I get the posts using an existing method that reads the posts from the files system, and parses the markdown and frontmatter from them into a list of custom `PostData` objects.

```tsx
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { PostData } from "../dtos/PostData";
import { calculateReadTimeOfText } from "./textUtils";

export const getPostData = (): PostData[] => {
  const files = fs.readdirSync(path.join("posts"));
  const postDataList: PostData[] = files.map((filename) => {
    const slug = filename.replace(".md", "");
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );
    const { data: frontmatter, content } = matter(markdownWithMeta);
    const readTimeInMinutes = calculateReadTimeOfText(content);
    const postData: PostData = {
      title: frontmatter?.title,
      slug: slug,
      date: frontmatter?.date,
      hero: frontmatter?.hero,
      excerpt: frontmatter?.excerpt,
      tags: frontmatter?.tags ? frontmatter.tags.split(" ") : null,
      readTimeInMinutes: readTimeInMinutes,
      content: content
    };
    return postData;
  });
  return postDataList
}
```

Ok, so now I have a list of all the unique tags. Now what?

## Build the pages for tags

I wanted to have the tag pages follow the */blog/tags/\<tag\>* URL scheme. So I created a *tags* folder nested in */pages/blog* and created a new file named *\[tag\].tsx*. The square brackets mean this is a template file for the tag page. There will be a page generated for each unique tag.

[Next.js docs on Dynamic Routes](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes)

### getStaticPaths

Within the tag template we need two methods. `getStaticPaths` will gather a list of all the paths that need to be generated. In this case it's a list of all the unique tags since they'll be used in the url path for each tag page in the format */blog/tags/\<tag\>*.

```tsx
export const getStaticPaths: GetStaticPaths = async (context): Promise<GetStaticPathsResult> => {
  const postData: PostData[] = getPostData();
  const tags = getTagsFromPostDataList(postData);
  const paths = tags.map((tag: string) => ({
    params: { tag }
  }));
  return {
    paths: paths,
    fallback: false
  };
};
```

I use the functions I defined above to pull the unique tags from my markdown articles and generate the paths.

[Next.js docs on *getStaticPaths*](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths)

### getStaticProps

Next is `getStaticProps`. This function gathers the props that are passed to each tag page to render. In this case we want to pass a list of the articles that have a given tag which comes in through `params`.

I use the same function again to get all the post data, then I filter the posts to only the sunset that have the given tag.

```tsx
export async function getStaticProps({ params }: Params) {
  const postDataList: PostData[] = getPostData();
  const postsForTag: PostData[] = postDataList.filter((post: PostData) => 
    post.tags.includes(params.tag)
  );
  return {
    props: {
      tag: params.tag,
      postsForTag: postsForTag.sort(sortPostsByDate)
    },
  }
}
```

When returning the subset of posts I also make sure they're sorted by date so that I can render them in decending order on the tag page.

[Next.js docs on *getStaticProps*](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props)

### Tags page template

The last thing to do is build the template for the tag page itself. This was extremely simple as I was able to reuse components I already had.

I have a `ArticlePreviewList` component from the homepage that generates a list of previews for a given list of post data. Other than that there are some headings and misc.

```tsx
export default function TagPage({tag, postsForTag}) {
  return (
    <>
      <HeadW title="superflux" />
      <StickyHeader title={tag} path={["blog","tags"]}/>
      <SectionHeading>
        #{tag}
      </SectionHeading>
      <ArticlePreviewList articleMetadataList={postsForTag} />
      <SectionHeading>
        Get in touch
      </SectionHeading>
      <p>
        Feel free to contact me via <Anchor href="https://twitter.com/tyreldelaney">Twitter</Anchor>!
      </p>
    </>
  );
}
```

And that's it! With those few pieces Next.js will handle the rest for us. During the build step it will generate all the pages on all the routes for each tag.

![](tag-page-screenshot.png)

## Link to tag pages

One last piece is to make it easy to navigate to these new pages. I already had a visual tag component I was using within the article previews, just for informational purposes.

I created a new Hashtag component that wraps Ant Design's Tag component. So now I can apply a Next `Link` within that. I also have a custom `Anchor` component that obfuscates the Next `Link` away. Since it's a hashtag component I can hard code the route with just the tag prop itself being the final portion of the route.

```tsx
import { Tag } from "antd"
import Anchor from "./Anchor"

export interface Props {
  tag: string
}

export default function Hashtag(props: Props) {
  return (
    <Anchor key={props.tag} href={`/blog/tags/${props.tag}`}>
      <Tag key={props.tag}>#{props.tag}</Tag>
    </Anchor>
  )
}
```

## Small gotcha

One small issue I ran into is one tag I was using contained a `/` character, `ci/cd`. This wasn't a very forward thinking decision on my part.

I just needed to search through my articles and remove the `/` character from that tag, making it just `cicd`. Much simpler than trying to code for it.

## Conclusion

I've had tags on my posts for some time now, but this functionality makes them much more useful. Clicking a tag now brings you to a page that contains articles curated by that tag.

It's basic functionality, but it's still rewarding to build it yourself.

## Resources

- [Creating Dynamic Tag Pages With NextJS Nested Routes](https://bionicjulia.com/blog/creating-dynamic-tag-page-nextjs-nested-routes) 
- [Next.js docs on Dynamic Routes](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes)
- [Next.js docs on *getStaticPaths*](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths)
- [Next.js docs on *getStaticProps*](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props)