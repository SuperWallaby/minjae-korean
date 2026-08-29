#!/usr/bin/env npx tsx
/**
 * Enrich EigoChart catalog: Japanese page copy + English Edge TTS (US/UK/AU).
 *
 *   yarn ja:enrich
 *   yarn ja:enrich --id 14_greetings__en-ja
 *   yarn ja:enrich --force --limit 2
 *   yarn ja:enrich --tts-only
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
import { JA_EN_ACCENTS, jaEnHasAllAccents } from "../src/lib/jaSite/accents";
import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import { loadEnvLocal } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/jaPins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "ja", "audio");

loadEnvLocal(ROOT);
loadEnvLocal(
  path.join(ROOT, "../projects/neo-project/auto-video-korean"),
);

type Word = {
  english: string;
  ja: string;
  kana: string;
  ttsUrl?: string;
  ttsUs?: string;
  ttsUk?: string;
  ttsAu?: string;
  ttsProvider?: string;
};
type Example = {
  english: string;
  ja: string;
  ttsUrl?: string;
  ttsUs?: string;
  ttsUk?: string;
  ttsAu?: string;
  ttsProvider?: string;
};
type Page = {
  id: string;
  titleJa: string;
  titleEn: string;
  words: Word[];
  examples?: Example[];
  description?: string;
  explanationJa?: string;
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
  let ttsOnly = false;
  let copyOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--id=")) onlyId = a.slice(5);
    else if (a === "--ids" && argv[i + 1]) onlyId = argv[++i];
    else if (a.startsWith("--ids=")) onlyId = a.slice(6);
    else if (a === "--tts-only") ttsOnly = true;
    else if (a === "--copy-only") copyOnly = true;
  }
  return { limit, force, onlyId, ttsOnly, copyOnly };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hasTts(url?: string): boolean {
  if (!url?.trim()) return false;
  if (/^https?:\/\//i.test(url)) return true;
  const rel = url.replace(/^\//, "");
  return existsSync(path.join(ROOT, "public", rel)) || existsSync(path.join(ROOT, rel));
}

function needsWork(page: Page, force: boolean, ttsOnly: boolean) {
  if (force) return true;
  const words = page.words || [];
  const ex = page.examples || [];
  if (!ttsOnly) {
    if (!ex.length || !page.explanationJa) return true;
  }
  if (words.some((w) => w.english?.trim() && !jaEnHasAllAccents(w))) return true;
  if (ex.some((e) => e.english?.trim() && !jaEnHasAllAccents(e))) return true;
  return false;
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
    const key = `grammar-x/ja-en-pin-tts/${keyRelative}`;
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
  return `/ja/audio/${keyRelative}`;
}

async function generateCopy(page: Page): Promise<{
  explanationJa: string;
  examples: Array<{ english: string; ja: string }>;
}> {
  const wordLines = (page.words || [])
    .map((w, i) => `${i + 1}. EN: ${w.english} | JA: ${w.ja} [${w.kana || ""}]`)
    .join("\n");
  const system = `You write beginner-friendly English-learning page copy for Japanese speakers.
Return ONLY valid JSON:
{
  "explanationJa": "このテーマの英単語の使い方を日本語で2〜3文",
  "examples": [
    { "english": "short natural English sentence using list words", "ja": "日本語訳" }
  ]
}
Rules:
- 4–6 examples, A1–A2 English.
- english = the sentence learners should hear (TTS target).
- ja = Japanese translation.
- No Korean. No markdown.`;
  const user = `Chart title: ${page.titleJa}
Words:
${wordLines}`;

  const raw = await azureChat({
    system,
    user,
    temperature: 0.4,
    maxTokens: 1800,
    jsonMode: true,
  });
  const text = stripCodeFence(String(raw || ""));
  const data = JSON.parse(text) as {
    explanationJa?: string;
    examples?: Array<{ english?: string; ja?: string }>;
  };
  const examples = (data.examples || [])
    .map((e) => ({
      english: String(e.english || "").trim(),
      ja: String(e.ja || "").trim(),
    }))
    .filter((e) => e.english && e.ja)
    .slice(0, 6);
  if (!examples.length) throw new Error("no examples from model");
  return {
    explanationJa:
      String(data.explanationJa || "").trim() || page.description || "",
    examples,
  };
}

async function writeAccentBundle(
  text: string,
  id: string,
  stem: string,
  prev: Word | Example,
  force: boolean,
): Promise<Pick<Word, "ttsUrl" | "ttsUs" | "ttsUk" | "ttsAu" | "ttsProvider">> {
  const out: Pick<
    Word,
    "ttsUrl" | "ttsUs" | "ttsUk" | "ttsAu" | "ttsProvider"
  > = {
    ttsUrl: prev.ttsUrl,
    ttsUs: prev.ttsUs || prev.ttsUrl,
    ttsUk: prev.ttsUk,
    ttsAu: prev.ttsAu,
    ttsProvider: "edge",
  };

  for (const accent of JA_EN_ACCENTS) {
    const key = `tts${accent.id[0].toUpperCase()}${accent.id.slice(1)}` as
      | "ttsUs"
      | "ttsUk"
      | "ttsAu";
    if (!force && hasTts(out[key])) continue;
    const buf = await synthesizeEdgeTtsMp3(text, { voice: accent.voice });
    const url = await storeMp3(`${id}/${stem}.${accent.id}.mp3`, buf);
    out[key] = url;
    if (accent.id === "us") {
      out.ttsUrl = url;
      await storeMp3(`${id}/${stem}.mp3`, buf);
    }
    await sleep(80);
  }
  return out;
}

async function writeWordTts(page: Page, word: Word, index: number, force: boolean) {
  const text = word.english.trim();
  if (!text) return word;
  const tts = await writeAccentBundle(text, page.id, `w${index}`, word, force);
  return { ...word, ...tts };
}

async function writeExampleTts(
  page: Page,
  ex: Example,
  index: number,
  force: boolean,
) {
  const text = ex.english.trim();
  if (!text) return ex;
  const tts = await writeAccentBundle(text, page.id, `ex${index}`, ex, force);
  return { ...ex, ...tts };
}

async function enrichPage(
  page: Page,
  opts: { force: boolean; ttsOnly: boolean; copyOnly: boolean },
): Promise<Page> {
  let next: Page = { ...page, words: [...(page.words || [])] };

  if (!opts.ttsOnly && !opts.copyOnly) {
    if (opts.force || !next.examples?.length || !next.explanationJa) {
      console.log(`  copy: Azure examples…`);
      const copy = await generateCopy(next);
      next.explanationJa = copy.explanationJa;
      const prevByEn = new Map(
        (page.examples || []).map((e) => [e.english, e] as const),
      );
      next.examples = copy.examples.map((e) => {
        const prev = prevByEn.get(e.english);
        return prev && jaEnHasAllAccents(prev)
          ? {
              ...e,
              ttsUrl: prev.ttsUrl,
              ttsUs: prev.ttsUs,
              ttsUk: prev.ttsUk,
              ttsAu: prev.ttsAu,
              ttsProvider: prev.ttsProvider,
            }
          : e;
      });
      const sample = next.words
        .slice(0, 6)
        .map((w) => w.english)
        .join("、");
      next.description = `日本人向け英単語：${sample}${next.words.length > 6 ? "…" : ""}。発音音声と例文つき。`;
    }
  }

  if (opts.copyOnly) return next;

  const wordsOut: Word[] = [];
  for (let i = 0; i < next.words.length; i++) {
    const w = next.words[i];
    if (!opts.force && jaEnHasAllAccents(w)) {
      wordsOut.push(w);
      continue;
    }
    if (!w.english?.trim()) {
      wordsOut.push(w);
      continue;
    }
    process.stdout.write(
      `  tts word ${i + 1}/${next.words.length}: ${w.english}… `,
    );
    try {
      wordsOut.push(await writeWordTts(next, w, i, opts.force));
      console.log("ok");
      await sleep(120);
    } catch (e) {
      console.log(`FAIL ${e instanceof Error ? e.message : e}`);
      wordsOut.push(w);
    }
  }
  next.words = wordsOut;

  const exIn = next.examples || [];
  const exOut: Example[] = [];
  for (let i = 0; i < exIn.length; i++) {
    const ex = exIn[i];
    if (!opts.force && jaEnHasAllAccents(ex)) {
      exOut.push(ex);
      continue;
    }
    process.stdout.write(
      `  tts ex ${i + 1}/${exIn.length}: ${ex.english.slice(0, 40)}… `,
    );
    try {
      exOut.push(await writeExampleTts(next, ex, i, opts.force));
      console.log("ok");
      await sleep(150);
    } catch (e) {
      console.log(`FAIL ${e instanceof Error ? e.message : e}`);
      exOut.push(ex);
    }
  }
  next.examples = exOut;
  return next;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(PUBLISHED)) {
    console.error("missing catalog", PUBLISHED);
    process.exit(1);
  }
  const catalog = JSON.parse(readFileSync(PUBLISHED, "utf8")) as Catalog;
  let pages = catalog.pages || [];
  if (args.onlyId) {
    const want = new Set(
      String(args.onlyId)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    pages = pages.filter((p) => want.has(p.id));
  }
  const queue = pages.filter((p) => needsWork(p, args.force, args.ttsOnly));
  const limited = args.limit > 0 ? queue.slice(0, args.limit) : queue;
  console.log(
    `==> ja-en enrich queue=${limited.length}/${queue.length} force=${args.force} ttsOnly=${args.ttsOnly} r2=${r2Configured()}`,
  );

  const byId = new Map(catalog.pages.map((p) => [p.id, p]));
  let ok = 0;
  let fail = 0;
  for (const page of limited) {
    console.log(`→ ${page.id} (${page.titleJa})`);
    try {
      byId.set(page.id, await enrichPage(page, args));
      catalog.pages = catalog.pages.map((p) => byId.get(p.id) || p);
      catalog.generatedAt = new Date().toISOString();
      writeFileSync(PUBLISHED, JSON.stringify(catalog, null, 2) + "\n");
      ok += 1;
    } catch (e) {
      fail += 1;
      console.error(`  FAIL ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`done ok=${ok} fail=${fail}`);
  if (fail && !ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
