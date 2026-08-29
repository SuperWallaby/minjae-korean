#!/usr/bin/env node
/**
 * Build kajakorean.com/vocab/{bundle}/{slug} → getpronounce /ko/pin/{id}
 * mappings. Only charts that exist and have words. Never map to /ko hub.
 *
 *   node scripts/build-vocab-ko-redirects.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { vocabKoRedirectPath } from "./lib/vocab-ko-redirects.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VOCAB = path.join(ROOT, "src/data/vocabInfographic/published.json");
const GLOBAL = path.join(ROOT, "src/data/globalPins/published.json");

const CORE_EXACT = {
  "list-eye-colors": "01_eye-colors__ko",
  "list-months": "02_months__ko",
  "grid-calendar-months-extra": "02_months__ko",
  "grid-emotions-basic": "04_emotions__ko",
  "grid-family-nuclear": "05_family__ko",
  "list-family-members": "05_family__ko",
  "list-numbers-1-20": "06_numbers__ko",
  "list-native-korean-numbers": "06_numbers__ko",
  "list-sino-korean-numbers": "06_numbers__ko",
  "list-body-parts-full": "08_body-parts__ko",
  "list-colors-basic": "10_colors__ko",
  "grid-pets-common": "12_pets__ko",
  "phrase-greetings-polite": "14_greetings__ko",
  "grid-greetings-social": "14_greetings__ko",
  "phrase-greetings-casual": "14_greetings__ko",
};

const STOP = new Set([
  "words",
  "word",
  "korean",
  "vs",
  "which",
  "this",
  "in",
  "at",
  "the",
  "a",
  "and",
]);

function loadPages(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(j?.pages) ? j.pages : [];
  } catch {
    return [];
  }
}

function hanguls(page) {
  const out = new Set();
  for (const w of page.words || []) {
    const h = String(w.hangul || w.ko || "").replace(/\s+/g, "");
    if (h.length >= 2) out.add(h);
  }
  return out;
}

function tokens(s) {
  return String(s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stripSeoSlug(slug) {
  return String(slug || "")
    .toLowerCase()
    .replace(/-in-korean$/i, "")
    .replace(/-korean$/i, "");
}

function trendTopic(pid) {
  const m = String(pid).match(
    /^tr_\d+_\d+_(.+?)__(?:super_list|grid_cluster|phrase_stack|cute_cast|antonym_split|similar_split|quiz_comment|concept_rows)__ko$/,
  );
  return m ? m[1] : "";
}

function pinReady(p) {
  const id = String(p.id || "");
  if (!id.endsWith("__ko") && p.lang !== "ko") return false;
  if (id.startsWith("rd_")) return false;
  return (p.words || []).length >= 4;
}

const vocab = loadPages(VOCAB);
const byBundle = new Map(vocab.map((v) => [v.bundleId, v]));
const ko = loadPages(GLOBAL).filter(pinReady);
const koHangul = ko.map((p) => [p, hanguls(p)]);

/** @type {Record<string, string>} */
const mappings = {};
const reason = { core_exact: 0, trend_topic: 0, hangul: 0 };

function setMap(bundleId, slug, pinId, why) {
  if (!bundleId || !slug || !pinId) return;
  const key = `${bundleId}/${slug}`;
  if (mappings[key]) return;
  mappings[key] = pinId;
  reason[why] += 1;
}

for (const [bid, pid] of Object.entries(CORE_EXACT)) {
  const page = byBundle.get(bid);
  if (page?.slug && ko.some((p) => p.id === pid)) {
    setMap(bid, page.slug, pid, "core_exact");
  }
}

for (const p of ko) {
  const topic = trendTopic(p.id);
  if (!topic) continue;
  const hyphenated = topic.includes("-");
  for (const v of vocab) {
    const bid = String(v.bundleId || "");
    const slug = stripSeoSlug(v.slug);
    if (hyphenated) {
      if (!bid.includes(topic) && !slug.includes(topic)) continue;
    } else {
      if (topic.length < 4) continue;
      const bt = new Set(tokens(bid));
      if (!bt.has(topic)) continue;
    }
    setMap(v.bundleId, v.slug, p.id, "trend_topic");
  }
}

for (const v of vocab) {
  const key = `${v.bundleId}/${v.slug}`;
  if (mappings[key]) continue;
  const vh = hanguls(v);
  if (vh.size < 4) continue;
  const scored = [];
  for (const [p, kh] of koHangul) {
    if (kh.size < 4) continue;
    let n = 0;
    for (const h of vh) if (kh.has(h)) n += 1;
    if (n >= 4) scored.push([n, p.id]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  if (!scored.length) continue;
  const best = scored[0];
  const second = scored[1]?.[0] || 0;
  if (best[0] >= 4 && (second === 0 || best[0] >= second + 2)) {
    setMap(v.bundleId, v.slug, best[1], "hangul");
  }
}

const out = {
  note: "Only redirect kajakorean.com/vocab/{path} when a matching getpronounce /ko/pin/{id} exists. Never fall back to the /ko/ hub.",
  generatedAt: new Date().toISOString(),
  generatedBy: "scripts/build-vocab-ko-redirects.mjs",
  counts: {
    mappings: Object.keys(mappings).length,
    uniquePins: new Set(Object.values(mappings)).size,
    ...reason,
  },
  mappings,
};

const dest = vocabKoRedirectPath(ROOT);
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `wrote ${dest} mappings=${out.counts.mappings} pins=${out.counts.uniquePins}`,
  reason,
);
