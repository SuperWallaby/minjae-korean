#!/usr/bin/env node
/**
 * Copy warehouse pin PNGs + meta into the live catalog.
 *
 *   node scripts/publish-ja-en-pins.mjs
 *   node scripts/publish-ja-en-pins.mjs --new-only --limit 6
 *   node scripts/publish-ja-en-pins.mjs --ids id1,id2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimizeGlobalPinWeb } from "./lib/optimize-global-pin-web.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, ".tmp", "ja-en-samples");
const OUT_IMG = path.join(ROOT, "public", "ja", "pins");
const OUT_JSON = path.join(ROOT, "src", "data", "jaPins", "published.json");

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
    else if (a === "--limit" && argv[i + 1]) limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a.startsWith("--limit=")) limit = Math.max(0, Number(a.slice(8)) || 0);
    else if (a === "--ids" && argv[i + 1]) ids = parseList(argv[++i]);
    else if (a.startsWith("--ids=")) ids = parseList(a.slice(6));
  }
  return { limit, newOnly, ids };
}

const { limit, newOnly, ids: onlyIds } = parseArgs(process.argv.slice(2));

fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const existing = fs.existsSync(OUT_JSON)
  ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8"))
  : { pages: [] };
const prevPages = existing.pages || [];
const prevById = new Map(prevPages.map((p) => [p.id, p]));

const skipMeta = /progress|pinned|results|queue/i;
const warehouse = [];
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith(".json") || skipMeta.test(f)) continue;
    const meta = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
    if (!meta.id) continue;
    if (!fs.existsSync(path.join(SRC, `${meta.id}.png`))) continue;
    warehouse.push(meta);
  }
}
warehouse.sort((a, b) => String(a.id).localeCompare(String(b.id)));

let selected = warehouse;
if (onlyIds.length) {
  const want = new Set(onlyIds);
  selected = warehouse.filter((m) => want.has(m.id));
}
if (newOnly) {
  selected = selected.filter((m) => !prevById.has(m.id));
}
if (limit > 0) selected = selected.slice(0, limit);

const pagesFromSrc = [];
for (const meta of selected) {
  const id = meta.id;
  const png = path.join(SRC, `${id}.png`);
  const destPng = path.join(OUT_IMG, `${id}.png`);
  fs.copyFileSync(png, destPng);
  try {
    await optimizeGlobalPinWeb(destPng);
  } catch (e) {
    console.warn(`webp skip ${id}:`, e instanceof Error ? e.message : e);
  }
  const prev = prevById.get(id) || {};
  const words = (meta.words || []).map((w, i) => {
    const english = w.english || w.english || "";
    const ja = w.ja || "";
    const pw = prev.words?.[i];
    const same = pw && (pw.english || pw.english) === english && pw.ja === ja;
    return {
      english,
      ja,
      kana: w.kana || w.kana || "",
      ...(same && (pw?.ttsUrl || pw?.ttsUs)
        ? {
            ttsUrl: pw.ttsUrl || pw.ttsUs,
            ttsUs: pw.ttsUs || pw.ttsUrl,
            ttsUk: pw.ttsUk,
            ttsAu: pw.ttsAu,
            ttsProvider: pw.ttsProvider || "edge",
          }
        : {}),
    };
  });
  const partner =
    String(meta.footer?.partner || prev.partner || "italki").toLowerCase() === "preply"
      ? "preply"
      : "italki";
  const titleJa = meta.titleJa || meta.titleJa || id;
  const titleEn = meta.titleEn || meta.titleEn || titleJa;
  const slug =
    prev.slug ||
    String(titleEn)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    id;
  pagesFromSrc.push({
    id,
    slug,
    titleJa,
    titleEn,
    imagePath: `/ja/pins/${id}.png`,
    words,
    ...(prev.examples?.length ? { examples: prev.examples } : {}),
    ...(prev.explanationJa || prev.explanationJa
      ? { explanationJa: prev.explanationJa || prev.explanationJa }
      : {}),
    partner,
    description:
      prev.description ||
      `日本人向け英単語チャート：${words
        .slice(0, 6)
        .map((w) => w.english)
        .filter(Boolean)
        .join("、")}${words.length > 6 ? "…" : ""}。サイトで音声を聞けます。`,
    topicSlug:
      meta.topicSlug ||
      meta.topicSlug ||
      String(id).split("__")[0]?.replace(/^\d+_/, "") ||
      "",
    withCharacter: Boolean(
      meta.mascot ||
        meta.withCharacter ||
        meta.cuteCast === "capybara" ||
        prev.withCharacter,
    ),
    publishedAt: meta.at || prev.publishedAt || new Date().toISOString(),
  });
  console.log(`  + ${id}`);
}

const merged = new Map(prevPages.map((p) => [p.id, p]));
for (const p of pagesFromSrc) merged.set(p.id, p);
const pages = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id));

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  site: process.env.NEXT_PUBLIC_JA_SITE_ORIGIN || "https://eigopin.com",
  audience: "ja",
  teaches: "en",
  pages,
};

let prevCatalog = null;
try {
  prevCatalog = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
} catch {
  /* first */
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
  console.log(`published ${pages.length} ja-en pins (unchanged) → ${OUT_JSON}`);
} else {
  fs.writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2) + "\n");
  console.log(
    `published ${pages.length} ja-en pins (added ${pagesFromSrc.length}) → ${OUT_JSON}`,
  );
}

if (pagesFromSrc.length && process.env.JA_EN_SKIP_R2 !== "1") {
  const { spawnSync } = await import("node:child_process");
  const up = spawnSync(process.execPath, [path.join(ROOT, "scripts", "upload-ja-pins-r2.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (up.status !== 0) {
    console.warn("upload-ja-pins-r2 failed — live thumbs stay on last R2 set");
  }
}
