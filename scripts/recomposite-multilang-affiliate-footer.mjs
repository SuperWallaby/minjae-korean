#!/usr/bin/env node
/**
 * Re-footer multilingual pins: strip kajakorean logo, apply affiliate CTA.
 * Uses *_raw.png (no GPT re-gen).
 *
 *   node scripts/recomposite-multilang-affiliate-footer.mjs
 *   node scripts/recomposite-multilang-affiliate-footer.mjs --lang es
 *   node scripts/recomposite-multilang-affiliate-footer.mjs --id 01_list-eye-colors__es
 *   node scripts/recomposite-multilang-affiliate-footer.mjs --dry-run
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { compositeAffiliateFooter } from "./lib/vocab-infographic-gen.mjs";
import { affiliateFooterCopy } from "./lib/global-pinterest-formats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-multilingual-top10");

function parseArgs(argv) {
  let dryRun = false;
  let onlyId = "";
  let onlyLang = "";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--id=")) onlyId = a.slice(5);
    else if (a === "--lang" && argv[i + 1]) onlyLang = argv[++i];
    else if (a.startsWith("--lang=")) onlyLang = a.slice(7);
  }
  return { dryRun, onlyId, onlyLang };
}

function langFromId(id) {
  const m = String(id).match(/__([a-z]{2})$/i);
  return m ? m[1].toLowerCase() : "";
}

async function main() {
  const { dryRun, onlyId, onlyLang } = parseArgs(process.argv.slice(2));
  if (!existsSync(OUT)) {
    console.error(`missing ${OUT}`);
    process.exit(1);
  }

  const raws = readdirSync(OUT)
    .filter((f) => f.endsWith("_raw.png"))
    .map((f) => f.replace(/_raw\.png$/, ""))
    .filter((id) => !onlyId || id === onlyId)
    .filter((id) => !onlyLang || langFromId(id) === onlyLang.toLowerCase())
    .sort();

  console.log(
    `==> multilang affiliate footer recompose count=${raws.length} dryRun=${dryRun}`,
  );

  let ok = 0;
  let fail = 0;
  for (const id of raws) {
    const lang = langFromId(id);
    const cta = affiliateFooterCopy(lang);
    const rawPath = join(OUT, `${id}_raw.png`);
    const outPath = join(OUT, `${id}.png`);
    console.log(`  ${id} → ${cta.line1} / ${cta.line2}`);
    if (dryRun) {
      ok++;
      continue;
    }
    try {
      const raw = readFileSync(rawPath);
      const branded = await compositeAffiliateFooter(raw, {
        line1: cta.line1,
        line2: cta.line2,
        rtl: cta.rtl,
        chicoCredit: false,
      });
      writeFileSync(outPath, branded);
      // keep meta in sync if present
      const metaPath = join(OUT, `${id}.json`);
      if (existsSync(metaPath)) {
        try {
          const meta = JSON.parse(readFileSync(metaPath, "utf8"));
          meta.footer = {
            kind: "affiliate_cta",
            ...cta,
            at: new Date().toISOString(),
          };
          delete meta.cast; // leave cast; just stamp footer
          meta.footerKind = "affiliate_cta";
          writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        } catch {
          /* ignore meta write */
        }
      }
      ok++;
    } catch (e) {
      fail++;
      console.error(`  FAIL ${id}: ${e?.message || e}`);
    }
  }
  console.log(`==> done ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
