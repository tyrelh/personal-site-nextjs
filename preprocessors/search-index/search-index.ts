import { PostData } from "../../dtos/PostData";
import { getPostData } from "../../utils/articleFileUtils";
import * as fs from "fs";

export const createSearchIndex = (postDataList: PostData[]): Map<string, Set<string>> => {
  const searchIndex: Map<string, Set<string>> = new Map();
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

const addToIndex = (searchIndex: Map<string, Set<string>>, key: string, post: PostData) => {
  const value = JSON.stringify({"title": post.title, "slug": post.slug});
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
  // Convert Map to plain object
  map.forEach((value, key) => {
      obj[key] = Array.from(value);
  });
  return JSON.stringify(obj);
}

const estimateJsonStringByteSize = (jsonString: string): number => {
  // Assuming 1 character is approximately 1 byte (which is not always true due to UTF-8 encoding, etc.)
  return jsonString.length * 2; // JavaScript strings are UTF-16 encoded, so we multiply by 2
}


const startTime = performance.now();

const postDataList: PostData[] = getPostData("./posts");
// console.log("Post Data List: ", postDataList);
const searchIndex: Map<string, Set<string>> = createSearchIndex(postDataList);
console.log("Search Index: ", searchIndex);
const searchIndexJsonString = convertMapToJson(searchIndex);
const searchIndexLocation = "./components/elements/search-index.json";
fs.writeFileSync(searchIndexLocation, searchIndexJsonString, "utf8");
console.log(`Search index saved to ${searchIndexLocation}`);

const endTime = performance.now();

console.log("Posts: ", postDataList.length);
console.log("Search Index size: ", searchIndex.size);
const sizeInBytes = estimateJsonStringByteSize(searchIndexJsonString);
console.log("Estimated JSON KB size:", Number(sizeInBytes/1000).toFixed(1), "KB");
console.log("Time to parse posts: ", Number(endTime - startTime).toFixed(1), "ms");
