import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { PostData } from "../dtos/PostData";
import { calculateReadTimeOfText } from "./textUtils";

export const getPostData = (): PostData[] => {
  const files = fs.readdirSync(path.join("posts"));
  const postDataList: PostData[] = files.map((filename) => {
    const slug = filename.replace(".md", "");
    const markdownWithMeta = fs.readFileSync(
      path.join("posts", filename),
      "utf-8"
    );
    const { data: frontmatter, content } = matter(markdownWithMeta);
    const readTimeInMinutes = calculateReadTimeOfText(content);
    const postData: PostData = {
      title: frontmatter?.title,
      slug: slug,
      date: frontmatter?.date,
      hero: frontmatter?.hero,
      excerpt: frontmatter?.excerpt,
      tags: frontmatter?.tags ? frontmatter.tags.split(" ") : null,
      readTimeInMinutes: readTimeInMinutes,
      content: content
    };
    return postData;
  });
  return postDataList
}