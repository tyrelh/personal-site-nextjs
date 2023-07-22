import { GetStaticPaths, GetStaticPathsResult, GetStaticProps, GetStaticPropsResult } from "next"
import path from "path"
import fs from "fs";
import { getPostData } from "../../../utils/articleFileUtils"
import { PostData, PostDataList, PostMetadata, Tags } from "../../../dtos/PostData";
import { getTagsFromPostDataList } from "../../../utils/tagUtils";
import matter from "gray-matter";
import { calculateReadTimeOfText } from "../../../utils/textUtils";
import { Params } from "next/dist/server/router";
import ArticlePreviewList from "../../../components/elements/ArticlePreviewList";
import { sortPostsByDate } from "../../../utils/dateUtils";
import HeadW from "../../../components/layout/HeadW";
import StickyHeader from "../../../components/elements/StickyHeader";
import SectionHeading from "../../../components/elements/SectionHeading";


export default function TagPage({tag, postsForTag}) {
  return (
    <>
      <HeadW title="superflux" />
      <StickyHeader />

      <h1>
        #{tag}
      </h1>
      <ArticlePreviewList articleMetadataList={postsForTag} />
    </>
  )
}

export async function getStaticProps({ params }: Params) {
  const postDataList: PostData[] = getPostData();
  console.log(`filtering posts for tag ${params.tag}`);
  const postsForTag: PostData[] = postDataList.filter((post: PostData) => 
    post.tags.includes(params.tag)
  );

  console.log(`There are ${postsForTag.length} posts for tag ${params.tag}`);

  return {
    props: {
      tag: params.tag,
      postsForTag: postsForTag.sort(sortPostsByDate)
    },
  }
}

export const getStaticPaths: GetStaticPaths = async (
  context
): Promise<GetStaticPathsResult> => {
  const postData: PostData[] = getPostData();
  const tags = getTagsFromPostDataList(postData);
  console.log("Tags: ", tags);
  const paths = tags.map((tag: string) => ({
    params: {
      tag,
    },
  }));

  return {
    paths: paths,
    fallback: false
  };
};