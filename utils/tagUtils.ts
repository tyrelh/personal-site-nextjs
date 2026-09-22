import { PostData, PostMetadata, Tags } from "../dtos/PostData";

export const getTagsFromPostDataList =(postData: PostData[]): string[] => {
  const tags = new Set<string>(); // Set forces only unique tags
  postData.forEach(function (postDatum) {
    postDatum.tags.forEach(function (tag) {
      tags.add(tag);
    });
  }); 
  return Array.from(tags);
}

export const getTagCountsFromPostMetadataList = (posts: PostMetadata[]): Tags => {
  return posts.reduce((tagCounts: Tags, post: PostMetadata) => {
    post.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    return tagCounts;
  }, {});
}
