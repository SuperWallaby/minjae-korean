#!/usr/bin/env node
/**
 * Generate blog cover (gpt-image-2) + thumb for an existing TSX post.
 *
 *   yarn blog:cover --slug mastering-korean-emotions-not-just-words
 *   yarn blog:cover --slug my-slug --title "Custom Title" --thesis "optional theme"
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { generateBlogCoverAssets } from "./lib/blog_cover_image.mjs";
import { patchBlogTsxImages } from "./lib/blog_markdown_to_tsx.mjs";
import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";

function parseArgs(argv) {
  const val = (flag, fallback = null) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    slug: val("--slug"),
    title: val("--title"),
    thesis: val("--thesis", ""),
    outDir: val("--out-dir", join(ROOT, ".tmp", "blog-pipeline")),
  };
}

function readTitleFromTsx(tsxPath) {
  const src = readFileSync(tsxPath, "utf8");
  const m = src.match(/\n  title:\s*"([^"]+)"/) || src.match(/\n  title:\s*'([^']+)'/);
  return m?.[1] || null;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error("Usage: yarn blog:cover --slug <slug> [--title ...] [--thesis ...]");
    process.exit(1);
  }

  const tsxPath = join(ROOT, "src", "data", "blogPosts", "content", `${args.slug}.tsx`);
  const title = args.title || readTitleFromTsx(tsxPath);
  if (!title) {
    console.error(`Could not read title from ${tsxPath} — pass --title`);
    process.exit(1);
  }

  const cover = await generateBlogCoverAssets({
    title,
    thesis: args.thesis || title,
    slug: args.slug,
    outDir: args.outDir,
  });

  patchBlogTsxImages(tsxPath, {
    imageThumb: cover.imageThumb,
    imageLarge: cover.imageLarge,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        slug: args.slug,
        imageThumb: cover.imageThumb,
        imageLarge: cover.imageLarge,
        local: cover.imageLargeLocal,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
