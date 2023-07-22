import { PostData } from "../dtos/PostData";

export const getTagsFromPostDataList =(postData: PostData[]): string[] => {
  let tags = new Set<string>();
  postData.forEach(function (postDatum) {
    postDatum.tags.forEach(function (tag) {
      tags.add(tag);
    });
  }); 
  return Array.from(tags);
}
