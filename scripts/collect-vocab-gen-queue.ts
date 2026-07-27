/**
 * Collect remaining vocab-infographic queue (format-rotated) and write a run list.
 *
 *   npx tsx scripts/collect-vocab-gen-queue.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import {
  formatRotatedQueue,
  summarizeByFormat,
  summarizeBundleTiers,
} from "../src/lib/vocabInfographic/bundle-queue.ts";
import { DROP_IDS } from "./lib/vocab-batch-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-infographic-gen");
const QUEUE_DIR = join(ROOT, ".tmp", "vocab-gen-queue");

function loadSkipped(): Record<string, unknown> {
  const p = join(OUT, "progress.json");
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8")).skipped || {};
  } catch {
    return {};
  }
}

function isDone(id: string) {
  return (
    existsSync(join(OUT, `${id}_raw.png`)) && existsSync(join(OUT, `${id}.png`))
  );
}

const skipped = loadSkipped();
const remaining = ALL_VOCAB_BUNDLES.filter((b) => {
  if (DROP_IDS.has(b.id)) return false;
  if (skipped[b.id]) return false;
  return !isDone(b.id);
});

const queue = formatRotatedQueue(remaining);
const byFormat = summarizeByFormat(queue);
const tiers = summarizeBundleTiers(queue);

mkdirSync(QUEUE_DIR, { recursive: true });

const payload = {
  collectedAt: new Date().toISOString(),
  total: queue.length,
  byFormat,
  tiers,
  rotation:
    "topik → similar → phrase → concept → quiz → list → antonym → grid (repeat)",
  queue: queue.map((b, i) => ({
    n: i + 1,
    id: b.id,
    format: b.format,
    title: b.title,
    priority: b.priority,
  })),
};

writeFileSync(join(QUEUE_DIR, "run-queue.json"), JSON.stringify(payload, null, 2));
writeFileSync(
  join(QUEUE_DIR, "run-queue.txt"),
  queue.map((b, i) => `${String(i + 1).padStart(3, " ")}. [${b.format}] ${b.id} — ${b.title}`).join("\n") +
    "\n",
);
writeFileSync(
  join(QUEUE_DIR, "run-ids.txt"),
  queue.map((b) => b.id).join("\n") + "\n",
);

// First-40 preview mix (what overnight will hit first)
const first40 = queue.slice(0, 40);
const first40Fmt: Record<string, number> = {};
for (const b of first40) first40Fmt[b.format] = (first40Fmt[b.format] || 0) + 1;

console.log(
  JSON.stringify(
    {
      total: queue.length,
      byFormat,
      first40Mix: first40Fmt,
      queueFile: join(QUEUE_DIR, "run-queue.json"),
      idsFile: join(QUEUE_DIR, "run-ids.txt"),
    },
    null,
    2,
  ),
);
