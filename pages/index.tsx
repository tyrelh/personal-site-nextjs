import { GetStaticProps, GetStaticPropsResult } from "next";
import { PostData, PostMetadataList } from "../dtos/PostData";
import { sortPostsByDate } from "../utils/dateUtils";
import HeadW from "../components/layout/HeadW";
import Anchor from "../components/elements/Anchor";
import SectionHeading from "../components/elements/SectionHeading";
import ArticlePreviewList from "../components/elements/ArticlePreviewList";
import SocialCallout from "../components/elements/SocialCallout";
import StickyHeader from "../components/elements/StickyHeader";
import { getPostData } from "../utils/articleFileUtils";

export default function Home({ posts }) {
  return (
    <>
      <HeadW title="superflux" />
      <StickyHeader />
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
): Promise<GetStaticPropsResult<PostMetadataList>> => {
  const postDataList: PostData[] = getPostData();
  return {
    props: {
      posts: postDataList.sort(sortPostsByDate),
    },
  };
};
