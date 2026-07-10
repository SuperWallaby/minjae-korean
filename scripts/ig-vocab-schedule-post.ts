#!/usr/bin/env node
/**
 * Upload restyled IG vocab image to R2 and enqueue X manual post.
 *   npx tsx scripts/ig-vocab-schedule-post.ts --code DZ5shFrkxK1 --topic "Money in Korean"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { enqueueGrammarXManual } from "../src/lib/grammarXQueueRepo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "ig-vocab-pipeline-test");

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

function buildTweetText(topic: string) {
  const t = (topic || "Korean vocabulary").trim().slice(0, 80);
  return `🇰🇷 ${t}\n\nSave this & practice out loud 👇\n\n#koreanvocab #learnkorean #kajakorean #한국어`.slice(
    0,
    280,
  );
}

function parseArgs(argv: string[]) {
  let code = "";
  let topic = "Korean vocabulary";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--code=")) code = a.slice("--code=".length);
    else if (a === "--code" && argv[i + 1]) code = argv[++i]!;
    else if (a.startsWith("--topic=")) topic = a.slice("--topic=".length);
    else if (a === "--topic" && argv[i + 1]) topic = argv[++i]!;
  }
  if (!code) throw new Error("Usage: --code SHORTCODE [--topic ...]");
  return { code, topic };
}

export async function scheduleIgVocabPost(input: {
  code: string;
  topic?: string;
}) {
  const code = input.code.trim();
  const topic = (input.topic || "Korean vocabulary").trim();
  const imagePath = path.join(OUT, `${code}_kaja_restyle.png`);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Restyle image not found: ${imagePath}`);
  }

  const key = `grammar-x/ig-vocab/${Date.now()}-${code}.png`;
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
  const imageAlt = `${topic} — Korean vocabulary infographic by What is this in Korean`;
  const tweetText = buildTweetText(topic);

  const item = await enqueueGrammarXManual({
    tweetText,
    imageUrl,
    imageAlt,
    note: `ig-vocab:${code}`,
  });

  const scheduledPath = path.join(OUT, "scheduled.json");
  const scheduled = fs.existsSync(scheduledPath)
    ? (JSON.parse(fs.readFileSync(scheduledPath, "utf8")) as Record<string, unknown>)
    : {};
  scheduled[code] = {
    queueId: item.id,
    imageUrl,
    tweetText,
    scheduledAt: new Date().toISOString(),
  };
  fs.writeFileSync(scheduledPath, JSON.stringify(scheduled, null, 2));

  return { queueId: item.id, imageUrl, tweetText };
}

async function main() {
  await loadEnv();
  const { code, topic } = parseArgs(process.argv.slice(2));
  const result = await scheduleIgVocabPost({ code, topic });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

const invoked = process.argv[1]?.includes("ig-vocab-schedule-post");
if (invoked) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
