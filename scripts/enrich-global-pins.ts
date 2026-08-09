#!/usr/bin/env npx tsx
/**
 * Enrich global pin catalog: example sentences (Azure) + Edge TTS (target lang).
 *
 *   yarn global:enrich
 *   yarn global:enrich -- --id 01_eye-colors__es
 *   yarn global:enrich -- --force --limit 2
 *   yarn global:enrich -- --tts-only
 *
 * Word TTS: Edge neural voice per language (short vocab).
 * Example TTS: Edge on the target-language sentence.
 * Audio files: public/global/audio/{pinId}/w{n}.mp3 · ex{n}.mp3
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { synthesizeEdgeTtsMp3 } from "../src/lib/edgeTtsServer";
import { edgeVoiceForLang } from "../src/lib/globalSite/voices";
import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import { loadEnvLocal } from "./lib/env_local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/globalPins/published.json");
const AUDIO_ROOT = path.join(ROOT, "public", "global", "audio");

loadEnvLocal(ROOT);

type Word = {
  english: string;
  target: string;
  romanization: string;
  ttsUrl?: string;
  ttsProvider?: string;
};
type Example = {
  target: string;
  english: string;
  ttsUrl?: string;
  ttsProvider?: string;
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
  let ttsOnly = false;
  let copyOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a === "--tts-only") ttsOnly = true;
    else if (a === "--copy-only") copyOnly = true;
  }
  return { limit, force, onlyId, ttsOnly, copyOnly };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function needsWork(page: Page, force: boolean, ttsOnly: boolean) {
  if (force) return true;
  const words = page.words || [];
  const ex = page.examples || [];
  if (!ttsOnly) {
    if (!ex.length || !page.explanationEn) return true;
  }
  if (words.some((w) => w.target?.trim() && !w.ttsUrl)) return true;
  if (ex.some((e) => e.target?.trim() && !e.ttsUrl)) return true;
  return false;
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
  "explanationEn": "2-3 short sentences about this vocabulary theme and how to use it",
  "examples": [
    { "target": "natural short sentence IN the target language", "english": "English translation" }
  ]
}
Rules:
- Provide 4-6 examples total (not one per word if that is too many; prefer natural sentences using the list words).
- Target sentences must be correct ${page.langName}, A1–A2 level.
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
  if (!examples.length) {
    throw new Error("no examples from model");
  }
  return {
    explanationEn: String(data.explanationEn || "").trim() || page.description || "",
    examples,
  };
}

async function writeWordTts(page: Page, word: Word, index: number) {
  const voice = edgeVoiceForLang(page.lang);
  const text = word.target.trim();
  if (!text) return word;
  const dir = path.join(AUDIO_ROOT, page.id);
  mkdirSync(dir, { recursive: true });
  const file = `w${index}.mp3`;
  const abs = path.join(dir, file);
  const buf = await synthesizeEdgeTtsMp3(text, { voice });
  writeFileSync(abs, buf);
  return {
    ...word,
    ttsUrl: `/global/audio/${page.id}/${file}`,
    ttsProvider: "edge",
  };
}

async function writeExampleTts(page: Page, ex: Example, index: number) {
  const voice = edgeVoiceForLang(page.lang);
  const text = ex.target.trim();
  if (!text) return ex;
  const dir = path.join(AUDIO_ROOT, page.id);
  mkdirSync(dir, { recursive: true });
  const file = `ex${index}.mp3`;
  const abs = path.join(dir, file);
  const buf = await synthesizeEdgeTtsMp3(text, { voice });
  writeFileSync(abs, buf);
  return {
    ...ex,
    ttsUrl: `/global/audio/${page.id}/${file}`,
    ttsProvider: "edge",
  };
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
      // preserve existing tts if target text matches
      const prevByTarget = new Map(
        (page.examples || []).map((e) => [e.target, e] as const),
      );
      next.examples = copy.examples.map((e) => {
        const prev = prevByTarget.get(e.target);
        return prev?.ttsUrl
          ? { ...e, ttsUrl: prev.ttsUrl, ttsProvider: prev.ttsProvider }
          : e;
      });
      // SEO description refresh
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
    if (!opts.force && w.ttsUrl && existsSync(path.join(ROOT, "public", w.ttsUrl.replace(/^\//, "")))) {
      wordsOut.push(w);
      continue;
    }
    if (!w.target?.trim()) {
      wordsOut.push(w);
      continue;
    }
    process.stdout.write(`  tts word ${i + 1}/${next.words.length}: ${w.target}… `);
    try {
      const ww = await writeWordTts(next, w, i);
      console.log("ok");
      wordsOut.push(ww);
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
    if (
      !opts.force &&
      ex.ttsUrl &&
      existsSync(path.join(ROOT, "public", ex.ttsUrl.replace(/^\//, "")))
    ) {
      exOut.push(ex);
      continue;
    }
    process.stdout.write(`  tts ex ${i + 1}/${exIn.length}: ${ex.target.slice(0, 40)}… `);
    try {
      const ee = await writeExampleTts(next, ex, i);
      console.log("ok");
      exOut.push(ee);
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
    pages = pages.filter((p) => p.id === args.onlyId);
  }
  const queue = pages.filter((p) => needsWork(p, args.force, args.ttsOnly));
  const limited = args.limit > 0 ? queue.slice(0, args.limit) : queue;
  console.log(
    `==> global enrich queue=${limited.length}/${queue.length} force=${args.force} ttsOnly=${args.ttsOnly}`,
  );

  const byId = new Map(catalog.pages.map((p) => [p.id, p]));
  let ok = 0;
  let fail = 0;
  for (const page of limited) {
    console.log(`→ ${page.id} (${page.langName})`);
    try {
      const enriched = await enrichPage(page, args);
      byId.set(page.id, enriched);
      // persist incrementally
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
