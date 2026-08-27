#!/usr/bin/env npx tsx
/**
 * Enrich getpronounce catalog: ElevenLabs TTS × CN/TW/HK × F/M (SoVITS later).
 *
 *   yarn pronounce:enrich
 *   yarn pronounce:enrich -- --id zh_word__ni-hao
 *   yarn pronounce:enrich -- --limit 2 --force
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
  PRONOUNCE_VOICE_SLOTS,
  pronounceHasFullVoices,
  ttsFieldName,
  type PronounceTtsFields,
} from "../src/lib/pronounceSite/voices";
import { loadEnvLocal } from "./lib/env_local.mjs";
import { CURATED_ZH_VOICES } from "./lib/getpronounce-zh-voices.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/pronouncePins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "pronounce", "audio");

loadEnvLocal(ROOT);
loadEnvLocal(path.join(ROOT, "../projects/neo-project/auto-video-korean"));

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const modelId =
  process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

type Word = {
  chinese: string;
  pinyin?: string;
  english: string;
} & PronounceTtsFields;

type Page = {
  id: string;
  words: Word[];
  [k: string]: unknown;
};

type Catalog = {
  version: number;
  generatedAt: string;
  site: string;
  pages: Page[];
};

function parseArgs(argv: string[]) {
  let limit = 0;
  let force = false;
  let onlyId = "";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
  }
  return { limit, force, onlyId };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hasUrl(url?: string) {
  if (!url?.trim()) return false;
  if (/^https?:\/\//i.test(url)) return true;
  const rel = url.replace(/^\//, "");
  return existsSync(path.join(ROOT, "public", rel));
}

function voiceIdForSlot(slot: string) {
  return CURATED_ZH_VOICES.find((v) => v.slot === slot)?.voice_id || "";
}

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      (process.env.R2_BUCKET_NAME || process.env.R2_BUCKET)?.trim(),
  );
}

function r2Bucket() {
  return (
    process.env.R2_BUCKET_NAME?.trim() ||
    process.env.R2_BUCKET?.trim() ||
    ""
  );
}

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID!.trim()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    },
  });
}

function publicBase() {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "https://file.kajakorean.com"
  );
}

async function storeMp3(keyRelative: string, body: Buffer): Promise<string> {
  if (r2Configured()) {
    const key = `grammar-x/pronounce-pin-tts/${keyRelative}`;
    await r2Client().send(
      new PutObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
        Body: body,
        ContentType: "audio/mpeg",
      }),
    );
    return `${publicBase()}/${key}`;
  }
  const dest = path.join(AUDIO_ROOT, keyRelative);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, body);
  return `/pronounce/audio/${keyRelative}`;
}

async function synthesizeElevenLabs(voiceId: string, text: string) {
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.1,
          use_speaker_boost: true,
        },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function enrichWord(
  pageId: string,
  word: Word,
  wordIdx: number,
  force: boolean,
) {
  const text = String(word.chinese || "").trim();
  if (!text) return word;
  if (!force && pronounceHasFullVoices(word)) return word;

  const out: Word = { ...word, ttsProvider: "elevenlabs" };
  for (const slot of PRONOUNCE_VOICE_SLOTS) {
    const field = ttsFieldName(slot.gender, slot.region);
    if (!force && hasUrl(String(out[field] || ""))) continue;
    const voiceId = voiceIdForSlot(slot.slot);
    if (!voiceId) continue;
    const key = `${pageId}/w${wordIdx}-${slot.region}-${slot.gender}.mp3`;
    try {
      const mp3 = await synthesizeElevenLabs(voiceId, text);
      out[field] = await storeMp3(key, mp3);
      if (field === "ttsFemaleCn" && !out.ttsUrl) out.ttsUrl = out[field];
      console.log(`    ok ${slot.label} → ${key}`);
      await sleep(350);
    } catch (e) {
      console.error(`    FAIL ${slot.label}:`, e instanceof Error ? e.message : e);
      if (/401|402|429|quota|limit/i.test(String(e))) throw e;
    }
  }
  return out;
}

async function main() {
  const { limit, force, onlyId } = parseArgs(process.argv.slice(2));
  if (!existsSync(PUBLISHED)) {
    console.error("Missing catalog:", PUBLISHED);
    process.exit(1);
  }
  const catalog = JSON.parse(readFileSync(PUBLISHED, "utf8")) as Catalog;
  let pages = catalog.pages || [];
  if (onlyId) pages = pages.filter((p) => p.id === onlyId);
  if (limit > 0) pages = pages.slice(0, limit);

  console.log(`==> pronounce enrich pages=${pages.length} elevenlabs=${Boolean(apiKey)}`);

  for (const page of pages) {
    console.log(`→ ${page.id}`);
    const words = [];
    for (let i = 0; i < (page.words || []).length; i++) {
      words.push(await enrichWord(page.id, page.words[i], i, force));
    }
    page.words = words;
  }

  catalog.generatedAt = new Date().toISOString();
  writeFileSync(PUBLISHED, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`==> saved ${PUBLISHED}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
