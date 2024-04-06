---
title: Static Site Search Part 1 - Preprocessing Articles
date: April 3, 2024
author: Tyrel Delaney
tags: static-site-generators nextjs javascript typesense search
hero: /images/posts/static-site-search-preprocessing-articles.jpg
excerpt: In this series of articles I discuss how I created a client-side search for my static website. After looking at a few options out there for static sites and Next.js projects, I decided the challenge to build my own search from scratch would be more enjoyable. This first article discusses how I preprocess my articles into a search index.
id: 20
---

![](./static-site-search-preprocessing-articles.jpg)

## Overview

So, I want a search feature for this blog. Simple as that. I need it to run client side since my website is statically compiled and served from GitHub. And I want it to be somewhat light weight.

I only have 19 posts as of writing this (this is the 20th), so the search space is relatively small now. But I'm contemplating re-writing my [partners food blog](https://www.theverdigris.ca/) in my custom Next + markdown CMS. She has 100's of posts so eventually it needs to be able to handle that amount.

I also like the idea of building it myself as much as I can. Building this website is a learning exercise and I don't learn much by running `npm install tool-that-solves-your-problem`.

### Pagefind

In my initial research I came across [Pagefind](https://pagefind.app/). It seems like what I wanted. Static site search with a default but customizable UI.

I tried for maybe an hour or two to get this running locally on my static site without success. I think it's tricky to get working with Next dev mode. I found [this article from Pete Millspaugh](https://www.petemillspaugh.com/nextjs-search-with-pagefind) on using Pagefind with Next. It was short on detail and didn't help much though.

So I decided to build something myself from scratch. How hard could it be?

## My plan

Taking inspiration from Ahmad Rosid's post on [Writing full text search in Javascript for Next.js static site](https://ahmadrosid.com/blog/fulltext-search-with-inverted-index), what I'm going to do is build an inverted index, of sorts, of the article data.

This index will contain all of my valid search terms as keys, and each key's value will be a list of objects representing the articles that match that search term.

Building this index will happen as a preprocessing step as part of my static site's build process.

The idea being on the static site, in a search component, you're just taking the current value of the search term and using that as a key into this search index map to get the corresponding articles.

The benefit to this approach is the actions on the client side, on my site itself, are very quick. I'm just taking the current search term as a key and retrieving the corresponding values from an map/object.

The downside is you need to load this search index at some point, hopefully lazily, and it could be quite big.
## Preprocessing article data

I write my articles in markdown with front matter metadata. I use the following format for my metadata:

```markdown
---
title: "Some apples are too sour"
date: "October 27, 2197"
author: "Tyrel Delaney"
excerpt: "Some apples are just too sour and I don't like them. Don't @ me."
hero: "badapple.jpg"
tags: "apples apple bleh sour"
---
```
I'll use this metadata from each article to create my search index.
## Creating a Typescript script to parse article data into an index

This script is going to be separate my Next project and be run on its own as a pre-build step. I'll output the resulting index in some format that my Next project can import and use, probably just JSON.

In my project root, I created a directory called *preprocessors/search-index/*, and a *search-index.ts* file. Using Typescript allows me to use my utility functions and DTOs I already have from my Next project.

For example, the first thing I want to do is read all my posts from the filesystem and parse their metadata out. I already have a function that does this so I just import it. I needed to refactor it slightly to take in an optional path, since this script is running in a different place relative to my posts directory that contains my markdown articles.

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

const postDataList: PostData[] = getPostData("../../posts");
```
Just for reference, my `PostData` looks like this. I should probably just be using `PostMetadata`, but I'll leave that for a future optimization.

*dtos/PostData.ts*:
```typescript
export interface PostMetadata {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	hero: string;
	tags: string[];
	readTimeInMinutes?: number;
}

export interface PostData extends PostMetadata {
	content: string
}
```

Note: One thing I needed to do was create a *tsconfig.json* file in my *preprocessors/search-index/* directory with the following:
```json
{
	"compilerOptions": {
		"esModuleInterop": true
	}
}
```
I think I might have removed the imports that necessitated this addition. But if you run into import errors related to ESModules you may need this as well.
## Create index from Titles, Tags, and Excerpt

Now that I have the `postDataList` I want to build an index from the relevant tokens. First I'll do Tags since it's relatively simple.

I'll just iterate over each Tag and add it along with it's corresponding post slug to the index. I use a `Set<string>` to ensure duplicate slugs aren't saved.

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
	const searchIndex: Map<string, Set<string>> = new Map();
	postDataList.forEach((post: PostData) => {
		// parse tags
		post.tags.forEach((tag: string) => {
			addToIndex(searchIndex, tag, post.slug);
		});
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, value: string) => {
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Set());
	}
	searchIndex.get(key).add(value);
}

const postDataList: PostData[] = getPostData("../../posts");
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
console.log("Search Index: ", searchIndex);
```
Cool, now lets do the same for the Title and the Excerpt since I want those to contribute to the search index as well.

Since the Title and Excerpt are just regular sentences, I'll need to tokenize them first. I also want to strip out most special characters, as well as convert some characters like `-` to spaces.

A little helper function accomplishes this. It strips special characters, replaces `"-"` with `" "`, splits the string on spaces, then filters out any empty strings.

```typescript
export const tokenizeText = (text: string): string[] => {
	const tokens = text.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '').replace(/-/g, ' ').split(' ');
	return tokens.filter((token: string) => token.length > 0);
}
```

With this `tokenizeText` function, I can do the same thing I did for Tags with the Title and Excerpt.

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
	const searchIndex: Map<string, Set<string>> = new Map();
	postDataList.forEach((post: PostData) => {
		// parse tags
		post.tags.forEach((tag: string) => {
			addToIndex(searchIndex, tag, post.slug);
		});
		// parse titles
		const titleTokens = tokenizeText(post.title);
		titleTokens.forEach((token: string) => {
			addToIndex(searchIndex, token, post.slug);
		});
		// parse excerpts
		const excerptTokens = tokenizeText(post.excerpt);
		excerptTokens.forEach((token: string) => {
			addToIndex(searchIndex, token, post.slug);
		});
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, value: string) => {
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Set());
	}
	searchIndex.get(key).add(value);
}

export const tokenizeText = (text: string): string[] => {
	const tokens = text.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '').replace(/-/g, ' ').split(' ');
	return tokens.filter((token: string) => token.length > 0);
}

const postDataList: PostData[] = getPostData("../../posts");
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
console.log("Search Index: ", searchIndex);
console.log("Search Index Size: ", searchIndex.size);
```

Great start! With my current small set of 19 articles this script generates an index with 452 tokens/keys.

We could stop here, but one thing I'd like to do is support partial searches. With this search index, you couldn't find "docker" by searching "dock".

## Ngrams

Again building off of the work of Ahmad Rosid in [Writing full text search in Javascript for Next.js static site](https://ahmadrosid.com/blog/fulltext-search-with-inverted-index), I'll create ngrams of each token. I didn't do much digging into ngrams beyond Ahmad's article, but they're essentially just sub-tokens of a given token.

For example, a token I already have is "cool". The 2 and 3 ngrams of "cool" would be `[ "co", "oo", "ol", "coo", "ool"]`. I'll start with ngrams of lengths 1 to 10. I might go beyond 10 in the future as well, but lets start there and see.

I'll create a helper function to generate the ngrams of a given token. This function contains a max `n` const. I'll iterate over each value from 1 -> `n` and create the corresponding ngram substrings using `slice()`.

My `createNGrams` function looks like this:
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

So then back in my `createSearchIndex` function, I'll use this `createNGrams` function to add all the ngrams to the index rather than just the token.

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
	const searchIndex: Map<string, Set<string>> = new Map();
	postDataList.forEach((post: PostData) => {
		// parse tags
		post.tags.forEach((tag: string) => {
			// addToIndex(searchIndex, tag, post.slug);
			const nGrams = createNGrams(tag);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
		// parse titles
		const titleTokens = tokenizeText(post.title);
		titleTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
		// parse excerpts
		const excerptTokens = tokenizeText(post.excerpt);
		excerptTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, value: string) => {
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Set());
	}
	searchIndex.get(key).add(value);
}

export const tokenizeText = (text: string): string[] => {
	const tokens = text.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '').replace(/-/g, ' ').split(' ');
	return tokens.filter((token: string) => token.length > 0);
}

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

const postDataList: PostData[] = getPostData("../../posts");
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
// console.log("Search Index: ", searchIndex);
console.log("Search Index Size: ", searchIndex.size);
```

Just a few things I need to clean up with this.

## Tokenizing tags

First, I need to tokenize the individual tags as well. Some tags contain `-`s, so removing those and splitting the tag into tokens will work better.

In the above code within `createSearchIndex` I'll refactor the loop over the tags to also tokenize each individual tag:
```typescript
// parse tags
post.tags.forEach((tag: string) => {
	const tagTokens = tokenizeText(tag);
	tagTokens.forEach((token: string) => {
		const nGrams = createNGrams(token);
		nGrams.forEach((nGram: string) => {
			addToIndex(searchIndex, nGram, post.slug);
		});
	});
});
```
## Lowercase all tokens

Next, I noticed that I'm not treating capitalized letters appropriately. I think what I'll do is lower-case all the ngrams. Then when I implement the search function I'll also make sure to lower-case the search string. I'll do this in my `tokenizeText` function

```typescript
export const tokenizeText = (text: string): string[] => {
	return text
		.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '')
		.replace(/-/g, ' ')
		.split(' ')
		.filter((token: string) => token.length > 0)
		.map((token: string) => token.toLowerCase());
}
```

Oh so functional.

My script so far looks like this:

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
	const searchIndex: Map<string, Set<string>> = new Map();
	postDataList.forEach((post: PostData) => {
		// parse tags
		post.tags.forEach((tag: string) => {
			const tagTokens = tokenizeText(tag);
			tagTokens.forEach((token: string) => {
				const nGrams = createNGrams(token);
				nGrams.forEach((nGram: string) => {
					addToIndex(searchIndex, nGram, post.slug);
				});
			});
		});
		// parse titles
		const titleTokens = tokenizeText(post.title);
		titleTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
		// parse excerpts
		const excerptTokens = tokenizeText(post.excerpt);
		excerptTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, value: string) => {
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Set());
	}
	searchIndex.get(key).add(value);
}

export const tokenizeText = (text: string): string[] => {
	return text
		.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '')
		.replace(/-/g, ' ')
		.split(' ')
		.filter((token: string) => token.length > 0)
		.map((token: string) => token.toLowerCase());
}

export const createNGrams = (token: string): Set<string> => {
	const n = [2, 3, 4, 5];
	const nGrams: Set<string> = new Set();
	n.forEach((nx: number) => {
		for (let i = 0; i < token.length - nx + 1; i++) {
			const nGram = token.slice(i, i + nx);
			nGrams.add(nGram);
		}
	});
	if (token.length > Math.max(...n) || token.length < Math.min(...n)) {
		nGrams.add(token);
	}
	return nGrams;
}

const postDataList: PostData[] = getPostData("../../posts");
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
// console.log("Search Index: ", searchIndex);
console.log("Search Index Size: ", searchIndex.size);
```

After implementing ngrams and adding these couple improvements my search index has 3833 keys now for 19 articles. Not sure how performant this will be, but we'll find out. A quick estimation showed this search index is around 340 kilobytes as JSON, so ideally I can lazy load it after the page renders?
## Save index as a JSON file

The last step of this script is to simply save this search index to a JSON file that will be used later by our static site.

First I need to convert this index map to a JSON string. `JSON.stringify` was acting weird with my index object, I think because I am using `Set`s 🤷🏻‍♂️. So I first convert my index to a more generic object with simple arrays instead of sets. Then I can pass this object to `JSON.stringify`. Heres the code in a little function:

```typescript
const convertMapToJson = (map: Map<string, Set<string>>): string => {
	const obj: { [key: string]: string[] } = {};
	map.forEach((value, key) => {
		obj[key] = Array.from(value);
	});
	return JSON.stringify(obj);
}
```

In my case I just saved this JSON file in my */public* directory in the project. May move this later if it's not the best place. Just use `fs` to save it.

```typescript
fs.writeFileSync("./public/search-index.json", searchIndexJsonString, "utf8");
```

My final search index preprocessor script looks like this:

*preprocessors/search-index/search-index.ts*:
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
	const searchIndex: Map<string, Set<string>> = new Map();
	postDataList.forEach((post: PostData) => {
		// parse tags
		post.tags.forEach((tag: string) => {
			const tagTokens = tokenizeText(tag);
			tagTokens.forEach((token: string) => {
				const nGrams = createNGrams(token);
				nGrams.forEach((nGram: string) => {
					addToIndex(searchIndex, nGram, post.slug);
				});
			});
		});
		// parse titles
		const titleTokens = tokenizeText(post.title);
		titleTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
		// parse excerpts
		const excerptTokens = tokenizeText(post.excerpt);
		excerptTokens.forEach((token: string) => {
			// addToIndex(searchIndex, token, post.slug);
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post.slug);
			})
		});
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, value: string) => {
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Set());
	}
	searchIndex.get(key).add(value);
}

export const tokenizeText = (text: string): string[] => {
	return text
		.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '')
		.replace(/-/g, ' ')
		.split(' ')
		.filter((token: string) => token.length > 0)
		.map((token: string) => token.toLowerCase());
}

export const createNGrams = (token: string): Set<string> => {
	const n = [2, 3, 4, 5];
	const nGrams: Set<string> = new Set();
	n.forEach((nx: number) => {
		for (let i = 0; i < token.length - nx + 1; i++) {
			const nGram = token.slice(i, i + nx);
			nGrams.add(nGram);
		}
	});
	if (token.length > Math.max(...n) || token.length < Math.min(...n)) {
		nGrams.add(token);
	}
	return nGrams;
}

const convertMapToJson = (map: Map<string, Set<string>>): string => {
	const obj: { [key: string]: string[] } = {};
	map.forEach((value, key) => {
		obj[key] = Array.from(value);
	});
	return JSON.stringify(obj);
}

const postDataList: PostData[] = getPostData("../../posts");
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
// console.log("Search Index: ", searchIndex);
console.log("Search Index Size: ", searchIndex.size);
fs.writeFileSync("./public/search-index.json", searchIndexJsonString, "utf8");
```
## Add NPM script to run this easily from the project root

The last-last step is to be able to automate running this preprocessor script during my build process. It technically is not included in the build, it will be included in the deployment, so it can happed before or after the build. Since I called it a "preprocessor" lets run it before the build.

First thing I did, to keep things a bit tidy, was add an out directory to my preprocessors *tsconfig.json*. The compiled Javascript is saved in *preprocessors/search-index/out/*. This is the tsconfig file located at *preprocessors/search-index/tsconfig.json*, not the one in the root of your project.
```json
{
	"compilerOptions": {
		"esModuleInterop": true,
		"outDir": "./out"
	}
}
```

In your *package.json*, add a new script definition to your `scripts` block. In my script I called `tsc` to compile my preprocessor and then `node` to immediately run the compiled files. My script looks like this:

```json
{
	...
	"scripts": {
		...
		"compile-search-index": "tsc -p ./preprocessors/search-index/ && node ./preprocessors/search-index/out/preprocessors/search-index/search-index.js"
	}
}
```
That path to the js file is a bit cumbersome, this is due to me storing the output in that *out* directory. But with this script you only need to run `npm run compile-search-index` and never need to type that path again. Much rather have that than compiled js all over the place.

Next I add this into my existing build script so that it runs automatically when I run a build.

```json
{
	...
	"scripts": {
		...
		"build": "npm run compile-search-index && next build",
		...
		"compile-search-index": "tsc -p ./preprocessors/search-index/ && node ./preprocessors/search-index/out/preprocessors/search-index/search-index.js"
	}
}
```

And there you go!

## Including the post title

After moving on to the next step of creating the search component itself that will use this index, I realized I need the post title to display in the search results.

The way I decided to do it for this first iteration is to just come back to this script and refactor the title into the index, alongside the post slug. This increases the byte size of the index substantially and isn't ideal.

I'll show how I did it this way, but a better way to do it and something I might do in the future is simply store a unique post ID in the index, and then use that to reference any details I need from a separate list of post data. I'll save that optimization for a future blog post.

For now I essentially replaced the `Set<string>` with a `{ title: string, slug: string }[]`. It's not a Set anymore, so I need make sure I'm not adding duplicates myself.

Then in my `addToIndex` function I simply pass in the whole post object and inside I pull out the title and slug and add an entry to the index.

Here is the full refactored code with these changes:

*preprocessors/search-index/search-index.ts*
```typescript
import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";
import * as fs from "fs";

export const createSearchIndex = (postDataList: PostData[]): Map<string, { title: string, slug: string }[]> => {
	const searchIndex: Map<string, { title: string, slug: string }[]> = new Map();
	postDataList.forEach((post: PostData) => {
		
		// parse tags
		post.tags.forEach((tag: string) => {
			const tagTokens = tokenizeText(tag);
			tagTokens.forEach((token: string) => {
				const nGrams = createNGrams(token);
				nGrams.forEach((nGram: string) => {
					addToIndex(searchIndex, nGram, post);
				});
			});
		});
		
		// parse titles
		const titleTokens = tokenizeText(post.title);
			titleTokens.forEach((token: string) => {
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post);
			});
		});
		
		// parse excerpts
		const excerptTokens = tokenizeText(post.excerpt);
		excerptTokens.forEach((token: string) => {
			const nGrams = createNGrams(token);
			nGrams.forEach((nGram: string) => {
				addToIndex(searchIndex, nGram, post);
			});
		});
		
	});
	return searchIndex;
}

const addToIndex = (searchIndex: Map<string, { title: string, slug: string }[]>, key: string, post: PostData) => {
	const value = {"title": post.title, "slug": post.slug};
	if (!searchIndex.has(key)) {
		searchIndex.set(key, new Array());
	}
	let found = false;
	for (let item of searchIndex.get(key)) {
		if (item.title === value.title) {
			found = true;
		}
	}
	if (!found) {
		searchIndex.get(key).push(value);
	}
}

export const tokenizeText = (text: string): string[] => {
	return text
		.replace(/[".,?!:;'[\]{\/}@#$%^&*(→)]/g, '')
		.replace(/-/g, ' ')
		.split(' ')
		.filter((token: string) => token.length > 0)
		.map((token: string) => token.toLowerCase());
}

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

const startTime = performance.now();

const postDataList: PostData[] = getPostData("./posts");
// console.log("Post Data List: ", postDataList);
const searchIndex: Map<string, { title: string, slug: string }[]> = createSearchIndex(postDataList);
// console.log("Search Index: ", searchIndex);
const searchIndexJsonString = JSON.stringify(Object.fromEntries(searchIndex.entries()));
// console.log("Search Index JSON: ", searchIndexJsonString);
const searchIndexLocation = "./components/elements/search-index.json";
fs.writeFileSync(searchIndexLocation, searchIndexJsonString, "utf8");
console.log(`⏺ Search index saved to ${searchIndexLocation}\n`);

const endTime = performance.now();

console.log(`⏺ ${postDataList.length} posts`);
console.log(`⏺ ${searchIndex.size} index entries`);
const sizeInBytes = searchIndexJsonString.length;
console.log(`⏺ ${Number(sizeInBytes/1000).toFixed(1)} KB JSON size`);
console.log(`⏺ ${Number(endTime - startTime).toFixed(1)} ms to process search index`);
console.log("\n✔ Done")
```

I also refactored and simplified how I was converting the index to JSON, and added some nice console output as well.

## Conclusion

Well thats it for the search index preprocessor. In an upcoming article I'll discuss how I built a search component to use this search index on my Next static site (this site!).

Give the search a try! It's near the top on desktop or bottom on mobile.

Hope you found this interesting or useful. 🙌🏻

## References

- [Writing full text search in Javascript for Next.js static site](https://ahmadrosid.com/blog/fulltext-search-with-inverted-index) - Great article from Ahmad Rosid on creating a static site search. Heavily inpired my implementation.
- [Pagefind](https://pagefind.app/) - a static site search tool that I didn't end up using
- [Add search to your Next.js static site with Pagefind](https://www.petemillspaugh.com/nextjs-search-with-pagefind) - article on using Pagefind with Next. Did not find it very helpful
