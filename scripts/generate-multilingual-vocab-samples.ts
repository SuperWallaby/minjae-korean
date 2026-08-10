#!/usr/bin/env node
/**
 * Multilingual Pinterest vocab pins (capybara cast, gpt-image-2).
 *
 * Fixed langs: Spanish, French, German, Arabic, Italian, Japanese
 * Default: analytics top-10 popular pins × 6 langs = 60 images
 *
 *   npx tsx scripts/generate-multilingual-vocab-samples.ts
 *   npx tsx scripts/generate-multilingual-vocab-samples.ts --limit 60
 *   npx tsx scripts/generate-multilingual-vocab-samples.ts --top 10
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import {
  IMAGE_DEPLOY,
  compositeAffiliateFooter,
  generateWithRetry,
  sizeForFormat,
  PINTEREST_MOBILE_THUMB,
  BABY_CAPYBARA_BLUE_HAT,
  CAPYBARA_ART_STYLE,
} from "./lib/vocab-infographic-gen.mjs";
import {
  affiliateFooterCopy,
  assertGlobalAffiliateFormat,
} from "./lib/global-pinterest-formats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GEN = join(ROOT, ".tmp", "vocab-infographic-gen");
const TOP50_MANIFEST = join(
  ROOT,
  ".tmp",
  "pinterest-popular-top50",
  "manifest.json",
);
const OUT = join(ROOT, ".tmp", "vocab-multilingual-top10");
const PUBLISHED = join(
  ROOT,
  "src",
  "data",
  "vocabInfographic",
  "published.json",
);
const LOG = join(OUT, "batch.log");
const PROGRESS = join(OUT, "progress.json");

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

/** Fixed multilingual set (Preply 1:1 share + Japanese). */
export const MULTILINGUAL_LANGS = [
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "ja", name: "Japanese", native: "日本語" },
] as const;

type Lang = (typeof MULTILINGUAL_LANGS)[number];

type WordRow = {
  hangul: string;
  romanization: string;
  english: string;
  visual?: string;
};

const CAPY_STYLE = `Premium Korean-learning Pinterest save graphic for {LANG}-speaking beginners.
${PINTEREST_MOBILE_THUMB}
Soft pastel cream or blush background, clean modern sans-serif typography.
Illustrations MUST follow the brand CAPYBARA doodle sticker style — wobbly black outlines, flat soft fills, cute chibi props — not photorealistic, not polished webtoon.
${CAPYBARA_ART_STYLE}
CAST LOCK (HARD): The ONLY allowed mascot/animal is the brand blue-hat-backwards CAPYBARA (${BABY_CAPYBARA_BLUE_HAT}).
If a cute character appears in the header, rows, cells, or corners — every one MUST be that same brand capybara (varied poses/outfits OK).
NEVER otter, NEVER pink sea otter, NEVER other animals, NEVER human teacher.
Every Korean word must show: {LANG} gloss label, Hangul, and romanization in [brackets].
Warm, friendly, professional edu-influencer aesthetic — bookmark-worthy on mobile.
NO website URLs, NO watermarks, NO @handles, NO logos, NO footer text anywhere in the image.
Leave a clean empty footer band (about 10% height at bottom) completely blank for branding overlay.
HARD BAN: English gloss text (except unavoidable loanwords) — all learner-facing labels must be in {LANG}.`;

function log(line: string) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  console.log(msg);
  mkdirSync(OUT, { recursive: true });
  appendFileSync(LOG, msg + "\n");
}

function parseArgs(argv: string[]) {
  const limitIdx = argv.indexOf("--limit");
  const topIdx = argv.indexOf("--top");
  const force = argv.includes("--force");
  const top =
    topIdx >= 0 && argv[topIdx + 1]
      ? Math.max(1, Number(argv[topIdx + 1]) || 10)
      : 10;
  const defaultLimit = top * MULTILINGUAL_LANGS.length;
  const limit =
    limitIdx >= 0 && argv[limitIdx + 1]
      ? Math.max(1, Number(argv[limitIdx + 1]) || defaultLimit)
      : defaultLimit;
  return { limit, top, force };
}

function loadTopBundleIds(top: number): string[] {
  if (existsSync(TOP50_MANIFEST)) {
    const man = JSON.parse(readFileSync(TOP50_MANIFEST, "utf8"));
    const ids = (man.items || [])
      .slice(0, top)
      .map((x: { bundleId: string }) => x.bundleId)
      .filter(Boolean);
    if (ids.length) return ids;
  }
  // fallback hardcoded analytics top10
  return [
    "list-eye-colors",
    "list-skin-tones-descriptive",
    "list-months",
    "concept-open-close-devices",
    "topik-emotion-words",
    "list-korean-food-unesco",
    "grid-dance-styles",
    "ant-push-pull",
    "concept-too-also",
    "list-appointment-scheduling",
  ].slice(0, top);
}

function loadWordsFromFiles(bundleId: string): WordRow[] | null {
  const wordsPath = join(GEN, `${bundleId}.words.json`);
  if (existsSync(wordsPath)) {
    const j = JSON.parse(readFileSync(wordsPath, "utf8"));
    if (Array.isArray(j.words) && j.words.length) {
      return j.words.map((w: Record<string, string>) => ({
        hangul: String(w.hangul || "").trim(),
        romanization: String(w.romanization || "").trim(),
        english: String(w.english || "").trim(),
      }));
    }
  }
  if (existsSync(PUBLISHED)) {
    const pub = JSON.parse(readFileSync(PUBLISHED, "utf8"));
    const page = (pub.pages || []).find(
      (p: { bundleId: string }) => p.bundleId === bundleId,
    );
    if (page?.words?.length) {
      return page.words.map((w: Record<string, string>) => ({
        hangul: String(w.hangul || "").trim(),
        romanization: String(w.romanization || w.romaji || "").trim(),
        english: String(w.english || "").trim(),
      }));
    }
  }
  return null;
}

function wordsForBundle(bundle: any): WordRow[] {
  if (bundle.format === "concept_rows" && bundle.conceptRows?.length) {
    return bundle.conceptRows.map((r: any) => ({
      hangul: r.hangul,
      romanization: r.romanization,
      english: r.english,
      visual: r.visual,
    }));
  }
  if (bundle.format === "topik_upgrade" && bundle.topikRows?.length) {
    // one gloss per meaning row (not flattened I/II)
    return bundle.topikRows.map((r: any) => ({
      hangul: r.topikI?.hangul || "",
      romanization: r.topikI?.romanization || "",
      english: r.english,
      // stash pair in visual JSON-ish via english only; hangul locked in prompt from catalog
    }));
  }
  const fromFile = loadWordsFromFiles(bundle.id);
  if (fromFile?.length) return fromFile;
  if (bundle.preview?.length) {
    return bundle.preview.map((p: string) => ({
      hangul: "",
      romanization: "",
      english: String(p),
    }));
  }
  return [];
}

async function translateBundle({
  title,
  words,
  lang,
}: {
  title: string;
  words: WordRow[];
  lang: Lang;
}) {
  const payload = {
    title,
    words: words.map((w) => ({
      hangul: w.hangul,
      romanization: w.romanization,
      english: w.english,
    })),
  };
  const raw = await azureChat({
    system: `You localize Korean-learning Pinterest pin copy into ${lang.name} (${lang.native}).
Return JSON only:
{
  "title": "localized title for ${lang.name} learners of Korean",
  "words": [{"hangul":"...","romanization":"...","gloss":"localized gloss"}]
}
Rules:
- Keep hangul + romanization EXACTLY as given (do not change spelling). If hangul empty, leave empty.
- gloss = natural short ${lang.name} flashcard label for the english meaning.
- Same word count/order as input.`,
    user: JSON.stringify(payload),
    temperature: 0.2,
    maxTokens: 4000,
    jsonMode: true,
  });
  const parsed = JSON.parse(stripCodeFence(raw));
  if (!parsed?.title || !Array.isArray(parsed.words)) {
    throw new Error(`bad translation JSON for ${lang.code}`);
  }
  return {
    title: String(parsed.title).trim(),
    words: parsed.words.map((w: any, i: number) => ({
      hangul: String(w.hangul || words[i]?.hangul || "").trim(),
      romanization: String(
        w.romanization || words[i]?.romanization || "",
      ).trim(),
      gloss: String(w.gloss || words[i]?.english || "").trim(),
      visual: words[i]?.visual,
    })),
  };
}

function buildMultilingualPrompt({
  bundle,
  lang,
  localized,
}: {
  bundle: any;
  lang: Lang;
  localized: { title: string; words: any[] };
}) {
  const style = CAPY_STYLE.replaceAll("{LANG}", lang.name);

  if (bundle.format === "antonym_split" && localized.words.length >= 2) {
    const [a, b] = localized.words;
    return `${style}

FORMAT: Vertical split antonym card. Header: "${localized.title}" bold centered in ${lang.name}.
LEFT half (warm pastel): scene for ${a.gloss} — ${lang.name} label "${a.gloss}", Hangul "${a.hangul}", [${a.romanization}].
RIGHT half (cool pastel): scene for ${b.gloss} — ${lang.name} label "${b.gloss}", Hangul "${b.hangul}", [${b.romanization}].
Both scenes star the brand blue-hat capybara (not otter). Do not cover text.
Mirrored layout, contrasting backgrounds, one vocabulary pair only.
VOCAB LOCK: use exactly these two Hangul forms — do not invent alternatives.`;
  }

  if (bundle.format === "concept_rows" && localized.words.length) {
    const panels = localized.words
      .map(
        (r, i) =>
          `PANEL ${i + 1}: Hangul "${r.hangul}" largest, then [${r.romanization}], small ${lang.name} "${r.gloss}".\n` +
          `  Scene (keep SIMPLE): ${r.visual || r.gloss}`,
      )
      .join("\n");
    return `${style}

FORMAT: Original Kaja CONCEPT PANEL card titled "${localized.title}" (bold, friendly, in ${lang.name}). Soft cream + sky-teal accents.
Layout: ${localized.words.length === 4 ? "2×2 rounded cards" : "stacked rounded cards"} with equal spacing.
ART STYLE — simpler than usual grids: soft flat pastel, ONE clear idea per panel, large readable Hangul.
Each panel's character (if any) = brand blue-hat capybara only.
HARD BAN: crowded scenes, Korean flags, watermarks, otter.
${panels}
Leave empty footer band blank.`;
  }

  if (bundle.format === "topik_upgrade" && bundle.topikRows?.length) {
    const rows = bundle.topikRows
      .map((r: any, i: number) => {
        const gloss = localized.words[i]?.gloss || r.english;
        return (
          `${i + 1}. ${gloss}\n` +
          `   TOPIK I:  ${r.topikI.hangul}  [${r.topikI.romanization}]\n` +
          `   TOPIK II: ${r.topikII.hangul}  [${r.topikII.romanization}]`
        );
      })
      .join("\n");
    return `${style}

FORMAT: TOPIK I ↔ TOPIK II upgrade card titled "${localized.title}" (in ${lang.name}). Portrait soft cream-to-blush.
HEADER: twin rounded pill badges — soft teal "TOPIK I" (left) and soft coral "TOPIK II" (right).
BODY: exactly ${bundle.topikRows.length} horizontally aligned rows in two clean columns.
LEFT = beginner Hangul (largest) + small [romanization].
RIGHT = formal/exam Hangul (largest) + small [romanization].
Tiny ${lang.name} meaning as gutter gloss — Hangul must dominate.
Row mascots (if any) = brand blue-hat capybara only — never otter.
PAIRS (use exactly — Hangul locked):
${rows}
Leave empty footer band blank.`;
  }

  if (bundle.format === "grid_cluster") {
    const rows = localized.words
      .map(
        (w, i) =>
          `${i + 1}. ${w.gloss} — Hangul "${w.hangul}" (largest) / [${w.romanization}]`,
      )
      .join("\n");
    return `${style}

FORMAT: Grid infographic titled "${localized.title}" at top center (in ${lang.name}).
Each cell: cute brand blue-hat CAPYBARA doodle (varied poses/outfits) + ${lang.name} gloss + LARGE Hangul + [romanization].
NEVER otter in any cell.
CELLS (exact lock):
${rows}
Leave empty footer band blank.`;
  }

  const rows = localized.words
    .map(
      (w, i) =>
        `${i + 1}. ${w.gloss} — Hangul "${w.hangul}" (largest) / [${w.romanization}]`,
    )
    .join("\n");
  return `${style}

FORMAT: Tall portrait list titled "${localized.title.toUpperCase()}" at top (in ${lang.name}).
Scannable rows. Left: brand blue-hat CAPYBARA doodle (or color swatch) — NEVER otter. Right: LARGE Hangul + [romanization] + ${lang.name} gloss.
Header may include one small brand capybara. Every row character must be the same brand capybara family.
Generous row height. Nothing cropped at bottom.
ROWS (exact lock — Hangul must match):
${rows}
Leave empty footer band blank.`;
}

type Progress = {
  done: Record<string, { at: string; sec: string; outPath: string }>;
  failed: Record<string, { at: string; error: string }>;
  startedAt: string;
};

function loadProgress(): Progress {
  if (!existsSync(PROGRESS)) {
    return { done: {}, failed: {}, startedAt: new Date().toISOString() };
  }
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return { done: {}, failed: {}, startedAt: new Date().toISOString() };
  }
}

function saveProgress(p: Progress) {
  writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

function buildJobs(top: number, limit: number) {
  const ids = loadTopBundleIds(top);
  const byId = new Map(ALL_VOCAB_BUNDLES.map((b) => [b.id, b]));
  const bundles: { bundle: any; words: WordRow[]; rank: number }[] = [];
  ids.forEach((id, idx) => {
    const b = byId.get(id);
    if (!b) {
      console.warn(`skip ${id}: not in catalog`);
      return;
    }
    const words = wordsForBundle(b);
    if (!words.length) {
      console.warn(`skip ${id}: no words`);
      return;
    }
    bundles.push({ bundle: b, words, rank: idx + 1 });
  });
  if (!bundles.length) throw new Error("no top bundles ready");

  const jobs: {
    bundle: any;
    words: WordRow[];
    lang: Lang;
    rank: number;
  }[] = [];
  // bundle-major order: finish all langs for pin #1 before #2
  for (const row of bundles) {
    for (const lang of MULTILINGUAL_LANGS) {
      if (jobs.length >= limit) break;
      jobs.push({ ...row, lang });
    }
    if (jobs.length >= limit) break;
  }
  return jobs.slice(0, limit);
}

async function main() {
  const { limit, top, force } = parseArgs(process.argv);
  mkdirSync(OUT, { recursive: true });
  const jobs = buildJobs(top, limit);
  let progress = loadProgress();
  if (force) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archive = join(OUT, `_archive_otter_${stamp}`);
    mkdirSync(archive, { recursive: true });
    let moved = 0;
    for (const job of jobs) {
      const outId = `${String(job.rank).padStart(2, "0")}_${job.bundle.id}__${job.lang.code}`;
      for (const suffix of [".png", "_raw.png", ".json"]) {
        const src = join(OUT, `${outId}${suffix}`);
        if (!existsSync(src)) continue;
        const { renameSync } = await import("node:fs");
        renameSync(src, join(archive, `${outId}${suffix}`));
        moved++;
      }
      delete progress.done[outId];
      delete progress.failed[outId];
    }
    saveProgress(progress);
    log(`--force: archived ${moved} files → ${archive}; cleared progress for job set`);
  }

  log(
    `==> multilingual top${top} × ${MULTILINGUAL_LANGS.length} langs → ${jobs.length} jobs`,
  );
  log(`    langs: ${MULTILINGUAL_LANGS.map((l) => l.code).join(", ")}`);
  log(`    cast: brand capybara only · model: ${IMAGE_DEPLOY}`);
  log(`    out: ${OUT}`);

  const manifest: any[] = [];
  for (let i = 0; i < jobs.length; i++) {
    const { bundle, words, lang, rank } = jobs[i];
    const outId = `${String(rank).padStart(2, "0")}_${bundle.id}__${lang.code}`;
    const outPng = join(OUT, `${outId}.png`);
    const metaPath = join(OUT, `${outId}.json`);

    log(`\n[${i + 1}/${jobs.length}] ${outId} (${bundle.format})`);

    if (!force && progress.done[outId] && existsSync(outPng)) {
      log("  skip (progress)");
      if (existsSync(metaPath)) {
        manifest.push(JSON.parse(readFileSync(metaPath, "utf8")));
      }
      continue;
    }
    if (!force && existsSync(outPng) && existsSync(metaPath)) {
      log("  skip (exists)");
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      progress.done[outId] = {
        at: meta.at || new Date().toISOString(),
        sec: meta.sec,
        outPath: outPng,
      };
      saveProgress(progress);
      manifest.push(meta);
      continue;
    }

    try {
      const localized = await translateBundle({
        title: bundle.title,
        words,
        lang,
      });
      log(`  title: ${localized.title}`);
      const prompt = buildMultilingualPrompt({ bundle, lang, localized });
      const size = sizeForFormat(bundle.format);
      const t0 = Date.now();
      const raw = await generateWithRetry(
        {
          prompt,
          size,
          root: ROOT,
          format: bundle.format,
          cuteCast: "capybara",
          includeJjibara: true,
        },
        {
          maxRetries: 8,
          onRetry: ({ attempt, wait, error, label }) => {
            log(
              `  ⏳ ${label} #${attempt} wait ${Math.round(wait / 1000)}s: ${error.message}`,
            );
          },
        },
      );
      assertGlobalAffiliateFormat(bundle.format);
      const cta = affiliateFooterCopy(lang.code);
      const branded = await compositeAffiliateFooter(raw, {
        line1: cta.line1,
        line2: cta.line2,
        rtl: cta.rtl,
        chicoCredit: false,
      });
      writeFileSync(outPng, branded);
      writeFileSync(join(OUT, `${outId}_raw.png`), raw);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      const meta = {
        id: outId,
        rank,
        bundleId: bundle.id,
        format: bundle.format,
        lang: lang.code,
        langName: lang.name,
        titleSource: bundle.title,
        titleLocalized: localized.title,
        words: localized.words,
        outPath: outPng,
        sec,
        model: IMAGE_DEPLOY,
        cast: "capybara",
        at: new Date().toISOString(),
      };
      writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      progress.done[outId] = { at: meta.at, sec, outPath: outPng };
      delete progress.failed[outId];
      saveProgress(progress);
      manifest.push(meta);
      log(`  ok ${sec}s → ${outPng}`);
    } catch (e: any) {
      const err = String(e?.message || e);
      progress.failed[outId] = { at: new Date().toISOString(), error: err };
      saveProgress(progress);
      log(`  FAIL ${err}`);
    }
  }

  writeFileSync(
    join(OUT, "manifest.json"),
    JSON.stringify(
      {
        top,
        langs: MULTILINGUAL_LANGS.map((l) => l.code),
        jobs: jobs.length,
        done: Object.keys(progress.done).length,
        failed: progress.failed,
        items: manifest,
      },
      null,
      2,
    ),
  );
  log(
    `\n==> done done=${Object.keys(progress.done).length} failed=${Object.keys(progress.failed).length} → ${OUT}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
