import { PostData } from "../dtos/PostData";

export const getTagsFromPostDataList =(postData: PostData[]): string[] => {
  const tags = new Set<string>(); // Set forces only unique tags
  postData.forEach(function (postDatum) {
    postDatum.tags.forEach(function (tag) {
      tags.add(tag);
    });
  }); 
  return Array.from(tags);
}
