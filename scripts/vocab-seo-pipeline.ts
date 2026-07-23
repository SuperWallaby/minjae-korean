#!/usr/bin/env npx tsx
/**
 * Vocab chart SEO pipeline: publish catalog + validate Breadcrumb/Article/FAQ JSON-LD.
 *
 *   yarn vocab:pipeline
 *   yarn vocab:pipeline -- --publish
 *   yarn vocab:pipeline -- --limit 50
 *   yarn vocab:pipeline -- --no-write
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildVocabSeoArticleJsonLd,
  buildVocabSeoBreadcrumbJsonLd,
  buildVocabSeoFaqJsonLd,
  vocabSeoBreadcrumbItems,
  vocabSeoCanonicalUrl,
  vocabSeoPath,
  vocabSeoSiteBaseUrl,
} from "../src/lib/vocabInfographic/seo";
import type { VocabSeoPublishedFile } from "../src/lib/vocabInfographic/seoTypes";
import { loadEnvLocal } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED_PATH = path.join(
  ROOT,
  "src/data/vocabInfographic/published.json",
);

function parseArgs(argv: string[]) {
  let limit = 0;
  let write = true;
  let publish = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) {
      limit = Math.max(0, Number(argv[++i]) || 0);
    } else if (a === "--no-write") write = false;
    else if (a === "--write") write = true;
    else if (a === "--publish") publish = true;
  }
  return { limit, write, publish };
}

function main() {
  loadEnvLocal(ROOT);
  const { limit, write, publish } = parseArgs(process.argv.slice(2));
  const baseUrl = vocabSeoSiteBaseUrl();

  console.log(`\nVocab charts — SEO pipeline`);
  console.log(`Site: ${baseUrl}`);

  if (publish) {
    console.log(`\n→ yarn vocab:publish`);
    execFileSync("yarn", ["vocab:publish"], {
      cwd: ROOT,
      stdio: "inherit",
    });
  }

  if (!existsSync(PUBLISHED_PATH)) {
    throw new Error(
      `Missing ${PUBLISHED_PATH} — run yarn vocab:publish (or --publish)`,
    );
  }

  const file = JSON.parse(
    readFileSync(PUBLISHED_PATH, "utf8"),
  ) as VocabSeoPublishedFile;
  let pages = [...(file.pages || [])];
  if (limit > 0) pages = pages.slice(0, limit);

  let breadcrumbOk = 0;
  let faqOk = 0;
  let articleOk = 0;
  let enriched = 0;
  let withWordTts = 0;
  let withExampleTts = 0;

  for (const page of pages) {
    const canonical = vocabSeoCanonicalUrl(
      baseUrl,
      page.bundleId,
      page.slug,
    );
    const crumbs = vocabSeoBreadcrumbItems(page);
    const breadcrumb = buildVocabSeoBreadcrumbJsonLd(page, baseUrl, canonical);
    const article = buildVocabSeoArticleJsonLd(page, canonical);
    const faq = buildVocabSeoFaqJsonLd(page, canonical);

    if (
      crumbs.length >= 3 &&
      breadcrumb["@type"] === "BreadcrumbList" &&
      Array.isArray(breadcrumb.itemListElement) &&
      breadcrumb.itemListElement.length === crumbs.length
    ) {
      breadcrumbOk += 1;
    }
    if (article["@type"] === "Article" && article.headline) articleOk += 1;
    if (
      faq["@type"] === "FAQPage" &&
      Array.isArray(faq.mainEntity) &&
      faq.mainEntity.length > 0
    ) {
      faqOk += 1;
    }
    if (page.enrichedAt) enriched += 1;
    if (page.words.some((w) => Boolean(w.ttsUrl))) withWordTts += 1;
    if (page.examples?.some((e) => Boolean(e.ttsUrl))) withExampleTts += 1;
  }

  console.log(`\nPages in catalog: ${pages.length} (file total ${file.pages.length})`);
  console.log(`  Breadcrumb JSON-LD ok: ${breadcrumbOk}/${pages.length}`);
  console.log(`  Article JSON-LD ok:    ${articleOk}/${pages.length}`);
  console.log(`  FAQ JSON-LD ok:        ${faqOk}/${pages.length}`);
  console.log(`  enriched (copy+TTS):   ${enriched}`);
  console.log(`  with word TTS:         ${withWordTts}`);
  console.log(`  with example TTS:      ${withExampleTts}`);
  console.log(`Hub: ${baseUrl}/vocab\n`);

  const preview = pages.slice(0, 20);
  console.log("Sample URLs (first 20):");
  for (const page of preview) {
    const url = vocabSeoCanonicalUrl(baseUrl, page.bundleId, page.slug);
    const trail = vocabSeoBreadcrumbItems(page)
      .map((c) => c.label)
      .join(" › ");
    console.log(`  ${url}`);
    console.log(
      `    ${trail} · words=${page.words.length} · enriched=${Boolean(page.enrichedAt)}`,
    );
  }
  if (pages.length > preview.length) {
    console.log(`  … +${pages.length - preview.length} more`);
  }

  if (write) {
    const outDir = path.join(ROOT, "scripts/data");
    mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "vocab-seo-catalog.json");
    const payload = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      total: pages.length,
      hub: `${baseUrl}/vocab`,
      breadcrumbOk,
      faqOk,
      articleOk,
      enriched,
      withWordTts,
      withExampleTts,
      pages: pages.map((page) => ({
        bundleId: page.bundleId,
        slug: page.slug,
        path: vocabSeoPath(page.bundleId, page.slug),
        url: vocabSeoCanonicalUrl(baseUrl, page.bundleId, page.slug),
        titleEn: page.titleEn,
        format: page.format,
        breadcrumb: vocabSeoBreadcrumbItems(page).map((c) => c.label),
        words: page.words.length,
        examples: page.examples?.length ?? 0,
        enriched: Boolean(page.enrichedAt),
        hasWordTts: page.words.some((w) => Boolean(w.ttsUrl)),
        hasExampleTts: page.examples?.some((e) => Boolean(e.ttsUrl)) ?? false,
        imageUrl: page.imageUrl,
        updatedAt: page.updatedAt,
      })),
    };
    writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`\nWrote catalog: ${outPath}`);
  }

  console.log("\nSEO checklist:");
  console.log("  - Sitemap includes /vocab + each /vocab/{bundleId}/{slug}");
  console.log("  - Hub + detail ship Breadcrumb UI + BreadcrumbList JSON-LD");
  console.log("  - Detail pages ship Article + FAQ JSON-LD");
  console.log("  - Detail pages link related charts (format/tag ring)");
  console.log("  - Enrich copy/TTS: yarn vocab:enrich");
  console.log("  - Republish keeps enrichment: yarn vocab:publish\n");

  if (breadcrumbOk !== pages.length) {
    throw new Error(
      `Breadcrumb validation failed: ${breadcrumbOk}/${pages.length}`,
    );
  }
}

main();
