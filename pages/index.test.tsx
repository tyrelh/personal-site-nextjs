import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { PostMetadata } from "../dtos/PostData";
import type { Props } from "../components/elements/ArticlePreviewList";
import type { PaginationConfig } from "antd/es/pagination";
import Home, { getStaticProps } from "./index";
import { getPostMetaData } from "../utils/articleFileUtils";

const { preview } = vi.hoisted(() => ({ preview: vi.fn((_props: Props) => null) }));

vi.mock("../components/elements/ArticlePreviewList", () => ({ default: preview }));
vi.mock("../components/layout/HeadW", () => ({ default: () => null }));
vi.mock("../components/elements/Anchor", () => ({ default: () => null }));
vi.mock("../components/elements/SectionHeading", () => ({ default: () => null }));
vi.mock("../components/elements/TagCloud", () => ({ default: () => null }));
vi.mock("../components/elements/SocialCallout", () => ({ default: () => null }));
vi.mock("../components/elements/StickyHeader", () => ({ default: () => null }));
vi.mock("../utils/articleFileUtils", () => ({ getPostMetaData: vi.fn() }));
vi.mock("../utils/searchIndexFileUtils", () => ({ getSearchIndex: () => [] }));
vi.mock("../utils/searchIndexUtils", () => ({ searchIndexToJson: () => "[]" }));

const makePost = (slug: string, date: string): PostMetadata => ({
  id: 1, slug, date, title: slug, excerpt: "Excerpt", hero: "/hero.png", tags: [],
});

describe("homepage articles", () => {
  beforeEach(() => { preview.mockClear(); });

  it("enables fixed 15-item pages for the homepage list", () => {
    const posts = [makePost("new", "April 12, 2024")];
    renderToStaticMarkup(<Home posts={posts} searchIndexJson="[]" tagCounts={{}} />);

    expect(preview).toHaveBeenCalledOnce();
    expect(preview.mock.calls[0][0]).toEqual({
      articleMetadataList: posts,
      pagination: { pageSize: 15, showSizeChanger: false, onChange: expect.any(Function) },
    });
  });

  it("scrolls to the top of the page when changing pages", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("window", { scrollTo });
    renderToStaticMarkup(<Home posts={[]} searchIndexJson="[]" tagCounts={{}} />);

    (preview.mock.calls[0][0].pagination as PaginationConfig).onChange!(2, 15);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    vi.unstubAllGlobals();
  });

  it("keeps posts sorted newest first before pagination", async () => {
    vi.mocked(getPostMetaData).mockReturnValue([
      makePost("old", "January 1, 2023"),
      makePost("new", "April 12, 2024"),
    ]);

    const result = await getStaticProps({} as Parameters<typeof getStaticProps>[0]);
    expect(result).toMatchObject({
      props: { posts: [
        expect.objectContaining({ slug: "new" }),
        expect.objectContaining({ slug: "old" }),
      ] },
    });
  });
});
