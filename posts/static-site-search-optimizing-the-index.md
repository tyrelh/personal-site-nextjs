---
title: Static Site Search Part 3 - Optimizing the Index
date: April 18, 2024
author: Tyrel Delaney
tags: static-site-generators nextjs javascript typesense search
hero: /images/posts/static-site-search-optimizing-the-index.jpg
excerpt: This is the final part (for now) on the search functionality for my site. I implemented some optimizations that I alluded to in part 1 & 2. I was able to get my search index for my 20-ish posts from ~700kb down to ~22kb!
id: 22
---

![](./static-site-search-optimizing-the-index.jpg)

## Static Site Search Series

This is Part 3 of a series on building a static site search from scratch.

[Part 1 - Preprocessing Articles](https://superflux.dev/blog/static-site-search-preprocessing-articles) walked through building a search index for all my markdown articles using their Title, Tags, and Excerpt as search spaces. The index is a map of all valid search terms and their corresponding article matches.

[Part 2 - Search Component](https://superflux.dev/blog/static-site-search-search-component) walked through creating a React component to use this search index. I used the Ant Design Select component as a base, then performed custom filtering using the search term and the search index. This gave me a simple and fast search experience for my blog. The main downside was the search index ended up being ~700kb for only my 20 articles.

In this part, I'm going to cover some optimizations I made to get that search index from ~700kb to ~22kb (for 20 articles).

## The Issue to solve

With my original implementation of the search index, I was storing the full post title and slug for each matching search term. This was convenient when performing the lookup because the data was right there. The issue is the amount of redundancy in the index. Each post title string and slug string was stored 100s of times.

With 20 posts my search index was ~700kb. That's a big chunk of data to download. And it will grow exponentially with the number of posts since each post adds 100s of entries.

So I had two thoughts to increase the efficiency of the search index. Using unique integer post IDs, and removing unneeded/unlikely search terms.

## Post IDs

Previously my posts didn't need IDs, beyond the unique post slugs. But now there's a nice use case.

First I added unique IDs to each articles metadata. Just simple consecutive & unique numbers counting up from 1.

```text
---
title: Static Site Search Part 1 - Preprocessing Articles
date: April 3, 2024
author: Tyrel Delaney
tags: static-site-generators nextjs javascript typesense search
hero: /images/posts/static-site-search-preprocessing-articles.jpg
excerpt: In this series of articles I discuss how I created a client-side search for my static website. After looking at a few options out there for static sites and Next.js projects, I decided the challenge to build my own search from scratch would be more enjoyable. This first article discusses how I preprocess my articles into a search index.
id: 20
---
```

In my `PostData`/`PostMetadata` DTO I added the `id` field

```typescript
export interface PostMetadata {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	hero: string;
	tags: string[];
	id: number;                 // <--
	readTimeInMinutes?: number;
}

export interface PostData extends PostMetadata {
	content: string
}
```

Then in my search index preprocessor script, I alter what I'm saving for each search term. Instead of a `{ title: string, slug: string }[]` for each search term I just save the post `id` in an array, a `number[]`.

In my _preprocessors/search-index/search-index.ts_, my `addToIndex` function looks like this

```typescript
const addToIndex = (searchIndex: Map<string, number[]>, key: string, post: PostData) => {
  if (!searchIndex.has(key)) {
    searchIndex.set(key, new Array());
  }
  let found = false;
  for (let item of searchIndex.get(key)) {
    if (item === post.id) {
      found = true;
    }
  }
  if (!found) {
    searchIndex.get(key).push(post.id);
  }
}
```

This change cut the search index size by more than 1/10. From ~700kb down to 62kb.

## Remove ngrams that don't start from the beginning of a token

In my original algorithm I was slicing all possible ngrams of length `n` from each token. For example, when `n = 3` and the token is `typescript`, the ngrams would be `typ`, `ype`, `pes`, `esc`, `scr`, `cri`, `rip`, and `ipt`. This covers a lot of bases for possible partial search terms, but it's very unlikely folks are typing `ipt` and intending to find matches for `typescript`. Its much more likely and common folks are typing the word from the beginning and simply expecting matches on partial words.

The previous implementation looked like this
```typescript
export const createNGrams = (token: string): Set<string> => {
	const n = 10;
	const nGrams: Set<string> = new Set();
	for (let nx = 1; nx <= n; nx++) {
		for (let i = 0; i < token.length - nx + 1; i++) {
			const nGram = token.slice(i, i + nx);
			nGrams.add(nGram);
		}
	};
	if (token.length > n) {
		nGrams.add(token);
	}
	return nGrams;
}
```

I changed it so I'm only saving substrings starting from the beginning of a token

```typescript
export const createNGrams = (token: string): Set<string> => {
	const n = 10;
	const nGrams: Set<string> = new Set();
	for (let nx = 1; nx <= n; nx++) {
		nGrams.add(token.slice(0, nx));      // <--
	};
	if (token.length > n) {
		nGrams.add(token);
	}
	return nGrams;
}
```

This reduced the number of index entries from 4044 to 1449, and further reduced the size of the final JSON from ~62kb to ~22kb.

Great! Now that my search index is a reasonable size, lets refactor my website to use this new index format.

## Importing search index during build time rather than lazy loading during runtime

Now that the search index is so small, I'd like to just fetch it in my build process and bundle it with the server-side rendered pages. Rather than loading it lazily.

This isn't necessary, the small file size gives a big performance boost. But doing it this way feels more in-line with Next static site generation.

### What I need for my search component

Since the search index now just contains the post IDs, I also need a list of posts to reference via their IDs.

So to make this refactor work I need pass the list of `PostMetadata` and the search index to my search component

### getStaticProps

In each of my pages (I have 3: *index.tsx*, *blog/\[slug\].tsx*, and *blog/tags/\[tag\].tsx*) within their `getStaticProps` I need to fetch and return the `PostMetadata[]` and the search index.

The first gotcha I ran into was I was loading the search index from disk and then parsing it back into it's `Map<string, number[]>` type. The issue with this is Next doesn't like returning this type from `getStaticProps` because `Map` isn't serializable (why not? 🤷🏻‍♂️). So instead what I do is just serialize it myself and return it as a `string`.

I created this helper function to fetch the search index from disk:

*utils/searchIndexFileUtils.ts*
```typescript
import fs from "fs";

export const getSearchIndex = (): Map<string, number[]> => {
	const searchIndexFilePath = "public/search-index.json";
	const searchIndexFile = fs.readFileSync(searchIndexFilePath, "utf-8");
	const searchIndexMap = new Map<string, number[]>();
	const searchIndexJson = JSON.parse(searchIndexFile);
	for (const key of Object.keys(searchIndexJson)) {
		searchIndexMap.set(key, searchIndexJson[key]);
	}
	return searchIndexMap;
}
```

I then also created these functions to convert this to and from JSON. I put these in a separate file from `getSearchIndex` because I wanted to be able to use them client-side and the `import fs from "fs"` would cause issues with that.

*utils/searchIndexUtils.ts*
```typescript
export const searchIndexToJson = (map: Map<string, number[]>): string => {
	const obj = Array.from(map.entries());
	return JSON.stringify(obj);
}

export const jsonToSearchIndex = (jsonStr: string): Map<string, number[]> => {
	const entries = JSON.parse(jsonStr) as [string, number[]][];
	return new Map(entries);
}
```

Then in each page, I refactored `getStaticProps` to fetch the `PostMetadata[]` and the search index. Here's the example from my *index.tsx* page:

```typescript
export const getStaticProps: GetStaticProps = async (
	context
): Promise<GetStaticPropsResult<{posts: PostMetadata[], searchIndexJson: string }>> => {
	const searchIndex = getSearchIndex();
	const searchIndexJson = searchIndexToJson(searchIndex);
	const postMetadataList: PostMetadata[] = getPostMetaData();
	return {
		props: {
			posts: postMetadataList.sort(sortPostsByDate),
			searchIndexJson
		},
	};
};
```

Make sure to also modify the corresponding props for the page component to handle the new props type. In this case it's `{ posts: PostMetadata[], searchIndexJson: string }`.

## Refactoring Search Component

Next I needed to add these values as props to my search component. Originally it was importing the search index itself within a `useEffect`. Now instead I want to pass the search index along with the posts metadata list in through props.

I add these values as props to my `SearchInput` component

*components/elements/SearchInput.tsx*
```tsx
export interface Props {
	searchIndexJson: string;
	postMetadataList: PostMetadata[];
}

export default function SearchInput(props: Props) {
	// ...
}
```

In the component's `useEffect`, I removed the logic I had to lazy load the search index from disk, and replaced it with some simple logic to deserialize the search index from json.

```tsx
useEffect(() => {
	if (!searchIndex.size) {
		setSearchIndex(jsonToSearchIndex(props.searchIndexJson));
	}

	// ...
})

```

Then in my `onChange` function, where I'm doing the work to convert the search term to an options list to display as the search results, instead of directly pulling the post title and slug from the search index I pull the post ID from the search index and then find that post's metadata in `props.postMetadataList`. Reference [my previous article on the Search Component](https://superflux.dev/blog/static-site-search-search-component) to see more details, but the relevant change is:

```tsx
const onChange = (searchTerm: string) => {

	// ...

	if (searchIndex.size && searchIndex.has(searchTerm)) {
		const newOptions = new Array<OptionValue>();
		for (const id of searchIndex.get(searchTerm)) {
			const postMetadata: PostMetadata = getPostMetadataById(id, props.postMetadataList);
			newOptions.push({
				value: postMetadata.slug,
				label: postMetadata.title
			});
		}
		setOptions(newOptions);
	} else {
		setOptions([]);
	}
	
}
```

That `getPostMetadataById` function is just doing a simple find right now. Perhaps in the future I'll refactor that `PostMetadata[]` into something more efficient so I can do a quick lookup by ID.

```typescript
export const getPostMetadataById = (id: number, postMetadataList: PostMetadata[]): PostMetadata => {
	return postMetadataList.find((post) => post.id === id);
}
```

## Conclusion

Ok great! I've cut the size of the search index down from ~700kb to ~22kb. I'm pulling my PostMetadata list into more places than before, but it's much smaller than the search index so say overall the data load per page is ~25kb. Huge improvement.

The search is maybe slightly slower than before, because I'm not just doing a simple Map lookup on the search term anymore. But we're talking like ~1ms or less, so it's not even noticeable. 

In the future, as my number of posts grow, I think I'd like to refactor the `PostMetadata[]` to be a Map on the post IDs instead. Something like `Map<number, PostMetadata>`. That would allow for quick lookup of both the search term results from the search index, and a quick lookup of the corresponding PostMetadata for each search result.

I'll leave it here for now. Thanks for reading, and I hope you found some value in this static site search series. Remember to visit [Part 1](https://superflux.dev/blog/static-site-search-preprocessing-articles) & [2](https://superflux.dev/blog/static-site-search-search-component) to see the my original implementation this refactor is building on.


