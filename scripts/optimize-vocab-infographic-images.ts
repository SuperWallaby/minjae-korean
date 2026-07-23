#!/usr/bin/env npx tsx
/**
 * Convert vocab infographic PNGs → WebP (+ thumb), upload to R2, update scheduled JSON.
 *
 * Prefer local `.tmp/.../{id}.png`; else fetch current imageUrl.
 * Skips bundles that already have a `.webp` imageUrl unless --force.
 *
 *   yarn vocab:optimize-images
 *   yarn vocab:optimize-images -- --limit 20
 *   yarn vocab:optimize-images -- --force --id ant-fresh-stale
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { loadEnvLocal } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GEN_DIR = path.join(ROOT, ".tmp/vocab-infographic-gen");
const SCHEDULED_PATH = path.join(GEN_DIR, "vocab-x-scheduled.json");

const HERO_MAX_W = Number(process.env.VOCAB_WEBP_MAX_WIDTH || 1200);
const THUMB_MAX_W = Number(process.env.VOCAB_WEBP_THUMB_WIDTH || 360);
const HERO_Q = Number(process.env.VOCAB_WEBP_QUALITY || 82);
const THUMB_Q = Number(process.env.VOCAB_WEBP_THUMB_QUALITY || 75);

type ScheduledEntry = {
  imageUrl?: string;
  imageUrlPng?: string;
  imageThumbUrl?: string;
  [key: string]: unknown;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function r2Bucket() {
  return (
    process.env.R2_BUCKET?.trim() ||
    process.env.R2_BUCKET_NAME?.trim() ||
    mustEnv("R2_BUCKET")
  );
}

function r2Client() {
  const accountId = mustEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: mustEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: mustEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function publicBase(): string {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${r2Bucket()}`
  );
}

function parseArgs(argv: string[]) {
  let limit = 0;
  let force = false;
  let onlyId: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) {
      limit = Math.max(0, Number(argv[++i]) || 0);
    } else if (a === "--force") {
      force = true;
    } else if (a === "--id" && argv[i + 1]) {
      onlyId = argv[++i];
    }
  }
  return { limit, force, onlyId };
}

async function loadPngBuffer(
  bundleId: string,
  entry: ScheduledEntry,
): Promise<Buffer> {
  const local = path.join(GEN_DIR, `${bundleId}.png`);
  if (existsSync(local)) return readFileSync(local);

  const src = entry.imageUrlPng || entry.imageUrl;
  if (!src) throw new Error(`No PNG source for ${bundleId}`);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${src}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadWebp(key: string, body: Buffer) {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: key,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${publicBase()}/${key}`;
}

async function main() {
  loadEnvLocal(ROOT);
  const { limit, force, onlyId } = parseArgs(process.argv.slice(2));

  if (!existsSync(SCHEDULED_PATH)) {
    throw new Error(`Missing ${SCHEDULED_PATH}`);
  }
  const scheduled = JSON.parse(
    readFileSync(SCHEDULED_PATH, "utf8"),
  ) as Record<string, ScheduledEntry>;

  let ids = Object.keys(scheduled).sort();
  if (onlyId) ids = ids.filter((id) => id === onlyId);
  if (!force) {
    ids = ids.filter((id) => {
      const url = String(scheduled[id]?.imageUrl || "");
      return !url.includes(".webp");
    });
  }
  if (limit > 0) ids = ids.slice(0, limit);

  console.log(
    `[vocab:optimize] ${ids.length} to process (force=${force} hero=${HERO_MAX_W}@${HERO_Q} thumb=${THUMB_MAX_W}@${THUMB_Q})`,
  );

  let ok = 0;
  let fail = 0;
  const stamp = Date.now();

  for (let i = 0; i < ids.length; i += 1) {
    const bundleId = ids[i]!;
    const entry = scheduled[bundleId]!;
    try {
      const png = await loadPngBuffer(bundleId, entry);
      const hero = await sharp(png)
        .resize({ width: HERO_MAX_W, withoutEnlargement: true })
        .webp({ quality: HERO_Q, effort: 4 })
        .toBuffer();
      const thumb = await sharp(png)
        .resize({ width: THUMB_MAX_W, withoutEnlargement: true })
        .webp({ quality: THUMB_Q, effort: 4 })
        .toBuffer();

      const heroKey = `grammar-x/vocab-infographic/${stamp}-${bundleId}.webp`;
      const thumbKey = `grammar-x/vocab-infographic/${stamp}-${bundleId}-thumb.webp`;
      const imageUrl = await uploadWebp(heroKey, hero);
      const imageThumbUrl = await uploadWebp(thumbKey, thumb);

      const prevUrl = String(entry.imageUrl || "");
      scheduled[bundleId] = {
        ...entry,
        imageUrlPng:
          entry.imageUrlPng ||
          (prevUrl.includes(".png") ? prevUrl : entry.imageUrlPng),
        imageUrl,
        imageThumbUrl,
        optimizedAt: new Date().toISOString(),
      };

      // Persist every item so crashes don't lose progress.
      writeFileSync(SCHEDULED_PATH, `${JSON.stringify(scheduled, null, 2)}\n`);

      ok += 1;
      console.log(
        `  [${i + 1}/${ids.length}] ${bundleId}  ${Math.round(png.length / 1024)}KB png → ${Math.round(hero.length / 1024)}KB / ${Math.round(thumb.length / 1024)}KB webp`,
      );
    } catch (err) {
      fail += 1;
      console.error(`  [${i + 1}/${ids.length}] FAIL ${bundleId}:`, err);
    }
  }

  mkdirSync(path.dirname(SCHEDULED_PATH), { recursive: true });
  writeFileSync(SCHEDULED_PATH, `${JSON.stringify(scheduled, null, 2)}\n`);
  console.log(`[vocab:optimize] done ok=${ok} fail=${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
