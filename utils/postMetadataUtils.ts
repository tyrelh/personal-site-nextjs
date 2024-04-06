import { PostMetadata } from "../dtos/PostData";


export const getPostMetadataById = (id: number, postMetadataList: PostMetadata[]): PostMetadata => {
    return postMetadataList.find((post) => post.id === id);
}