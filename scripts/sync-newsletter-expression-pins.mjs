#!/usr/bin/env node
/**
 * Sync pinned infographics into src/data/newsletter/expression-pins.json
 * for the weekly popular-expressions newsletter (runs on Vercel).
 *
 *   node scripts/sync-newsletter-expression-pins.mjs
 *   node scripts/sync-newsletter-expression-pins.mjs --import-scrape
 *
 * Metrics:
 *   .tmp/vocab-infographic-gen/pinterest-pin-metrics.json
 *   { "list-eye-colors": { "saveCount": 460, ... }, ... }
 *
 * Or import board-sorted scrape from auto-video-korean:
 *   --import-scrape  (uses last-scrape.json ranked by Saves)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLISHED = path.join(ROOT, "src/data/vocabInfographic/published.json");
const PINNED = path.join(
  ROOT,
  ".tmp/vocab-infographic-gen/pinterest-pinned.json",
);
const METRICS = path.join(
  ROOT,
  ".tmp/vocab-infographic-gen/pinterest-pin-metrics.json",
);
const DEFAULT_SCRAPE = path.resolve(
  ROOT,
  "../projects/neo-project/auto-video-korean/.cache/pinterest/analytics/last-scrape.json",
);
const OUT = path.join(ROOT, "src/data/newsletter/expression-pins.json");

/** Baseline pool when no engagement metrics exist. */
const EXPRESSION_FORMATS = new Set([
  "phrase_stack",
  "similar_split",
  "concept_rows",
  "topik_upgrade",
]);

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .slice(0, 90);
}

function importScrapeToMetrics() {
  const scrapePath =
    process.env.PINTEREST_LAST_SCRAPE?.trim() || DEFAULT_SCRAPE;
  if (!fs.existsSync(scrapePath)) {
    console.warn(`[metrics] scrape missing: ${scrapePath}`);
    return {};
  }
  if (!fs.existsSync(PINNED)) {
    console.warn("[metrics] pinterest-pinned.json missing");
    return {};
  }

  const scrape = loadJson(scrapePath);
  const pinned = loadJson(PINNED);
  const byTitle = new Map();
  for (const [bundleId, pin] of Object.entries(pinned)) {
    const t = normTitle(pin.title);
    if (t) byTitle.set(t, bundleId);
    const first = normTitle(String(pin.title || "").split("\n")[0]);
    if (first) byTitle.set(first, bundleId);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: scrapePath,
    scrapedAt: scrape.scraped_at || null,
    sortBy: scrape.sort_by || null,
  };
  let matched = 0;
  for (const p of scrape.pins || []) {
    const t = normTitle(p.title);
    let bundleId = byTitle.get(t) || null;
    if (!bundleId && t) {
      for (const [kt, id] of byTitle) {
        if (
          t.includes(kt.slice(0, 28)) ||
          kt.includes(t.slice(0, 28))
        ) {
          bundleId = id;
          break;
        }
      }
    }
    if (!bundleId) continue;
    matched += 1;
    out[bundleId] = {
      saveCount: Number(p.saves) || 0,
      impressionCount: Number(p.impressions) || 0,
      pinClickCount: Number(p.pin_clicks) || 0,
      outboundClickCount: Number(p.outbound_clicks) || 0,
      pinId: p.pin_id || null,
      title: p.title || "",
    };
  }
  fs.mkdirSync(path.dirname(METRICS), { recursive: true });
  fs.writeFileSync(METRICS, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `[metrics] imported scrape → ${matched} bundle metrics (${scrape.pin_count ?? "?"} scrape rows)`,
  );
  return out;
}

function metricsMap(raw) {
  const map = {};
  if (!raw || typeof raw !== "object") return map;
  for (const [k, v] of Object.entries(raw)) {
    if (
      k === "generatedAt" ||
      k === "source" ||
      k === "scrapedAt" ||
      k === "sortBy" ||
      k === "items" ||
      k === "note"
    ) {
      continue;
    }
    if (v && typeof v === "object" && ("saveCount" in v || "saves" in v)) {
      map[k] = v;
    }
  }
  // nested items map
  if (raw.items && typeof raw.items === "object" && !Array.isArray(raw.items)) {
    for (const [k, v] of Object.entries(raw.items)) {
      if (v && typeof v === "object") map[k] = v;
    }
  }
  return map;
}

const doImport = process.argv.includes("--import-scrape");
if (doImport) importScrapeToMetrics();

const pub = loadJson(PUBLISHED);
const pinned = fs.existsSync(PINNED) ? loadJson(PINNED) : {};
const metricsRaw = fs.existsSync(METRICS) ? loadJson(METRICS) : {};
const metrics = metricsMap(metricsRaw);
const hasAnyMetrics = Object.keys(metrics).length > 0;

const items = [];
for (const page of pub.pages ?? []) {
  if (!String(page.imageUrl || "").trim()) continue;
  const pin = pinned[page.bundleId];
  if (!pin) continue;

  const m = metrics[page.bundleId] || {};
  const saveCount =
    typeof m.saveCount === "number"
      ? m.saveCount
      : typeof m.saves === "number"
        ? m.saves
        : null;
  const impressionCount =
    typeof m.impressionCount === "number"
      ? m.impressionCount
      : typeof m.impressions === "number"
        ? m.impressions
        : null;
  const hasMetrics =
    (Number(saveCount) || 0) > 0 || (Number(impressionCount) || 0) > 0;

  // With metrics: keep any ranked pin. Without: expression-style only.
  if (!hasMetrics && !EXPRESSION_FORMATS.has(page.format)) continue;
  // If we have a metrics pool, still keep expression-style for fallback depth.
  if (hasAnyMetrics && !hasMetrics && !EXPRESSION_FORMATS.has(page.format)) {
    continue;
  }

  items.push({
    bundleId: page.bundleId,
    slug: page.slug,
    format: page.format,
    title: page.titleEn || page.title,
    description: page.description || "",
    imageUrl: page.imageUrl,
    imageThumbUrl: page.imageThumbUrl || "",
    words: (page.words || []).slice(0, 8).map((w) => ({
      hangul: w.hangul,
      romanization: w.romanization || "",
      english: w.english,
    })),
    pinnedAt: pin.at || null,
    pinTitle: pin.title || page.title,
    saveCount,
    impressionCount,
  });
}

items.sort((a, b) => {
  const sa = Number(a.saveCount) || 0;
  const sb = Number(b.saveCount) || 0;
  if (sb !== sa) return sb - sa;
  const ia = Number(a.impressionCount) || 0;
  const ib = Number(b.impressionCount) || 0;
  if (ib !== ia) return ib - ia;
  return String(a.pinnedAt || "").localeCompare(String(b.pinnedAt || ""));
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: "Popular pin candidates for newsletter. Metrics via --import-scrape or pinterest-pin-metrics.json",
      hasMetrics: hasAnyMetrics,
      items,
    },
    null,
    2,
  ) + "\n",
);

const withMetrics = items.filter(
  (i) =>
    (Number(i.saveCount) || 0) > 0 || (Number(i.impressionCount) || 0) > 0,
);
console.log(
  `Wrote ${items.length} pins → ${path.relative(ROOT, OUT)} (with metrics: ${withMetrics.length}; top: ${
    withMetrics[0]
      ? `${withMetrics[0].bundleId} saves=${withMetrics[0].saveCount}`
      : "n/a"
  })`,
);
