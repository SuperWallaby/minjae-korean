#!/usr/bin/env node
/**
 * Batch-optimize vocab PNGs for Pinterest (no upload).
 *
 *   node scripts/optimize-pinterest-pins.mjs
 *   node scripts/optimize-pinterest-pins.mjs --id ant-inside-outside
 *   node scripts/optimize-pinterest-pins.mjs --limit 20
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  optimizePinterestPin,
  optimizedPinPath,
} from "./lib/optimize-pinterest-pin.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const PIN_OPT_DIR = path.join(OUT, "pin-optimized");

function parseArgs(argv) {
  let id = "";
  let limit = 0;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--limit" && argv[i + 1]) limit = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a.startsWith("--limit=")) limit = Math.max(0, parseInt(a.slice(8), 10) || 0);
  }
  return { id, limit };
}

async function main() {
  const { id, limit } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(OUT)) {
    throw new Error(`missing ${OUT}`);
  }

  let ids = id
    ? [id]
    : fs
        .readdirSync(OUT)
        .filter((f) => f.endsWith(".png") && !f.includes("_raw"))
        .map((f) => f.replace(/\.png$/i, ""));

  if (limit > 0) ids = ids.slice(0, limit);

  console.log(`optimize ${ids.length} pin(s) → ${PIN_OPT_DIR}`);
  let ok = 0;
  let failed = 0;
  let savedKb = 0;

  for (const bundleId of ids) {
    const src = path.join(OUT, `${bundleId}.png`);
    if (!fs.existsSync(src)) {
      console.error(`skip missing ${bundleId}`);
      failed += 1;
      continue;
    }
    try {
      const dest = optimizedPinPath(src, PIN_OPT_DIR);
      const r = await optimizePinterestPin(src, dest);
      savedKb += Math.max(0, r.inputKb - r.outputKb);
      console.log(
        `✓ ${bundleId} ${r.width}×${r.height} ${r.kind} ${r.inputKb}→${r.outputKb} KB`,
      );
      ok += 1;
    } catch (e) {
      console.error(`✗ ${bundleId}: ${e?.message || e}`);
      failed += 1;
    }
  }

  console.log(
    `\ndone ok=${ok} failed=${failed} saved≈${savedKb} KB (${(savedKb / 1024).toFixed(1)} MB)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
