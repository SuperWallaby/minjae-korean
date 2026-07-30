#!/usr/bin/env node
/**
 * Sync pinned expression-style infographics into src/data/newsletter/expression-pins.json
 * for the weekly popular-expressions newsletter (runs on Vercel).
 *
 *   node scripts/sync-newsletter-expression-pins.mjs
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
const OUT = path.join(ROOT, "src/data/newsletter/expression-pins.json");

const FORMATS = new Set([
  "phrase_stack",
  "similar_split",
  "concept_rows",
  "topik_upgrade",
]);

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const pub = loadJson(PUBLISHED);
const pinned = fs.existsSync(PINNED) ? loadJson(PINNED) : {};

const items = [];
for (const page of pub.pages ?? []) {
  if (!FORMATS.has(page.format)) continue;
  if (!String(page.imageUrl || "").trim()) continue;
  const pin = pinned[page.bundleId];
  if (!pin) continue;
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
  });
}

items.sort((a, b) =>
  String(a.pinnedAt || "").localeCompare(String(b.pinnedAt || "")),
);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: "Pinned expression-style infographics for weekly newsletter. Refresh via scripts/sync-newsletter-expression-pins.mjs",
      items,
    },
    null,
    2,
  ) + "\n",
);

const now = Date.now();
const ge10 = items.filter(
  (i) => i.pinnedAt && now - Date.parse(i.pinnedAt) >= 10 * 864e5,
);
console.log(
  `Wrote ${items.length} pins → ${path.relative(ROOT, OUT)} (${ge10.length} ≥10d old)`,
);
