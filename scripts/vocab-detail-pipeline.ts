#!/usr/bin/env node
/**
 * Catalog canonical /vocab/detail SEO pages (difference + how-to-say).
 *
 *   yarn vocab-detail:pipeline
 *   yarn vocab-detail:pipeline --limit 200
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
  const { buildWhenToUseCatalog } = await import("../src/lib/whenToUse/repo");
  const { toVocabDifferencePage, toVocabHowToSayPage } = await import(
    "../src/lib/vocabDetail/project"
  );
  const {
    vocabDetailSiteBaseUrl,
    vocabDifferenceCanonicalUrl,
    vocabDifferencePath,
    vocabHowToSayCanonicalUrl,
    vocabHowToSayPath,
  } = await import("../src/lib/vocabDetail/slug");

  const baseUrl = vocabDetailSiteBaseUrl();
  console.log(`\nVocab detail — SEO catalog pipeline`);
  console.log(`Site: ${baseUrl}`);
  console.log(`Limit: ${limit}\n`);

  const [compareRaw, howToSayRaw] = await Promise.all([
    buildVocabCompareCatalog(limit),
    buildWhenToUseCatalog(limit),
  ]);

  const difference = compareRaw.map((row) => toVocabDifferencePage(row));
  const howToSay = howToSayRaw.map((row) => toVocabHowToSayPage(row));

  console.log(`Difference pages: ${difference.length}`);
  console.log(`How-to-say pages: ${howToSay.length}`);
  console.log(`Hub: ${baseUrl}/vocab/detail\n`);

  for (const page of difference.slice(0, 10)) {
    console.log(
      `  ${vocabDifferenceCanonicalUrl(baseUrl, page.leftId, page.rightId, page.slug)}`,
    );
  }
  if (difference.length > 10) console.log(`  … +${difference.length - 10} more difference`);

  for (const page of howToSay.slice(0, 10)) {
    console.log(`  ${vocabHowToSayCanonicalUrl(baseUrl, page.id, page.slug)}`);
  }
  if (howToSay.length > 10) console.log(`  … +${howToSay.length - 10} more how-to-say`);

  if (write) {
    const outDir = join(__dirname, "data");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "vocab-detail-catalog.json");
    const payload = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      hub: `${baseUrl}/vocab/detail`,
      totals: {
        difference: difference.length,
        howToSay: howToSay.length,
      },
      difference: difference.map((page) => ({
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
        contrastSource: page.contrastSource,
        updatedAt: page.updatedAt ?? null,
      })),
      howToSay: howToSay.map((page) => ({
        id: page.id,
        slug: page.slug,
        path: vocabHowToSayPath(page.id, page.slug),
        url: vocabHowToSayCanonicalUrl(baseUrl, page.id, page.slug),
        korean: page.korean,
        english: page.english,
        titleEn: page.titleEn,
        examples: page.examples.length,
        imageUrl: page.imageUrl,
        imageAlt: page.imageAlt,
        updatedAt: page.updatedAt ?? null,
      })),
    };
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`\nWrote catalog: ${outPath}`);
  }

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
