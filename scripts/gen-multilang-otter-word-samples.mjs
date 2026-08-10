#!/usr/bin/env node
/**
 * Sample: multilingual word-format pins with otter illustrations (compose only).
 *
 * 2 popular-theme Korean words × 5 non-English L2 glosses = 10 pins.
 * Character: pink otter crops from brand sheet (never capybara).
 *
 *   node scripts/gen-multilang-otter-word-samples.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  composeWordFlashcardPin,
  WORD_PIN_W,
  WORD_PIN_H,
} from "./lib/quiz_word_pin.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "multilang-otter-samples");
const OTTER_SHEET = join(ROOT, "public/brand/pink-otter-doodle-sheet.png");

/** Top non-English Pinterest / learner markets (EN excluded). */
const LANGS = [
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
];

/**
 * Two high-demand themes from pin-rank (eye colors / everyday feelings).
 * Hangul + romanization fixed; L2 gloss swaps per language.
 */
const WORDS = [
  {
    id: "brown-eyes",
    hangul: "갈색 눈",
    romanization: "galssaek nun",
    gloss: {
      es: "Ojos marrones",
      pt: "Olhos castanhos",
      fr: "Yeux marron",
      de: "Braune Augen",
      ja: "茶色の目",
    },
  },
  {
    id: "january",
    hangul: "1월",
    romanization: "irwol",
    gloss: {
      es: "Enero",
      pt: "Janeiro",
      fr: "Janvier",
      de: "Januar",
      ja: "1月",
    },
  },
];

/** Crop two distinct otter tiles from the doodle sheet (3×N-ish grid). */
async function otterCrops() {
  if (!existsSync(OTTER_SHEET)) {
    throw new Error(`Missing otter sheet: ${OTTER_SHEET}`);
  }
  const meta = await sharp(OTTER_SHEET).metadata();
  const W = meta.width || 1024;
  const H = meta.height || 1024;
  // Sheet is a sticker page — take two upper cells with padding.
  const cellW = Math.floor(W / 3);
  const cellH = Math.floor(H / 3);
  const specs = [
    { left: cellW, top: 0, width: cellW, height: cellH },
    { left: 0, top: cellH, width: cellW, height: cellH },
  ];
  const out = [];
  for (const s of specs) {
    const buf = await sharp(OTTER_SHEET)
      .extract({
        left: Math.max(0, s.left),
        top: Math.max(0, s.top),
        width: Math.min(cellW, W - s.left),
        height: Math.min(cellH, H - s.top),
      })
      .resize(700, 700, { fit: "contain", background: { r: 245, g: 245, b: 247, alpha: 1 } })
      .png()
      .toBuffer();
    out.push(buf);
  }
  return out;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const otters = await otterCrops();
  const manifest = [];

  let i = 0;
  for (const word of WORDS) {
    const ill = otters[i % otters.length];
    i += 1;
    for (const lang of LANGS) {
      const gloss = word.gloss[lang.code];
      const png = await composeWordFlashcardPin({
        english: gloss,
        hangul: word.hangul,
        romanization: word.romanization,
        illustrationPng: ill,
      });
      const name = `${String(manifest.length + 1).padStart(2, "0")}-${word.id}-${lang.code}.png`;
      const path = join(OUT, name);
      writeFileSync(path, png);
      manifest.push({
        file: name,
        path,
        lang: lang.code,
        langName: lang.name,
        hangul: word.hangul,
        gloss,
        size: `${WORD_PIN_W}x${WORD_PIN_H}`,
        character: "otter",
      });
      console.log("✓", name, `(${lang.name}: ${gloss} → ${word.hangul})`);
    }
  }

  writeFileSync(
    join(OUT, "manifest.json"),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        note: "Sample 10: word-format Sharp recompose; L2 gloss only; otter crops; EN excluded",
        languages: LANGS,
        count: manifest.length,
        items: manifest,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${manifest.length} pins → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
