#!/usr/bin/env node
/**
 * Re-apply brand footer. Chico watermark only when generation had includeJjibara
 * or the pin is cute_cast with capybara cast — never default-on.
 *
 * grammar_spotlight: `_raw.png` / `_ill.png` are illustration-only. This script
 * re-runs SVG text compose before the footer (raw+footer alone strips Hangul).
 *
 *   node scripts/recomposite-unpinned-pins.mjs
 *   node scripts/recomposite-unpinned-pins.mjs --dry-run
 *   node scripts/recomposite-unpinned-pins.mjs --id phrase-foo
 *   node scripts/recomposite-unpinned-pins.mjs --all
 *   node scripts/recomposite-unpinned-pins.mjs --prefix gram-
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { compositeListenCtaOnly } from "./lib/vocab-infographic-gen.mjs";
import { composeGrammarSpotlightPin } from "./lib/grammar_spotlight_pin.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-infographic-gen");
const PINNED = join(OUT, "pinterest-pinned.json");
const SCHEDULED = join(OUT, "vocab-x-scheduled.json");
const PROGRESS = join(OUT, "progress.json");
const LOG_DIR = join(OUT, "logs");

function parseArgs(argv) {
  let dryRun = false;
  let onlyId = "";
  let prefix = "";
  let concurrency = 6;
  let all = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--all") all = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--id=")) onlyId = a.slice(5);
    else if (a === "--prefix" && argv[i + 1]) prefix = argv[++i];
    else if (a.startsWith("--prefix=")) prefix = a.slice(9);
    else if (a === "--concurrency" && argv[i + 1]) {
      concurrency = Math.max(1, parseInt(argv[++i], 10) || 6);
    }
  }
  return { dryRun, onlyId, prefix, concurrency, all };
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/** id → { cuteCast, format, includeJjibara, grammarSpotlight? } */
function loadFlagsById() {
  const probe = `
    import { ALL_VOCAB_BUNDLES } from ${JSON.stringify(join(ROOT, "src/lib/vocabInfographic/bundle-catalog.ts"))};
    const m = {};
    for (const b of ALL_VOCAB_BUNDLES) {
      if (!b?.id) continue;
      m[b.id] = {
        cuteCast: b.cuteCast ?? null,
        format: b.format ?? null,
        grammarSpotlight: b.grammarSpotlight ?? null,
      };
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
    console.warn("[warn] catalog load failed", (r.stderr || "").slice(0, 400));
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
      grammarSpotlight: cat.grammarSpotlight ?? null,
    };
  }
  return out;
}

function illustrationPathFor(id, format) {
  // grammar_spotlight stores illustration-only as _ill.png (and _raw.png).
  if (format === "grammar_spotlight") {
    const ill = join(OUT, `${id}_ill.png`);
    if (existsSync(ill)) return ill;
  }
  return join(OUT, `${id}_raw.png`);
}

async function buildBasePng(id, flags) {
  const format = String(flags.format || "");
  const rawPath = illustrationPathFor(id, format);
  const raw = readFileSync(rawPath);

  if (format === "grammar_spotlight") {
    const g = flags.grammarSpotlight;
    if (!g) {
      throw new Error(
        `grammar_spotlight missing catalog fields for ${id} — refuse raw+footer (would strip text)`,
      );
    }
    return composeGrammarSpotlightPin({
      illustrationPng: raw,
      koreanBefore: g.koreanBefore,
      koreanHighlight: g.koreanHighlight,
      koreanAfter: g.koreanAfter,
      englishBefore: g.englishBefore,
      englishHighlight: g.englishHighlight,
      englishAfter: g.englishAfter,
      grammarLabel: g.grammarLabel,
    });
  }

  return raw;
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
  const { dryRun, onlyId, prefix, concurrency, all } = parseArgs(
    process.argv.slice(2),
  );
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
  if (prefix) ids = ids.filter((id) => id.startsWith(prefix));
  ids = ids.filter(
    (id) =>
      existsSync(join(OUT, `${id}_raw.png`)) ||
      existsSync(join(OUT, `${id}_ill.png`)),
  );

  const flagsMap = loadFlagsById();
  const withChico = ids.filter((id) => shouldChico(flagsMap[id]));
  const grammarN = ids.filter(
    (id) => String(flagsMap[id]?.format || "") === "grammar_spotlight",
  ).length;

  console.log(
    `==> recomposite ${all ? "all raw" : "unpinned"}: ${ids.length} (pinned ${Object.keys(pinned).length})`,
  );
  console.log(`    chico credit: ${withChico.length} · no-credit: ${ids.length - withChico.length}`);
  console.log(`    grammar_spotlight recompose: ${grammarN}`);
  console.log(`    footer=Listen on website (band)`);
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
    const outPath = join(OUT, `${id}.png`);
    const flags = flagsMap[id] || {};
    const chico = shouldChico(flags);
    const format = String(flags.format || "");
    try {
      if (dryRun) {
        ok += 1;
        if ((idx + 1) % 50 === 0 || idx === 0) {
          console.log(
            `  [dry] ${idx + 1}/${ids.length} ${id} format=${format || "?"} chico=${chico}`,
          );
        }
        return;
      }
      const base = await buildBasePng(id, flags);
      const branded = await compositeListenCtaOnly(base);
      writeFileSync(outPath, branded);
      ok += 1;
      if ((idx + 1) % 25 === 0 || idx === 0 || idx === ids.length - 1) {
        console.log(
          `  ✓ ${idx + 1}/${ids.length} ${id} format=${format || "?"} chico=${chico}${flags.includeJjibara === true ? " jjibara" : ""}`,
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
