#!/usr/bin/env node
/**
 * Convert PNGs in public/meme/offical/* to WebP with height 500px (aspect ratio maintained).
 * Usage: node scripts/convert-meme-official-webp.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT_DIR = path.join(ROOT, "public", "meme", "offical");
const HEIGHT = 500;

const files = fs.readdirSync(INPUT_DIR).filter((f) => f.toLowerCase().endsWith(".png"));

if (files.length === 0) {
  console.log("No PNG files in public/meme/offical/");
  process.exit(0);
}

console.log(`Converting ${files.length} PNG(s) to WebP (height=${HEIGHT}px)...\n`);

for (const file of files) {
  const inputPath = path.join(INPUT_DIR, file);
  const base = path.basename(file, ".png");
  const outputPath = path.join(INPUT_DIR, `${base}.webp`);

  try {
    const meta = await sharp(inputPath).metadata();
    const { width, height } = meta;
    if (!height || height === 0) {
      console.warn(`  Skip ${file}: no height`);
      continue;
    }
    const newWidth = Math.round((width ?? 0) * (HEIGHT / height));

    await sharp(inputPath)
      .resize(newWidth, HEIGHT, { fit: "inside", withoutEnlargement: false })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`  ${file} -> ${base}.webp (${width}x${height} -> ${newWidth}x${HEIGHT})`);
  } catch (err) {
    console.error(`  ${file}: ${err.message}`);
  }
}

console.log("\nDone.");
