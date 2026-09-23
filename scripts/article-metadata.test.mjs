// node scripts/article-metadata.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const detail = readFileSync(new URL("../pages/blog/[slug].tsx", import.meta.url), "utf8");
const previews = readFileSync(new URL("../components/elements/ArticlePreviewList.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/_text.scss", import.meta.url), "utf8");

function guardedMetadata(source) {
  const match = source.match(/\{\s*post\?\.date\s*&&\s*<span className="post-metadata">([\s\S]*?)<\/span>\s*\}/);
  assert.ok(match, "date metadata should remain guarded and use a span");
  assert.doesNotMatch(source, /<h4\b/, "metadata should not add a heading to the outline");
  assert.match(match[1], /<CalendarOutlined\s*\/>\s*\{post\.date\}/);
  return match[1];
}

const detailMetadata = guardedMetadata(detail);
assert.match(detail, /<h1>\{post\.title\}<\/h1>/);
assert.doesNotMatch(detailMetadata, /ReadOutlined|readTimeInMinutes|Minute Read/);

const previewMetadata = guardedMetadata(previews);
assert.match(previews, /<h3 className="article-preview-title">/);
assert.equal((previews.match(/<Link href=\{`\/blog\/\$\{post\.slug\}`\}>/g) ?? []).length, 2);
assert.match(previewMetadata, /<ReadOutlined className="readtime-icon"\s*\/>(\s*)\{post\.readTimeInMinutes\} Minute Read/);

// H4 remains styled for real Markdown headings; metadata shares both theme rules.
const metadataStyle = styles.match(/\.post-metadata\s*\{([^}]+)\}/)?.[1];
assert.ok(metadataStyle);
assert.match(metadataStyle, /display:\s*block;/);
assert.match(metadataStyle, /font-weight:\s*700;/);

const dark = styles.match(/h4,\s*\.post-metadata\s*\{([\s\S]*?)\n\}/)?.[1];
assert.ok(dark, "H4 and metadata should share dark-mode styles");
assert.match(dark, /color:\s*darken\(\$color-main-text, 50%\);/);
assert.match(dark, /font-size:\s*0\.9rem !important;/);
assert.match(dark, /margin-top:\s*0px;/);
assert.match(dark, /margin-bottom:\s*0px;/);
assert.match(dark, /\.anticon\s*\{\s*margin-right:\s*0\.4rem;/);
assert.match(dark, /svg path\s*\{\s*fill:\s*darken\(\$color-main-text, 50%\);/);

const light = styles.match(/\.light-mode\s*\{\s*h4,\s*\.post-metadata\s*\{([\s\S]*?)\n  \}\s*\n\}/)?.[1];
assert.ok(light, "H4 and metadata should share light-mode styles");
assert.match(light, /color:\s*lighten\(\$color-main-text-light-theme, 50%\);/);
assert.match(light, /svg path\s*\{\s*fill:\s*lighten\(\$color-main-text-light-theme, 50%\);/);

console.log("✔ article metadata source and styles pass");
