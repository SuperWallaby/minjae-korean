#!/usr/bin/env npx tsx
/**
 * Enrich /vocab SEO pages: English explanation + examples + TTS.
 *
 * Word TTS: SoVITS (v100) → Azure Whisper STT verify → Edge fallback if score low.
 * Example TTS: SoVITS preferred (Edge on failure).
 *
 * Incremental TTS only (pinned SEO + missing clips):
 *   yarn vocab:enrich -- --tts-only --pinned-only
 *   - examples (sentences): GPU SoVITS (Edge on failure)
 *   - short words (≤SHORT_WORD_MAX hangul): Edge only
 *   - longer missing words: Edge only (GPU reserved for sentences)
 *
 *   yarn vocab:enrich -- --limit 5
 *   yarn vocab:enrich -- --id ant-fresh-stale
 *   yarn vocab:enrich -- --force --limit 3
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { azureChatCompletion } from "../src/lib/azureOpenAI";
import { synthesizeEdgeTtsMp3 } from "../src/lib/edgeTtsServer";
import {
  minScoreForText,
  scoreTtsMatch,
} from "../src/lib/vocabInfographic/ttsQuality";
import type {
  VocabSeoExample,
  VocabSeoPage,
  VocabSeoPublishedFile,
  VocabSeoWord,
} from "../src/lib/vocabInfographic/seoTypes";
import { loadEnvLocal } from "./lib/env_local.mjs";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED_PATH = path.join(
  ROOT,
  "src/data/vocabInfographic/published.json",
);
const AVK_ENV = path.resolve(
  ROOT,
  "../projects/neo-project/auto-video-korean/.env",
);
const SSH_HOST = process.env.VOCAB_TTS_SSH || "lab-worker";
const REMOTE_AVK =
  process.env.VOCAB_TTS_REMOTE_AVK || "~/v100/auto-video-korean";
const REMOTE_PY =
  process.env.VOCAB_TTS_REMOTE_PY ||
  "~/v100/gpt-sovits/conda-env/bin/python";
const SOVITS_VOICE = process.env.KOREAN_QUIZ_SOVITS_VOICE_ID || "Mina";
const EDGE_VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-SunHiNeural";
/** Hangul letters ≤ this → short word, Edge TTS (default 4). */
const SHORT_WORD_MAX = Math.max(
  1,
  Number(process.env.VOCAB_SHORT_WORD_MAX || "4") || 4,
);
const STT_GAP_MS = Math.max(
  0,
  Number(process.env.VOCAB_STT_GAP_MS || "3500") || 3500,
);
/** After Whisper 429 exhaustion, skip STT this long (keep SoVITS). */
const STT_COOLDOWN_MS = Math.max(
  0,
  Number(process.env.VOCAB_STT_COOLDOWN_MS || "120000") || 120_000,
);

let sttCooldownUntil = 0;

type CopyBundle = {
  explanationEn: string;
  examples: Array<{ korean: string; english: string }>;
};

function parseArgs(argv: string[]) {
  let limit = 0;
  let force = false;
  let onlyId: string | undefined;
  let copyOnly = false;
  let pinnedOnly = false;
  let ttsOnly = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) {
      limit = Math.max(0, Number(argv[++i]) || 0);
    } else if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) onlyId = argv[++i];
    else if (a === "--copy-only") copyOnly = true;
    else if (a === "--pinned-only") pinnedOnly = true;
    else if (a === "--tts-only") ttsOnly = true;
  }
  return { limit, force, onlyId, copyOnly, pinnedOnly, ttsOnly };
}

function hangulCount(text: string): number {
  return (String(text || "").match(/[\uAC00-\uD7A3]/g) || []).length;
}

function isShortWord(hangul: string): boolean {
  return hangulCount(hangul) > 0 && hangulCount(hangul) <= SHORT_WORD_MAX;
}

function pageNeedsTts(page: VocabSeoPage): boolean {
  if (!page.examples?.length) return true;
  if (page.examples.some((ex) => ex.korean && !ex.ttsUrl)) return true;
  if (page.words.some((w) => w.hangul?.trim() && !w.ttsUrl)) return true;
  return false;
}

function loadExtraEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

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
  return new S3Client({
    region: "auto",
    endpoint: `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: mustEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: mustEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function publicBase() {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    `https://${mustEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${r2Bucket()}`
  );
}

function stripCodeFence(text: string): string {
  const t = text.trim();
  if (!t.startsWith("```")) return t;
  const lines = t.split("\n");
  if (lines[0]?.startsWith("```")) lines.shift();
  if (lines.at(-1)?.trim() === "```") lines.pop();
  return lines.join("\n").trim();
}

async function uploadMp3(key: string, body: Buffer): Promise<string> {
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

async function synthesizeSovitsMp3(text: string): Promise<Buffer> {
  const remoteOut = `/tmp/vocab-seo-tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  const remoteCmd = [
    `export GPT_SOVITS_API_URL="\${GPT_SOVITS_API_URL:-http://127.0.0.1:9880}"`,
    `cd ${REMOTE_AVK}`,
    `${REMOTE_PY} scripts/generate_korean_quiz_tts.py --text=${JSON.stringify(text)} --output ${remoteOut} --provider sovits --voice-id=${JSON.stringify(SOVITS_VOICE)}`,
  ].join(" && ");

  await execFileAsync(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=12", SSH_HOST, remoteCmd],
    { maxBuffer: 4 * 1024 * 1024, timeout: 600_000 },
  );

  const localDir = mkdtempSync(path.join(tmpdir(), "vocab-seo-tts-"));
  const localOut = path.join(localDir, "out.mp3");
  try {
    await execFileAsync(
      "scp",
      ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", `${SSH_HOST}:${remoteOut}`, localOut],
      { timeout: 120_000 },
    );
    const buf = readFileSync(localOut);
    if (!buf.length) throw new Error("SoVITS returned empty audio");
    return buf;
  } finally {
    rmSync(localDir, { recursive: true, force: true });
    void execFileAsync("ssh", [
      "-o",
      "BatchMode=yes",
      SSH_HOST,
      `rm -f ${remoteOut}`,
    ]).catch(() => undefined);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function transcribeAzureWhisper(mp3: Buffer): Promise<string> {
  const endpoint = (
    process.env.AZURE_OPENAI_STT_ENDPOINT ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  const apiKey = (
    process.env.AZURE_OPENAI_STT_API_KEY ||
    process.env.AZURE_OPENAI_API_KEY ||
    ""
  ).trim();
  const deployment = (
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT ||
    process.env.AZURE_OPENAI_STT_DEPLOYMENT ||
    "whisper-1"
  ).trim();
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION_STT?.trim() || "2024-06-01";
  if (!endpoint || !apiKey) throw new Error("Azure STT not configured");

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/audio/transcriptions?api-version=${encodeURIComponent(apiVersion)}`;
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(mp3)], { type: "audio/mpeg" }),
      "audio.mp3",
    );
    form.append("language", "ko");
    form.append("model", deployment);

    const res = await fetch(url, {
      method: "POST",
      headers: { "api-key": apiKey },
      body: form,
    });
    if (res.ok) {
      const json = (await res.json()) as { text?: string };
      return String(json.text || "").trim();
    }
    const body = await res.text();
    lastErr = new Error(`Azure STT ${res.status}: ${body.slice(0, 240)}`);
    if (res.status === 429 || res.status === 503) {
      const wait = Math.min(12_000, 2_000 * 2 ** attempt);
      console.warn(`    STT ${res.status}, retry in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    throw lastErr;
  }
  throw lastErr || new Error("Azure STT failed");
}

async function wordTtsEdge(
  hangul: string,
): Promise<{ buffer: Buffer; provider: "edge"; score: number }> {
  const edge = await synthesizeEdgeTtsMp3(hangul, { voice: EDGE_VOICE });
  return { buffer: edge, provider: "edge", score: 1 };
}

async function wordTtsWithVerify(
  hangul: string,
): Promise<{ buffer: Buffer; provider: "sovits" | "edge"; score: number }> {
  // Incremental policy: short words skip GPU → Edge only.
  if (isShortWord(hangul)) {
    console.log(
      `    short word Edge (${hangulCount(hangul)}≤${SHORT_WORD_MAX}): "${hangul}"`,
    );
    return wordTtsEdge(hangul);
  }

  const minScore = minScoreForText(hangul);
  let sovits: Buffer | null = null;
  try {
    sovits = await synthesizeSovitsMp3(hangul);
  } catch (err) {
    console.warn(`    SoVITS failed for "${hangul}":`, err);
  }

  if (sovits) {
    const now = Date.now();
    if (now < sttCooldownUntil) {
      console.log(
        `    STT cooldown ${Math.ceil((sttCooldownUntil - now) / 1000)}s — keeping SoVITS for "${hangul}"`,
      );
      return { buffer: sovits, provider: "sovits", score: -1 };
    }
    try {
      if (STT_GAP_MS > 0) await sleep(STT_GAP_MS);
      const heard = await transcribeAzureWhisper(sovits);
      const score = scoreTtsMatch(hangul, heard);
      console.log(
        `    word STT "${hangul}" → "${heard}" score=${score.toFixed(2)} (need ≥${minScore})`,
      );
      if (score >= minScore) {
        return { buffer: sovits, provider: "sovits", score };
      }
      console.warn(`    score too low — Edge fallback`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/Azure STT 429/.test(msg) && STT_COOLDOWN_MS > 0) {
        sttCooldownUntil = Date.now() + STT_COOLDOWN_MS;
        console.warn(
          `    STT rate-limited — cooldown ${STT_COOLDOWN_MS / 1000}s, keeping SoVITS`,
        );
      } else {
        console.warn(
          `    STT unavailable for "${hangul}", keeping SoVITS:`,
          err,
        );
      }
      return { buffer: sovits, provider: "sovits", score: -1 };
    }
  }

  return wordTtsEdge(hangul);
}

async function exampleTts(
  korean: string,
): Promise<{ buffer: Buffer; provider: "sovits" | "edge" }> {
  const t0 = Date.now();
  try {
    console.log(`      … SoVITS SSH (${korean.length} chars)`);
    const sovits = await synthesizeSovitsMp3(korean);
    console.log(`      … SoVITS ok ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    return { buffer: sovits, provider: "sovits" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `      … SoVITS fail ${((Date.now() - t0) / 1000).toFixed(1)}s → Edge: ${msg.slice(0, 180)}`,
    );
    const edge = await synthesizeEdgeTtsMp3(korean, { voice: EDGE_VOICE });
    return { buffer: edge, provider: "edge" };
  }
}

async function generateCopy(page: VocabSeoPage): Promise<CopyBundle> {
  const wordLines = page.words
    .map(
      (w) =>
        `- ${w.hangul}${w.romanization ? ` [${w.romanization}]` : ""} — ${w.english}`,
    )
    .join("\n");

  const prompt = `You write SEO learner copy for a Korean vocabulary chart page.

Chart title: ${page.titleEn}
Format: ${page.format}
Tags: ${page.tags.join(", ") || "none"}
Words:
${wordLines || "(see title)"}

Return JSON only:
{"explanationEn":"...","examples":[{"korean":"...","english":"..."}, ...]}

Rules:
- explanationEn: 2–4 clear English sentences. Explain the GROUP/COMPARISON (not one isolated dictionary gloss). Beginner-friendly. No hashtags.
- examples: prefer exactly 3 natural Korean sentences (min 2, max 4) that use the chart words. Everyday A1–A2. Each needs an English translation.
- Korean must be natural Hangul. English only in explanationEn and example.english.`;

  const raw = await azureChatCompletion(
    [
      {
        role: "system",
        content:
          "You are a Korean teaching editor. Reply with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.35, maxTokens: 1200 },
  );

  if (!raw) throw new Error(`Empty Azure copy for ${page.bundleId}`);

  const parsed = JSON.parse(stripCodeFence(raw)) as CopyBundle;
  const explanationEn = String(parsed.explanationEn || "").trim();
  const examples = (parsed.examples || [])
    .map((ex) => ({
      korean: String(ex.korean || "").trim(),
      english: String(ex.english || "").trim(),
    }))
    .filter((ex) => ex.korean && ex.english)
    .slice(0, 4);

  if (!explanationEn || examples.length < 2) {
    throw new Error(`Bad copy for ${page.bundleId}`);
  }
  return { explanationEn, examples };
}

async function enrichPage(
  page: VocabSeoPage,
  opts: { copyOnly?: boolean; ttsOnly?: boolean } = {},
): Promise<VocabSeoPage> {
  const stamp = Date.now();

  // Incremental: keep existing good copy/TTS; only fill holes.
  if (opts.ttsOnly) {
    let explanationEn = String(page.explanationEn || "").trim();
    let exampleSeed: Array<{ korean: string; english: string; ttsUrl?: string; ttsProvider?: string }> =
      (page.examples || []).map((ex) => ({ ...ex }));

    if (!explanationEn || exampleSeed.length < 2) {
      const copy = await generateCopy(page);
      explanationEn = copy.explanationEn;
      // Keep any existing TTS when Korean matches; otherwise new copy lines.
      const byKo = new Map(
        (page.examples || [])
          .filter((ex) => ex.korean && ex.ttsUrl)
          .map((ex) => [ex.korean, ex]),
      );
      exampleSeed = copy.examples.map((ex) => {
        const prev = byKo.get(ex.korean);
        return prev
          ? { ...ex, ttsUrl: prev.ttsUrl, ttsProvider: prev.ttsProvider }
          : { ...ex };
      });
      console.log(
        `    generated copy (explanation + ${exampleSeed.length} examples)`,
      );
    }

    const words: VocabSeoWord[] = [];
    let wordsFilled = 0;
    let wordsKept = 0;
    for (const w of page.words) {
      if (!w.hangul.trim()) {
        words.push(w);
        continue;
      }
      if (w.ttsUrl) {
        words.push(w);
        wordsKept += 1;
        continue;
      }
      // All missing word clips → Edge (GPU reserved for example sentences).
      const kind = isShortWord(w.hangul)
        ? `short≤${SHORT_WORD_MAX}`
        : `long=${hangulCount(w.hangul)}`;
      console.log(`    word Edge (${kind}): "${w.hangul}"`);
      const { buffer, provider, score } = await wordTtsEdge(w.hangul);
      const key = `grammar-x/vocab-seo-tts/${stamp}-${page.bundleId}-w${words.length}.mp3`;
      const ttsUrl = await uploadMp3(key, buffer);
      words.push({
        ...w,
        ttsUrl,
        ttsProvider: provider,
        ttsScore: score,
      });
      wordsFilled += 1;
    }

    const examples: VocabSeoExample[] = [];
    let exFilled = 0;
    let exKept = 0;
    for (let i = 0; i < exampleSeed.length; i += 1) {
      const ex = exampleSeed[i]!;
      if (ex.ttsUrl) {
        examples.push({
          korean: ex.korean,
          english: ex.english,
          ttsUrl: ex.ttsUrl,
          ttsProvider: ex.ttsProvider,
        });
        exKept += 1;
        continue;
      }
      console.log(`    example SoVITS: "${ex.korean.slice(0, 40)}…"`);
      const { buffer, provider } = await exampleTts(ex.korean);
      const key = `grammar-x/vocab-seo-tts/${stamp}-${page.bundleId}-ex-${i}.mp3`;
      const ttsUrl = await uploadMp3(key, buffer);
      examples.push({
        korean: ex.korean,
        english: ex.english,
        ttsUrl,
        ttsProvider: provider,
      });
      exFilled += 1;
    }

    console.log(
      `    tts-only filled words=${wordsFilled} kept=${wordsKept} examples=${exFilled} keptEx=${exKept}`,
    );

    return {
      ...page,
      explanationEn,
      examples,
      words,
      enrichedAt: page.enrichedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description:
        explanationEn.length > 160
          ? `${explanationEn.slice(0, 157).trimEnd()}…`
          : explanationEn || page.description,
    };
  }

  const copy = await generateCopy(page);

  if (opts.copyOnly) {
    return {
      ...page,
      explanationEn: copy.explanationEn,
      examples: copy.examples.map((ex) => ({
        korean: ex.korean,
        english: ex.english,
      })),
      enrichedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description:
        copy.explanationEn.length > 160
          ? `${copy.explanationEn.slice(0, 157).trimEnd()}…`
          : copy.explanationEn,
    };
  }

  const words: VocabSeoWord[] = [];
  for (const w of page.words) {
    if (!w.hangul.trim()) {
      words.push(w);
      continue;
    }
    const { buffer, provider, score } = await wordTtsWithVerify(w.hangul);
    const key = `grammar-x/vocab-seo-tts/${stamp}-${page.bundleId}-w${words.length}.mp3`;
    const ttsUrl = await uploadMp3(key, buffer);
    words.push({
      ...w,
      ttsUrl,
      ttsProvider: provider,
      ttsScore: score,
    });
  }

  const examples: VocabSeoExample[] = [];
  for (let i = 0; i < copy.examples.length; i += 1) {
    const ex = copy.examples[i]!;
    const { buffer, provider } = await exampleTts(ex.korean);
    const key = `grammar-x/vocab-seo-tts/${stamp}-${page.bundleId}-ex-${i}.mp3`;
    const ttsUrl = await uploadMp3(key, buffer);
    examples.push({ ...ex, ttsUrl, ttsProvider: provider });
  }

  return {
    ...page,
    explanationEn: copy.explanationEn,
    examples,
    words,
    enrichedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description:
      copy.explanationEn.length > 160
        ? `${copy.explanationEn.slice(0, 157).trimEnd()}…`
        : copy.explanationEn,
  };
}

async function main() {
  loadEnvLocal(ROOT);
  loadExtraEnv(AVK_ENV);
  const { limit, force, onlyId, copyOnly, pinnedOnly, ttsOnly } = parseArgs(
    process.argv.slice(2),
  );

  if (copyOnly && ttsOnly) {
    throw new Error("Use either --copy-only or --tts-only, not both");
  }

  if (!existsSync(PUBLISHED_PATH)) {
    throw new Error(`Missing ${PUBLISHED_PATH} — run yarn vocab:publish first`);
  }

  const file = JSON.parse(
    readFileSync(PUBLISHED_PATH, "utf8"),
  ) as VocabSeoPublishedFile;

  let candidates = [...(file.pages || [])];
  if (onlyId) candidates = candidates.filter((p) => p.bundleId === onlyId);
  if (pinnedOnly) {
    const pinnedPath = path.join(
      ROOT,
      ".tmp/vocab-infographic-gen/pinterest-pinned.json",
    );
    if (!existsSync(pinnedPath)) {
      throw new Error(`Missing ${pinnedPath} for --pinned-only`);
    }
    const pinned = JSON.parse(readFileSync(pinnedPath, "utf8")) as Record<
      string,
      unknown
    >;
    const set = new Set(Object.keys(pinned));
    candidates = candidates.filter((p) => set.has(p.bundleId));
  }
  if (!force) {
    candidates = candidates.filter((p) => {
      if (copyOnly) {
        return !p.explanationEn || !(p.examples && p.examples.length >= 2);
      }
      if (ttsOnly) return pageNeedsTts(p);
      return (
        !p.explanationEn ||
        !p.examples?.length ||
        p.words.some((w) => w.hangul && !w.ttsUrl)
      );
    });
  } else if (ttsOnly) {
    // force + tts-only still only pages that lack something unless --force alone wants all;
    // with force we allow redoing pages that already have TTS for targeted --id runs.
  }
  // Prefer pages with words, then fewer words (antonyms finish faster).
  candidates.sort((a, b) => {
    const aHas = a.words.length > 0 ? 0 : 1;
    const bHas = b.words.length > 0 ? 0 : 1;
    if (aHas !== bHas) return aHas - bHas;
    return (
      a.words.length - b.words.length || a.bundleId.localeCompare(b.bundleId)
    );
  });
  if (limit > 0) candidates = candidates.slice(0, limit);

  console.log(
    `[vocab:enrich] ${candidates.length} pages (force=${force} copyOnly=${copyOnly} ttsOnly=${ttsOnly} pinnedOnly=${pinnedOnly} shortMax=${SHORT_WORD_MAX} voice=${SOVITS_VOICE} avkEnv=${existsSync(AVK_ENV)})`,
  );

  const byId = new Map(file.pages.map((p) => [p.bundleId, p]));
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < candidates.length; i += 1) {
    const page = candidates[i]!;
    console.log(
      `\n→ [${i + 1}/${candidates.length}] ${page.bundleId} (${page.words.length} words)`,
    );
    try {
      const enriched = await enrichPage(page, { copyOnly, ttsOnly });
      byId.set(page.bundleId, enriched);
      file.pages = [...byId.values()].sort((a, b) =>
        a.bundleId.localeCompare(b.bundleId),
      );
      file.generatedAt = new Date().toISOString();
      writeFileSync(PUBLISHED_PATH, `${JSON.stringify(file, null, 2)}\n`);
      ok += 1;
      const edgeWords = enriched.words.filter(
        (w) => w.ttsProvider === "edge",
      ).length;
      const sovitsExamples = enriched.examples?.filter(
        (e) => e.ttsProvider === "sovits",
      ).length;
      console.log(
        `  ok explanation=${(enriched.explanationEn || "").slice(0, 60)}… examples=${enriched.examples!.length}${
          copyOnly
            ? " copy-only"
            : ttsOnly
              ? ` tts-only edgeWords=${edgeWords} sovitsEx=${sovitsExamples ?? 0}`
              : ` edgeWords=${edgeWords}`
        }`,
      );
    } catch (err) {
      fail += 1;
      console.error(`  FAIL ${page.bundleId}:`, err);
    }
  }

  console.log(`\n[vocab:enrich] done ok=${ok} fail=${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
