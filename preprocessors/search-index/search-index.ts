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
fs.writeFileSync("./public/search-index.json", searchIndexJsonString, "utf8");
console.log(`⏺ Search index saved to ${searchIndexLocation}\n`);

const endTime = performance.now();

console.log(`⏺ ${postDataList.length} posts`);
console.log(`⏺ ${searchIndex.size} index entries`);
const sizeInBytes = searchIndexJsonString.length;
console.log(`⏺ ${Number(sizeInBytes/1000).toFixed(1)} KB JSON size`);
console.log(`⏺ ${Number(endTime - startTime).toFixed(1)} ms to process search index`);
console.log("\n✔ Done")
