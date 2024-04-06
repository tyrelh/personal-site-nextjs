import { GetStaticProps, GetStaticPropsResult } from "next";
import { PostData, PostMetadata, PostMetadataList } from "../dtos/PostData";
import { sortPostsByDate } from "../utils/dateUtils";
import HeadW from "../components/layout/HeadW";
import Anchor from "../components/elements/Anchor";
import SectionHeading from "../components/elements/SectionHeading";
import ArticlePreviewList from "../components/elements/ArticlePreviewList";
import SocialCallout from "../components/elements/SocialCallout";
import StickyHeader from "../components/elements/StickyHeader";
import { getPostDataList, getPostMetaData } from "../utils/articleFileUtils";
import { getSearchIndex } from "../utils/searchIndexFileUtils";
import { searchIndexToJson } from "../utils/searchIndexUtils";

export default function Home({ posts, searchIndexJson }) {
  return (
    <>
      <HeadW title="superflux" />
      <StickyHeader postMetadataList={posts} searchIndexJson={searchIndexJson} />
      <h1>
        Hi, I&rsquo;m Tyrel.
      </h1>
      <p>
        A software developer constantly learning new skills and technologies. I work for <Anchor href="https://www.giftbit.com">Giftbit</Anchor> building great web services. You can see some of my work below as well as on my <Anchor href="https://github.com/tyrelh">Github</Anchor>.
      </p>
      <SocialCallout/>
      
      <SectionHeading>
        Articles
      </SectionHeading>
      <ArticlePreviewList articleMetadataList={posts} />
      {/* <SectionHeading>
        Get in touch
      </SectionHeading>
      <p>
        Feel free to contact me via <Anchor href="https://twitter.com/tyreldelaney">Twitter</Anchor>!
      </p> */}
    </>
  );
}

// GET POST METADATA FROM MARKDOWN ARTICLES
export const getStaticProps: GetStaticProps = async (
  context
): Promise<GetStaticPropsResult<{posts: PostMetadata[], searchIndexJson: string }>> => {
  const searchIndex = getSearchIndex();
  const searchIndexJson = searchIndexToJson(searchIndex);
  const postMetadataList: PostMetadata[] = getPostMetaData();
  return {
    props: {
      posts: postMetadataList.sort(sortPostsByDate),
      searchIndexJson
    },
  };
};
