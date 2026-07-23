#!/usr/bin/env npx tsx
/**
 * Build SEO pages for /vocab from catalog + vocab-x-scheduled (+ optional .words.json).
 *
 * Eligibility: has imageUrl (no reviewStatus filter).
 *
 *   yarn vocab:publish
 *   npx tsx scripts/publish-vocab-seo-pages.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog";
import {
  cleanVocabTweetIntro,
  slugifyVocabBundleTitle,
  vocabSeoDescription,
  vocabSeoTitleEn,
} from "../src/lib/vocabInfographic/seo";
import type {
  VocabSeoPage,
  VocabSeoPublishedFile,
  VocabSeoWord,
} from "../src/lib/vocabInfographic/seoTypes";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GEN_DIR = path.join(ROOT, ".tmp/vocab-infographic-gen");
const SCHEDULED_PATH = path.join(GEN_DIR, "vocab-x-scheduled.json");
const OUT_PATH = path.join(ROOT, "src/data/vocabInfographic/published.json");

type ScheduledEntry = {
  imageUrl?: string;
  imageThumbUrl?: string;
  tweetText?: string;
  caption?: { line1?: string; line2?: string };
  imageWords?: Array<{
    hangul?: string;
    romanization?: string;
    english?: string;
  }>;
  registeredAt?: string;
  regeneratedAt?: string;
  scheduledAt?: string;
  reviewStatus?: string;
};

function loadScheduled(): Record<string, ScheduledEntry> {
  if (!existsSync(SCHEDULED_PATH)) {
    throw new Error(`Missing ${SCHEDULED_PATH}`);
  }
  return JSON.parse(readFileSync(SCHEDULED_PATH, "utf8")) as Record<
    string,
    ScheduledEntry
  >;
}

function loadWordsJson(bundleId: string): VocabSeoWord[] {
  const p = path.join(GEN_DIR, `${bundleId}.words.json`);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as {
      words?: Array<{
        hangul?: string;
        romanization?: string;
        english?: string;
      }>;
    };
    return (raw.words ?? [])
      .map((w) => ({
        hangul: String(w.hangul ?? "").trim(),
        romanization: String(w.romanization ?? "").trim() || undefined,
        english: String(w.english ?? "").trim(),
      }))
      .filter((w) => w.hangul && w.english);
  } catch {
    return [];
  }
}

function normalizeWords(
  raw: ScheduledEntry["imageWords"] | undefined,
): VocabSeoWord[] {
  if (!raw?.length) return [];
  return raw
    .map((w) => ({
      hangul: String(w.hangul ?? "").trim(),
      romanization: String(w.romanization ?? "").trim() || undefined,
      english: String(w.english ?? "").trim(),
    }))
    .filter((w) => w.hangul && w.english);
}

function loadPrevious(): Map<string, VocabSeoPage> {
  if (!existsSync(OUT_PATH)) return new Map();
  try {
    const prev = JSON.parse(readFileSync(OUT_PATH, "utf8")) as VocabSeoPublishedFile;
    return new Map((prev.pages || []).map((p) => [p.bundleId, p]));
  } catch {
    return new Map();
  }
}

/** Keep explanation / examples / word TTS across republish. */
function mergeEnrichment(
  next: VocabSeoPage,
  prev: VocabSeoPage | undefined,
): VocabSeoPage {
  if (!prev) return next;
  const ttsByHangul = new Map(
    prev.words
      .filter((w) => w.hangul && w.ttsUrl)
      .map((w) => [w.hangul, w] as const),
  );
  const words = next.words.map((w) => {
    const old = ttsByHangul.get(w.hangul);
    if (!old?.ttsUrl) return w;
    return {
      ...w,
      ttsUrl: old.ttsUrl,
      ttsProvider: old.ttsProvider,
      ttsScore: old.ttsScore,
    };
  });
  return {
    ...next,
    words,
    explanationEn: prev.explanationEn || next.explanationEn,
    examples: prev.examples?.length ? prev.examples : next.examples,
    enrichedAt: prev.enrichedAt || next.enrichedAt,
    description:
      prev.explanationEn && prev.explanationEn.length > 40
        ? prev.explanationEn.length > 160
          ? `${prev.explanationEn.slice(0, 157).trimEnd()}…`
          : prev.explanationEn
        : next.description,
  };
}

function main() {
  const scheduled = loadScheduled();
  const previous = loadPrevious();
  const catalogById = new Map(ALL_VOCAB_BUNDLES.map((b) => [b.id, b]));
  const pages: VocabSeoPage[] = [];
  let skippedNoImage = 0;
  let skippedUnknownBundle = 0;
  let keptEnrichment = 0;

  for (const [bundleId, entry] of Object.entries(scheduled)) {
    const imageUrl = String(entry.imageUrl ?? "").trim();
    if (!imageUrl) {
      skippedNoImage += 1;
      continue;
    }

    const bundle = catalogById.get(bundleId);
    if (!bundle) {
      skippedUnknownBundle += 1;
      // Still publish with id-derived title so CDN assets aren't orphaned.
    }

    const title = bundle?.title ?? bundleId.replace(/^(grid|ant|list|quiz)-/, "").replace(/-/g, " ");
    const titleEn = vocabSeoTitleEn(title);
    const slug = slugifyVocabBundleTitle(title);
    const words =
      normalizeWords(entry.imageWords).length > 0
        ? normalizeWords(entry.imageWords)
        : loadWordsJson(bundleId);

    const tweet = String(entry.tweetText ?? "").trim();
    const intro =
      cleanVocabTweetIntro(tweet) ||
      `A picture chart of related Korean words: ${title}.`;

    const updatedAt =
      entry.regeneratedAt ||
      entry.registeredAt ||
      entry.scheduledAt ||
      new Date().toISOString();

    const page = mergeEnrichment(
      {
        bundleId,
        slug,
        format: bundle?.format ?? "grid_cluster",
        title,
        titleEn,
        description: vocabSeoDescription(titleEn, words),
        imageUrl,
        imageThumbUrl: String(entry.imageThumbUrl ?? "").trim() || undefined,
        imageAlt: `${titleEn} — Korean vocab chart`,
        words,
        tags: bundle?.tags ?? [],
        intro,
        updatedAt,
      },
      previous.get(bundleId),
    );
    if (page.enrichedAt) keptEnrichment += 1;
    pages.push(page);
  }

  pages.sort((a, b) => a.bundleId.localeCompare(b.bundleId));

  const out: VocabSeoPublishedFile = {
    generatedAt: new Date().toISOString(),
    pages,
  };

  mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  console.log(
    `[vocab:publish] wrote ${pages.length} pages → ${path.relative(ROOT, OUT_PATH)}`,
  );
  console.log(
    `  skipped no-image=${skippedNoImage} unknown-bundle=${skippedUnknownBundle}`,
  );
  console.log(
    `  with words=${pages.filter((p) => p.words.length > 0).length} keptEnrichment=${keptEnrichment}`,
  );
}

main();
