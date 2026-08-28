#!/usr/bin/env node
/**
 * Build a format-rotated ids JSON for batch gen.
 *
 *   node scripts/build-balanced-gen-ids.mjs --count 100 --out path.json
 *   node scripts/build-balanced-gen-ids.mjs --count 100 --exclude quiz_comment,cute_cast
 */
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DEFAULT = join(
  process.env.HOME || "",
  "Library/Application Support/kaja/vocab-infographic-gen",
);

function parseArgs(argv) {
  let count = 100;
  let out = "";
  let exclude = ["quiz_comment", "cute_cast"];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 100);
    else if (a === "--out" && argv[i + 1]) out = argv[++i];
    else if (a === "--exclude" && argv[i + 1]) {
      exclude = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a === "--exclude=") {
      exclude = a.slice(10).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return { count, out, exclude };
}

const { count, exclude } = parseArgs(process.argv.slice(2));
const VOCAB_OUT = process.env.VOCAB_OUT?.trim() || OUT_DEFAULT;
const outPath =
  parseArgs(process.argv.slice(2)).out ||
  join(VOCAB_OUT, `_gen-${count}-balanced.json`);

const probe = `
  import { existsSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  import { ALL_VOCAB_BUNDLES } from ${JSON.stringify(join(ROOT, "src/lib/vocabInfographic/bundle-catalog.ts"))};
  import { formatRotatedQueue } from ${JSON.stringify(join(ROOT, "src/lib/vocabInfographic/bundle-queue.ts"))};
  import { DROP_IDS } from ${JSON.stringify(join(ROOT, "scripts/lib/vocab-batch-config.mjs"))};

  const OUT = ${JSON.stringify(VOCAB_OUT)};
  const EXCLUDE = new Set(${JSON.stringify(exclude)});
  const TARGET = ${count};

  function isDone(id) {
    return existsSync(join(OUT, id + ".png")) && existsSync(join(OUT, id + "_raw.png"));
  }

  let progress = { skipped: {} };
  try { progress = JSON.parse(readFileSync(join(OUT, "progress.json"), "utf8")); } catch {}

  const pool = ALL_VOCAB_BUNDLES.filter(
    (b) =>
      !DROP_IDS.has(b.id) &&
      !EXCLUDE.has(b.format) &&
      !isDone(b.id) &&
      !progress.skipped?.[b.id],
  );
  const rotated = formatRotatedQueue(pool, Date.now() % 1e9);
  const picked = rotated.slice(0, TARGET);
  const ids = picked.map((b) => b.id);
  const byFormat = {};
  for (const b of picked) byFormat[b.format] = (byFormat[b.format] || 0) + 1;
  process.stdout.write(JSON.stringify({ ids, byFormat, pool: pool.length }));
`;

const r = spawnSync("npx", ["tsx", "--eval", probe], {
  cwd: ROOT,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}
const data = JSON.parse(r.stdout.trim().split("\n").pop());
const payload = {
  ids: data.ids,
  generatedAt: new Date().toISOString(),
  byFormat: data.byFormat,
  excludeFormats: exclude,
};
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`wrote ${outPath}`);
console.log(`count ${data.ids.length} (pool ${data.pool})`);
console.log("byFormat", data.byFormat);
