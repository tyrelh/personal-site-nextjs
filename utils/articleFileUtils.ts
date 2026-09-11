import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { PostData, PostMetadata } from "../dtos/PostData";
import { calculateReadTimeOfText } from "./textUtils";

// YAML parses an unquoted ISO scalar (`2024-04-12`) as a Date at UTC midnight. Obsidian writes
// exactly that when a property is typed "Date". Format it in UTC — local-tz formatting on a
// Pacific machine would print April 11 — to match the `April 12, 2024` style of existing posts.
const fmtDate = (d: unknown): string => {
  if (d instanceof Date) {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  }
  return d ? String(d) : null;
};

// Accepts the Obsidian YAML list and the legacy space-separated string. Returns [] rather than
// null so `post.tags.includes` / `tags.forEach` never blow up on a post missing tags.
export const toTags = (t: unknown): string[] =>
  Array.isArray(t) ? t.map(String) : typeof t === "string" ? t.trim().split(/\s+/).filter(Boolean) : [];

// First prose block of the body, used when frontmatter has no excerpt. Returns undefined (not
// null) for an empty body so the `?? ""` fallback in parsePost fires.
const firstParagraph = (content: string): string | undefined =>
  content
    .split(/\n\s*\n/)
    .map((block: string) => block.trim())
    .find((block: string) => block.length > 0 && !/^(#|!\[|```|>|\||-{3,})/.test(block));

export const parsePost = (filename: string, dir: string = "posts"): Omit<PostData, "id"> => {
  const slug = filename.replace(/\.md$/, "");
  const { data: fm, content: raw } = matter(fs.readFileSync(path.join(dir, filename), "utf-8"));
  // gray-matter has already stripped the frontmatter; `raw` is the body only.
  // Anchor to the very start of the body (no `m` flag) so a `# comment` inside a
  // code fence is never matched — posts/deno-and-github-actions.md:81 has one.
  const body = raw.replace(/^\s+/, "");
  const h1 = body.match(/^# (.+)\n?/);
  const content = h1 ? body.slice(h1[0].length).replace(/^\s+/, "") : body;
  return {
    title: fm?.title ?? h1?.[1].trim() ?? slug,
    slug: slug,
    date: fmtDate(fm?.date),   // string, never a Date: Next cannot serialize Date props
    excerpt: fm?.excerpt ?? firstParagraph(content) ?? "",  // "" not null: search-index tokenizes it
    hero: fm?.hero ?? null,
    tags: toTags(fm?.tags),
    readTimeInMinutes: calculateReadTimeOfText(content),
    content: content
  };
};

// `id` is derived, not authored. Sorting by filename (not date) is deliberate: two posts share
// `date: April 3, 2024` and readdirSync order is not guaranteed on Linux, so a date sort would be
// tie-order dependent. Homepage / tag pages sort by date themselves via sortPostsByDate.
export const getPostDataList = (dir: string = "posts"): PostData[] =>
  fs
    .readdirSync(path.join(dir))
    .sort()
    .map((filename: string, i: number) => ({ ...parsePost(filename, dir), id: i }));

export const getPostMetaData = (dir: string = "posts"): PostMetadata[] =>
  getPostDataList(dir).map(({ content, ...meta }) => meta);
