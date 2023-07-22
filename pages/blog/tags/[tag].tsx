import { GetStaticPaths, GetStaticPathsResult } from "next"
import { getPostData } from "../../../utils/articleFileUtils"
import { PostData } from "../../../dtos/PostData";
import { getTagsFromPostDataList } from "../../../utils/tagUtils";
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
      <SectionHeading>
        #{tag}
      </SectionHeading>
      <ArticlePreviewList articleMetadataList={postsForTag} />
    </>
  )
}

// get articles for a given tag
export async function getStaticProps({ params }: Params) {
  const postDataList: PostData[] = getPostData();
  const postsForTag: PostData[] = postDataList.filter((post: PostData) => 
    post.tags.includes(params.tag)
  );
  return {
    props: {
      tag: params.tag,
      postsForTag: postsForTag.sort(sortPostsByDate)
    },
  }
}

// get unique tags to generate tag page paths
export const getStaticPaths: GetStaticPaths = async (context): Promise<GetStaticPathsResult> => {
  const postData: PostData[] = getPostData();
  const tags = getTagsFromPostDataList(postData);
  console.log("Tags: ", tags);
  const paths = tags.map((tag: string) => ({
    params: { tag }
  }));
  return {
    paths: paths,
    fallback: false
  };
};