#!/usr/bin/env npx tsx
/**
 * Enrich EigoSound catalog: US/UK/AU × female/male Edge TTS + IPA.
 *
 *   yarn sound:enrich
 *   yarn sound:enrich --id en_upgrade__filthy
 *   yarn sound:enrich --force --limit 2
 *   yarn sound:enrich --ipa-only
 *   yarn sound:enrich --tts-only
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

import { synthesizeEdgeTtsMp3 } from "../src/lib/edgeTtsServer";
import {
  SOUND_VOICE_SLOTS,
  soundHasFullVoices,
  type SoundTtsFields,
} from "../src/lib/soundSite/voices";
import { azureChat } from "./lib/azure_chat.mjs";
import { loadEnvLocal } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/soundPins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "sound", "audio");

loadEnvLocal(ROOT);
loadEnvLocal(
  path.join(ROOT, "../projects/neo-project/auto-video-korean"),
);

type Item = SoundTtsFields & {
  english: string;
  gloss?: string;
  ipa?: string;
};

type Page = {
  id: string;
  titleEn: string;
  words: Item[];
  examples?: Item[];
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
  let ipaOnly = false;
  let ttsOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1])
      limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a.startsWith("--limit="))
      limit = Math.max(0, Number(a.slice(8)) || 0);
    else if (a === "--force") force = true;
    else if (a === "--ipa-only") ipaOnly = true;
    else if (a === "--tts-only") ttsOnly = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--id=")) onlyId = a.slice(5);
    else if (a === "--ids" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--ids=")) onlyId = a.slice(6);
  }
  return { limit, force, onlyId, ipaOnly, ttsOnly };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hasUrl(url?: string): boolean {
  if (!url?.trim()) return false;
  if (/^https?:\/\//i.test(url)) return true;
  const rel = url.replace(/^\//, "");
  return (
    existsSync(path.join(ROOT, "public", rel)) ||
    existsSync(path.join(ROOT, rel))
  );
}

function itemReady(item: Item, force: boolean, ipaOnly: boolean, ttsOnly: boolean) {
  if (force) return false;
  const needIpa = !ttsOnly && !String(item.ipa || "").trim();
  const needTts = !ipaOnly && !soundHasFullVoices(item);
  return !(needIpa || needTts);
}

function pageNeedsWork(
  page: Page,
  force: boolean,
  ipaOnly: boolean,
  ttsOnly: boolean,
): boolean {
  if (force) return true;
  const items = [...(page.words || []), ...(page.examples || [])];
  if (!items.length) return true;
  return items.some(
    (it) => it.english?.trim() && !itemReady(it, force, ipaOnly, ttsOnly),
  );
}

function r2Configured(): boolean {
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
    const key = `grammar-x/sound-en-pin-tts/${keyRelative}`;
    await r2Client().send(
      new PutObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
        Body: body,
        ContentType: "audio/mpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${publicBase()}/${key}`;
  }
  const abs = path.join(AUDIO_ROOT, keyRelative);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  return `/sound/audio/${keyRelative}`;
}

function normalizeIpa(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, " ");
}

async function fillIpaBatch(items: Item[], force: boolean): Promise<void> {
  const need = items.filter(
    (it) => it.english?.trim() && (force || !normalizeIpa(it.ipa || "")),
  );
  if (!need.length) return;
  const lines = need.map((it, i) => `${i + 1}. ${it.english}`).join("\n");
  const system = `You are a phonetics expert. Return ONLY valid JSON:
{ "items": [ { "i": 1, "ipa": "ðæts nɑt fɚ mi" } ] }
Rules:
- IPA for General American English pronunciation.
- No slashes in ipa values.
- Put a space between each word in multi-word phrases.
- One entry per numbered line. Keep index i matching the list.`;
  const user = `Transcribe these English words/phrases to IPA:\n${lines}`;
  try {
    const raw = await azureChat({
      system,
      user,
      temperature: 0.1,
      maxTokens: 2000,
      jsonMode: true,
    });
    const text = String(raw || "")
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const data = JSON.parse(text) as {
      items?: Array<{ i?: number; ipa?: string }>;
    };
    for (const row of data.items || []) {
      const idx = Number(row.i) - 1;
      const ipa = normalizeIpa(String(row.ipa || ""));
      if (idx >= 0 && idx < need.length && ipa) need[idx].ipa = ipa;
    }
  } catch (e) {
    console.warn(
      `  ipa batch skip: ${e instanceof Error ? e.message : e}`,
    );
  }
}

async function enrichTts(
  item: Item,
  id: string,
  stem: string,
  force: boolean,
): Promise<void> {
  const text = String(item.english || "").trim();
  if (!text) return;
  item.ttsProvider = "edge";

  for (const slot of SOUND_VOICE_SLOTS) {
    const current = String(item[slot.field] || "").trim();
    const legacy =
      slot.field === "ttsFemale" ? String(item.ttsUrl || "").trim() : "";
    if (!force && hasUrl(current || legacy)) continue;

    const buf = await synthesizeEdgeTtsMp3(text, { voice: slot.voice });
    const file = `${id}/${stem}.${slot.accent}.${slot.gender}.mp3`;
    const url = await storeMp3(file, buf);
    item[slot.field] = url;
    if (slot.accent === "us" && slot.gender === "female") {
      item.ttsUrl = url;
      await storeMp3(`${id}/${stem}.mp3`, buf);
    }
    await sleep(100);
  }
}

async function main() {
  const { limit, force, onlyId, ipaOnly, ttsOnly } = parseArgs(
    process.argv.slice(2),
  );
  if (!existsSync(PUBLISHED)) {
    throw new Error(
      `missing catalog: ${PUBLISHED} — run yarn sound:publish first`,
    );
  }
  const catalog = JSON.parse(readFileSync(PUBLISHED, "utf8")) as Catalog;
  let pages = catalog.pages || [];
  if (onlyId) {
    const want = new Set(
      onlyId
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    pages = pages.filter((p) => want.has(p.id));
  }
  pages = pages.filter((p) => pageNeedsWork(p, force, ipaOnly, ttsOnly));
  if (limit > 0) pages = pages.slice(0, limit);

  console.log(
    `==> sound enrich ${pages.length} page(s) force=${force} ipaOnly=${ipaOnly} ttsOnly=${ttsOnly} r2=${r2Configured()} slots=${SOUND_VOICE_SLOTS.length}`,
  );
  if (!pages.length) {
    console.log("nothing to enrich");
    return;
  }

  let ok = 0;
  for (const page of pages) {
    console.log(`→ ${page.id}`);
    try {
      if (!ttsOnly) {
        await fillIpaBatch(page.words || [], force);
        if (page.examples?.length) await fillIpaBatch(page.examples, force);
      }
      if (!ipaOnly) {
        for (let i = 0; i < (page.words || []).length; i++) {
          await enrichTts(
            page.words[i],
            page.id,
            `w${String(i + 1).padStart(2, "0")}`,
            force,
          );
        }
        for (let i = 0; i < (page.examples || []).length; i++) {
          await enrichTts(
            page.examples![i],
            page.id,
            `ex${String(i + 1).padStart(2, "0")}`,
            force,
          );
        }
      }

      const full = JSON.parse(readFileSync(PUBLISHED, "utf8")) as Catalog;
      const idx = full.pages.findIndex((p) => p.id === page.id);
      if (idx >= 0) full.pages[idx] = page;
      else full.pages.push(page);
      full.generatedAt = new Date().toISOString();
      writeFileSync(PUBLISHED, JSON.stringify(full, null, 2) + "\n");
      ok++;
      const sample = page.words?.[0];
      console.log(
        `  ok words=${page.words?.length || 0} examples=${page.examples?.length || 0}` +
          (sample?.ipa ? ` ipa=/${sample.ipa}/` : ""),
      );
    } catch (e) {
      console.error(`  fail: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`==> done ok=${ok}/${pages.length}`);
  if (ok < pages.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
