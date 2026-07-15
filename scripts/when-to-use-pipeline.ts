#!/usr/bin/env node
/**
 * Build a catalog of SEO-ready “When to use {word}” pages from approved quiz
 * items that already have word explanations + examples.
 *
 * Does not generate new explanations — it only lists (and snapshots) pages
 * that are already publishable.
 *
 *   yarn when-to-use:pipeline
 *   yarn when-to-use:pipeline --limit 50
 *   yarn when-to-use:pipeline --write
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

  const { buildWhenToUseCatalog } = await import("../src/lib/whenToUse/repo");
  const { whenToUseCanonicalUrl, whenToUseSiteBaseUrl } = await import(
    "../src/lib/whenToUse/seo"
  );

  const baseUrl = whenToUseSiteBaseUrl();
  console.log(`\nWhen to use — SEO catalog pipeline`);
  console.log(`Site: ${baseUrl}`);
  console.log(`Limit: ${limit}\n`);

  const pages = await buildWhenToUseCatalog(limit);
  const withExampleTts = pages.filter((p) =>
    p.examples.some((e) => Boolean(e.ttsUrl)),
  ).length;
  const withAnswerTts = pages.filter((p) => Boolean(p.answerTtsUrl)).length;

  console.log(`Ready pages: ${pages.length}`);
  console.log(`  with example TTS: ${withExampleTts}`);
  console.log(`  with answer TTS:  ${withAnswerTts}`);
  console.log(`Hub: ${baseUrl}/when-to-use\n`);

  const preview = pages.slice(0, 25);
  console.log("Sample URLs (first 25):");
  for (const page of preview) {
    const url = whenToUseCanonicalUrl(baseUrl, page.id, page.slug);
    console.log(`  ${url}`);
    console.log(`    ${page.korean} · ${page.english} · examples=${page.examples.length}`);
  }
  if (pages.length > preview.length) {
    console.log(`  … +${pages.length - preview.length} more`);
  }

  if (write) {
    const outDir = join(__dirname, "data");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "when-to-use-catalog.json");
    const payload = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      total: pages.length,
      hub: `${baseUrl}/when-to-use`,
      pages: pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        path: `/when-to-use/${page.id}/${page.slug}`,
        url: whenToUseCanonicalUrl(baseUrl, page.id, page.slug),
        korean: page.korean,
        english: page.english,
        titleEn: page.titleEn,
        topic: page.topic ?? null,
        examples: page.examples.length,
        hasAnswerTts: Boolean(page.answerTtsUrl),
        hasExampleTts: page.examples.some((e) => Boolean(e.ttsUrl)),
        imageUrl: page.imageUrl,
        imageAlt: page.imageAlt,
        updatedAt: page.updatedAt ?? null,
      })),
    };
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`\nWrote catalog: ${outPath}`);
  }

  console.log("\nSEO checklist:");
  console.log("  - Sitemap includes /when-to-use + each page URL");
  console.log("  - Detail pages ship Article + FAQ + Breadcrumb JSON-LD");
  console.log("  - Hero image uses illustrationEnglish (or gloss) as alt");
  console.log("  - Do not regenerate explanations here — use korean-quiz backfill if missing\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
