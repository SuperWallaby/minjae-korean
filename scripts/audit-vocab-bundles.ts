#!/usr/bin/env node
/**
 * Audit vocab bundle catalog for format fit, overlap, weak entries.
 *   npx tsx scripts/audit-vocab-bundles.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALL_VOCAB_BUNDLES,
  validateBundleCatalog,
} from "../src/lib/vocabInfographic/bundle-catalog.ts";

/** @typedef {import("../src/lib/vocabInfographic/bundle-catalog.ts").VocabBundle} VocabBundle */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const issues = [];

function flag(
  b,
  severity,
  reason,
  suggestion,
) {
  issues.push({
    id: b.id,
    title: b.title,
    format: b.format,
    severity,
    reason,
    suggestion,
  });
}

/** Super list must have ≥9 rows per format spec. */
const SUPER_LIST_MIN = 9;

/** Bundles that are abstract / grammar — poor fit for illustrated grid cells. */
const GRID_ABSTRACT_SLUGS = new Set([
  "email-words",
  "presentation-words",
  "meeting-business",
  "internet-terms",
  "software-ui",
  "cybersecurity-basic",
  "coding-basics",
  "mental-health-words",
  "animal-groups",
  "eco-green-living",
  "remote-work",
  "kpop-fan-words",
  "kdrama-words",
  "video-game-terms",
  "streaming-media",
  "ecommerce-shopping",
  "historical-figures-korea",
  "korean-etiquette",
  "seasonal-festivals-korea",
  "mood-swings",
  "attitudes-mindset",
]);

/** Grid bundles that overlap a super_list topic — keep one format only. */
const GRID_SUPER_OVERLAP = {
  "grid-body-head": "list-body-parts-full",
  "grid-body-torso": "list-body-parts-full",
  "grid-body-limbs": "list-body-parts-full",
  "grid-family-nuclear": "list-family-members",
  "grid-family-extended": "list-family-members",
  "grid-symptoms-common": "list-symptoms-body-order",
  "grid-five-senses": "list-body-parts-full",
};

/** 16-cell grids that duplicate an existing 9-cell theme. */
const GRID_16_DUPLICATE_OF = {
  "grid-office-supplies-16": "grid-office-supplies",
  "grid-kitchen-16": "grid-kitchen-tools",
  "grid-school-16": "grid-classroom-objects",
  "grid-clothing-16": "grid-tops-clothing",
  "grid-nature-16": "grid-landscape-features",
};

/** Weak antonym pairs — not clean opposites or overlap another pair. */
const WEAK_ANTONYM_SLUGS = new Set([
  "borrow-return", // overlaps lend-borrow
  "early-bird-night-owl", // idioms, not single words
  "literary-spoken", // register lecture, not vocab pair
  "singular-plural", // grammar concept
  "thirsty-hydrated", // asymmetric register
  "loud-silent-place", // phrase not word pair
  "success-fail", // nouns/verbs mixed
  "honest-dishonest", // rare in beginner IG
  "employed-unemployed",
  "married-single",
  "urban-rural",
  "north-south",
  "east-west",
  "public-private",
  "local-foreign",
]);

/** Antonym duplicates with grid adjective bundles. */
const ANT_GRID_OVERLAP = new Set([
  "ant-sweet-salty",
  "ant-sweet-bitter",
  "ant-spicy-mild",
  "ant-smooth-rough-touch",
  "ant-soft-hard-touch",
]);

/** Super lists: wrong format or too niche / hard to illustrate. */
const SUPER_LIST_DROP_OR_REVIEW = new Set([
  "list-weekdays", // count 7 < 9
  "list-seasons", // count 4 < 9
  "list-hangul-double-consonants", // count 5 < 9
  "list-seoul-districts", // 25 rows — readability
  "list-kpop-generations", // meta slang, weak order
  "list-zodiac-signs-western", // niche
  "list-currency-world-major", // not Korean-focused
  "list-math-symbols-words",
  "list-percent-fraction-words",
  "list-romanization-guide", // text-heavy rules
  "list-keyboard-hangul-layout",
  "list-shopping-phrases-short", // phrases not list anchor
  "list-decades-centuries",
]);

/** Super list overlap — two number bundles too similar. */
const SUPER_LIST_MERGE_CANDIDATES = [
  ["list-numbers-tens", "list-numbers-powers-ten", "merge into one numbers ladder"],
  ["list-counting-practice-1-12", "list-numbers-1-20", "overlap beginner counting"],
  ["list-counters-people-objects", "list-counters-common", "split or merge counters"],
  ["list-colors-extended", "list-colors-basic", "one colors list with tiers"],
];

/** Phrase bundles in grid — better as super_list or 4-cell only. */
const GRID_PHRASE_9CELL = new Set([
  "grid-greetings-social",
  "grid-courtesy-polite",
  "grid-compliment-phrases",
  "grid-friendship-words",
  "grid-dating-words",
]);

/** titleCase artifacts — slug ends with -adj or -verbs in title awkwardly. */
function hasAwkwardTitle(b) {
  return (
    /\bAdj in Korean$/i.test(b.title) ||
    /\bVerbs in Korean$/i.test(b.title) ||
    /\bKorean in Korean/i.test(b.title) ||
    /Bugs Kids Learn/i.test(b.title) ||
    /Eco Green Living/i.test(b.title)
  );
}

/** Semantic slug families for overlap detection within grid. */
function slugStem(slug) {
  return slug.replace(/^grid-/, "").replace(/-16$/, "").replace(/-(verbs|adj)$/, "");
}

for (const b of ALL_VOCAB_BUNDLES) {
  const slug = b.id.replace(/^(grid|ant|list)-/, "");

  if (b.format === "super_list" && b.count < SUPER_LIST_MIN) {
    flag(b, "reformat", `super_list has ${b.count} items (min ${SUPER_LIST_MIN})`, "merge with related rows or move to grid 4-cell");
  }

  if (b.format === "grid_cluster") {
    if (GRID_ABSTRACT_SLUGS.has(slug)) {
      flag(b, "drop", "abstract/grammar/meta — hard to illustrate in 9 icon cells", "drop or move to text-only super_list");
    }
    if (GRID_PHRASE_9CELL.has(b.id)) {
      flag(b, "reformat", "9 phrase lines don't fit grid pattern (meant for single words + icons)", "super_list or 4-cell phrase card");
    }
    if (GRID_SUPER_OVERLAP[b.id]) {
      flag(b, "merge", `body/family topic already in ${GRID_SUPER_OVERLAP[b.id]}`, "drop grid split, keep super_list");
    }
    if (GRID_16_DUPLICATE_OF[b.id]) {
      flag(b, "drop", `16-cell duplicate of ${GRID_16_DUPLICATE_OF[b.id]}`, "drop extended unless unique items defined");
    }
    if (slug.includes("insects") && ALL_VOCAB_BUNDLES.some((x) => x.id === "grid-bugs-kids-learn")) {
      if (b.id === "grid-insects-garden" || b.id === "grid-insects-household") {
        flag(b, "merge", "insect bundles overlap bugs-kids-learn", "one insects bundle");
      }
    }
    if (hasAwkwardTitle(b)) {
      flag(b, "rename", "auto titleCase title reads awkward", "hand-write title e.g. Taste words in Korean");
    }
    if (b.id === "grid-emoji-feelings-16") {
      flag(b, "review", "emoji feelings — unclear if 16 distinct learnable words", "define word list or drop");
    }
    if (b.id === "grid-dinosaurs") {
      flag(b, "review", "niche topic, low Korean learner demand", "low priority or drop");
    }
    if (b.id === "grid-pet-supplies" || b.id === "grid-pet-home-items") {
      flag(b, "merge", "pet-related grids overlap", "one pet supplies bundle");
    }
    if (
      b.id === "grid-beach-nature" ||
      b.id === "grid-beach-travel" ||
      b.id === "grid-camping-outdoors" ||
      b.id === "grid-camping-hobby"
    ) {
      flag(b, "merge", "beach/camping split across nature + travel + hobby", "consolidate");
    }
    if (b.id === "grid-photography-digital" || b.id === "grid-photography-hobby") {
      flag(b, "merge", "duplicate photography theme", "one bundle");
    }
    if (b.id === "grid-daily-routine-verbs" && ALL_VOCAB_BUNDLES.some((x) => x.id === "grid-morning-routine-verbs")) {
      flag(b, "merge", "daily vs morning routine verbs overlap", "one routine verbs bundle");
    }
    if (b.id === "grid-chuseok-words" || b.id === "grid-seollal-words") {
      if (ALL_VOCAB_BUNDLES.some((x) => x.id === "grid-holidays-korean")) {
        flag(b, "merge", "holiday sub-bundles overlap holidays-korean", "one holidays grid or super_list");
      }
    }
    if (b.id === "grid-taste-flavor-adj") {
      flag(b, "merge", "taste adjectives overlap food learner sets", "keep one taste grid; ant pairs for pairs");
    }
    if (b.id === "grid-weather-adj" && ALL_VOCAB_BUNDLES.some((x) => x.id === "grid-weather-events")) {
      flag(b, "review", "weather adj vs weather events — different POS but confusing", "rename clearly");
    }
  }

  if (b.format === "antonym_split") {
    if (WEAK_ANTONYM_SLUGS.has(slug)) {
      flag(b, "drop", "weak antonym pair for IG vocab card", "drop");
    }
    if (ANT_GRID_OVERLAP.has(b.id)) {
      flag(b, "merge", "taste/texture antonyms overlap grid_cluster adjective sets", "pick one format");
    }
    if (b.id === "ant-full-empty" && ALL_VOCAB_BUNDLES.some((x) => x.id === "ant-full-hungry")) {
      flag(b, "review", "full/empty vs full/hungry — confusing full", "rename Korean gloss");
    }
    if (b.id === "ant-heavy-light-weight") {
      flag(b, "review", "light = weight vs light = brightness elsewhere", "disambiguate in title");
    }
  }

  if (b.format === "super_list") {
    if (SUPER_LIST_DROP_OR_REVIEW.has(b.id)) {
      const reason =
        b.count < SUPER_LIST_MIN
          ? `count ${b.count} below super_list minimum`
          : "niche, text-heavy, or weak ordering key";
      flag(b, "drop", reason, "drop, merge, or pad to 9+ with related items");
    }
    if (b.id === "list-money-krw" && b.count === 8) {
      flag(b, "review", "8 denominations — pad to 9 or accept as exception", "add 원 or coinless 1원");
    }
  }
}

for (const [a, b, note] of SUPER_LIST_MERGE_CANDIDATES) {
  const ba = ALL_VOCAB_BUNDLES.find((x) => x.id === `list-${a}` || x.id === a);
  const bb = ALL_VOCAB_BUNDLES.find((x) => x.id === `list-${b}` || x.id === b);
  if (ba && bb) {
    flag(ba, "merge", note, `merge with ${bb.id}`);
  }
}

// Stem overlap within grid (e.g. fruits-* too many)
const gridByStem = new Map();
for (const b of ALL_VOCAB_BUNDLES.filter((x) => x.format === "grid_cluster")) {
  const stem = slugStem(b.id);
  const family = stem.split("-")[0];
  if (!gridByStem.has(family)) gridByStem.set(family, []);
  gridByStem.get(family).push(b);
}
for (const [family, bundles] of gridByStem) {
  if (bundles.length >= 5 && ["fruits", "vegetables", "jobs", "sports"].includes(family)) {
    for (const b of bundles) {
      if (!issues.some((i) => i.id === b.id)) {
        flag(b, "review", `${family} split into ${bundles.length} grids — risk of filler overlap`, "keep 2–3 best, merge rest");
      }
    }
  }
}

const bySeverity = {
  drop: issues.filter((i) => i.severity === "drop"),
  reformat: issues.filter((i) => i.severity === "reformat"),
  merge: issues.filter((i) => i.severity === "merge"),
  rename: issues.filter((i) => i.severity === "rename"),
  review: issues.filter((i) => i.severity === "review"),
};

const uniqueFlagged = new Set(issues.map((i) => i.id));
const clean = ALL_VOCAB_BUNDLES.filter((b) => !uniqueFlagged.has(b.id));
const dropIds = new Set(bySeverity.drop.map((i) => i.id));

const report = {
  validated: validateBundleCatalog(300),
  summary: {
    total: ALL_VOCAB_BUNDLES.length,
    flagged: uniqueFlagged.size,
    bySeverity: Object.fromEntries(
      Object.entries(bySeverity).map(([k, v]) => [k, v.length]),
    ),
    estimatedAfterDrop: ALL_VOCAB_BUNDLES.length - dropIds.size,
    cleanUnflagged: clean.length,
  },
  issues: bySeverity,
};

const outDir = join(ROOT, ".tmp");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "vocab-bundle-audit.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report.summary, null, 2));
console.log(`\nFull report: ${outPath}`);
console.log("\n--- DROP (sample) ---");
for (const i of bySeverity.drop.slice(0, 15)) {
  console.log(`  ${i.id}: ${i.reason}`);
}
if (bySeverity.drop.length > 15) console.log(`  ... +${bySeverity.drop.length - 15} more`);
console.log("\n--- REFORMAT (sample) ---");
for (const i of bySeverity.reformat.slice(0, 10)) {
  console.log(`  ${i.id}: ${i.reason}`);
}
console.log("\n--- MERGE (sample) ---");
for (const i of bySeverity.merge.slice(0, 12)) {
  console.log(`  ${i.id}: ${i.reason}`);
}
