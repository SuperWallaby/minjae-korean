#!/usr/bin/env node
/**
 * Generate optimized logo, favicon, and OG assets from logo-app.png.
 * Usage: node scripts/generate-brand-assets.mjs
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "logo-app.png");
const BRAND = path.join(ROOT, "public", "brand");

/** Warm cream from the logo background */
const OG_BG = { r: 245, g: 235, b: 212 };

if (!fs.existsSync(SOURCE)) {
  console.error(`Missing source image: ${SOURCE}`);
  process.exit(1);
}

fs.mkdirSync(BRAND, { recursive: true });

const source = sharp(SOURCE).ensureAlpha();

async function writePng(bufferPipeline, outPath, label) {
  await bufferPipeline.clone().png({ compressionLevel: 9, effort: 10 }).toFile(outPath);
  const stat = fs.statSync(outPath);
  console.log(`  ${label}: ${path.basename(outPath)} (${Math.round(stat.size / 1024)} KB)`);
}

async function writeWebp(bufferPipeline, outPath, label, quality = 85) {
  await bufferPipeline.clone().webp({ quality, effort: 6 }).toFile(outPath);
  const stat = fs.statSync(outPath);
  console.log(`  ${label}: ${path.basename(outPath)} (${Math.round(stat.size / 1024)} KB)`);
}

async function resizeSquare(size) {
  return source.clone().resize(size, size, { fit: "cover" });
}

/** Keep circular avatar; make square corner background transparent. */
async function circularPng(size) {
  const r = size / 2;
  const mask = await sharp(
    Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
    ),
  )
    .ensureAlpha()
    .png()
    .toBuffer();
  return (await resizeSquare(size)).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]);
}

console.log("Generating brand assets from logo-app.png...\n");

await writePng(
  source.clone().png({ compressionLevel: 9, effort: 10 }),
  path.join(BRAND, "logo-app.png"),
  "source copy",
);

await writeWebp(await resizeSquare(80), path.join(BRAND, "logo.webp"), "navbar logo");
await writeWebp(await resizeSquare(96), path.join(BRAND, "logo-v2.webp"), "logo v2");
await writePng(await circularPng(96), path.join(BRAND, "logo-for-footer.png"), "footer logo");

const iconSizes = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["icon.png", 512],
];

for (const [name, size] of iconSizes) {
  await writePng(await resizeSquare(size), path.join(BRAND, name), `icon ${size}px`);
}

const logoOg = await resizeSquare(380);
const logoOgBuf = await logoOg.png().toBuffer();
const ogCanvas = sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: OG_BG,
  },
}).composite([{ input: logoOgBuf, gravity: "center" }]);

await writePng(ogCanvas, path.join(BRAND, "og.png"), "og png");
await writeWebp(ogCanvas, path.join(BRAND, "og.webp"), "og webp", 88);

try {
  execSync(
    `magick "${path.join(BRAND, "favicon-16x16.png")}" "${path.join(BRAND, "favicon-32x32.png")}" "${path.join(BRAND, "favicon.ico")}"`,
    { stdio: "inherit" },
  );
  const icoStat = fs.statSync(path.join(BRAND, "favicon.ico"));
  console.log(`  favicon.ico (${Math.round(icoStat.size / 1024)} KB)`);
} catch (e) {
  console.warn("  favicon.ico: skipped (ImageMagick not available)");
}

console.log("\nDone.");
