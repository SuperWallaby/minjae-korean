#!/usr/bin/env node
/**
 * Layout QA for EN→EN composite formats (no Azure).
 * Builds placeholder art → compose → optional listen CTA → write PNGs for visual review.
 *
 *   node scripts/en-en-layout-qa.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { compositeListenCtaOnly } from "./lib/vocab-infographic-gen.mjs";
import {
  EN_EN_PORTRAIT,
  composeOtherWaysPin,
  composeSimpleUpgradePin,
  pickOtherWaysPalette,
  pickSimpleUpgradeBg,
} from "./lib/en-en-pin-formats.mjs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "en-en-samples");
const SOUND_LISTEN_CTA = "Listen on website";
const { w, h } = EN_EN_PORTRAIT;

/** Mirror of composite jobs in en-en-queue-jobs.ts (avoid TS import from .mjs). */
const COMPOSITE_JOBS = [
  {
    id: "en_upgrade__filthy",
    format: "simple_upgrade",
    simple: "Very dirty",
    target: "Filthy",
    targetColor: "#dc2626",
  },
  {
    id: "en_upgrade__exhausted",
    format: "simple_upgrade",
    simple: "Very tired",
    target: "Exhausted",
    targetColor: "#7c3aed",
  },
  {
    id: "en_upgrade__starving",
    format: "simple_upgrade",
    simple: "Very hungry",
    target: "Starving",
    targetColor: "#ea580c",
  },
  {
    id: "en_other__dont-like-it",
    format: "other_ways",
    headline: "I don't like it",
    kicker: "Other ways to say",
    phrases: [
      "That's not for me",
      "I'm not into it",
      "I'm not fond of it",
      "I dislike it",
      "I'm not crazy about it",
      "It doesn't appeal to me",
      "It's not my cup of tea",
      "I'm not a big fan of it",
      "I'm not keen on it",
      "I pass",
    ],
    brand: "EIGO SOUND",
  },
  {
    id: "en_other__im-sorry",
    format: "other_ways",
    headline: "I'm sorry",
    kicker: "Other ways to say",
    phrases: [
      "My bad",
      "I apologize",
      "That was on me",
      "I regret that",
      "Please forgive me",
      "I didn't mean to",
      "It won't happen again",
      "I owe you an apology",
      "Sorry about that",
      "I take full responsibility",
    ],
    brand: "EIGO SOUND",
  },
  {
    id: "en_other__thats-great",
    format: "other_ways",
    headline: "That's great",
    kicker: "Other ways to say",
    phrases: [
      "That's awesome",
      "Love that",
      "Sounds perfect",
      "Couldn't be better",
      "I'm all for it",
      "That's wonderful",
      "Nailed it",
      "That's fantastic",
      "I'm thrilled",
      "Way to go",
    ],
    brand: "EIGO SOUND",
  },
  // Stress: long headline + long phrases (width clamp / packing).
  {
    id: "en_other__stress-long",
    format: "other_ways",
    headline: "I don't understand",
    kicker: "Other ways to say",
    phrases: [
      "I'm not following you",
      "That went over my head",
      "Could you run that by me again",
      "I'm having trouble keeping up",
      "I don't quite get it",
      "You've lost me there",
      "I'm a bit confused",
      "Can you break that down",
      "I need you to clarify that",
      "I'm not sure I follow",
      "Help me understand",
      "That doesn't make sense to me",
    ],
    brand: "EIGO SOUND",
  },
];

/** Placeholder art: solid bg + simple character blob on the right (other_ways) or center (upgrade). */
async function placeholderArt({ bg, mode }) {
  const svg =
    mode === "other_ways"
      ? Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <!-- left text lane stays clear -->
  <ellipse cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.52)}" rx="220" ry="320" fill="rgba(0,0,0,0.18)"/>
  <circle cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.32)}" r="110" fill="rgba(255,255,255,0.35)"/>
  <text x="${Math.round(w * 0.72)}" y="${Math.round(h * 0.55)}" text-anchor="middle"
    font-family="system-ui" font-size="28" fill="rgba(255,255,255,0.5)">CHAR</text>
</svg>`)
      : Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <!-- fill most of the pin like real art (quiet ~10% top/bottom for type) -->
  <ellipse cx="${w / 2}" cy="${Math.round(h * 0.5)}" rx="340" ry="480" fill="rgba(0,0,0,0.1)"/>
  <circle cx="${w / 2}" cy="${Math.round(h * 0.34)}" r="150" fill="rgba(0,0,0,0.14)"/>
  <rect x="${Math.round(w * 0.28)}" y="${Math.round(h * 0.42)}" width="${Math.round(w * 0.44)}" height="${Math.round(h * 0.38)}" rx="56" fill="rgba(0,0,0,0.12)"/>
  <text x="${w / 2}" y="${Math.round(h * 0.58)}" text-anchor="middle"
    font-family="system-ui" font-size="32" fill="rgba(0,0,0,0.28)">ILLUSTRATION</text>
</svg>`);

  return sharp(svg).png().toBuffer();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const jobs = COMPOSITE_JOBS;
  console.log(`Layout QA: ${jobs.length} composite jobs → ${OUT}`);

  for (const job of jobs) {
    let art;
    let composed;
    if (job.format === "simple_upgrade") {
      const bg = pickSimpleUpgradeBg(job.id);
      art = await placeholderArt({ bg, mode: "upgrade" });
      composed = await composeSimpleUpgradePin({
        simple: job.simple,
        target: job.target,
        illustrationPng: art,
        bgColor: bg,
        targetColor: job.targetColor,
      });
    } else {
      const palette = pickOtherWaysPalette(job.id);
      art = await placeholderArt({ bg: palette.bg, mode: "other_ways" });
      composed = await composeOtherWaysPin({
        headline: job.headline,
        phrases: job.phrases,
        illustrationPng: art,
        ink: palette.ink,
        brand: job.brand,
        kicker: job.kicker,
      });
    }
    const branded = await compositeListenCtaOnly(composed, {
      ctaText: SOUND_LISTEN_CTA,
      variant: "global",
      overlay: true,
      corner: "top-right",
    });
    writeFileSync(join(OUT, `${job.id}_art.png`), art);
    writeFileSync(join(OUT, `${job.id}.png`), branded);
    const meta = await sharp(branded).metadata();
    console.log(
      `  ${job.format} ${job.id} → ${meta.width}x${meta.height}`,
    );
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
