#!/usr/bin/env node
/** Recompose EN→EN pins from existing *_art.png after layout tweaks (no GPT). */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  composeOtherWaysPin,
  composeSimpleUpgradePin,
  pickOtherWaysPalette,
  pickSimpleUpgradeBg,
} from "./lib/en-en-pin-formats.mjs";
import { compositeListenCtaOnly } from "./lib/vocab-infographic-gen.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "en-en-samples");
const CTA = "Listen on website";

async function main() {
  const files = readdirSync(OUT).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const meta = JSON.parse(readFileSync(join(OUT, f), "utf8"));
    const id = meta.id;
    if (!id || meta.format === "slang_card") continue;
    const artPath = join(OUT, `${id}_art.png`);
    if (!existsSync(artPath)) {
      console.log("skip no art", id);
      continue;
    }
    const art = readFileSync(artPath);
    let composed;
    if (meta.format === "simple_upgrade") {
      const bg = pickSimpleUpgradeBg(id);
      composed = await composeSimpleUpgradePin({
        simple: meta.simple || meta.words?.[0]?.gloss,
        target: meta.target || meta.words?.[0]?.english,
        illustrationPng: art,
        bgColor: bg,
        targetColor: meta.targetColor,
      });
    } else if (meta.format === "other_ways") {
      const palette = pickOtherWaysPalette(id);
      composed = await composeOtherWaysPin({
        headline: meta.headline,
        phrases: meta.phrases || meta.words?.map((w) => w.english) || [],
        illustrationPng: art,
        ink: palette.ink,
        kicker: meta.kicker || "Other ways to say",
      });
    } else {
      continue;
    }
    const branded = await compositeListenCtaOnly(composed, {
      ctaText: CTA,
      variant: "global",
      overlay: true,
      corner: "top-right",
    });
    writeFileSync(join(OUT, `${id}.png`), branded);
    console.log("ok", id, meta.format);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
