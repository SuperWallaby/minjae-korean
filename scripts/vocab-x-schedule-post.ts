#!/usr/bin/env node
/**
 * Upload vocab infographic to R2 and enqueue X manual post (3×/day via lab-worker cron).
 *
 *   npx tsx scripts/vocab-x-schedule-post.ts --id grid-fruits-tropical
 *   npx tsx scripts/vocab-x-auto-queue.ts          # queue all ready images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import { enqueueGrammarXManual } from "../src/lib/grammarXQueueRepo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

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

export async function scheduleVocabXPost(input: {
  bundleId: string;
  skipIfScheduled?: boolean;
}) {
  const bundleId = input.bundleId.trim();
  const bundle = findBundle(bundleId);
  const imagePath = path.join(OUT, `${bundleId}.png`);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Branded image not found: ${imagePath}`);
  }

  const scheduled = loadScheduled();
  if (input.skipIfScheduled !== false && scheduled[bundleId]) {
    return { skipped: true, bundleId, reason: "already_scheduled" as const };
  }

  const { tweetText, caption, replyText } = await buildVocabXPostText(bundle);

  const key = `grammar-x/vocab-infographic/${Date.now()}-${bundleId}.png`;
  const buffer = fs.readFileSync(imagePath);
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }),
  );

  const publicBase =
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${r2Bucket()}`;
  const imageUrl = `${publicBase}/${key}`;
  const imageAlt = `${bundle.title} — Korean vocabulary by What is this in Korean`;

  const item = await enqueueGrammarXManual({
    tweetText,
    imageUrl,
    imageAlt,
    replyText,
    note: `vocab-infographic:${bundleId}`,
  });

  scheduled[bundleId] = {
    queueId: item.id,
    imageUrl,
    tweetText,
    caption,
    replyText,
    scheduledAt: new Date().toISOString(),
  };
  saveScheduled(scheduled);

  return {
    skipped: false as const,
    bundleId,
    queueId: item.id,
    imageUrl,
    tweetText,
    caption,
    replyText,
  };
}

export async function autoQueueReadyVocabPosts() {
  const scheduled = loadScheduled();
  const ready = ALL_VOCAB_BUNDLES.filter((b) => {
    if (scheduled[b.id]) return false;
    return fs.existsSync(path.join(OUT, `${b.id}.png`));
  });

  const results = [];
  for (const bundle of ready) {
    try {
      const r = await scheduleVocabXPost({ bundleId: bundle.id, skipIfScheduled: true });
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

function parseArgs(argv: string[]) {
  let bundleId = "";
  let auto = argv.includes("--auto");
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--id=")) bundleId = a.slice("--id=".length);
    else if (a === "--id" && argv[i + 1]) bundleId = argv[++i]!;
    else if (a === "--auto") auto = true;
  }
  return { bundleId, auto };
}

async function main() {
  await loadEnv();
  const { bundleId, auto } = parseArgs(process.argv.slice(2));

  if (auto) {
    const results = await autoQueueReadyVocabPosts();
    console.log(JSON.stringify({ ok: true, queued: results.length, results }, null, 2));
    return;
  }

  if (!bundleId) {
    throw new Error("Usage: --id BUNDLE_ID  |  --auto");
  }

  const result = await scheduleVocabXPost({ bundleId });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

const invoked = process.argv[1]?.includes("vocab-x-schedule-post");
if (invoked) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
