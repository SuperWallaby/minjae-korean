#!/usr/bin/env node
/**
 * Sync photo-trial grammar quizzes into src/data/newsletter/photo-quiz-trials.json
 * and upload composed JPEGs to public R2 for newsletter emails.
 *
 * Default source: ../projects/neo-project/korean-quiz/... (override with PHOTO_QUIZ_TRIALS_DIR)
 *
 *   node scripts/sync-newsletter-photo-quiz-trials.mjs
 *   node scripts/sync-newsletter-photo-quiz-trials.mjs --skip-upload   # catalog only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import { hasR2Config, r2PublicBase, uploadBufferToR2 } from "./lib/r2_upload.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "src/data/newsletter/photo-quiz-trials.json");

const DEFAULT_SOURCE = path.resolve(
  ROOT,
  "../projects/neo-project/korean-quiz/local/photo-quiz-trials/raw-safezone",
);

function sourceRoot() {
  const fromEnv = process.env.PHOTO_QUIZ_TRIALS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return DEFAULT_SOURCE;
}

async function main() {
  loadEnvLocal();
  const skipUpload = process.argv.includes("--skip-upload");
  const root = sourceRoot();
  const catalogPath = path.join(root, "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`catalog.json not found at ${catalogPath}`);
  }

  const rows = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("catalog.json is empty");
  }

  const publicBase = hasR2Config()
    ? r2PublicBase()
    : (process.env.R2_PUBLIC_BASE_URL || "https://file.kajakorean.com").replace(
        /\/+$/,
        "",
      );

  const items = [];
  let uploaded = 0;
  let skippedUpload = 0;

  for (const row of rows) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    const composed = String(row.composedFile || `${id}-composed.png`).trim();
    const composedPath = path.join(root, composed);
    if (!fs.existsSync(composedPath)) {
      console.warn(`[skip] missing composed: ${composed}`);
      continue;
    }

    // v2: max 720px progressive mozjpeg — email body is ~520px wide
    const key = `newsletter/photo-quiz-trials/v2/${id}-composed.jpg`;
    const imageUrl = `${publicBase}/${key}`;

    if (!skipUpload && hasR2Config()) {
      const jpeg = await sharp(fs.readFileSync(composedPath))
        .rotate()
        .resize(720, null, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({
          quality: 72,
          progressive: true,
          mozjpeg: true,
          chromaSubsampling: "4:2:0",
        })
        .toBuffer();
      await uploadBufferToR2(key, jpeg, "image/jpeg");
      uploaded += 1;
      console.error(
        `[upload] ${id} → ${key} (${jpeg.length} bytes, ${(jpeg.length / 1024).toFixed(0)}KB)`,
      );
    } else {
      skippedUpload += 1;
    }

    items.push({
      id,
      difficulty: row.difficulty ?? "",
      focus: row.focus ?? "",
      korean: row.korean ?? "",
      sentence: row.sentence ?? "",
      choices: Array.isArray(row.choices) ? row.choices : [],
      correct: typeof row.correct === "number" ? row.correct : 0,
      sceneMeaning: row.sceneMeaning ?? "",
      imageUrl,
      tweetText: row.tweetText ?? "",
      replyText: row.replyText ?? "",
      level: typeof row.level === "number" ? row.level : undefined,
    });
  }

  if (items.length === 0) {
    throw new Error("No valid trial items to write");
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceRoot: root,
        note: "Photo-trial grammar quizzes for weekly newsletter. Refresh via scripts/sync-newsletter-photo-quiz-trials.mjs",
        items,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        count: items.length,
        uploaded,
        skippedUpload,
        out: OUT,
        sample: items[0]?.id,
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
