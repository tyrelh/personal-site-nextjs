// node scripts/import-post.test.mjs
import assert from "node:assert/strict";
import {
  slugify,
  hoistH1,
  extractImageRefs,
  imageFileName,
  rewriteImageRefs,
  parseHeroRef
} from "./import-post.mjs";

// slugify
assert.equal(slugify("Markdown Static Site Code Block Syntax Highlighting"),
  "markdown-static-site-code-block-syntax-highlighting");
assert.equal(slugify("Screenshot 2024-04-12 at 6.05.28 AM"), "screenshot-2024-04-12-at-6-05-28-am");
assert.equal(slugify("  Déjà — vu!  "), "deja-vu");

// hoistH1
assert.deepEqual(hoistH1("\n# My Post\n\nBody text.\n"), { title: "My Post", body: "Body text.\n" });
assert.deepEqual(hoistH1("No heading here."), { title: null, body: "No heading here." });
// a `# comment` inside a fence is not a heading: the match is anchored to the start of the body
assert.equal(hoistH1("```sh\n# comment\n```").title, null);
// only the leading H1 is removed; the same text later in the body survives
assert.equal(hoistH1("# Title\n\nSee # Title below.").body, "See # Title below.");

// extractImageRefs
assert.deepEqual(
  extractImageRefs("![[Screenshot 1.png]]\n![[b.png|a snake]]\n![alt text](c.png)\n"),
  [
    { target: "Screenshot 1.png", alt: "" },
    { target: "b.png", alt: "a snake" },
    { target: "c.png", alt: "alt text" }
  ]
);
// external and absolute srcs are left alone, and repeated targets appear once
assert.deepEqual(
  extractImageRefs("![x](https://example.com/a.png)\n![y](/images/posts/b.png)\n![z](c.png)\n![z2](c.png)"),
  [{ target: "c.png", alt: "z" }]
);

// imageFileName
assert.equal(imageFileName("my-post", "Screenshot 2024-04-12 at 6.05.28 AM.png"),
  "my-post-screenshot-2024-04-12-at-6-05-28-am.png");
assert.equal(imageFileName("my-post", "Hero.JPEG"), "my-post-hero.jpeg");

// parseHeroRef
assert.equal(parseHeroRef(undefined), null);
assert.equal(parseHeroRef(""), null);
assert.equal(parseHeroRef("   "), null);
assert.equal(parseHeroRef("MyHero.png"), "MyHero.png");
// Obsidian's property editor writes a wikilink when you pick an image
assert.equal(parseHeroRef("[[My Hero.png]]"), "My Hero.png");
assert.equal(parseHeroRef("![[My Hero.png|banner]]"), "My Hero.png");
// already-in-repo and external heroes survive untouched
assert.equal(parseHeroRef("/images/posts/aws-ddns.jpg"), "/images/posts/aws-ddns.jpg");
assert.equal(parseHeroRef("https://example.com/a.png"), "https://example.com/a.png");
assert.equal(parseHeroRef("My%20Hero.png"), "My Hero.png");

// rewriteImageRefs
const rename = (target) => (target === "Screenshot 1.png" ? "p-screenshot-1.png" : null);
assert.equal(rewriteImageRefs("![[Screenshot 1.png]]", rename), "![](p-screenshot-1.png)");
assert.equal(rewriteImageRefs("![[Screenshot 1.png|a cat]]", rename), "![a cat](p-screenshot-1.png)");
assert.equal(rewriteImageRefs("![a cat](Screenshot 1.png)", rename), "![a cat](p-screenshot-1.png)");
// unresolved and external refs are untouched
assert.equal(rewriteImageRefs("![[missing.png]]", rename), "![[missing.png]]");
assert.equal(rewriteImageRefs("![x](https://example.com/a.png)", rename), "![x](https://example.com/a.png)");

console.log("✔ import-post helpers pass");
