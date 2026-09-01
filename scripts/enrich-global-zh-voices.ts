#!/usr/bin/env npx tsx
/**
 * Global zh vocab pins — CN/TW/HK × F/M via Edge TTS (SoVITS CN swap later).
 *
 *   yarn global:enrich-zh-voices
 *   yarn global:enrich-zh-voices -- --id 01_eye-colors__zh
 *   yarn global:enrich-zh-voices -- --limit 3 --force
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { synthesizeEdgeTtsMp3 } from "../src/lib/edgeTtsServer";
import {
  PRONOUNCE_VOICE_SLOTS,
  pronounceHasFullVoices,
  ttsFieldName,
  type PronounceGenderId,
  type PronounceRegionId,
  type PronounceTtsFields,
} from "../src/lib/pronounceSite/voices";
import { GLOBAL_ZH_EDGE_VOICES } from "./lib/global-zh-edge-voices.mjs";
import { loadEnvLocal } from "./lib/env_local.mjs";
import {
  ensureCatalogImported,
  exportPublishedJson,
  listPages,
  openCatalogDb,
  upsertPage,
} from "./lib/global-pin-catalog-db.mjs";
import { writeLastEnrichRound } from "./lib/last-global-enrich-round.mjs";
import { publishEnrichedPinLive } from "./lib/publish-enriched-pin-live.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/globalPins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "global", "audio");

loadEnvLocal(ROOT);
loadEnvLocal(path.join(ROOT, "../projects/neo-project/auto-video-korean"));

type Word = {
  english: string;
  target: string;
  romanization: string;
} & PronounceTtsFields;

type Page = {
  id: string;
  lang: string;
  langName: string;
  words: Word[];
  [k: string]: unknown;
};

const EDGE_BY_SLOT = new Map(
  GLOBAL_ZH_EDGE_VOICES.map((v) => [v.slot, v.voice] as const),
);

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
    const key = `grammar-x/global-pin-tts/${keyRelative}`;
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
  const dest = path.join(AUDIO_ROOT, keyRelative);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, body);
  return `/global/audio/${keyRelative}`;
}

function edgeVoiceForSlot(
  region: PronounceRegionId,
  gender: PronounceGenderId,
): string {
  const slot = PRONOUNCE_VOICE_SLOTS.find(
    (s) => s.region === region && s.gender === gender,
  )?.slot;
  return (slot && EDGE_BY_SLOT.get(slot)) || "zh-CN-XiaoxiaoNeural";
}

async function enrichWord(
  pageId: string,
  word: Word,
  wordIdx: number,
  force: boolean,
): Promise<Word> {
  const text = String(word.target || "").trim();
  if (!text) return word;
  if (!force && pronounceHasFullVoices(word)) return word;

  const out: Word = { ...word, ttsProvider: "edge" };
  for (const slot of PRONOUNCE_VOICE_SLOTS) {
    const field = ttsFieldName(slot.gender, slot.region);
    if (!force && hasUrl(String(out[field] || ""))) continue;
    const voice = edgeVoiceForSlot(slot.region, slot.gender);
    const key = `${pageId}/w${wordIdx}-${slot.region}-${slot.gender}.mp3`;
    try {
      const mp3 = await synthesizeEdgeTtsMp3(text, { voice });
      out[field] = await storeMp3(key, mp3);
      if (field === "ttsFemaleCn") out.ttsUrl = out[field];
      console.log(`    ok ${slot.label} (${voice})`);
      await sleep(100);
    } catch (e) {
      console.error(
        `    FAIL ${slot.label}:`,
        e instanceof Error ? e.message : e,
      );
    }
  }
  return out;
}

function pageNeedsWork(page: Page, force: boolean): boolean {
  if (force) return true;
  return (page.words || []).some((w) => !pronounceHasFullVoices(w));
}

async function main() {
  const { limit, force, onlyId } = parseArgs(process.argv.slice(2));
  if (!existsSync(PUBLISHED)) {
    console.error("Missing catalog:", PUBLISHED);
    process.exit(1);
  }

  const db = openCatalogDb(ROOT);
  ensureCatalogImported(db, PUBLISHED);
  let pages = listPages(db, { lang: "zh" });
  if (onlyId) pages = pages.filter((p) => p.id === onlyId);
  const queue = pages.filter((p) => pageNeedsWork(p, force));
  const limited = limit > 0 ? queue.slice(0, limit) : queue;

  console.log(
    `==> zh multi-voice enrich pages=${limited.length}/${queue.length} force=${force} r2=${r2Configured()} db=sqlite`,
  );

  let ok = 0;
  let fail = 0;
  const done: { id: string; lang: string }[] = [];

  for (const page of limited) {
    console.log(`→ ${page.id} (${page.words?.length || 0} words)`);
    try {
      const words: Word[] = [...(page.words || [])];
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        process.stdout.write(`  w${i + 1} ${w.target}… `);
        words[i] = await enrichWord(page.id, w, i, force);
        upsertPage(db, { ...page, words }, { preserveTts: true });
        exportPublishedJson(db, PUBLISHED);
        console.log("done");
      }
      ok += 1;
      done.push({ id: page.id, lang: page.lang || "zh" });
      writeLastEnrichRound(done, ROOT);
      try {
        await publishEnrichedPinLive({
          id: page.id,
          lang: page.lang || "zh",
        });
      } catch (e) {
        console.warn(
          `  live publish ${e instanceof Error ? e.message : e}`,
        );
      }
    } catch (e) {
      fail += 1;
      console.error(`  FAIL ${e instanceof Error ? e.message : e}`);
    }
  }

  if (done.length) writeLastEnrichRound(done, ROOT);
  db.close();
  console.log(`==> saved sqlite + ${PUBLISHED} ok=${ok} fail=${fail}`);
  if (fail && !ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
