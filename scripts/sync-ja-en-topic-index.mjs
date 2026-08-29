#!/usr/bin/env node
/**
 * Full EigoChart topic vector index.
 *
 *   npx tsx scripts/sync-ja-en-topic-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(path.join(ROOT, ".env.local"));
loadEnv(path.join(ROOT, ".env"));
loadEnv(path.join(ROOT, "..", "projects", "neo-project", "korean-quiz", ".env.local"));

const {
  jaEnOutDir,
  syncJaEnTopicIndex,
  loadJaEnTopicIndex,
} = await import("./lib/ja-en-topic-similarity.mjs");
const { azureEmbeddingsConfigured } = await import("./lib/pin-topic-similarity.mjs");

let queueJobs = [];
try {
  const { JA_EN_QUEUE_JOBS } = await import("./data/ja-en-queue-jobs.ts");
  queueJobs = JA_EN_QUEUE_JOBS;
} catch {
  /* optional */
}

const OUT = jaEnOutDir(ROOT);
console.log(`sync ja-en-topic-vectors → ${OUT}`);
const result = await syncJaEnTopicIndex(OUT, ROOT, queueJobs);
const index = loadJaEnTopicIndex(OUT);
console.log(
  JSON.stringify(
    {
      added: result.added,
      total: result.total,
      queueJobs: queueJobs.length,
      azure: azureEmbeddingsConfigured(),
      indexFile: path.join(OUT, "ja-en-topic-vectors.json"),
      sample: (index.entries || []).slice(-2).map((e) => ({
        topic: e.topic,
        source: e.source,
      })),
    },
    null,
    2,
  ),
);
