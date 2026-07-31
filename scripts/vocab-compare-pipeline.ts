#!/usr/bin/env node
/**
 * Catalog SEO-ready vocab compare pages (image + alt on both sides).
 *
 *   yarn vocab-compare:pipeline
 *   yarn vocab-compare:pipeline --limit 100
 *   yarn vocab-compare:pipeline --no-write
 */
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(join(__dirname, ".."));
}

function parseArgs(argv: string[]) {
  let limit = 5000;
  let write = true;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limit") {
      const n = Number(argv[++i]);
      if (Number.isFinite(n) && n > 0) limit = Math.floor(n);
    } else if (arg === "--no-write") {
      write = false;
    } else if (arg === "--write") {
      write = true;
    }
  }
  return { limit, write };
}

async function main() {
  await loadEnv();
  const { limit, write } = parseArgs(process.argv.slice(2));

  const { buildVocabCompareCatalog } = await import(
    "../src/lib/vocabCompare/repo"
  );
  const { toVocabDifferencePage } = await import("../src/lib/vocabDetail/project");
  const {
    vocabDetailSiteBaseUrl,
    vocabDifferenceCanonicalUrl,
    vocabDifferencePath,
  } = await import("../src/lib/vocabDetail/slug");

  const baseUrl = vocabDetailSiteBaseUrl();
  console.log(`\nVocab compare — SEO catalog pipeline`);
  console.log(`Site: ${baseUrl}`);
  console.log(`Limit: ${limit}\n`);

  const raw = await buildVocabCompareCatalog(limit);
  const pages = raw.map((page) => toVocabDifferencePage(page));
  const cachedContrast = pages.filter((p) => p.contrastSource === "cached").length;

  console.log(`Ready difference pages: ${pages.length}`);
  console.log(`  with cached AI contrast: ${cachedContrast}`);
  console.log(`  with fallback contrast:  ${pages.length - cachedContrast}`);
  console.log(`Hub: ${baseUrl}/vocab/detail\n`);

  const preview = pages.slice(0, 20);
  console.log("Sample URLs (first 20):");
  for (const page of preview) {
    const url = vocabDifferenceCanonicalUrl(
      baseUrl,
      page.leftId,
      page.rightId,
      page.slug,
    );
    console.log(`  ${url}`);
    console.log(
      `    ${page.left.korean} vs ${page.right.korean} · ${page.contrastSource}`,
    );
  }
  if (pages.length > preview.length) {
    console.log(`  … +${pages.length - preview.length} more`);
  }

  if (write) {
    const outDir = join(__dirname, "data");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "vocab-compare-catalog.json");
    const payload = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      total: pages.length,
      hub: `${baseUrl}/vocab/detail`,
      canonicalNote:
        "Legacy /vocab/compare URLs 301 to /vocab/detail/difference",
      pages: pages.map((page) => ({
        leftId: page.leftId,
        rightId: page.rightId,
        slug: page.slug,
        path: vocabDifferencePath(page.leftId, page.rightId, page.slug),
        url: vocabDifferenceCanonicalUrl(
          baseUrl,
          page.leftId,
          page.rightId,
          page.slug,
        ),
        titleEn: page.titleEn,
        left: {
          korean: page.left.korean,
          english: page.left.english,
          imageUrl: page.left.imageUrl,
          imageAlt: page.left.imageAlt,
        },
        right: {
          korean: page.right.korean,
          english: page.right.english,
          imageUrl: page.right.imageUrl,
          imageAlt: page.right.imageAlt,
        },
        contrastSource: page.contrastSource,
        updatedAt: page.updatedAt ?? null,
      })),
    };
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`\nWrote catalog: ${outPath}`);
  }

  console.log("\nSEO checklist:");
  console.log("  - Each page has two quiz illustrations with English alt text");
  console.log("  - Sitemap includes /vocab/detail/difference URLs");
  console.log("  - Legacy /vocab/compare redirects to difference pages\n");

  try {
    const { closeMongoClient } = await import("../src/lib/mongo");
    await closeMongoClient();
  } catch {
    // no client opened
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
