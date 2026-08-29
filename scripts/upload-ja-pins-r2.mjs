#!/usr/bin/env node
/**
 * Upload JA pin WebP (card + page) to R2 under ja/pins/.
 *
 *   node scripts/upload-ja-pins-r2.mjs
 *   node scripts/upload-ja-pins-r2.mjs --force
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { loadEnvLocal } from "./lib/env_local.mjs";
import { r2Client, r2PublicBase, hasR2Config } from "./lib/r2_upload.mjs";

loadEnvLocal();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "ja", "pins");
const force = process.argv.includes("--force");

if (!hasR2Config()) {
  console.error("Missing R2 env (R2_ACCOUNT_ID, keys, R2_BUCKET, R2_PUBLIC_BASE_URL)");
  process.exit(1);
}

const client = r2Client();
const bucket = process.env.R2_BUCKET.trim();
const base = r2PublicBase();

if (!fs.existsSync(DIR)) {
  console.log("no public/ja/pins — skip");
  process.exit(0);
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".webp"))
  .sort();

let uploaded = 0;
let skipped = 0;

for (const name of files) {
  const key = `ja/pins/${name}`;
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

console.log(`\ndone: uploaded=${uploaded} skipped=${skipped} total=${files.length}`);
console.log(`CDN base: ${base}/ja/pins/`);
