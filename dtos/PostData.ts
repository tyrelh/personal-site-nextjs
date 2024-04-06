export interface PostMetadata {
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    hero: string;
    tags: string[];
    id: number;
    readTimeInMinutes?: number;
}

export interface PostData extends PostMetadata {
    content: string
}

export interface PostMetadataList {
    posts: PostMetadata[]
}

export interface PostDataList {
    posts: PostData[]
}

export interface Tags {
    [index: string]: number;
}