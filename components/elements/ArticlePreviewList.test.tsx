import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ArticlePreviewList from "./ArticlePreviewList";
import type { PostMetadata } from "../../dtos/PostData";

const posts: PostMetadata[] = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  slug: `post-${index + 1}`,
  title: `Article ${index + 1}`,
  date: "April 12, 2024",
  excerpt: `Excerpt ${index + 1}`,
  hero: `/images/posts/hero-${index + 1}.png`,
  tags: [],
}));

describe("ArticlePreviewList", () => {
  it("shows all articles without pagination by default (as on tag pages)", () => {
    const html = renderToStaticMarkup(<ArticlePreviewList articleMetadataList={posts} />);

    expect(html.match(/class="article-preview-title"/g)).toHaveLength(16);
    expect(html).not.toContain("ant-list-pagination");
  });

  it("passes pagination through to Ant Design List", () => {
    const html = renderToStaticMarkup(
      <ArticlePreviewList articleMetadataList={posts} pagination={{ pageSize: 15, showSizeChanger: false }} />
    );

    expect(html.match(/class="article-preview-title"/g)).toHaveLength(15);
    expect(html).toContain("Article 1");
    expect(html).not.toContain("Article 16");
    expect(html).toContain("ant-list-pagination");
    expect(html).toContain('title="2"');
  });
});
