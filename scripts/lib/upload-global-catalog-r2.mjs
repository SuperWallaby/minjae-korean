/**
 * Put live getpronounce catalog JSON on R2 (index + per-lang shards).
 * Pin pages fetch `global/catalog/{lang}.json` with ISR ~60s.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { loadEnvLocal } from "./env_local.mjs";
import { r2Client, r2PublicBase, hasR2Config } from "./r2_upload.mjs";

loadEnvLocal();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG = path.join(ROOT, "src", "data", "globalPins", "published.json");
const CATALOG_KEY = "global/catalog/published.json";
const INDEX_KEY = "global/catalog/index.json";
const CATALOG_CACHE =
  "public, max-age=60, s-maxage=60, stale-while-revalidate=300";

function listingFromPage(p) {
  return {
    id: p.id,
    lang: p.lang,
    langName: p.langName,
    titleEn: p.titleEn,
    slug: p.slug,
    imagePath: p.imagePath,
    ...(p.topicSlug ? { topicSlug: p.topicSlug } : {}),
    ...(p.publishedAt ? { publishedAt: p.publishedAt } : {}),
  };
}

function langCode(raw) {
  const c = String(raw || "")
    .trim()
    .toLowerCase();
  return /^[a-z]{2,8}$/.test(c) ? c : "";
}

export async function uploadGlobalCatalogJson(opts = {}) {
  const root = opts.root || ROOT;
  const file = path.join(root, "src", "data", "globalPins", "published.json");
  if (!hasR2Config()) {
    console.warn("R2 not configured — skip catalog upload");
    return false;
  }
  if (!fs.existsSync(file)) {
    console.warn(`missing catalog ${file}`);
    return false;
  }

  const raw = fs.readFileSync(file, "utf8");
  const cat = JSON.parse(raw);
  const pages = Array.isArray(cat.pages) ? cat.pages : [];
  const allLangs = [
    ...new Set(pages.map((p) => langCode(p.lang)).filter(Boolean)),
  ].sort();
  const want = Array.isArray(opts.langs) && opts.langs.length
    ? [...new Set(opts.langs.map(langCode).filter(Boolean))]
    : allLangs;

  const client = r2Client();
  const bucket = process.env.R2_BUCKET.trim();
  const base = r2PublicBase();

  async function putJson(key, body) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "application/json; charset=utf-8",
        CacheControl: CATALOG_CACHE,
      }),
    );
    console.log(
      `put ${key} (${Math.round(body.length / 1024)}KB) → ${base}/${key}`,
    );
  }

  if (!opts.skipIndex) {
    const index = {
      version: cat.version ?? 1,
      generatedAt: cat.generatedAt,
      site: cat.site,
      languages: cat.languages || allLangs.map((code) => ({ code, name: code })),
      pages: pages.map(listingFromPage),
    };
    await putJson(INDEX_KEY, Buffer.from(JSON.stringify(index), "utf8"));
  }

  for (const lang of want) {
    const shard = {
      version: cat.version ?? 1,
      generatedAt: cat.generatedAt,
      site: cat.site,
      languages: cat.languages || [],
      pages: pages.filter((p) => langCode(p.lang) === lang),
    };
    await putJson(
      `global/catalog/${lang}.json`,
      Buffer.from(JSON.stringify(shard), "utf8"),
    );
  }

  if (!opts.skipMonolith) {
    await putJson(CATALOG_KEY, Buffer.from(raw, "utf8"));
  }
  return true;
}

export { CATALOG, CATALOG_KEY, INDEX_KEY, ROOT };
