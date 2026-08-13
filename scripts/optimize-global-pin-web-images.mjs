#!/usr/bin/env node
/**
 * Build listing + detail WebP next to public/global/pins/*.png
 *
 *   node scripts/optimize-global-pin-web-images.mjs
 *   node scripts/optimize-global-pin-web-images.mjs --force
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimizeGlobalPinWeb } from "./lib/optimize-global-pin-web.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "global", "pins");
const force = process.argv.includes("--force");

const pngs = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".png"))
  .map((f) => path.join(DIR, f));

let cardKb = 0;
let pageKb = 0;
let inputKb = 0;
let wrote = 0;

for (const png of pngs) {
  const r = await optimizeGlobalPinWeb(png, { force });
  inputKb += r.inputKb;
  cardKb += r.cardKb;
  pageKb += r.pageKb;
  if (r.wroteCard || r.wrotePage) wrote += 1;
  const name = path.basename(png);
  console.log(
    `${name}  ${r.inputKb}KB png → card ${r.cardKb}KB / page ${r.pageKb}KB${
      r.wroteCard || r.wrotePage ? "" : " (cached)"
    }`,
  );
}

console.log(
  `\n${pngs.length} pins (${wrote} written)\n` +
    `  png  ${(inputKb / 1024).toFixed(1)} MB\n` +
    `  card ${(cardKb / 1024).toFixed(1)} MB\n` +
    `  page ${(pageKb / 1024).toFixed(1)} MB`,
);
