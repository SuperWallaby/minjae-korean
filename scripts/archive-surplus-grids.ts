/**
 * Cap unpinned grid_cluster leftovers at 60; archive the rest for later.
 *
 *   npx tsx scripts/archive-surplus-grids.ts
 *   npx tsx scripts/archive-surplus-grids.ts --keep 60
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { WAVE2_GRID_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog-wave2.ts";
import { AUDIT_DROP_IDS } from "./lib/vocab-batch-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEEP_N = (() => {
  const i = process.argv.indexOf("--keep");
  if (i >= 0 && process.argv[i + 1]) return Number(process.argv[i + 1]) || 60;
  return 60;
})();

const OUT_DIR = join(ROOT, ".tmp", "vocab-catalog-archive");
const GEN = join(ROOT, ".tmp", "vocab-infographic-gen");
const pinned = JSON.parse(readFileSync(join(GEN, "pinterest-pinned.json"), "utf8"));
const wave2Ids = new Set(WAVE2_GRID_BUNDLES.map((b) => b.id));

// Use AUDIT_DROP only — surplus archive is what this script (re)builds.
const unpinned = ALL_VOCAB_BUNDLES.filter(
  (b) =>
    b.format === "grid_cluster" &&
    !AUDIT_DROP_IDS.has(b.id) &&
    !pinned[b.id],
);

const pri: Record<string, number> = { high: 0, medium: 1, low: 2 };
function score(b: (typeof unpinned)[0]) {
  const wavePenalty = wave2Ids.has(b.id) ? 10 : 0;
  return (pri[b.priority] ?? 1) + wavePenalty;
}

const byTag = new Map<string, typeof unpinned>();
for (const b of [...unpinned].sort(
  (a, b) => score(a) - score(b) || a.id.localeCompare(b.id),
)) {
  const tag = b.tags?.[0] || "misc";
  if (!byTag.has(tag)) byTag.set(tag, []);
  byTag.get(tag)!.push(b);
}

const keep: typeof unpinned = [];
const keepIds = new Set<string>();
const tagKeys = [...byTag.keys()].sort();
let guard = 0;
while (keep.length < KEEP_N && guard < 10_000) {
  guard += 1;
  let added = false;
  for (const tag of tagKeys) {
    if (keep.length >= KEEP_N) break;
    const bucket = byTag.get(tag)!;
    while (bucket.length) {
      const b = bucket.shift()!;
      if (keepIds.has(b.id)) continue;
      keep.push(b);
      keepIds.add(b.id);
      added = true;
      break;
    }
  }
  if (!added) break;
}

if (keep.length < KEEP_N) {
  for (const b of [...unpinned].sort((a, b) => score(a) - score(b))) {
    if (keep.length >= KEEP_N) break;
    if (keepIds.has(b.id)) continue;
    keep.push(b);
    keepIds.add(b.id);
  }
}

const archive = unpinned.filter((b) => !keepIds.has(b.id));

mkdirSync(OUT_DIR, { recursive: true });

const payload = {
  archivedAt: new Date().toISOString(),
  reason:
    "Cap unpinned grid_cluster surplus at 60 active leftovers so Pinterest mix is not grid-only.",
  keepUnpinnedCount: keep.length,
  archivedCount: archive.length,
  keepUnpinnedIds: keep.map((b) => b.id).sort(),
  archivedIds: archive.map((b) => b.id).sort(),
  keepUnpinned: keep.map((b) => ({
    id: b.id,
    title: b.title,
    priority: b.priority,
    tags: b.tags,
    wave: wave2Ids.has(b.id) ? 2 : 1,
  })),
  archived: archive.map((b) => ({
    id: b.id,
    title: b.title,
    priority: b.priority,
    tags: b.tags,
    count: b.count,
    fit: b.fit,
    wave: wave2Ids.has(b.id) ? 2 : 1,
  })),
};

writeFileSync(join(OUT_DIR, "surplus-grids.json"), JSON.stringify(payload, null, 2));
writeFileSync(
  join(OUT_DIR, "surplus-grid-ids.txt"),
  `${payload.archivedIds.join("\n")}\n`,
);
writeFileSync(
  join(OUT_DIR, "keep-unpinned-grid-ids.txt"),
  `${payload.keepUnpinnedIds.join("\n")}\n`,
);

const idsLit = payload.archivedIds.map((id) => `  ${JSON.stringify(id)},`).join("\n");
const keepLit = payload.keepUnpinnedIds
  .map((id) => `  ${JSON.stringify(id)},`)
  .join("\n");
writeFileSync(
  join(ROOT, "scripts", "lib", "vocab-grid-surplus-ids.mjs"),
  `/** Auto-generated surplus grids (unpinned beyond 60-cap).\n` +
    ` * Full payload: .tmp/vocab-catalog-archive/surplus-grids.json\n` +
    ` * Re-run: npx tsx scripts/archive-surplus-grids.ts\n` +
    ` */\n` +
    `export const ARCHIVED_SURPLUS_GRID_IDS = new Set([\n${idsLit}\n]);\n\n` +
    `export const KEEP_UNPINNED_GRID_IDS = new Set([\n${keepLit}\n]);\n`,
);

console.log(
  JSON.stringify(
    {
      unpinned: unpinned.length,
      keep: keep.length,
      archive: archive.length,
      keepWave1: keep.filter((b) => !wave2Ids.has(b.id)).length,
      keepWave2: keep.filter((b) => wave2Ids.has(b.id)).length,
      keepHigh: keep.filter((b) => b.priority === "high").length,
      archivePath: join(OUT_DIR, "surplus-grids.json"),
    },
    null,
    2,
  ),
);
