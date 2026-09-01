#!/usr/bin/env node
/**
 * Upload global pin WebP + live catalog JSON to R2.
 *
 *   node scripts/upload-global-pins-r2.mjs
 *   node scripts/upload-global-pins-r2.mjs --force
 *   node scripts/upload-global-pins-r2.mjs --catalog-only
 *
 * Catalog:
 *   global/catalog/index.json     — languages + listing rows (home/sitemap)
 *   global/catalog/{lang}.json    — full pins for one language
 *   global/catalog/published.json — legacy monolith (old deploys)
 * Images:  global/pins/*.webp (immutable)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { loadEnvLocal } from "./lib/env_local.mjs";
import { r2Client, r2PublicBase, hasR2Config } from "./lib/r2_upload.mjs";
import { uploadGlobalCatalogJson } from "./lib/upload-global-catalog-r2.mjs";

loadEnvLocal();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "global", "pins");
const force = process.argv.includes("--force");
const catalogOnly = process.argv.includes("--catalog-only");

if (!hasR2Config()) {
  console.error("Missing R2 env (R2_ACCOUNT_ID, keys, R2_BUCKET, R2_PUBLIC_BASE_URL)");
  process.exit(1);
}

const client = r2Client();
const bucket = process.env.R2_BUCKET.trim();
const base = r2PublicBase();

let uploaded = 0;
let skipped = 0;

if (!catalogOnly && fs.existsSync(DIR)) {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".webp"))
    .sort();

  for (const name of files) {
    const key = `global/pins/${name}`;
    const local = path.join(DIR, name);
    if (!force) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        skipped += 1;
        continue;
      } catch {
        /* missing → upload */
      }
    }
    const body = fs.readFileSync(local);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    uploaded += 1;
    console.log(`put ${key} (${Math.round(body.length / 1024)}KB) → ${base}/${key}`);
  }
  console.log(`pins: uploaded=${uploaded} skipped=${skipped} total=${files.length}`);
} else if (!catalogOnly) {
  console.log("no public/global/pins — pin upload skip");
}

await uploadGlobalCatalogJson({ root: ROOT });
console.log(`\nCDN base: ${base}/global/`);
