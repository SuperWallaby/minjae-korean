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
import { mixedBundleQueue, summarizeBundleTiers } from "../src/lib/vocabInfographic/bundle-queue.ts";
import {
  IMAGE_DEPLOY,
  LOGO_PATH,
  FOOTER_TAGLINE,
  buildImagePrompt,
  compositeFooter,
  generateWithRetry,
  isPromptContentError,
  sizeForFormat,
  sleep,
} from "./lib/vocab-infographic-gen.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-infographic-gen");
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

import { DROP_IDS } from "./lib/vocab-batch-config.mjs";

type Progress = {
  done: Record<string, { at: string; sec: string; outPath: string; rawPath: string }>;
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
  let queue = ALL_VOCAB_BUNDLES.filter((b) => !DROP_IDS.has(b.id));
  if (priorityFilter) queue = queue.filter((b) => b.priority === priorityFilter);
  queue = queue.filter((b) => !isDone(b.id) && !progress.skipped?.[b.id]);
  if (!catalogOrder && queue.length > 1) {
    queue = mixedBundleQueue(queue);
  }
  return queue;
}

async function processBundle(bundle: (typeof ALL_VOCAB_BUNDLES)[0], progress: Progress) {
  const size = sizeForFormat(bundle.format);
  const logoPath = join(ROOT, LOGO_PATH);
  const prompt = await buildImagePrompt(bundle, ROOT);
  const t0 = Date.now();

  const raw = await generateWithRetry(
    { prompt, size, root: ROOT },
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
  const branded = await compositeFooter(raw, logoPath);
  const outPath = join(OUT, `${bundle.id}.png`);
  writeFileSync(outPath, branded);

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  log(`  ✓ ${bundle.id} (${sec}s)`);
  progress.done[bundle.id] = { at: new Date().toISOString(), sec, outPath, rawPath };
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
  }

  await sleep(2000);
}

async function runBatch() {
  const priorityFilter = (() => {
    const idx = process.argv.indexOf("--priority");
    return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
  })();

  mkdirSync(OUT, { recursive: true });
  const progress = loadProgress();

  log(`═══ batch runner start — ${IMAGE_DEPLOY} quality=high timeout=600s ═══`);

  while (true) {
    const queue = buildQueue(priorityFilter, progress);
    if (queue.length === 0) {
      log(`All ${Object.keys(progress.done).length} bundles complete.`);
      break;
    }

    progress.passes += 1;
    const tierCounts = summarizeBundleTiers(queue);
    log(
      `Pass #${progress.passes} — ${queue.length} remaining (expr ${tierCounts.expression} / noun ${tierCounts.noun} / ant ${tierCounts.antonym} / list ${tierCounts.list} / quiz ${tierCounts.quiz})`,
    );
    if (queue.length > 0) {
      log(`  next up: ${queue.slice(0, 5).map((b) => b.id).join(" → ")}`);
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
}

main().catch((e) => {
  log(`main crash: ${e.message} — exit 1, supervisor should restart`);
  process.exit(1);
});
