import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Markdown from 'marked-react';
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsResult,
} from "next/types";
import { PostData, PostMetadata } from "../../dtos/PostData";
import HeadW from "../../components/layout/HeadW";
import { renderer } from "../../utils/markedUtils"
import StickyHeader from "../../components/elements/StickyHeader";
import Hashtag from "../../components/elements/Hashtag";
import { CalendarOutlined } from "@ant-design/icons";
import { getSearchIndex } from "../../utils/searchIndexFileUtils";
import { getPostMetaData } from "../../utils/articleFileUtils";
import { searchIndexToJson } from "../../utils/searchIndexUtils";


export default function PostPage({ post, postMetadataList, searchIndexJson }) {
  return (
    <>
      <HeadW title={post.title} />
      <StickyHeader searchIndexJson={searchIndexJson} postMetadataList={postMetadataList} title={post.slug} path={["blog"]}/>
      <h1>{post.title}</h1>
      {post?.date &&
          <h4><CalendarOutlined /> {post.date}</h4>
      }
      <p>
        {post.tags.map((tag: string) => (
          <Hashtag key={tag} tag={tag}/>
        ))}
      </p>
      <Markdown renderer={renderer}>{post.content}</Markdown>
    </>
  );
}

// get filenames of posts, use filesnames to generate paths
export const getStaticPaths: GetStaticPaths =
  async (): Promise<GetStaticPathsResult> => {
    const files = fs.readdirSync(path.join("posts"));
    const paths = files.map((filename) => ({
      params: {
        slug: filename.replace(".md", "")
      },
    }));
    return {
      paths: paths,
      fallback: false
    };
  };
  
// get post data for a given slug (filename)
export const getStaticProps: GetStaticProps = async ({ params: { slug } }): Promise<GetStaticPropsResult<{post: PostData, searchIndexJson: string, postMetadataList: PostMetadata[] }>> => {
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );
  const { data: frontmatter, content } = matter(markdownWithMeta);
  const postData: PostData = {
    title: frontmatter?.title,
    slug: slug as string,
    date: frontmatter?.date,
    excerpt: frontmatter?.excerpt,
    hero: frontmatter?.hero,
    tags: frontmatter?.tags ? frontmatter.tags.split(" ") : null,
    id : frontmatter?.id,
    content: content
  };
  const searchIndex = getSearchIndex();
  const searchIndexJson = searchIndexToJson(searchIndex);
  const postMetadataList: PostMetadata[] = getPostMetaData();
  return {
    props: {
      post: postData,
      searchIndexJson: searchIndexJson,
      postMetadataList: postMetadataList
    }
  };
};
