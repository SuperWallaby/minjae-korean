#!/usr/bin/env node
/**
 * Pick today's EigoChart batch (default 6 new + any catch-up).
 *
 * Non-negotiable: published-but-not-pinned IDs are NEVER dropped / topic-skipped.
 * They are always included first (catch-up). Then fill with new warehouse IDs up to --limit.
 *
 *   node scripts/select-ja-en-daily.mjs
 *   node scripts/select-ja-en-daily.mjs --limit 6
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildJaEnDedupContext,
  filterJaEnIds,
  jaEnOutDir,
} from "./lib/ja-en-topic-similarity.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = jaEnOutDir(ROOT);
const PUBLISHED = path.join(ROOT, "src", "data", "jaPins", "published.json");
const PINNED = path.join(SRC, "pinterest-pinned.json");

const limitIdx = process.argv.indexOf("--limit");
const limit = Math.max(
  1,
  Number(
    limitIdx >= 0
      ? process.argv[limitIdx + 1]
      : process.argv.find((a) => a.startsWith("--limit="))?.slice(8) || 6,
  ) || 6,
);

function load(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const catalog = load(PUBLISHED, {});
const published = catalog.pages || [];
const publishedIds = new Set(published.map((p) => p.id));
const pinned = load(PINNED, {});
const pinnedIds = new Set(Object.keys(pinned));
const topicCtx = buildJaEnDedupContext(SRC);

const skipMeta = /progress|pinned|results|queue|vectors/i;
const warehouse = [];
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith(".json") || skipMeta.test(f)) continue;
    const id = f.replace(/\.json$/, "");
    if (!fs.existsSync(path.join(SRC, `${id}.png`))) continue;
    warehouse.push(id);
  }
}
warehouse.sort();

/** Live on eigopin but not yet on Pinterest — must retry, never omit. */
const catchUp = published
  .map((p) => p.id)
  .filter((id) => id && !pinnedIds.has(id));

const unpublishedReady = warehouse.filter((id) => !publishedIds.has(id));
const { kept: freshKept, skipped: topicSkipped } = filterJaEnIds(
  unpublishedReady,
  SRC,
  catalog,
  topicCtx,
);
const freshSlots = Math.max(0, limit);
const fresh = freshKept.slice(0, freshSlots);

const picked = [];
for (const id of [...catchUp, ...fresh]) {
  if (picked.includes(id)) continue;
  picked.push(id);
}

const payload = {
  limit,
  ids: picked,
  catchUpIds: catchUp,
  freshIds: fresh,
  topicDedupSkipped: topicSkipped,
  unpinnedLive: catchUp.length,
  unpublishedReady: unpublishedReady.length,
  warehouse: warehouse.length,
  published: publishedIds.size,
  pinned: pinnedIds.size,
  note:
    catchUp.length > 0
      ? `catch-up ${catchUp.length} unpinned live first (never skip), then up to ${limit} new`
      : `up to ${limit} new from warehouse`,
};
console.log(JSON.stringify(payload));
