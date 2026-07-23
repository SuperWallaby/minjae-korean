#!/usr/bin/env node
/**
 * Upload vocab infographic to R2 and register for X review (approve → queue).
 *
 *   npx tsx scripts/vocab-x-schedule-post.ts --id grid-fruits-tropical
 *   npx tsx scripts/vocab-x-schedule-post.ts --auto
 *   npx tsx scripts/vocab-x-schedule-post.ts --id grid-fruits-tropical --queue   # skip review, enqueue now
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import { resolveVocabImageWords } from "../src/lib/vocabImageWords.ts";
import { enqueueGrammarXManual } from "../src/lib/grammarXQueueRepo";
import { markVocabXApproved, upsertVocabXPending } from "../src/lib/vocabXReviewRepo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

async function imageWordsForBundle(
  bundleId: string,
  imageUrl?: string,
) {
  const bundle = findBundle(bundleId);
  const imagePath = path.join(OUT, `${bundleId}.png`);
  return resolveVocabImageWords({
    bundle,
    cacheDir: OUT,
    imagePath: fs.existsSync(imagePath) ? imagePath : undefined,
    imageUrl,
  });
}

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function r2Bucket() {
  return process.env.R2_BUCKET?.trim() || process.env.R2_BUCKET_NAME?.trim() || mustEnv("R2_BUCKET");
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

function loadScheduled(): Record<string, unknown> {
  if (!fs.existsSync(SCHEDULED_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(SCHEDULED_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveScheduled(data: Record<string, unknown>) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(SCHEDULED_PATH, JSON.stringify(data, null, 2));
}

function findBundle(bundleId: string) {
  const bundle = ALL_VOCAB_BUNDLES.find((b) => b.id === bundleId);
  if (!bundle) throw new Error(`Unknown bundle id: ${bundleId}`);
  return bundle;
}

async function uploadBrandedImage(bundleId: string): Promise<{
  imageUrl: string;
  imageThumbUrl: string;
  imageAlt: string;
}> {
  const bundle = findBundle(bundleId);
  const imagePath = path.join(OUT, `${bundleId}.png`);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Branded image not found: ${imagePath}`);
  }

  const sharp = (await import("sharp")).default;
  const png = fs.readFileSync(imagePath);
  const hero = await sharp(png)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  const thumb = await sharp(png)
    .resize({ width: 360, withoutEnlargement: true })
    .webp({ quality: 75, effort: 4 })
    .toBuffer();

  const stamp = Date.now();
  const heroKey = `grammar-x/vocab-infographic/${stamp}-${bundleId}.webp`;
  const thumbKey = `grammar-x/vocab-infographic/${stamp}-${bundleId}-thumb.webp`;
  const client = r2Client();
  const bucket = r2Bucket();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: heroKey,
      Body: hero,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumb,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicBase =
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${bucket}`;
  const imageUrl = `${publicBase}/${heroKey}`;
  const imageThumbUrl = `${publicBase}/${thumbKey}`;
  const imageAlt = `${bundle.title} — Korean vocabulary by What is this in Korean`;
  return { imageUrl, imageThumbUrl, imageAlt };
}

/** Register for admin approval (does not enqueue X). */
export async function registerVocabXForReview(input: {
  bundleId: string;
  skipIfRegistered?: boolean;
}) {
  const bundleId = input.bundleId.trim();
  const bundle = findBundle(bundleId);

  const scheduled = loadScheduled();
  const prev = scheduled[bundleId] as { reviewStatus?: string; queueId?: string } | undefined;
  if (input.skipIfRegistered !== false && prev?.reviewStatus === "pending") {
    return { skipped: true as const, bundleId, reason: "already_pending" as const };
  }
  if (input.skipIfRegistered !== false && prev?.queueId && !prev.reviewStatus) {
    // Legacy auto-queued entry — treat as already handled until pull-back.
    return { skipped: true as const, bundleId, reason: "already_scheduled" as const };
  }

  const { imageUrl, imageThumbUrl, imageAlt } = await uploadBrandedImage(bundleId);
  const imagePayload = await imageWordsForBundle(bundleId, imageUrl);
  const { tweetText, caption, replyText } = await buildVocabXPostText(bundle, {
    imageWords: imagePayload.words,
  });

  const item = await upsertVocabXPending({
    bundleId,
    title: bundle.title,
    format: bundle.format,
    priority: bundle.priority,
    imageUrl,
    imageAlt,
    tweetText,
    replyText,
    captionLine1: caption.line1,
    captionLine2: caption.line2,
  });

  scheduled[bundleId] = {
    reviewId: item.id,
    reviewStatus: "pending",
    imageUrl,
    imageThumbUrl,
    tweetText,
    caption,
    replyText,
    imageWords: imagePayload.words,
    imageWordsSource: imagePayload.source,
    registeredAt: new Date().toISOString(),
  };
  saveScheduled(scheduled);

  return {
    skipped: false as const,
    bundleId,
    reviewId: item.id,
    imageUrl,
    tweetText,
    caption,
    replyText,
  };
}

/** Legacy: upload + enqueue immediately (skip review). Prefer register + approve. */
export async function scheduleVocabXPost(input: {
  bundleId: string;
  skipIfScheduled?: boolean;
}) {
  const bundleId = input.bundleId.trim();
  const bundle = findBundle(bundleId);

  const scheduled = loadScheduled();
  if (input.skipIfScheduled !== false && scheduled[bundleId]) {
    return { skipped: true, bundleId, reason: "already_scheduled" as const };
  }

  const { imageUrl, imageAlt } = await uploadBrandedImage(bundleId);
  const imagePayload = await imageWordsForBundle(bundleId, imageUrl);
  const { tweetText, caption, replyText } = await buildVocabXPostText(bundle, {
    imageWords: imagePayload.words,
  });

  const queueItem = await enqueueGrammarXManual({
    tweetText,
    imageUrl,
    imageAlt,
    replyText,
    note: `vocab-infographic:${bundleId}`,
  });

  await upsertVocabXPending({
    bundleId,
    title: bundle.title,
    format: bundle.format,
    priority: bundle.priority,
    imageUrl,
    imageAlt,
    tweetText,
    replyText,
    captionLine1: caption.line1,
    captionLine2: caption.line2,
    forcePending: true,
  });
  // Mark approved with the queue we just created (avoid double enqueue).
  await markVocabXApproved(bundleId, queueItem.id);

  scheduled[bundleId] = {
    queueId: queueItem.id,
    reviewStatus: "approved",
    imageUrl,
    tweetText,
    caption,
    replyText,
    imageWords: imagePayload.words,
    imageWordsSource: imagePayload.source,
    scheduledAt: new Date().toISOString(),
  };
  saveScheduled(scheduled);

  return {
    skipped: false as const,
    bundleId,
    queueId: queueItem.id,
    imageUrl,
    tweetText,
    caption,
    replyText,
  };
}

export async function autoRegisterReadyVocabReviews() {
  const scheduled = loadScheduled();
  const ready = ALL_VOCAB_BUNDLES.filter((b) => {
    if (scheduled[b.id]) return false;
    return fs.existsSync(path.join(OUT, `${b.id}.png`));
  });

  const results = [];
  for (const bundle of ready) {
    try {
      const r = await registerVocabXForReview({ bundleId: bundle.id, skipIfRegistered: true });
      results.push(r);
    } catch (e) {
      results.push({
        bundleId: bundle.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return results;
}

/** @deprecated use autoRegisterReadyVocabReviews */
export async function autoQueueReadyVocabPosts() {
  return autoRegisterReadyVocabReviews();
}

function parseArgs(argv: string[]) {
  let bundleId = "";
  let auto = argv.includes("--auto");
  let queueNow = argv.includes("--queue");
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--id=")) bundleId = a.slice("--id=".length);
    else if (a === "--id" && argv[i + 1]) bundleId = argv[++i]!;
    else if (a === "--auto") auto = true;
    else if (a === "--queue") queueNow = true;
  }
  return { bundleId, auto, queueNow };
}

async function main() {
  await loadEnv();
  const { bundleId, auto, queueNow } = parseArgs(process.argv.slice(2));

  if (auto) {
    const results = await autoRegisterReadyVocabReviews();
    console.log(JSON.stringify({ ok: true, registered: results.length, results }, null, 2));
    return;
  }

  if (!bundleId) {
    throw new Error("Usage: --id BUNDLE_ID [--queue]  |  --auto");
  }

  if (queueNow) {
    const result = await scheduleVocabXPost({ bundleId });
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    return;
  }

  const result = await registerVocabXForReview({ bundleId });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

const invoked = process.argv[1]?.includes("vocab-x-schedule-post");
if (invoked) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
