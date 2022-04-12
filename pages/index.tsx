import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GetStaticProps, GetStaticPropsResult } from "next";
import { PostMetadata, PostMetadataList } from "../dtos/PostData";
import { sortPostsByDate } from "../utils/dateUtils";
import HeadW from "../components/layout/HeadW";
import Anchor from "../components/elements/Anchor";
import Title from "../components/elements/Title";
import SectionHeading from "../components/elements/SectionHeading";
import ArticlePreviewList from "../components/elements/ArticlePreviewList";
import SocialCallout from "../components/elements/SocialCallout";


export default function Home({ posts }) {
  return (
    <>
      <HeadW title="superflux" />

      <Title>Hi, I&rsquo;m Tyrel.</Title>

      

      <p>
        A software engineer constantly learning new skills and technologies. I
        work for <Anchor href="https://www.giftbit.com">Giftbit</Anchor>{" "}
        building great web services. You can see some of my work below as well
        as on my <Anchor href="https://github.com/tyrelh">Github</Anchor>.
        <SocialCallout/>
      </p>

      

      <SectionHeading>
        Articles
      </SectionHeading>

      <ArticlePreviewList articleMetadataList={posts} />

      <SectionHeading>
        Get in touch
      </SectionHeading>

      <p>
        Feel free to contact me via <Anchor href="https://twitter.com/tyrelhiebert">Twitter</Anchor>!
      </p>
    </>
  );
}

// GET POST METADATA FROM MARKDOWN ARTICLES
export const getStaticProps: GetStaticProps = async (
  context
): Promise<GetStaticPropsResult<PostMetadataList>> => {
  // get files from posts dir
  const files = fs.readdirSync(path.join("posts"));

  // get slug and frontmatter from posts
  const posts = files.map((filename) => {
    // create slug
    const slug = filename.replace(".md", "");

    // get frontmatter
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );
    const { data: frontmatter } = matter(markdownWithMeta);

    const metadata: PostMetadata = {
      title: frontmatter?.title,
      slug: slug,
      date: frontmatter?.date,
      hero: frontmatter?.hero,
      excerpt: frontmatter?.excerpt,
      tags: frontmatter?.tags ? frontmatter.tags.split(" ") : null
    };
    return metadata;
  });

  return {
    props: {
      posts: posts.sort(sortPostsByDate),
    },
  };
};
