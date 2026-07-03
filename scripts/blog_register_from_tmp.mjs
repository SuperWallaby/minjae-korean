#!/usr/bin/env node
/** Resume register from .tmp/blog-pipeline artifacts (after a failed TSX step). */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { generateBlogCoverAssets } from "./lib/blog_cover_image.mjs";
import {
  blogPostToTsx,
  parseBlogMarkdown,
  patchBlogTsxImages,
  registerBlogSlug,
  writeBlogTsx,
} from "./lib/blog_markdown_to_tsx.mjs";
import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/blog_register_from_tmp.mjs <slug>");
  process.exit(1);
}

loadEnvLocal();
const outDir = join(ROOT, ".tmp", "blog-pipeline");
const md = readFileSync(join(outDir, `${slug}.md`), "utf8");
const proposal = JSON.parse(readFileSync(join(outDir, `${slug}-proposal.json`), "utf8"));
const digest = JSON.parse(readFileSync(join(outDir, "youtube-one-digest.json"), "utf8"));
const result = Array.isArray(digest.results) ? digest.results[0] : digest;

const parsed = parseBlogMarkdown(md);
const postTitle = parsed.title || proposal.titles?.[0];
const tsxPath = join(ROOT, "src", "data", "blogPosts", "content", `${slug}.tsx`);
const indexPath = join(ROOT, "src", "data", "blogPosts", "index.ts");

process.env.BLOG_FORCE_OVERWRITE = "1";
const tsx = blogPostToTsx({
  slug,
  title: postTitle,
  level: proposal.level || 3,
  videoId: result.videoId,
  sections: parsed.sections,
});
writeBlogTsx(tsxPath, tsx);
registerBlogSlug(slug, indexPath);

const cover = await generateBlogCoverAssets({
  title: postTitle,
  thesis: proposal.thesis,
  slug,
  outDir,
});
patchBlogTsxImages(tsxPath, {
  imageThumb: cover.imageThumb,
  imageLarge: cover.imageLarge,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      slug,
      title: postTitle,
      url: `/blog/article/${slug}`,
      imageThumb: cover.imageThumb,
      imageLarge: cover.imageLarge,
    },
    null,
    2,
  ),
);
