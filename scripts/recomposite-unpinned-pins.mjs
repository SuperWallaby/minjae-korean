#!/usr/bin/env node
/**
 * Re-apply brand footer. Chico watermark only when generation had includeJjibara
 * or the pin is cute_cast with capybara cast — never default-on.
 *
 *   node scripts/recomposite-unpinned-pins.mjs
 *   node scripts/recomposite-unpinned-pins.mjs --dry-run
 *   node scripts/recomposite-unpinned-pins.mjs --id phrase-foo
 *   node scripts/recomposite-unpinned-pins.mjs --all
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compositeFooter, LOGO_PATH } from "./lib/vocab-infographic-gen.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-infographic-gen");
const PINNED = join(OUT, "pinterest-pinned.json");
const SCHEDULED = join(OUT, "vocab-x-scheduled.json");
const PROGRESS = join(OUT, "progress.json");
const LOGO = join(ROOT, LOGO_PATH);
const LOG_DIR = join(OUT, "logs");

function parseArgs(argv) {
  let dryRun = false;
  let onlyId = "";
  let concurrency = 6;
  let all = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--all") all = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--id=")) onlyId = a.slice(5);
    else if (a === "--concurrency" && argv[i + 1]) {
      concurrency = Math.max(1, parseInt(argv[++i], 10) || 6);
    }
  }
  return { dryRun, onlyId, concurrency, all };
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/** id → { cuteCast, format, includeJjibara } */
function loadFlagsById() {
  const probe = `
    import { ALL_VOCAB_BUNDLES } from ${JSON.stringify(join(ROOT, "src/lib/vocabInfographic/bundle-catalog.ts"))};
    const m = {};
    for (const b of ALL_VOCAB_BUNDLES) {
      if (b?.id) m[b.id] = { cuteCast: b.cuteCast ?? null, format: b.format ?? null };
    }
    process.stdout.write(JSON.stringify(m));
  `;
  const r = spawnSync(
    "npx",
    ["tsx", "--eval", probe],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  let catalog = {};
  if (r.status === 0) {
    try {
      catalog = JSON.parse(r.stdout || "{}");
    } catch {
      catalog = {};
    }
  } else {
    console.warn("[warn] catalog load failed");
  }
  const progress = loadJson(PROGRESS, { done: {} });
  const out = {};
  const ids = new Set([
    ...Object.keys(catalog),
    ...Object.keys(progress.done || {}),
  ]);
  for (const id of ids) {
    const cat = catalog[id] || {};
    const done = progress.done?.[id] || {};
    out[id] = {
      format: cat.format ?? null,
      cuteCast: done.cuteCast ?? cat.cuteCast ?? null,
      includeJjibara:
        typeof done.includeJjibara === "boolean" ? done.includeJjibara : undefined,
    };
  }
  return out;
}

/**
 * Chico credit only when jibara was recorded OR cute_cast + capybara.
 * Default false for unknown/old progress.
 */
function shouldChico(flags) {
  if (!flags) return false;
  if (String(flags.cuteCast || "").toLowerCase() === "otter") return false;
  if (flags.includeJjibara === true) return true;
  if (flags.includeJjibara === false) return false;
  const format = String(flags.format || "");
  if (format === "quiz_comment") return true;
  return (
    format === "cute_cast" &&
    String(flags.cuteCast || "").toLowerCase() === "capybara"
  );
}

async function mapPool(items, concurrency, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const { dryRun, onlyId, concurrency, all } = parseArgs(process.argv.slice(2));
  if (!existsSync(LOGO)) throw new Error(`logo missing: ${LOGO}`);
  mkdirSync(LOG_DIR, { recursive: true });

  const scheduled = loadJson(SCHEDULED, {});
  const pinned = loadJson(PINNED, {});
  let ids;
  if (all) {
    ids = readdirSync(OUT)
      .filter((f) => f.endsWith("_raw.png"))
      .map((f) => f.slice(0, -"_raw.png".length));
  } else {
    ids = Object.keys(scheduled).filter((id) => !pinned[id]);
  }
  if (onlyId) ids = ids.filter((id) => id === onlyId);
  ids = ids.filter((id) => existsSync(join(OUT, `${id}_raw.png`)));

  const flagsMap = loadFlagsById();
  const withChico = ids.filter((id) => shouldChico(flagsMap[id]));

  console.log(
    `==> recomposite ${all ? "all raw" : "unpinned"}: ${ids.length} (pinned ${Object.keys(pinned).length})`,
  );
  console.log(`    chico credit: ${withChico.length} · no-credit: ${ids.length - withChico.length}`);
  console.log(`    logo=${LOGO}`);
  console.log(`    concurrency=${concurrency} dryRun=${dryRun}`);

  if (!ids.length) {
    console.log("Nothing to do.");
    return;
  }

  let ok = 0;
  let failed = 0;
  const t0 = Date.now();
  const errors = [];

  await mapPool(ids, concurrency, async (id, idx) => {
    const rawPath = join(OUT, `${id}_raw.png`);
    const outPath = join(OUT, `${id}.png`);
    const flags = flagsMap[id] || {};
    const chico = shouldChico(flags);
    try {
      if (dryRun) {
        ok += 1;
        if ((idx + 1) % 50 === 0 || idx === 0) {
          console.log(`  [dry] ${idx + 1}/${ids.length} ${id} chico=${chico}`);
        }
        return;
      }
      const raw = readFileSync(rawPath);
      const branded = await compositeFooter(raw, LOGO, {
        cuteCast: flags.cuteCast || undefined,
        chicoCredit: chico,
      });
      writeFileSync(outPath, branded);
      ok += 1;
      if ((idx + 1) % 25 === 0 || idx === 0 || idx === ids.length - 1) {
        console.log(
          `  ✓ ${idx + 1}/${ids.length} ${id} chico=${chico}${flags.includeJjibara === true ? " jjibara" : ""}`,
        );
      }
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ id, error: msg });
      console.error(`  ✗ ${id}: ${msg}`);
    }
  });

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  const summary = {
    at: new Date().toISOString(),
    ok,
    failed,
    total: ids.length,
    chico: withChico.length,
    dryRun,
    all,
    sec,
    errors: errors.slice(0, 20),
  };
  const logPath = join(
    LOG_DIR,
    `recomposite-unpinned-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  if (!dryRun) writeFileSync(logPath, JSON.stringify(summary, null, 2));
  console.log(`done: ok=${ok} failed=${failed} in ${sec}s`);
  if (!dryRun) console.log(`log=${logPath}`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
