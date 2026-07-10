#!/usr/bin/env node
/**
 * Queue all ready vocab infographics for X (3×/day cron on lab-worker).
 *   npx tsx scripts/vocab-x-auto-queue.ts
 */
import { autoQueueReadyVocabPosts } from "./vocab-x-schedule-post.ts";

async function main() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  loadEnvLocal(ROOT);

  const results = await autoQueueReadyVocabPosts();
  const queued = results.filter((r) => !("error" in r) && !("skipped" in r && r.skipped));
  const skipped = results.filter((r) => "skipped" in r && r.skipped);
  const errors = results.filter((r) => "error" in r);
  console.log(
    JSON.stringify(
      { ok: true, total: results.length, queued: queued.length, skipped: skipped.length, errors: errors.length, results },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
