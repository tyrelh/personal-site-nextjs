#!/usr/bin/env node
// Import an Obsidian note into posts/, copying and rewriting its images.
//
//   npm run import-post "$OBSIDIAN_VAULT_PATH/projects/superflux.dev/My Post.md" [--slug my-post] [--dry-run] [--force]
//
// Wikilink -> markdown conversion lives here rather than in the runtime parser: only this script
// knows the filename an image was renamed to, so a runtime regex could not produce a working src.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const POSTS_DIR = path.join(REPO_ROOT, "posts");
const IMAGES_DIR = path.join(REPO_ROOT, "public", "images", "posts");
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"]);
const SKIP_DIRS = new Set([".obsidian", ".git", ".trash", "node_modules"]);

// --- pure helpers (exported for scripts/import-post.test.mjs) -------------------------------

export const slugify = (text) =>
  String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The body convention is `# Title` on the first line. Returns the title and the body without it.
export const hoistH1 = (body) => {
  const trimmed = body.replace(/^\s+/, "");
  const match = trimmed.match(/^# (.+)\n?/);
  return match
    ? { title: match[1].trim(), body: trimmed.slice(match[0].length).replace(/^\s+/, "") }
    : { title: null, body: trimmed };
};

const WIKI_RE = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
// tolerant of unencoded spaces (`![a](My File.png)`) and of `<...>` / trailing-title forms
const MD_RE = /!\[([^\]]*)\]\(\s*<?([^)<>]+?)>?\s*(?:"[^"]*")?\s*\)/g;

const isExternal = (target) => /^(https?:|\/|data:)/.test(target);

// Every image reference in the body, in document order, deduplicated by target.
export const extractImageRefs = (body) => {
  const refs = [];
  const seen = new Set();
  const push = (target, alt) => {
    const decoded = decodeURIComponent(target.trim());
    if (isExternal(decoded) || seen.has(decoded)) return;
    seen.add(decoded);
    refs.push({ target: decoded, alt: (alt ?? "").trim() });
  };
  for (const m of body.matchAll(WIKI_RE)) push(m[1], m[2]);
  for (const m of body.matchAll(MD_RE)) push(m[2], m[1]);
  return refs;
};

// A frontmatter `hero` names an image the same way the body does, so it goes through the same
// resolve-and-copy path — the file has to be in public/images/posts/ to ship. Obsidian writes a
// wikilink when you pick an image in the property editor; unwrap it to the bare target.
export const parseHeroRef = (hero) => {
  if (!hero) return null;
  const target = String(hero)
    .trim()
    .replace(/^!?\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]$/, "$1")
    .trim();
  return target ? decodeURIComponent(target) : null;
};

// `Screenshot 2024-04-12 at 6.05.28 AM.png` -> `my-post-screenshot-2024-04-12-at-6-05-28-am.png`.
// Derived from the old name rather than a counter so re-importing after reordering images keeps
// names stable, and --force can never point an existing filename at a different image.
export const imageFileName = (slug, basename) => {
  const ext = path.extname(basename).toLowerCase();
  return `${slug}-${slugify(path.basename(basename, path.extname(basename)))}${ext}`;
};

// Rewrites both `![[f]]`/`![[f|alt]]` and `![alt](f)` to `![alt](newName)`, preserving alt text.
// `rename` maps a resolved target to its new filename; unknown or external targets are untouched.
export const rewriteImageRefs = (body, rename) => {
  const lookup = (target) => rename(decodeURIComponent(target.trim()));
  return body
    .replace(WIKI_RE, (whole, target, alt) => {
      const renamed = lookup(target);
      return renamed ? `![${(alt ?? "").trim()}](${renamed})` : whole;
    })
    .replace(MD_RE, (whole, alt, target) => {
      const renamed = lookup(target);
      return renamed ? `![${alt.trim()}](${renamed})` : whole;
    });
};

// --- file system ---------------------------------------------------------------------------

const findInVault = (vaultRoot, basename) => {
  const stack = [vaultRoot];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(path.join(dir, entry.name));
      } else if (entry.name === basename) {
        return path.join(dir, entry.name);
      }
    }
  }
  return null;
};

// Obsidian's attachmentFolderPath is "./", so the note's own directory wins; the real screenshots
// live in <vault>/images; anything else needs a walk.
const resolveImage = (target, noteDir, vaultRoot) => {
  const candidates = [
    path.resolve(noteDir, target),
    path.join(vaultRoot, "images", path.basename(target))
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return findInVault(vaultRoot, path.basename(target));
};

const insideRepo = (target) => {
  const resolved = path.resolve(target);
  return resolved === REPO_ROOT || resolved.startsWith(REPO_ROOT + path.sep);
};

const fail = (message) => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

// --- main ------------------------------------------------------------------------------------

const main = () => {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const slugFlag = argv.indexOf("--slug");
  const slugArg = slugFlag === -1 ? null : argv[slugFlag + 1];
  const positional = argv.filter(
    (arg, i) => !arg.startsWith("--") && !(slugFlag !== -1 && i === slugFlag + 1)
  );
  const source = positional[0];

  if (!source) fail('usage: npm run import-post "<note.md>" [--slug my-post] [--dry-run] [--force]');
  if (!fs.existsSync(source)) fail(`note not found: ${source}`);

  const notePath = path.resolve(source);
  const noteDir = path.dirname(notePath);
  const vaultRoot = process.env.OBSIDIAN_VAULT_PATH
    ? path.resolve(process.env.OBSIDIAN_VAULT_PATH)
    : noteDir;

  const { data: frontmatter, content } = matter(fs.readFileSync(notePath, "utf-8"));
  const { title: h1Title } = hoistH1(content);
  const slug = slugify(
    slugArg ?? frontmatter?.title ?? h1Title ?? path.basename(notePath, ".md")
  );
  if (!slug) fail("could not derive a slug; pass --slug");

  const postPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!insideRepo(postPath)) fail(`refusing to write outside the repo: ${postPath}`);
  if (fs.existsSync(postPath) && !force) fail(`posts/${slug}.md already exists; pass --force`);

  // Resolve every image before writing anything: a post with broken images is worse than no post.
  // A frontmatter `hero` naming a vault image is resolved and copied alongside the body images —
  // an image that never lands in public/images/posts/ never gets deployed. An already-in-repo
  // `/images/posts/...` hero is checked for existence instead; an external URL is left alone.
  const refs = extractImageRefs(content);
  const heroRef = parseHeroRef(frontmatter?.hero);
  const heroNeedsCopy = heroRef !== null && !isExternal(heroRef);
  const targets = refs.map((ref) => ({ ...ref, inBody: true }));
  if (heroNeedsCopy && !refs.some((ref) => ref.target === heroRef)) {
    targets.push({ target: heroRef, alt: "", inBody: false });
  }

  const resolved = new Map();
  const unresolved = [];
  for (const ref of targets) {
    const found = resolveImage(ref.target, noteDir, vaultRoot);
    if (!found) {
      unresolved.push(ref.inBody ? ref.target : `${ref.target} (frontmatter hero)`);
      continue;
    }
    if (!IMAGE_EXTS.has(path.extname(found).toLowerCase())) {
      unresolved.push(`${ref.target} (unsupported extension)`);
      continue;
    }
    resolved.set(ref.target, {
      from: found,
      to: imageFileName(slug, path.basename(found)),
      alt: ref.alt,
      inBody: ref.inBody
    });
  }
  if (unresolved.length) {
    fail(`could not resolve ${unresolved.length} image(s) in the vault:\n  ${unresolved.join("\n  ")}`);
  }

  if (heroRef !== null && !heroNeedsCopy && heroRef.startsWith("/")) {
    const heroInRepo = path.join(REPO_ROOT, "public", heroRef);
    if (!insideRepo(heroInRepo) || !fs.existsSync(heroInRepo)) {
      fail(`hero points at public${heroRef}, which is not in this repo — name the vault file instead and it will be copied`);
    }
  }

  const hero = heroRef !== null
    ? (heroNeedsCopy ? `/images/posts/${resolved.get(heroRef).to}` : heroRef)
    : refs.length
      ? `/images/posts/${resolved.get(refs[0].target).to}`
      : null;
  if (!hero) fail("note has no images and no `hero`; the homepage preview needs one");

  // Copy images. A byte-identical file already in place is a no-op; a different one needs --force.
  const copies = [];
  for (const { from, to } of resolved.values()) {
    const dest = path.join(IMAGES_DIR, to);
    if (!insideRepo(dest)) fail(`refusing to write outside the repo: ${dest}`);
    if (fs.existsSync(dest)) {
      if (fs.readFileSync(dest).equals(fs.readFileSync(from))) {
        copies.push({ to, status: "unchanged" });
        continue;
      }
      if (!force) fail(`public/images/posts/${to} exists with different content; pass --force`);
      copies.push({ to, status: "overwritten" });
    } else {
      copies.push({ to, status: "copied" });
    }
    if (!dryRun) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      fs.copyFileSync(from, dest);
    }
  }

  const rename = (target) => resolved.get(target)?.to ?? null;
  // `tags` are left exactly as authored — the parser's toTags accepts the YAML list and the
  // legacy space-separated string, so reshaping here is dead work. `id` is derived at build time.
  const { id, ...rest } = frontmatter ?? {};
  const post = matter.stringify(rewriteImageRefs(content, rename), { ...rest, hero });

  if (!dryRun) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    fs.writeFileSync(postPath, post, "utf-8");
  }

  const missingAlt = [...resolved.values()].filter((image) => image.inBody && !image.alt);
  console.log(`${dryRun ? "⏺ [dry run] would import" : "✔ imported"} ${path.basename(notePath)}`);
  console.log(`⏺ posts/${slug}.md`);
  console.log(`⏺ hero: ${hero}`);
  for (const { to, status } of copies) console.log(`⏺ images: ${to} (${status})`);
  if (missingAlt.length) {
    console.log(`\n⚠ ${missingAlt.length} image(s) have no alt text — add it in posts/${slug}.md:`);
    for (const image of missingAlt) console.log(`  ![](${image.to})`);
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main();
}
