#!/usr/bin/env node
/**
 * Copy article images from file.fancamrank.com → file.kajakorean.com (same key).
 *
 * Pass URLs as args, or pipe newline-separated URLs on stdin:
 *   node scripts/migrate-fancamrank-media-to-kaja-r2.mjs 'https://file.fancamrank.com/articles/foo.webp'
 *   rg -o 'https://file\.fancamrank\.com/[^"'\'' ]+' some.json | node scripts/migrate-fancamrank-media-to-kaja-r2.mjs
 */
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { loadEnvLocal } from "./lib/env_local.mjs";
import { r2Client, r2PublicBase, hasR2Config } from "./lib/r2_upload.mjs";

loadEnvLocal();

if (!hasR2Config()) {
  console.error("Missing R2 env");
  process.exit(1);
}

const client = r2Client();
const bucket = process.env.R2_BUCKET.trim();
const base = r2PublicBase();

async function readUrls() {
  const fromArgs = process.argv.slice(2).filter((a) => a.startsWith("http"));
  if (fromArgs.length) return fromArgs;
  if (process.stdin.isTTY) return [];
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks)
    .toString("utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http"));
}

const urls = [...new Set(await readUrls())];
if (!urls.length) {
  console.error("No fancamrank URLs provided");
  process.exit(1);
}

let ok = 0;
let skip = 0;
let fail = 0;

for (const url of urls) {
  let u;
  try {
    u = new URL(url);
  } catch {
    fail += 1;
    continue;
  }
  if (u.hostname !== "file.fancamrank.com") {
    console.warn("skip non-fancamrank", url);
    skip += 1;
    continue;
  }
  const key = u.pathname.replace(/^\//, "");
  if (!key) {
    fail += 1;
    continue;
  }

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`exists ${key}`);
    skip += 1;
    continue;
  } catch {
    /* upload */
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/webp";
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ContentType: ct,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    console.log(`copied ${key} → ${base}/${key}`);
    ok += 1;
  } catch (e) {
    console.error(`fail ${key}:`, e instanceof Error ? e.message : e);
    fail += 1;
  }
}

console.log(`done ok=${ok} skip=${skip} fail=${fail}`);
