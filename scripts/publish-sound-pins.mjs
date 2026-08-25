#!/usr/bin/env node
/**
 * Publish EN→EN warehouse pins into the EigoSound catalog.
 *
 *   SRC  .tmp/en-en-samples/{id}.png (+ optional {id}.json)
 *   OUT  public/sound/pins/{id}.png|.webp|.card.webp
 *        src/data/soundPins/published.json
 *
 *   node scripts/publish-sound-pins.mjs
 *   node scripts/publish-sound-pins.mjs --new-only --limit 6
 *   node scripts/publish-sound-pins.mjs --ids en_upgrade__filthy,en_other__dont-like-it
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { optimizeGlobalPinWeb } from "./lib/optimize-global-pin-web.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, ".tmp", "en-en-samples");
const OUT_IMG = path.join(ROOT, "public", "sound", "pins");
const OUT_JSON = path.join(ROOT, "src", "data", "soundPins", "published.json");
const QUEUE_TS = path.join(ROOT, "scripts", "data", "en-en-queue-jobs.ts");

const SOUND_SITE = (
  process.env.NEXT_PUBLIC_SOUND_SITE_ORIGIN ||
  process.env.SOUND_SITE_URL ||
  "https://sound.eigopin.com"
).replace(/\/+$/, "");

function parseList(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  let limit = 0;
  let newOnly = false;
  let ids = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--new-only") newOnly = true;
    else if (a === "--limit" && argv[i + 1])
      limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a.startsWith("--limit="))
      limit = Math.max(0, Number(a.slice(8)) || 0);
    else if (a === "--ids" && argv[i + 1]) ids = parseList(argv[++i]);
    else if (a.startsWith("--ids=")) ids = parseList(a.slice(6));
  }
  return { limit, newOnly, ids };
}

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "pin"
  );
}

function strField(body, key) {
  const hit = body.match(new RegExp(`${key}:\\s*"((?:\\\\.|[^"\\\\])*)"`));
  return hit ? hit[1].replace(/\\"/g, '"') : "";
}

/** Lightweight parse of EN_EN_QUEUE_JOBS from the TS source (no tsx required). */
function loadQueueJobs() {
  if (!fs.existsSync(QUEUE_TS)) return [];
  const src = fs.readFileSync(QUEUE_TS, "utf8");
  const jobs = [];
  const blockRe =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?format:\s*"([^"]+)"[\s\S]*?topicSlug:\s*"([^"]+)"([\s\S]*?)(?=\n  \{|\n\];)/g;
  let m;
  while ((m = blockRe.exec(src))) {
    const id = m[1];
    const format = m[2];
    const topicSlug = m[3];
    const body = m[4] || "";
    const phrases = [];
    const ph = body.match(/phrases:\s*\[([\s\S]*?)\]/);
    if (ph) {
      for (const pm of ph[1].matchAll(/"((?:\\.|[^"\\])*)"/g)) {
        phrases.push(pm[1].replace(/\\"/g, '"'));
      }
    }
    jobs.push({
      id,
      format,
      topicSlug,
      simple: strField(body, "simple"),
      target: strField(body, "target"),
      headline: strField(body, "headline"),
      kicker: strField(body, "kicker"),
      label: strField(body, "label"),
      word: strField(body, "word"),
      definition: strField(body, "definition"),
      example: strField(body, "example"),
      phrases,
    });
  }
  return jobs;
}

function metaFromJob(job) {
  if (!job) return null;
  if (job.format === "simple_upgrade") {
    return {
      id: job.id,
      format: job.format,
      topicSlug: job.topicSlug,
      titleEn: `${job.simple} → ${job.target}`,
      words: [{ english: job.target, gloss: job.simple }],
    };
  }
  if (job.format === "other_ways") {
    return {
      id: job.id,
      format: job.format,
      topicSlug: job.topicSlug,
      titleEn: `Other ways to say ${job.headline}`,
      words: (job.phrases || []).map((p) => ({ english: p })),
      examples: job.headline
        ? [{ english: job.headline, gloss: job.kicker || "Other ways to say" }]
        : [],
    };
  }
  if (job.format === "slang_card") {
    return {
      id: job.id,
      format: job.format,
      topicSlug: job.topicSlug,
      titleEn: `${job.label}: ${job.word}`,
      words: [{ english: job.word, gloss: job.definition }],
      examples: job.example
        ? [{ english: job.example, gloss: job.definition }]
        : [],
      description: job.definition,
    };
  }
  return null;
}

function descriptionFor(page) {
  if (page.description) return String(page.description).trim();
  const words = (page.words || [])
    .map((w) => w.english)
    .filter(Boolean)
    .slice(0, 8);
  if (!words.length) return `English pronunciation chart — ${page.titleEn}`;
  return `Hear “${page.titleEn}”: ${words.join(", ")}${
    (page.words || []).length > 8 ? "…" : ""
  }. Female and male voices on EigoSound.`;
}

function keepTts(prev, nextEnglish, nextGloss) {
  if (!prev) return {};
  const same =
    String(prev.english || "").trim() === nextEnglish &&
    String(prev.gloss || "").trim() === String(nextGloss || "").trim();
  if (!same) return {};
  if (!(prev.ttsFemale || prev.ttsMale || prev.ttsUrl)) return {};
  return {
    ttsUrl: prev.ttsUrl || prev.ttsFemale,
    ttsFemale: prev.ttsFemale || prev.ttsUrl,
    ttsMale: prev.ttsMale,
    ttsProvider: prev.ttsProvider || "edge",
  };
}

const { limit, newOnly, ids: onlyIds } = parseArgs(process.argv.slice(2));

fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const existing = fs.existsSync(OUT_JSON)
  ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8"))
  : { pages: [] };
const prevPages = existing.pages || [];
const prevById = new Map(prevPages.map((p) => [p.id, p]));
const queueById = new Map(loadQueueJobs().map((j) => [j.id, j]));

const warehouse = [];
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith(".png") || f.includes("_art")) continue;
    const id = f.replace(/\.png$/i, "");
    const png = path.join(SRC, f);
    const metaPath = path.join(SRC, `${id}.json`);
    let meta = null;
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      } catch {
        meta = null;
      }
    }
    if (!meta?.id) meta = metaFromJob(queueById.get(id));
    if (!meta?.id) {
      // Layout-QA stress pins without queue: keep a minimal page.
      if (id.startsWith("en_")) {
        meta = {
          id,
          format: id.includes("other") ? "other_ways" : "simple_upgrade",
          topicSlug: "en-en",
          titleEn: id.replace(/^en_/, "").replace(/__/g, ": ").replace(/-/g, " "),
          words: [],
        };
      } else {
        console.warn(`  skip ${id} (no meta / queue job)`);
        continue;
      }
    }
    warehouse.push({ ...meta, id, _png: png });
  }
}
warehouse.sort((a, b) => String(a.id).localeCompare(String(b.id)));

let selected = warehouse;
if (onlyIds.length) {
  const want = new Set(onlyIds);
  selected = warehouse.filter((m) => want.has(m.id));
}
if (newOnly) selected = selected.filter((m) => !prevById.has(m.id));
if (limit > 0) selected = selected.slice(0, limit);

const pagesFromSrc = [];
for (const meta of selected) {
  const id = meta.id;
  const destPng = path.join(OUT_IMG, `${id}.png`);
  fs.copyFileSync(meta._png, destPng);
  try {
    await optimizeGlobalPinWeb(destPng);
  } catch (e) {
    console.warn(`webp skip ${id}:`, e instanceof Error ? e.message : e);
  }

  const prev = prevById.get(id) || {};
  const words = (meta.words || []).map((w, i) => {
    const english = String(w.english || "").trim();
    const gloss = String(w.gloss || "").trim();
    return {
      english,
      ...(gloss ? { gloss } : {}),
      ...keepTts(prev.words?.[i], english, gloss),
    };
  });

  const examples = (meta.examples || prev.examples || [])
    .map((ex, i) => {
      const english = String(ex.english || "").trim();
      if (!english) return null;
      const gloss = String(ex.gloss || "").trim();
      return {
        english,
        ...(gloss ? { gloss } : {}),
        ...keepTts(prev.examples?.[i], english, gloss),
      };
    })
    .filter(Boolean);

  const titleEn = String(meta.titleEn || prev.titleEn || id).trim();
  const slug = prev.slug || slugify(titleEn) || id;
  const page = {
    id,
    titleEn,
    slug,
    imagePath: `/sound/pins/${id}.png`,
    words,
    ...(examples.length ? { examples } : {}),
    description: descriptionFor({
      titleEn,
      words,
      description: meta.description || prev.description,
    }),
    partner: prev.partner || "preply",
    format: meta.format || prev.format || "",
    topicSlug: meta.topicSlug || prev.topicSlug || "",
    publishedAt: prev.publishedAt || new Date().toISOString(),
    ...(prev.pinterestPinnedAt
      ? { pinterestPinnedAt: prev.pinterestPinnedAt }
      : {}),
  };
  pagesFromSrc.push(page);

  const warehouseMeta = path.join(SRC, `${id}.json`);
  if (!fs.existsSync(warehouseMeta)) {
    fs.writeFileSync(
      warehouseMeta,
      JSON.stringify(
        {
          id,
          format: meta.format,
          topicSlug: meta.topicSlug,
          titleEn,
          words,
          examples,
          site: "sound.eigopin.com",
          product: "teach_english_in_english",
          at: new Date().toISOString(),
        },
        null,
        2,
      ) + "\n",
    );
  }
  console.log(`  + ${id}`);
}

const merged = new Map(prevPages.map((p) => [p.id, p]));
for (const p of pagesFromSrc) merged.set(p.id, p);
const pages = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id));

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  site: SOUND_SITE,
  teaches: "en",
  audience: "en",
  pages,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `published ${pages.length} sound pins (added/updated ${pagesFromSrc.length}) → ${OUT_JSON}`,
);
console.log(`site ${SOUND_SITE} · images ${OUT_IMG}`);
