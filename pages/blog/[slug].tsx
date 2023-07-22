import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsResult,
} from "next/types";
import { PostData } from "../../dtos/PostData";
import HeadW from "../../components/layout/HeadW";
import { getOptions, renderer } from "../../utils/markedUtils"
import StickyHeader from "../../components/elements/StickyHeader";
import Anchor from "../../components/elements/Anchor";
import Hashtag from "../../components/elements/Hashtag";
import { CalendarOutlined } from "@ant-design/icons"

marked.setOptions(getOptions());
marked.use({ renderer });

export default function PostPage(post: PostData) {
  return (
    <>
      <HeadW title={post.title} />
      <StickyHeader title={post.title} path={["blog"]}/>
      <h1>{post.title}</h1>
      {post?.date &&
          <h4><CalendarOutlined /> {post.date}</h4>
      }
      <p>
        {post.tags.map((tag: string) => (
          <Anchor key={tag} href={`/blog/tags/${tag}`}>
            <Hashtag tag={tag}/>
          </Anchor>
        ))}
      </p>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}></div>
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
export const getStaticProps: GetStaticProps = async ({ params: { slug } }): Promise<GetStaticPropsResult<PostData>> => {
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
    content: content
  };
  return {
    props: { ...postData }
  };
};
