import { GetStaticPaths, GetStaticPathsResult, GetStaticProps,
  GetStaticPropsResult } from "next"
import { getPostData } from "../../../utils/articleFileUtils"
import { PostData } from "../../../dtos/PostData";
import { getTagsFromPostDataList } from "../../../utils/tagUtils";
import ArticlePreviewList from "../../../components/elements/ArticlePreviewList";
import { sortPostsByDate } from "../../../utils/dateUtils";
import HeadW from "../../../components/layout/HeadW";
import StickyHeader from "../../../components/elements/StickyHeader";
import SectionHeading from "../../../components/elements/SectionHeading";
import Anchor from "../../../components/elements/Anchor";

export default function TagPage({tag, postsForTag}) {
  return (
    <>
      <HeadW title="superflux" />
      <StickyHeader title={tag} path={["blog","tags"]}/>
      <SectionHeading>
        #{tag}
      </SectionHeading>
      <ArticlePreviewList articleMetadataList={postsForTag} />
      <SectionHeading>
        Get in touch
      </SectionHeading>
      <p>
        Feel free to contact me via <Anchor href="https://twitter.com/tyreldelaney">Twitter</Anchor>!
      </p>
    </>
  );
}

// get articles for a given tag
export const getStaticProps: GetStaticProps = async ({ params: { tag } }): Promise<GetStaticPropsResult<any>> => {
  const postDataList: PostData[] = getPostData();
  const postsForTag: PostData[] = postDataList.filter((post: PostData) => 
    post.tags.includes(tag as string)
  );
  return {
    props: {
      tag: tag,
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