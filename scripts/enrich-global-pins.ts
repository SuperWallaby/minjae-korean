#!/usr/bin/env npx tsx
/**
 * Enrich global pin catalog: example sentences (Azure) + Edge TTS (target lang).
 *
 *   yarn global:enrich
 *   yarn global:enrich -- --id 01_eye-colors__es
 *   yarn global:enrich -- --force --limit 2
 *   yarn global:enrich -- --tts-only
 *
 * Prefer R2 CDN URLs (live without redeploy); else public/global/audio/*.
 * Auto daemon: yarn global:enrich-daemon:install
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
import { edgeVoiceForLang } from "../src/lib/globalSite/voices";
import type { SpanishAccentId } from "../src/lib/globalSite/spanishAccents";
import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import { loadEnvStack } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/globalPins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "global", "audio");

loadEnvStack(ROOT);

type Word = {
  english: string;
  target: string;
  romanization: string;
  ttsUrl?: string;
  ttsProvider?: string;
  ttsLatam?: string;
  ttsEs?: string;
};
type Example = {
  target: string;
  english: string;
  ttsUrl?: string;
  ttsProvider?: string;
  ttsLatam?: string;
  ttsEs?: string;
};
type Page = {
  id: string;
  lang: string;
  langName: string;
  titleEn: string;
  words: Word[];
  examples?: Example[];
  description?: string;
  explanationEn?: string;
  [k: string]: unknown;
};
type Catalog = {
  version: number;
  generatedAt: string;
  site: string;
  languages: { code: string; name: string }[];
  pages: Page[];
};

function parseArgs(argv: string[]) {
  let limit = 0;
  let force = false;
  let onlyId = "";
  let onlyLang = "";
  let ttsOnly = false;
  let copyOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a === "--lang" && argv[i + 1]) onlyLang = argv[++i];
    else if (a === "--tts-only") ttsOnly = true;
    else if (a === "--copy-only") copyOnly = true;
  }
  return { limit, force, onlyId, onlyLang, ttsOnly, copyOnly };
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

function wordNeedsTts(page: Page, w: Word): boolean {
  if (!w.target?.trim()) return false;
  if (page.lang === "es") {
    return !hasTts(w.ttsLatam || w.ttsUrl) || !hasTts(w.ttsEs);
  }
  return !hasTts(w.ttsUrl);
}

function exampleNeedsTts(page: Page, ex: Example): boolean {
  if (!ex.target?.trim()) return false;
  if (page.lang === "es") {
    return !hasTts(ex.ttsLatam || ex.ttsUrl) || !hasTts(ex.ttsEs);
  }
  return !hasTts(ex.ttsUrl);
}

function needsWork(page: Page, force: boolean, ttsOnly: boolean) {
  if (force) return true;
  const words = page.words || [];
  const ex = page.examples || [];
  if (!ttsOnly) {
    if (!ex.length || !page.explanationEn) return true;
  }
  if (words.some((w) => wordNeedsTts(page, w))) return true;
  if (ex.some((e) => exampleNeedsTts(page, e))) return true;
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
  const abs = path.join(AUDIO_ROOT, keyRelative);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  return `/global/audio/${keyRelative}`;
}

async function generateCopy(page: Page): Promise<{
  explanationEn: string;
  examples: Array<{ target: string; english: string }>;
}> {
  const wordLines = (page.words || [])
    .map(
      (w, i) =>
        `${i + 1}. EN: ${w.english} | ${page.langName}: ${w.target} [${w.romanization || ""}]`,
    )
    .join("\n");
  const system = `You write beginner-friendly language-learning page copy for English speakers.
Return ONLY valid JSON:
{
  "explanationEn": "ONE short sentence about this chart — how these words sound / when you say them",
  "examples": [
    { "target": "natural short sentence IN the target language", "english": "English translation" }
  ]
}
Rules:
- Provide 4-6 examples total (not one per word if that is too many; prefer natural sentences using the list words).
- Target sentences must be correct ${page.langName}, A1–A2 level.
- explanationEn: exactly ONE sentence (≤ ~25 words). Pronunciation / listen-first framing. Name a few words from THIS chart — no second sentence, no listicles.
- No romanization in the JSON fields.
- No markdown.`;
  const user = `Chart title: ${page.titleEn}
Language code: ${page.lang} (${page.langName})
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
    explanationEn?: string;
    examples?: Array<{ target?: string; english?: string }>;
  };
  const examples = (data.examples || [])
    .map((e) => ({
      target: String(e.target || "").trim(),
      english: String(e.english || "").trim(),
    }))
    .filter((e) => e.target && e.english)
    .slice(0, 6);
  if (!examples.length) throw new Error("no examples from model");
  const rawExplanation =
    String(data.explanationEn || "").trim() || page.description || "";
  const oneSentence =
    rawExplanation.match(/^[\s\S]+?[.!?。！？](?=\s|$)/)?.[0]?.trim() ||
    rawExplanation.split(/(?<=[.!?。！？])\s+/)[0]?.trim() ||
    rawExplanation;
  return {
    explanationEn: oneSentence,
    examples,
  };
}

async function writeEdgeClip(
  pageId: string,
  key: string,
  text: string,
  lang: string,
  spanishAccent?: SpanishAccentId,
) {
  const voice = edgeVoiceForLang(lang, { spanishAccent });
  const buf = await synthesizeEdgeTtsMp3(text, { voice });
  return storeMp3(`${pageId}/${key}.mp3`, buf);
}

async function writeWordTts(page: Page, word: Word, index: number) {
  const text = word.target.trim();
  if (!text) return word;
  if (page.lang === "es") {
    const ttsLatam = await writeEdgeClip(
      page.id,
      `w${index}-latam`,
      text,
      "es",
      "latam",
    );
    await sleep(80);
    const ttsEs = await writeEdgeClip(page.id, `w${index}-es`, text, "es", "es");
    return {
      ...word,
      ttsUrl: ttsLatam,
      ttsLatam,
      ttsEs,
      ttsProvider: "edge",
    };
  }
  const ttsUrl = await writeEdgeClip(page.id, `w${index}`, text, page.lang);
  return { ...word, ttsUrl, ttsProvider: "edge" };
}

async function writeExampleTts(page: Page, ex: Example, index: number) {
  const text = ex.target.trim();
  if (!text) return ex;
  if (page.lang === "es") {
    const ttsLatam = await writeEdgeClip(
      page.id,
      `ex${index}-latam`,
      text,
      "es",
      "latam",
    );
    await sleep(80);
    const ttsEs = await writeEdgeClip(
      page.id,
      `ex${index}-es`,
      text,
      "es",
      "es",
    );
    return {
      ...ex,
      ttsUrl: ttsLatam,
      ttsLatam,
      ttsEs,
      ttsProvider: "edge",
    };
  }
  const ttsUrl = await writeEdgeClip(page.id, `ex${index}`, text, page.lang);
  return { ...ex, ttsUrl, ttsProvider: "edge" };
}

async function enrichPage(
  page: Page,
  opts: { force: boolean; ttsOnly: boolean; copyOnly: boolean },
): Promise<Page> {
  let next: Page = { ...page, words: [...(page.words || [])] };

  if (!opts.ttsOnly && !opts.copyOnly) {
    if (opts.force || !(next.examples?.length) || !next.explanationEn) {
      console.log(`  copy: Azure examples…`);
      const copy = await generateCopy(next);
      next.explanationEn = copy.explanationEn;
      const prevByTarget = new Map(
        (page.examples || []).map((e) => [e.target, e] as const),
      );
      next.examples = copy.examples.map((e) => {
        const prev = prevByTarget.get(e.target);
        return prev?.ttsUrl && hasTts(prev.ttsUrl)
          ? { ...e, ttsUrl: prev.ttsUrl, ttsProvider: prev.ttsProvider }
          : e;
      });
      const sample = next.words
        .slice(0, 6)
        .map((w) => w.english)
        .join(", ");
      next.description = `Learn ${next.langName}: ${sample}${next.words.length > 6 ? "…" : ""}. Free chart with pronunciation audio and example sentences for English speakers.`;
    }
  }

  if (opts.copyOnly) return next;

  const wordsOut: Word[] = [];
  for (let i = 0; i < next.words.length; i++) {
    const w = next.words[i];
    const esReady =
      page.lang === "es" &&
      hasTts(w.ttsLatam || w.ttsUrl) &&
      hasTts(w.ttsEs);
    if (!opts.force && (esReady || (page.lang !== "es" && hasTts(w.ttsUrl)))) {
      wordsOut.push(w);
      continue;
    }
    if (!w.target?.trim()) {
      wordsOut.push(w);
      continue;
    }
    process.stdout.write(
      `  tts word ${i + 1}/${next.words.length}: ${w.target}… `,
    );
    try {
      wordsOut.push(await writeWordTts(next, w, i));
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
    const esExReady =
      page.lang === "es" &&
      hasTts(ex.ttsLatam || ex.ttsUrl) &&
      hasTts(ex.ttsEs);
    if (
      !opts.force &&
      (esExReady || (page.lang !== "es" && hasTts(ex.ttsUrl)))
    ) {
      exOut.push(ex);
      continue;
    }
    process.stdout.write(
      `  tts ex ${i + 1}/${exIn.length}: ${ex.target.slice(0, 40)}… `,
    );
    try {
      exOut.push(await writeExampleTts(next, ex, i));
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
  if (args.onlyId) pages = pages.filter((p) => p.id === args.onlyId);
  if (args.onlyLang) pages = pages.filter((p) => p.lang === args.onlyLang);
  const queue = pages.filter((p) => needsWork(p, args.force, args.ttsOnly));
  const limited = args.limit > 0 ? queue.slice(0, args.limit) : queue;
  console.log(
    `==> global enrich queue=${limited.length}/${queue.length} force=${args.force} ttsOnly=${args.ttsOnly} r2=${r2Configured()}`,
  );

  const byId = new Map(catalog.pages.map((p) => [p.id, p]));
  let ok = 0;
  let fail = 0;
  for (const page of limited) {
    console.log(`→ ${page.id} (${page.langName})`);
    try {
      byId.set(page.id, await enrichPage(page, args));
      catalog.pages = catalog.pages.map((p) => byId.get(p.id) || p);
      catalog.generatedAt = new Date().toISOString();
      writeFileSync(PUBLISHED, JSON.stringify(catalog, null, 2));
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
