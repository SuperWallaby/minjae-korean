#!/usr/bin/env node
/**
 * Overnight batch: gpt-image-2 vocab infographics — never gives up.
 * Retries timeouts/413/429/crashes per item. Outer loop until queue empty.
 *
 *   npx tsx scripts/batch-generate-vocab-infographics.ts
 *   npx tsx scripts/batch-generate-vocab-infographics.ts --catalog-order  # old noun-first order
 *   npx tsx scripts/run-vocab-batch-overnight.sh
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
import { mixedBundleQueue, summarizeBundleTiers, summarizeByFormat } from "../src/lib/vocabInfographic/bundle-queue.ts";
import { auditHanjaHub, catalogHanjaImageWords } from "../src/lib/vocabInfographic/hanjaHubAudit.ts";
import {
  IMAGE_DEPLOY,
  preparePinGeneration,
  compositeListenCtaOnly,
  generateWithRetry,
  isPromptContentError,
  resolveCharacterRefPath,
  sizeForFormat,
  sleep,
  JJIBARA_APPEAR_RATE,
  STYLE_BASE,
} from "./lib/vocab-infographic-gen.mjs";
import { composeGrammarSpotlightPin } from "./lib/grammar_spotlight_pin.mjs";
import {
  composeCompoundWordPin,
  compoundIconPrompt,
  defaultCompoundResultIcon,
} from "./lib/compound_word_pin.mjs";
import {
  composePhraseSquarePin,
  phraseSquareIllustrationPrompt,
  pickPhraseSquareBg,
} from "./lib/phrase_square_pin.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = (process.env.VOCAB_OUT || "").trim() || join(ROOT, ".tmp", "vocab-infographic-gen");
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
loadEnvFile(join(ROOT, ".env.development.local"));
// Image keys usually live on sibling projects
loadEnvFile(
  join(ROOT, "..", "projects", "neo-project", "korean-quiz", ".env.local"),
);
loadEnvFile(
  join(ROOT, "..", "projects", "neo-project", "auto-video-korean", ".env"),
);

import { DROP_IDS } from "./lib/vocab-batch-config.mjs";

type Progress = {
  done: Record<
    string,
    {
      at: string;
      sec: string;
      outPath: string;
      rawPath: string;
      includeJjibara?: boolean;
      cuteCast?: string | null;
    }
  >;
  failed: Record<string, { at: string; error: string; attempts?: number }>;
  skipped: Record<string, { at: string; error: string; reason: "prompt" }>;
  startedAt: string;
  passes: number;
};

function log(line: string) {
  const ts = new Date().toISOString();
  const msg = `[${ts}] ${line}`;
  console.log(msg);
  appendFileSync(LOG, msg + "\n");
}

function loadProgress(): Progress {
  if (!existsSync(PROGRESS)) {
    return { done: {}, failed: {}, skipped: {}, startedAt: new Date().toISOString(), passes: 0 };
  }
  try {
    const p = JSON.parse(readFileSync(PROGRESS, "utf8"));
    return { passes: 0, skipped: {}, ...p };
  } catch {
    return { done: {}, failed: {}, skipped: {}, startedAt: new Date().toISOString(), passes: 0 };
  }
}

function saveProgress(p: Progress) {
  writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

function isDone(bundleId: string) {
  const raw = join(OUT, `${bundleId}_raw.png`);
  const branded = join(OUT, `${bundleId}.png`);
  return existsSync(raw) && existsSync(branded);
}

function buildQueue(priorityFilter: string | null, progress: Progress) {
  const catalogOrder = process.argv.includes("--catalog-order");
  const onlyIdx = process.argv.indexOf("--only");
  const onlyId =
    onlyIdx >= 0 && process.argv[onlyIdx + 1] ? process.argv[onlyIdx + 1].trim() : null;
  const idsFileIdx = process.argv.indexOf("--ids-file");
  const idsFile =
    idsFileIdx >= 0 && process.argv[idsFileIdx + 1]
      ? process.argv[idsFileIdx + 1].trim()
      : null;
  let onlyIds: Set<string> | null = null;
  if (idsFile) {
    const raw = JSON.parse(readFileSync(idsFile, "utf8")) as { ids?: string[] } | string[];
    const list = Array.isArray(raw) ? raw : (raw.ids ?? []);
    onlyIds = new Set(list.map((id) => String(id).trim()).filter(Boolean));
  }
  const formatIdx = process.argv.indexOf("--format");
  const formatFilter =
    formatIdx >= 0 && process.argv[formatIdx + 1]
      ? process.argv[formatIdx + 1].trim()
      : null;
  let queue = ALL_VOCAB_BUNDLES.filter((b) => !DROP_IDS.has(b.id));
  if (onlyId) queue = queue.filter((b) => b.id === onlyId);
  if (onlyIds) queue = queue.filter((b) => onlyIds!.has(b.id));
  if (formatFilter) queue = queue.filter((b) => b.format === formatFilter);
  if (priorityFilter) queue = queue.filter((b) => b.priority === priorityFilter);
  queue = queue.filter((b) => !isDone(b.id) && !progress.skipped?.[b.id]);
  if (!catalogOrder && !onlyId && queue.length > 1) {
    queue = mixedBundleQueue(queue);
  }
  return queue;
}

async function processBundle(bundle: (typeof ALL_VOCAB_BUNDLES)[0], progress: Progress) {
  // Hanja hubs: only generate from pre-audited locked compound packs.
  if (bundle.format === "hanja_hub" && bundle.hanjaHub) {
    const issues = auditHanjaHub(bundle.id, bundle.hanjaHub, { allowlistStrict: true });
    if (issues.length) {
      const msg = issues.map((i) => i.message).join("; ");
      log(`  ✗ ${bundle.id} hanja audit failed — skip gen: ${msg}`);
      if (!progress.skipped) progress.skipped = {};
      progress.skipped[bundle.id] = {
        at: new Date().toISOString(),
        error: msg,
        reason: "prompt",
      };
      saveProgress(progress);
      return;
    }
  }

  const t0 = Date.now();

  // Phrase square: illustration-only gen → SVG L1/Hangul/(rom) compose (no footer band)
  if (bundle.format === "phrase_square" && bundle.phraseSquare) {
    const ps = bundle.phraseSquare;
    const bgColor = ps.bgColor || pickPhraseSquareBg(bundle.id);
    const illPrompt = phraseSquareIllustrationPrompt({
      scene: ps.scene,
      bgColor,
      styleBase: STYLE_BASE,
    });
    const ill = await generateWithRetry(
      {
        prompt: illPrompt,
        size: "1024x1024",
        root: ROOT,
        format: "phrase_square",
        includeJjibara: false,
      },
      {
        onRetry: ({ attempt, wait, error }) => {
          if (isPromptContentError(error)) throw error;
          log(
            `  ⏳ retry ${bundle.id} ill #${attempt} in ${Math.round(wait / 1000)}s — ${error.message}`,
          );
        },
      },
    );
    const illPath = join(OUT, `${bundle.id}_ill.png`);
    writeFileSync(illPath, ill);
    const composed = await composePhraseSquarePin({
      gloss: ps.gloss,
      hangul: ps.hangul,
      romanization: ps.romanization,
      illustrationPng: ill,
      bgColor,
    });
    const rawPath = join(OUT, `${bundle.id}_raw.png`);
    writeFileSync(rawPath, composed);
    const outPath = join(OUT, `${bundle.id}.png`);
    writeFileSync(outPath, composed);
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    log(`  ✓ ${bundle.id} (${sec}s) phrase_square`);
    progress.done[bundle.id] = {
      at: new Date().toISOString(),
      sec,
      outPath,
      rawPath,
      includeJjibara: false,
      cuteCast: null,
    };
    delete progress.failed[bundle.id];
    saveProgress(progress);
    await sleep(2000);
    return;
  }

  // Compound word: 3 icon gens (L/R/result) → knockout bg → SVG equation compose
  // Style = doodle text style only (no capybara cast / no style-ref edits).
  if (bundle.format === "compound_word" && bundle.compoundWord) {
    const cw = bundle.compoundWord;
    const resultScene =
      (cw as { resultIcon?: string }).resultIcon || defaultCompoundResultIcon(cw);
    const leftPrompt = compoundIconPrompt(cw.left.icon, "LEFT");
    const rightPrompt = compoundIconPrompt(cw.right.icon, "RIGHT");
    const resultPrompt = compoundIconPrompt(resultScene, "RESULT");
    const prevUseRef = process.env.VOCAB_IMAGE_USE_REF;
    process.env.VOCAB_IMAGE_USE_REF = "0";
    // Simple sticker props — low is enough (gpt-image-2 quality ≈ effort; no separate effort param).
    const iconQuality = (process.env.VOCAB_COMPOUND_ICON_QUALITY || "low").trim() || "low";
    try {
      const iconRetry = (slot: string) => ({
        onRetry: ({
          attempt,
          wait,
          error,
        }: {
          attempt: number;
          wait: number;
          error: Error;
        }) => {
          if (isPromptContentError(error)) throw error;
          log(
            `  ⏳ retry ${bundle.id} ${slot} #${attempt} in ${Math.round(wait / 1000)}s — ${error.message}`,
          );
        },
      });
      const [leftIcon, rightIcon, resultIcon] = await Promise.all([
        generateWithRetry(
          {
            prompt: leftPrompt,
            size: "1024x1024",
            root: ROOT,
            format: "grid_cluster",
            includeJjibara: false,
            quality: iconQuality,
          },
          iconRetry("left"),
        ),
        generateWithRetry(
          {
            prompt: rightPrompt,
            size: "1024x1024",
            root: ROOT,
            format: "grid_cluster",
            includeJjibara: false,
            quality: iconQuality,
          },
          iconRetry("right"),
        ),
        generateWithRetry(
          {
            prompt: resultPrompt,
            size: "1024x1024",
            root: ROOT,
            format: "grid_cluster",
            includeJjibara: false,
            quality: iconQuality,
          },
          iconRetry("result"),
        ),
      ]);
      writeFileSync(join(OUT, `${bundle.id}_left.png`), leftIcon);
      writeFileSync(join(OUT, `${bundle.id}_right.png`), rightIcon);
      writeFileSync(join(OUT, `${bundle.id}_result.png`), resultIcon);
      const composed = await composeCompoundWordPin({
        leftIconPng: leftIcon,
        rightIconPng: rightIcon,
        resultIconPng: resultIcon,
        left: cw.left,
        right: cw.right,
        resultHangul: cw.resultHangul,
        resultRomanization: cw.resultRomanization,
        resultMeaning: cw.resultMeaning,
      });
      const rawPath = join(OUT, `${bundle.id}_raw.png`);
      writeFileSync(rawPath, composed);
      const branded = await compositeListenCtaOnly(composed);
      const outPath = join(OUT, `${bundle.id}.png`);
      writeFileSync(outPath, branded);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      log(`  ✓ ${bundle.id} (${sec}s) compound`);
      progress.done[bundle.id] = {
        at: new Date().toISOString(),
        sec,
        outPath,
        rawPath,
        includeJjibara: false,
        cuteCast: null,
      };
      delete progress.failed[bundle.id];
      saveProgress(progress);
    } finally {
      if (prevUseRef === undefined) delete process.env.VOCAB_IMAGE_USE_REF;
      else process.env.VOCAB_IMAGE_USE_REF = prevUseRef;
    }
    await sleep(2000);
    return;
  }

  const size = sizeForFormat(bundle.format);
  const { prompt, includeJjibara, cuteCast } = await preparePinGeneration(bundle, ROOT);

  const raw = await generateWithRetry(
    {
      prompt,
      size,
      root: ROOT,
      format: bundle.format,
      cuteCast,
      includeJjibara,
    },
    {
      onRetry: ({ attempt, wait, error }) => {
        if (isPromptContentError(error)) throw error;
        log(`  ⏳ retry ${bundle.id} #${attempt} in ${Math.round(wait / 1000)}s — ${error.message}`);
        progress.failed[bundle.id] = {
          at: new Date().toISOString(),
          error: error.message,
          attempts: attempt,
        };
        saveProgress(progress);
      },
    },
  );

  const rawPath = join(OUT, `${bundle.id}_raw.png`);
  writeFileSync(rawPath, raw);

  let composed = raw;
  if (bundle.format === "grammar_spotlight" && bundle.grammarSpotlight) {
    const g = bundle.grammarSpotlight;
    composed = await composeGrammarSpotlightPin({
      illustrationPng: raw,
      koreanBefore: g.koreanBefore,
      koreanHighlight: g.koreanHighlight,
      koreanAfter: g.koreanAfter,
      englishBefore: g.englishBefore,
      englishHighlight: g.englishHighlight,
      englishAfter: g.englishAfter,
      grammarLabel: g.grammarLabel,
    });
    writeFileSync(join(OUT, `${bundle.id}_ill.png`), raw);
  }

  // Chico watermark only when jibara/cameo was actually rolled in, or full cute_cast capybara pin.
  const branded = await compositeListenCtaOnly(composed);
  const outPath = join(OUT, `${bundle.id}.png`);
  writeFileSync(outPath, branded);

  // Hanja: lock SEO/pin word list to audited catalog (never vision invent).
  if (bundle.format === "hanja_hub" && bundle.hanjaHub) {
    const words = catalogHanjaImageWords(bundle.hanjaHub);
    writeFileSync(
      join(OUT, `${bundle.id}.words.json`),
      JSON.stringify(
        {
          bundleId: bundle.id,
          extractedAt: new Date().toISOString(),
          source: "catalog-audited",
          words,
        },
        null,
        2,
      ),
    );
  }

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  const castNote =
    bundle.format === "cute_cast"
      ? ` cast=${cuteCast}`
      : includeJjibara
        ? " jjibara=1"
        : " jjibara=0";
  log(`  ✓ ${bundle.id} (${sec}s)${castNote}`);
  progress.done[bundle.id] = {
    at: new Date().toISOString(),
    sec,
    outPath,
    rawPath,
    includeJjibara,
    cuteCast: cuteCast ?? null,
  };
  delete progress.failed[bundle.id];
  saveProgress(progress);

  if (process.env.VOCAB_AUTO_QUEUE_X === "1") {
    try {
      const { scheduleVocabXPost } = await import("./vocab-x-schedule-post.ts");
      const r = await scheduleVocabXPost({ bundleId: bundle.id, skipIfScheduled: true });
      if (r.skipped) log(`  ↷ X queue skip (${bundle.id}): already scheduled`);
      else log(`  📤 X queued ${bundle.id} → ${r.queueId}`);
    } catch (e) {
      log(`  ⚠ X queue skip (${bundle.id}): ${e instanceof Error ? e.message : e}`);
    }
  } else if (process.env.VOCAB_AUTO_REVIEW_X === "1") {
    try {
      const { registerVocabXForReview } = await import("./vocab-x-schedule-post.ts");
      const r = await registerVocabXForReview({ bundleId: bundle.id, skipIfRegistered: true });
      if (r.skipped) log(`  ↷ X review skip (${bundle.id}): ${r.reason}`);
      else log(`  📝 X review pending ${bundle.id} → ${r.reviewId}`);
    } catch (e) {
      log(`  ⚠ X review skip (${bundle.id}): ${e instanceof Error ? e.message : e}`);
    }
  }

  await sleep(2000);
}

async function runBatch() {
  const priorityFilter = (() => {
    const idx = process.argv.indexOf("--priority");
    return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
  })();

  mkdirSync(OUT, { recursive: true });
  // Catalog import already auto-asserts hanja allowlist; log for operators.
  const { assertHanjaCatalogAudited } = await import(
    "../src/lib/vocabInfographic/hanjaHubAudit.ts"
  );
  const { hubCount } = assertHanjaCatalogAudited(ALL_VOCAB_BUNDLES);
  log(`hanja audit auto-OK (${hubCount} hubs, allowlist-locked)`);

  const progress = loadProgress();

  const styleRef = resolveCharacterRefPath(ROOT);
  log(`═══ batch runner start — ${IMAGE_DEPLOY} quality=high timeout=600s ═══`);
  log(`capybara cast: always on (VOCAB_JJIBARA_RATE=${JJIBARA_APPEAR_RATE})`);
  log(
    styleRef
      ? `style/character ref: ${styleRef} (images/edits + high fidelity)`
      : "⚠ no capybara style ref found — text-only generations",
  );

  while (true) {
    const queue = buildQueue(priorityFilter, progress);
    if (queue.length === 0) {
      log(`All ${Object.keys(progress.done).length} bundles complete.`);
      break;
    }

    progress.passes += 1;
    const tierCounts = summarizeBundleTiers(queue);
    const fmtCounts = summarizeByFormat(queue);
    log(
      `Pass #${progress.passes} — ${queue.length} remaining (expr ${tierCounts.expression} / noun ${tierCounts.noun} / ant ${tierCounts.antonym} / list ${tierCounts.list} / quiz ${tierCounts.quiz})`,
    );
    log(`  by format: ${JSON.stringify(fmtCounts)}`);
    if (queue.length > 0) {
      log(`  next up: ${queue.slice(0, 8).map((b) => `${b.format}:${b.id}`).join(" → ")}`);
    }
    saveProgress(progress);

    for (let i = 0; i < queue.length; i++) {
      const bundle = queue[i];
      if (isDone(bundle.id)) continue;

      log(`[${i + 1}/${queue.length}] ${bundle.id} (${bundle.format})`);

      try {
        await processBundle(bundle, progress);
      } catch (e) {
        const err = e as Error & { code?: string; status?: number };
        if (isPromptContentError(err)) {
          log(`  ⊘ ${bundle.id} SKIP (prompt/content): ${err.message}`);
          if (!progress.skipped) progress.skipped = {};
          progress.skipped[bundle.id] = {
            at: new Date().toISOString(),
            error: err.message,
            reason: "prompt",
          };
          delete progress.failed[bundle.id];
          saveProgress(progress);
          await sleep(2000);
          continue;
        }
        log(`  ✗ ${bundle.id} hard fail: ${err.message} — will retry next pass`);
        progress.failed[bundle.id] = {
          at: new Date().toISOString(),
          error: err.message,
        };
        saveProgress(progress);
        await sleep(10_000);
      }
    }

    const remaining = buildQueue(priorityFilter, progress).length;
    log(`Pass #${progress.passes} done — ${remaining} still remaining`);
    if (remaining === 0) break;
    log("Starting next pass in 15s…");
    await sleep(15_000);
  }
}

async function main() {
  process.on("uncaughtException", (e) => {
    log(`uncaughtException: ${e.message} — restarting in 30s`);
    setTimeout(() => main().catch(() => process.exit(1)), 30_000);
  });
  process.on("unhandledRejection", (reason) => {
    log(`unhandledRejection: ${reason} — restarting in 30s`);
    setTimeout(() => main().catch(() => process.exit(1)), 30_000);
  });

  await runBatch();
  log("batch finished cleanly — exiting");
  process.exit(0);
}

main().catch((e) => {
  log(`main crash: ${e.message} — exit 1, supervisor should restart`);
  process.exit(1);
});
