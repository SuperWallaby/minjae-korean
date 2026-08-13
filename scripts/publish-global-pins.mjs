#!/usr/bin/env node
/**
 * Copy generated global pin PNGs + meta into the live catalog.
 *
 *   node scripts/publish-global-pins.mjs
 *   node scripts/publish-global-pins.mjs --src .tmp/global-lang-en-samples
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimizeGlobalPinWeb } from "./lib/optimize-global-pin-web.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, ".tmp", "global-lang-en-samples");
const OUT_IMG = path.join(ROOT, "public", "global", "pins");
const OUT_JSON = path.join(ROOT, "src", "data", "globalPins", "published.json");

const LANG_NAME = {
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  ar: "Arabic",
  ja: "Japanese",
};
const langOrder = ["es", "fr", "de", "it", "ar", "ja"];

fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const existing = fs.existsSync(OUT_JSON)
  ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8"))
  : { pages: [] };
const prevById = new Map(
  (existing.pages || []).map((p) => [p.id, p]),
);

const pages = [];
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".json")) continue;
  if (/progress|pinned|results/i.test(f)) continue;
  const meta = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
  const id = meta.id;
  if (!id) continue;
  const png = path.join(SRC, `${id}.png`);
  if (!fs.existsSync(png)) continue;
  const destPng = path.join(OUT_IMG, `${id}.png`);
  fs.copyFileSync(png, destPng);
  try {
    await optimizeGlobalPinWeb(destPng);
  } catch (e) {
    console.warn(`webp skip ${id}:`, e instanceof Error ? e.message : e);
  }
  const prev = prevById.get(id) || {};
  const words = (meta.words || []).map((w, i) => {
    const pw = prev.words?.[i];
    const same =
      pw &&
      pw.target === (w.target || "") &&
      pw.english === (w.english || "");
    return {
      english: w.english || "",
      target: w.target || "",
      romanization: w.romanization || "",
      ...(same && pw?.ttsUrl
        ? { ttsUrl: pw.ttsUrl, ttsProvider: pw.ttsProvider }
        : {}),
    };
  });
  const partner =
    String(meta.footer?.partner || "preply").toLowerCase() === "italki"
      ? "italki"
      : "preply";
  const titleEn = meta.titleEn || id;
  const slug = String(titleEn)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const langName = meta.langName || LANG_NAME[meta.lang] || meta.lang;
  pages.push({
    id,
    lang: meta.lang,
    langName,
    titleEn,
    slug,
    imagePath: `/global/pins/${id}.png`,
    words,
    ...(prev.examples?.length ? { examples: prev.examples } : {}),
    ...(prev.explanationEn ? { explanationEn: prev.explanationEn } : {}),
    partner,
    description:
      prev.description ||
      `Learn ${langName} vocabulary: ${words
        .slice(0, 6)
        .map((w) => w.english)
        .filter(Boolean)
        .join(", ")}${words.length > 6 ? "…" : ""}. Save-friendly chart with pronunciation.`,
    topicSlug:
      meta.topicSlug ||
      String(id)
        .split("__")[0]
        ?.replace(/^\d+_/, "") ||
      "",
    publishedAt: meta.at || prev.publishedAt || new Date().toISOString(),
  });
}

pages.sort((a, b) => {
  const ia = langOrder.indexOf(a.lang);
  const ib = langOrder.indexOf(b.lang);
  if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  return a.id.localeCompare(b.id);
});

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  site: "https://global.kajakorean.com",
  languages: langOrder.map((code) => ({ code, name: LANG_NAME[code] })),
  pages,
};

// Avoid churning generatedAt (and useless git noise) when content is unchanged.
let prevCatalog = null;
try {
  prevCatalog = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
} catch {
  /* first publish */
}
const stripTs = (c) => {
  if (!c || typeof c !== "object") return c;
  const { generatedAt: _g, ...rest } = c;
  return rest;
};
if (
  prevCatalog &&
  JSON.stringify(stripTs(prevCatalog)) === JSON.stringify(stripTs(catalog))
) {
  console.log(
    `published ${pages.length} global pins (unchanged, skip write) → ${OUT_JSON}`,
  );
} else {
  fs.writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2));
  console.log(`published ${pages.length} global pins → ${OUT_JSON}`);
}
