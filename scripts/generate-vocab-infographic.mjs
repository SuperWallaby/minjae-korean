#!/usr/bin/env node
/**
 * Generate sample vocab infographics via gpt-image-2 (generations only).
 *   npx tsx scripts/generate-vocab-infographic.mjs --sample 3
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  IMAGE_DEPLOY,
  LOGO_PATH,
  FOOTER_TAGLINE,
  STYLE_BASE,
  KAJA_ART_STYLE,
  KAJA_MASCOT,
  compositeFooter,
  generateWithRetry,
} from "./lib/vocab-infographic-gen.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "vocab-infographic-gen");

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const SAMPLES = [
  {
    id: "01-taste-grid",
    format: "grid_cluster",
    size: "1024x1024",
    prompt: `${STYLE_BASE}

FORMAT: 3×3 grid infographic titled "Taste in Korean" at top center.
Nine cells, each with a cute food illustration and:
1 Sweet — 달다 [dalda]
2 Salty — 짜다 [jjada]
3 Spicy — 맵다 [maepda]
4 Bitter — 쓰다 [sseuda]
5 Sour — 시다 [sida]
6 Savory/nutty — 고소하다 [gosohada]
7 Bland — 싱겁다 [singgeopda]
8 Crunchy — 바삭하다 [basakada]
9 Soft — 부드럽다 [budeureopda]
Even spacing, numbered subtly, symmetrical grid.`,
  },
  {
    id: "02-early-late-split",
    format: "antonym_split",
    size: "1024x1536",
    prompt: `${STYLE_BASE}

FORMAT: Vertical split antonym card. Header: "KOREAN" bold centered.
LEFT half (warm cream): sunrise scene, alarm clock morning — EARLY / 이르다 [ireuda]
RIGHT half (soft lavender): moon night scene, alarm clock evening — LATE / 늦다 [neutda]
Mirrored layout, contrasting backgrounds, one vocabulary pair only.`,
  },
  {
    id: "03-money-list",
    format: "super_list",
    size: "1024x1536",
    prompt: `${STYLE_BASE}

FORMAT: Tall portrait vocabulary list titled "MONEY IN KOREAN" at top.
Vertical list with thin center divider. Left: coin/bill image or ₩ amount. Right: Hangul + romanization.
Rows (all must fit, nothing cropped):
₩10 십원 [sibwon]
₩50 오십원 [osibwon]
₩100 백원 [baegwon]
₩500 오백원 [obaegwon]
₩1,000 천원 [cheonwon]
₩5,000 오천원 [ocheonwon]
₩10,000 만원 [manwon]
₩50,000 오만원 [omanwon]
Scannable table layout, consistent row height.`,
  },
  {
    id: "04-quiz-consider",
    format: "quiz_comment",
    size: "1024x1536",
    prompt: `${STYLE_BASE}

FORMAT: Comment-bait vocabulary QUIZ card (portrait 4:5). Clean blue-and-white edu-influencer layout.
TOP LEFT: rounded blue badge with book icon + "KOREAN WORD QUIZ" in white caps.
TOP RIGHT: "English → Korean" with small blue motion lines.
CENTER: bold black question — Which Korean word means "to consider / think carefully about"?
LEFT COLUMN: four stacked white rounded option cards with thin blue border, large blue number circles:
1. 생각하다 [saenggakhada]
2. 고려하다 [goryeohada]
3. 알다 [alda]
4. 이해하다 [ihaehada]
RIGHT SIDE: ${KAJA_MASCOT}
${KAJA_ART_STYLE}
ABOVE FOOTER BAND: light blue rounded CTA bar with lightbulb icon + "Try to answer before checking the comments! ↓"
CRITICAL: Do NOT highlight or mark the correct answer. All four options look equally neutral.`,
  },
];

async function rebrandRaw(rawPath, logoPath) {
  const base = rawPath.replace(/_raw\.png$/i, "");
  const branded = await compositeFooter(readFileSync(rawPath), logoPath);
  writeFileSync(`${base}.png`, branded);
  return base.split("/").pop();
}

async function main() {
  const rebrandOnly = process.argv.includes("--rebrand");
  const rebrandAll = process.argv.includes("--rebrand-all");
  const sampleN = (() => {
    const idx = process.argv.indexOf("--sample");
    if (idx >= 0 && process.argv[idx + 1]) return Math.max(1, parseInt(process.argv[idx + 1], 10) || 3);
    return SAMPLES.length;
  })();

  mkdirSync(OUT, { recursive: true });
  const logoPath = join(ROOT, LOGO_PATH);

  if (rebrandAll) {
    const raws = readdirSync(OUT)
      .filter((f) => f.endsWith("_raw.png"))
      .map((f) => join(OUT, f))
      .sort();
    console.log(`Rebranding ${raws.length} raw images (SNS-optimal → translucent footer, else extend)\n`);
    let n = 0;
    for (const rawPath of raws) {
      const id = await rebrandRaw(rawPath, logoPath);
      n += 1;
      if (n % 25 === 0 || n === raws.length) console.log(`  ↺ ${n}/${raws.length} (last: ${id})`);
    }
    return;
  }

  if (rebrandOnly) {
    for (const s of SAMPLES.slice(0, sampleN)) {
      const rawPath = join(OUT, `${s.id}_raw.png`);
      if (!existsSync(rawPath)) continue;
      await rebrandRaw(rawPath, logoPath);
      console.log(`  ↺ rebranded ${s.id}.png`);
    }
    return;
  }

  console.log(`Generating ${sampleN} via ${IMAGE_DEPLOY} (quality=high, footer="${FOOTER_TAGLINE}")\n`);

  for (const sample of SAMPLES.slice(0, sampleN)) {
    console.log(`→ ${sample.id}`);
    const t0 = Date.now();
    const raw = await generateWithRetry({ prompt: sample.prompt, size: sample.size });
    writeFileSync(join(OUT, `${sample.id}_raw.png`), raw);
    const branded = await compositeFooter(raw, logoPath);
    writeFileSync(join(OUT, `${sample.id}.png`), branded);
    console.log(`  ✓ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
