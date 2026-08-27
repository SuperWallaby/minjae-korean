#!/usr/bin/env node
/**
 * Publish getpronounce.net warehouse → catalog + public/pronounce/pins
 *
 *   node scripts/publish-pronounce-pins.mjs
 *   node scripts/publish-pronounce-pins.mjs --new-only --limit 8
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimizeGlobalPinWeb } from "./lib/optimize-global-pin-web.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, ".tmp", "zh-pronounce-samples");
const OUT_IMG = path.join(ROOT, "public", "pronounce", "pins");
const OUT_JSON = path.join(ROOT, "src", "data", "pronouncePins", "published.json");

const SITE = (
  process.env.NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN ||
  process.env.PRONOUNCE_SITE_URL ||
  "https://getpronounce.net"
).replace(/\/+$/, "");

function parseArgs(argv) {
  let limit = 0;
  let newOnly = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--new-only") newOnly = true;
    else if (argv[i] === "--limit" && argv[i + 1])
      limit = Math.max(0, Number(argv[++i]) || 0);
  }
  return { limit, newOnly };
}

fs.mkdirSync(OUT_IMG, { recursive: true });
const existing = fs.existsSync(OUT_JSON)
  ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8"))
  : { pages: [] };
const prevById = new Map((existing.pages || []).map((p) => [p.id, p]));
const { limit, newOnly } = parseArgs(process.argv.slice(2));

const pagesFromSrc = [];
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith(".json") || /progress|pinned/i.test(f)) continue;
    const meta = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
    const id = meta.id;
    if (!id) continue;
    if (newOnly && prevById.has(id)) continue;
    const png = path.join(SRC, `${id}.png`);
    if (!fs.existsSync(png)) continue;
    const destPng = path.join(OUT_IMG, `${id}.png`);
    fs.copyFileSync(png, destPng);
    try {
      await optimizeGlobalPinWeb(destPng);
    } catch (e) {
      console.warn(`webp skip ${id}:`, e.message);
    }
    const prev = prevById.get(id) || {};
    const words = (meta.words || []).map((w, i) => {
      const pw = prev.words?.[i];
      const same =
        pw &&
        pw.chinese === w.chinese &&
        pw.english === w.english;
      return {
        chinese: w.chinese || "",
        pinyin: w.pinyin || "",
        english: w.english || "",
        ...(same && pw?.ttsFemaleCn
          ? {
              ttsUrl: pw.ttsUrl,
              ttsFemaleCn: pw.ttsFemaleCn,
              ttsMaleCn: pw.ttsMaleCn,
              ttsFemaleTw: pw.ttsFemaleTw,
              ttsMaleTw: pw.ttsMaleTw,
              ttsFemaleHk: pw.ttsFemaleHk,
              ttsMaleHk: pw.ttsMaleHk,
              ttsProvider: pw.ttsProvider,
            }
          : {}),
      };
    });
    pagesFromSrc.push({
      id,
      titleEn: meta.titleEn || id,
      slug: meta.slug || id.replace(/^zh_word__/, ""),
      imagePath: `/pronounce/pins/${id}.png`,
      words,
      description:
        prev.description ||
        `Hear how to pronounce ${words[0]?.chinese || "Chinese"} (${words[0]?.pinyin || ""}) — CN / TW / HK voices on GetPronounce.`,
      format: meta.format || "zh_word",
      topicSlug: meta.topicSlug || "",
      publishedAt: prev.publishedAt || meta.at || new Date().toISOString(),
    });
    console.log(`  + ${id}`);
  }
}

let selected = pagesFromSrc;
if (limit > 0) selected = selected.slice(0, limit);

const merged = new Map((existing.pages || []).map((p) => [p.id, p]));
for (const p of selected) merged.set(p.id, p);

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  site: SITE,
  teaches: "zh",
  audience: "en",
  pages: [...merged.values()].sort((a, b) => a.id.localeCompare(b.id)),
};

fs.writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `published ${catalog.pages.length} pronounce pins (+${selected.length}) → ${OUT_JSON}`,
);
