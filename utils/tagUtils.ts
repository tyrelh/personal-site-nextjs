import { PostMetadata, Tags } from "../dtos/PostData";


export const getTagsFromMetadata =(metadata: PostMetadata[]): string[] => {
  const tags = new Set<string>();
  metadata.forEach(function (metadatum) {
    metadatum.tags.forEach(function (tag) {
      tags.add(tag);
    });
  }); 
  return Array.from(tags);
}