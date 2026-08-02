#!/usr/bin/env node
/**
 * Upload email-optimized welcome book cover JPEG to R2.
 *
 * Source is the large site PNG (1985x2807 ~3MB) → progressive JPEG ~420px wide.
 *
 *   node scripts/upload_newsletter_book_cover.mjs
 */
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import { hasR2Config, uploadBufferToR2 } from "./lib/r2_upload.mjs";

const SOURCE = path.join(ROOT, "public/book-samples/book-cover.png");
const KEY = "newsletter/welcome/book-cover-email.jpg";
const MAX_WIDTH = 420;
const QUALITY = 78;

async function main() {
  loadEnvLocal();
  if (!hasR2Config()) {
    throw new Error("Missing R2 env");
  }
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Missing source cover: ${SOURCE}`);
  }

  const jpeg = await sharp(fs.readFileSync(SOURCE))
    .rotate()
    .resize(MAX_WIDTH, null, {
      fit: "inside",
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({
      quality: QUALITY,
      progressive: true,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();

  const publicUrl = await uploadBufferToR2(KEY, jpeg, "image/jpeg");
  console.log(
    JSON.stringify(
      {
        ok: true,
        key: KEY,
        publicUrl,
        bytes: jpeg.length,
        kb: Math.round(jpeg.length / 1024),
        sourceBytes: fs.statSync(SOURCE).size,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
