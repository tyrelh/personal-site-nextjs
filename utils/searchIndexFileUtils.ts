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
