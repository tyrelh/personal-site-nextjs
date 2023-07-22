import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { PostData, PostMetadata } from "../dtos/PostData";
import { calculateReadTimeOfText } from "./textUtils";

export const getPostData = (): PostData[] => {
  // get files from posts dir
  const files = fs.readdirSync(path.join("posts"));

  // get slug and frontmatter from posts
  const metadata = files.map((filename) => {
    // create slug
    const slug = filename.replace(".md", "");

    // get frontmatter
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );
    const { data: frontmatter, content } = matter(markdownWithMeta);

    const readTimeInMinutes = calculateReadTimeOfText(content);

    const metadatum: PostData = {
      title: frontmatter?.title,
      slug: slug,
      date: frontmatter?.date,
      hero: frontmatter?.hero,
      excerpt: frontmatter?.excerpt,
      tags: frontmatter?.tags ? frontmatter.tags.split(" ") : null,
      readTimeInMinutes: readTimeInMinutes,
      content: content
    };
    return metadatum;
  });

  return metadata
}