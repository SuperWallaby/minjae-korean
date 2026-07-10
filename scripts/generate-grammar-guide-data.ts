#!/usr/bin/env node
/**
 * Generate "What does xxx mean" and "How to use yyy" grammar SEO pages.
 *
 *   npx tsx scripts/generate-grammar-guide-data.ts --type meaning --word 근데
 *   npx tsx scripts/generate-grammar-guide-data.ts --type usage --word 으로
 *   npx tsx scripts/generate-grammar-guide-data.ts --type meaning --batch-file scripts/data/grammar-meaning-batch.txt
 */
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatGrammarPatternDisplay,
  formatUsageGuideTitleEn,
} from "../src/lib/grammarPatternDisplay";

const __dirname = dirname(fileURLToPath(import.meta.url));

type GuideType = "meaning" | "usage";

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(join(__dirname, ".."));
}

const EXAMPLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sentence", "translationEn", "isCorrect", "reasonKo", "reasonEn"],
  properties: {
    sentence: { type: "string" },
    translationEn: { type: "string" },
    isCorrect: { type: "boolean" },
    reasonKo: { type: "string" },
    reasonEn: { type: "string" },
  },
} as const;

const QUIZ_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "questionKo",
    "questionEn",
    "options",
    "answer",
    "explanationKo",
    "explanationEn",
  ],
  properties: {
    questionKo: { type: "string" },
    questionEn: { type: "string" },
    options: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: { type: "string" },
    },
    answer: { type: "string" },
    explanationKo: { type: "string" },
    explanationEn: { type: "string" },
  },
} as const;

function buildGuideJsonSchema(type: GuideType) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "slug",
      "wordName",
      "titleKo",
      "titleEn",
      "summaryKo",
      "summaryEn",
      "meaningKo",
      "meaningEn",
      "ruleKo",
      "ruleEn",
      "situationsKo",
      "situationsEn",
      "nuancesKo",
      "nuancesEn",
      "examples",
      "quizzes",
      "capybaraQuestionEn",
      "imageAnswerEn",
      "imageAlt",
    ],
    properties: {
      slug: { type: "string" },
      wordName: { type: "string" },
      titleKo: { type: "string" },
      titleEn: { type: "string" },
      summaryKo: { type: "string" },
      summaryEn: { type: "string" },
      meaningKo: { type: "string" },
      meaningEn: { type: "string" },
      ruleKo: { type: "string" },
      ruleEn: { type: "string" },
      situationsKo: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      situationsEn: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      nuancesKo: {
        type: "array",
        minItems: type === "meaning" ? 2 : 0,
        maxItems: 4,
        items: { type: "string" },
      },
      nuancesEn: {
        type: "array",
        minItems: type === "meaning" ? 2 : 0,
        maxItems: 4,
        items: { type: "string" },
      },
      capybaraQuestionEn: { type: "string" },
      imageAnswerEn: { type: "string" },
      imageAlt: { type: "string" },
      examples: {
        type: "array",
        minItems: 4,
        maxItems: 8,
        items: EXAMPLE_SCHEMA,
      },
      quizzes: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: QUIZ_SCHEMA,
      },
    },
  } as const;
}

function parseType(argv: string[]): GuideType | null {
  const flag = argv.find((a) => a.startsWith("--type="));
  if (flag) {
    const v = flag.slice("--type=".length).trim();
    if (v === "meaning" || v === "usage") return v;
    return null;
  }
  const idx = argv.indexOf("--type");
  if (idx >= 0 && argv[idx + 1]) {
    const v = argv[idx + 1]!.trim();
    if (v === "meaning" || v === "usage") return v;
  }
  return null;
}

function parseWord(argv: string[]): string | null {
  const flag = argv.find((a) => a.startsWith("--word="));
  if (flag) return flag.slice("--word=".length).trim() || null;
  const idx = argv.indexOf("--word");
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1]!.trim() || null;
  return null;
}

function parseBatchFile(argv: string[]): string | null {
  const flag = argv.find((a) => a.startsWith("--batch-file="));
  if (flag) return flag.slice("--batch-file=".length).trim() || null;
  const idx = argv.indexOf("--batch-file");
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1]!.trim();
  return null;
}

function parseStartIndex(argv: string[]): number {
  const flag = argv.find((a) => a.startsWith("--start="));
  if (flag) {
    const n = parseInt(flag.slice("--start=".length), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  const idx = argv.indexOf("--start");
  if (idx >= 0 && argv[idx + 1]) {
    const n = parseInt(argv[idx + 1]!, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  return 0;
}

function readAzureConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const deploymentsRaw =
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT?.trim() ||
    "";
  const deployments = deploymentsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!endpoint || !apiKey || deployments.length === 0) {
    throw new Error(
      "Missing Azure OpenAI config. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME.",
    );
  }
  return { endpoint, apiKey, apiVersion, deployments };
}

function buildSystemPrompt(type: GuideType): string {
  const pageKind =
    type === "meaning"
      ? '"What does xxx mean" meaning guide'
      : '"How to use yyy" usage guide';

  return `You are a friendly Korean native "Language Partner" — not a stiff textbook teacher.
Write for B1–B2 Korean learners AND Koreans who want sharper, natural phrasing.
Tone: witty, intuitive, real-life spoken Korean + business nuance when relevant.
Always provide BOTH Korean (_ko) and English (_en) for meanings, rules, reasons, and explanations.

This is a ${pageKind} for a SINGLE Korean word or grammar pattern.
Focus on what learners actually search for on Google.

Examples: ONLY sentences native speakers would agree are clearly correct (⭕) or clearly wrong (❌).
Never include borderline, context-dependent, or "both could work" cases.
reasonEn must be definitive. Ban hedging: might, sometimes, depends, often, can work, etc.
translationEn: natural English translation only (max ~12 words).
Quizzes: 2–4 items; questionEn is the learner-facing prompt in English; questionKo optional Korean example line only when needed; options are Korean; answer must match one option exactly.

Slug: SEO-friendly hyphen-separated, e.g. "what-does-근데-mean" or "how-to-use-으로" (no URL encoding).
titleEn: must match SEO intent — "What does {word} mean?" or "How to use {display} in Korean" where {display} has no hyphen/parens (e.g. "은/ㄴ 후에" not "-(으)ㄴ 후에").
summaryKo/summaryEn: 1–2 sentences hook for the page intro.
capybaraQuestionEn: English question for infographic; Korean allowed ONLY as the clean display form (no hyphen or parentheses).
imageAnswerEn: ONE short English sentence for the capybara answer on the infographic (max 15 words). Complete thought — never a comma-separated keyword list.
situationsEn: 1–3 words each, English only (page content). situationsKo: page content only.
nuancesKo/nuancesEn: ${type === "meaning" ? "2–4 short nuance bullets (meaning pages)" : "may be empty arrays for usage pages"}.
When mentioning Korean words in summaryEn or ruleEn, add romanization in parentheses once.
imageAlt: concise English alt text for accessibility/SEO.`;
}

function buildUserPrompt(type: GuideType, word: string): string {
  if (type === "meaning") {
    return `Create a full "What does ${word} mean?" dictionary-style guide for this Korean word/pattern: ${word}.
Return JSON matching the schema exactly.
- wordName: exactly "${word}"
- titleEn: "What does ${word} mean?" (or natural variant)
- meaningKo/meaningEn: core definition
- ruleKo/ruleEn: how it fits in real sentences / register
- nuancesKo/nuancesEn: shades of meaning learners miss
- 4–8 confident examples
- 2–4 quiz questions`;
  }
  return `Create a full "How to use ${word}" usage guide for this Korean word/pattern: ${word}.
Return JSON matching the schema exactly.
- wordName: exactly "${word}" (keep textbook notation for DB)
- titleEn: "How to use {clean display form} in Korean" — e.g. for "-(으)ㄴ 후에" use "How to use 은/ㄴ 후에 in Korean"
- capybaraQuestionEn: "When to use {clean display form}?" — no hyphen or parentheses in the Korean part
- meaningKo/meaningEn: brief gloss
- ruleKo/ruleEn: practical usage rules and patterns
- situationsKo/situationsEn: when native speakers reach for it
- nuancesKo/nuancesEn: empty arrays OK
- 4–8 confident examples
- 2–4 quiz questions`;
}

async function azureStructuredJson(
  type: GuideType,
  word: string,
): Promise<Record<string, unknown>> {
  const { endpoint, apiKey, apiVersion, deployments } = readAzureConfig();
  const messages = [
    { role: "system" as const, content: buildSystemPrompt(type) },
    { role: "user" as const, content: buildUserPrompt(type, word) },
  ];

  let lastErr: Error | null = null;
  for (const deployment of deployments) {
    const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    const body = {
      messages,
      max_completion_tokens: 8192,
      temperature: 0.45,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: `grammar_guide_${type}`,
          strict: true,
          schema: buildGuideJsonSchema(type),
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "Api-Key": apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300_000),
    });
    const text = await res.text().catch(() => "");
    let data: {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    } | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      lastErr = new Error(
        data?.error?.message || text || `Azure OpenAI HTTP ${res.status}`,
      );
      continue;
    }
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      lastErr = new Error("Azure OpenAI returned empty content");
      continue;
    }
    return JSON.parse(content) as Record<string, unknown>;
  }
  throw lastErr ?? new Error("Azure OpenAI chat failed");
}

function normalizePayload(
  type: GuideType,
  raw: Record<string, unknown>,
  word: string,
  filterExamples: (
    examples: import("../src/lib/grammarGuidesRepo").GuideExample[],
  ) => import("../src/lib/grammarGuidesRepo").GuideExample[],
): import("../src/lib/grammarGuidesRepo").GeneratedGrammarGuidePayload {
  const slug = String(raw.slug ?? "").trim();
  if (!slug) throw new Error("AI response missing slug");

  const wordName = String(raw.wordName ?? word).trim() || word;

  const examplesRaw = Array.isArray(raw.examples) ? raw.examples : [];
  const examples = filterExamples(
    examplesRaw.map((row) => {
      const o = row as Record<string, unknown>;
      return {
        sentence: String(o.sentence ?? "").trim(),
        translationEn: String(o.translationEn ?? "").trim(),
        isCorrect: Boolean(o.isCorrect),
        reasonKo: String(o.reasonKo ?? "").trim(),
        reasonEn: String(o.reasonEn ?? "").trim(),
      };
    }),
  );
  if (examples.length < 3) {
    throw new Error("Need at least 3 confident examples after filtering");
  }

  const quizzesRaw = Array.isArray(raw.quizzes) ? raw.quizzes : [];
  const quizzes = quizzesRaw.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      questionKo: String(o.questionKo ?? "").trim(),
      questionEn: String(o.questionEn ?? "").trim(),
      options: Array.isArray(o.options)
        ? o.options.map((s) => String(s).trim()).filter(Boolean)
        : [],
      answer: String(o.answer ?? "").trim(),
      explanationKo: String(o.explanationKo ?? "").trim(),
      explanationEn: String(o.explanationEn ?? "").trim(),
    };
  });

  const capybaraQuestionEn =
    String(raw.capybaraQuestionEn ?? "").trim() ||
    (type === "meaning"
      ? `What does ${wordName} mean?`
      : `When to use ${formatGrammarPatternDisplay(wordName)}?`);
  const imageAlt =
    String(raw.imageAlt ?? "").trim() ||
    (type === "meaning"
      ? `Korean meaning guide: What does ${wordName} mean?`
      : `Korean usage guide: How to use ${wordName}`);
  const imageAnswerEn =
    String(raw.imageAnswerEn ?? "").trim() ||
    String(raw.meaningEn ?? "").trim() ||
    String(raw.summaryEn ?? "").trim();

  const strArr = (v: unknown) =>
    Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];

  return {
    type,
    slug,
    wordName,
    titleKo: String(raw.titleKo ?? "").trim(),
    titleEn:
      type === "usage"
        ? formatUsageGuideTitleEn(wordName)
        : String(raw.titleEn ?? "").trim(),
    summaryKo: String(raw.summaryKo ?? "").trim(),
    summaryEn: String(raw.summaryEn ?? "").trim(),
    meaningKo: String(raw.meaningKo ?? "").trim(),
    meaningEn: String(raw.meaningEn ?? "").trim(),
    ruleKo: String(raw.ruleKo ?? "").trim(),
    ruleEn: String(raw.ruleEn ?? "").trim(),
    situationsKo: strArr(raw.situationsKo),
    situationsEn: strArr(raw.situationsEn),
    nuancesKo: strArr(raw.nuancesKo),
    nuancesEn: strArr(raw.nuancesEn),
    examples,
    quizzes,
    capybaraQuestionEn,
    imageAnswerEn,
    imageAlt,
  };
}

async function uploadImage(
  type: GuideType,
  id: number,
  slug: string,
  buffer: Buffer,
): Promise<string | null> {
  const { hasR2Config, uploadBufferToR2 } = await import("./lib/r2_upload.mjs");
  if (!hasR2Config()) {
    console.warn("  · R2 not configured — skipping image upload");
    return null;
  }
  const key = `grammar-guides/${type}/${id}/${slug}.webp`;
  return uploadBufferToR2(key, buffer, "image/webp");
}

async function renderGuideWebp(
  type: GuideType,
  questionEn: string,
  wordName: string,
  imageAnswerEn: string,
  meaningEn: string,
  summaryEn: string,
  forceLocal = false,
): Promise<Buffer> {
  const remoteBase = forceLocal
    ? ""
    : process.env.CAPYBARA_RENDER_SERVICE_URL?.trim();

  if (remoteBase) {
    console.log(`  · using GPU render (${remoteBase.replace(/\/+$/, "")})`);
    const url = `${remoteBase.replace(/\/+$/, "")}/render-grammar-guide`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const apiKey = process.env.CAPYBARA_RENDER_API_KEY?.trim();
    if (apiKey) headers["X-API-Key"] = apiKey;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type,
          questionEn,
          wordName,
          imageAnswerEn,
          meaningEn,
          summaryEn,
          outputWidth: 960,
          webpQuality: 85,
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(
          `Remote render failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        );
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  · GPU render unavailable, using local Sharp: ${message}`);
    }
  } else if (forceLocal) {
    console.log("  · using local Sharp render (--local-render)");
  }

  const { renderGrammarGuideImage } = await import("../src/lib/grammarGuideImage");
  return renderGrammarGuideImage({
    type,
    questionEn,
    wordName,
    imageAnswerEn,
    meaningEn,
    summaryEn,
  });
}

async function renderAndUploadGuideImage(
  type: GuideType,
  id: number,
  slug: string,
  questionEn: string,
  wordName: string,
  imageAnswerEn: string,
  meaningEn: string,
  summaryEn: string,
  imageAlt: string,
  forceLocal = false,
): Promise<string | null> {
  const { updateGrammarGuideImage } = await import("../src/lib/grammarGuidesRepo");

  const webp = await renderGuideWebp(
    type,
    questionEn,
    wordName,
    imageAnswerEn,
    meaningEn,
    summaryEn,
    forceLocal,
  );
  const uploadedUrl = await uploadImage(type, id, slug, webp);
  if (uploadedUrl) {
    await updateGrammarGuideImage(id, uploadedUrl, imageAlt);
    console.log(`  · image uploaded: ${uploadedUrl}`);
  }
  return uploadedUrl;
}

async function generateAndUploadPronunciation(
  type: GuideType,
  id: number,
  slug: string,
  wordName: string,
  imageUrl?: string | null,
): Promise<string | null> {
  if (type !== "meaning") return null;

  try {
    const { ensureGrammarGuidePronunciation } = await import(
      "../src/lib/grammarGuideTts"
    );
    const { updateGrammarGuidePronunciation } = await import(
      "../src/lib/grammarGuidesRepo"
    );
    const url = await ensureGrammarGuidePronunciation({
      type,
      id,
      slug,
      wordName,
      imageUrl: imageUrl ?? undefined,
    });
    if (url) {
      await updateGrammarGuidePronunciation(id, url);
      console.log(`  · pronunciation uploaded: ${url}`);
    }
    return url;
  } catch (err) {
    console.warn(
      `  · pronunciation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

function readBatchWords(filePath: string): string[] {
  const abs = filePath.startsWith("/") ? filePath : join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`Batch file not found: ${abs}`);
  return fs
    .readFileSync(abs, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function generateGuideForWord(
  type: GuideType,
  word: string,
  forceLocal = false,
): Promise<{ id: number; slug: string; created: boolean }> {
  const raw = await azureStructuredJson(type, word);
  const { filterConfidentExamples } = await import(
    "../src/lib/grammarComparisonExamples"
  );
  const payload = normalizePayload(type, raw, word, filterConfidentExamples);

  const { upsertGrammarGuideFromGenerated } = await import(
    "../src/lib/grammarGuidesRepo"
  );

  const { id, slug, created } = await upsertGrammarGuideFromGenerated(payload);
  console.log(`  · DB ${created ? "created" : "updated"} id=${id} slug=${slug}`);

  let uploadedImageUrl: string | null = null;
  try {
    uploadedImageUrl = await renderAndUploadGuideImage(
      type,
      id,
      slug,
      payload.capybaraQuestionEn,
      payload.wordName,
      payload.imageAnswerEn,
      payload.meaningEn,
      payload.summaryEn,
      payload.imageAlt,
      forceLocal,
    );
  } catch (err) {
    console.warn(
      `  · image generation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (type === "meaning") {
    await generateAndUploadPronunciation(
      type,
      id,
      slug,
      payload.wordName,
      uploadedImageUrl,
    );
  }

  return { id, slug, created };
}

function guideUrl(type: GuideType, id: number, slug: string): string {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000";
  const prefix = type === "meaning" ? "/grammar/meaning" : "/grammar/usage";
  return `${site}${prefix}/${id}/${encodeURIComponent(slug)}`;
}

async function runBatchFromFile(
  type: GuideType,
  filePath: string,
  startIndex = 0,
  forceLocal = false,
  skipExisting = false,
) {
  const words = readBatchWords(filePath);
  if (words.length === 0) {
    console.error("Batch file has no valid words.");
    process.exit(1);
  }

  console.log(
    `Batch generate ${words.length} ${type} guides from ${filePath} (start=${startIndex})${forceLocal ? " [local-render]" : ""}${skipExisting ? " [skip-existing]" : ""}`,
  );

  const failed: Array<{ index: number; word: string; error: string }> = [];
  let ok = 0;
  let skipped = 0;

  const getGrammarGuideByWord = skipExisting
    ? (await import("../src/lib/grammarGuidesRepo")).getGrammarGuideByWord
    : null;

  for (let i = startIndex; i < words.length; i++) {
    const word = words[i]!;
    if (getGrammarGuideByWord) {
      const existing = await getGrammarGuideByWord(type, word);
      if (existing) {
        skipped += 1;
        console.log(`\n=== [${i + 1}/${words.length}] ${word} — skip existing id=${existing.id} ===`);
        continue;
      }
    }
    console.log(`\n=== [${i + 1}/${words.length}] ${word} ===`);
    try {
      const result = await generateGuideForWord(type, word, forceLocal);
      ok += 1;
      console.log(`  → ${guideUrl(type, result.id, result.slug)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed.push({ index: i, word, error: message });
      console.error(`  ✗ failed: ${message}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(
    JSON.stringify({ ok: failed.length === 0, created: ok, skipped, failed: failed.length, failures: failed }, null, 2),
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

async function reimageGuideById(
  type: GuideType,
  id: number,
  forceLocal: boolean,
): Promise<void> {
  const { getGrammarGuideById } = await import("../src/lib/grammarGuidesRepo");
  const guide = await getGrammarGuideById(id);
  if (!guide) throw new Error(`Guide id=${id} not found`);
  if (guide.type !== type) {
    throw new Error(`Guide id=${id} is type ${guide.type}, expected ${type}`);
  }

  const questionEn =
    type === "meaning"
      ? `What does ${guide.wordName} mean?`
      : `When to use ${formatGrammarPatternDisplay(guide.wordName)}?`;
  const imageAnswerEn = guide.imageAnswerEn?.trim() || guide.meaningEn;

  await renderAndUploadGuideImage(
    type,
    guide.id,
    guide.slug,
    questionEn,
    guide.wordName,
    imageAnswerEn,
    guide.meaningEn,
    guide.summaryEn,
    guide.imageAlt ?? "",
    forceLocal,
  );

  if (type === "meaning") {
    await generateAndUploadPronunciation(
      type,
      guide.id,
      guide.slug,
      guide.wordName,
      guide.imageUrl,
    );
  }
}

async function runReimageBatch(
  type: GuideType,
  filePath: string,
  startIndex: number,
  forceLocal: boolean,
) {
  const { getGrammarGuideByWord } = await import("../src/lib/grammarGuidesRepo");
  const words = readBatchWords(filePath);
  const failed: Array<{ index: number; word: string; error: string }> = [];
  let ok = 0;

  console.log(
    `Reimage ${words.length} ${type} guides from ${filePath} (start=${startIndex})${forceLocal ? " [local-render]" : ""}`,
  );

  for (let i = startIndex; i < words.length; i++) {
    const word = words[i]!;
    console.log(`\n=== [${i + 1}/${words.length}] ${word} ===`);
    try {
      const guide = await getGrammarGuideByWord(type, word);
      if (!guide) throw new Error("Guide not found in DB");
      await reimageGuideById(type, guide.id, forceLocal);
      ok += 1;
      console.log(`  → ${guideUrl(type, guide.id, guide.slug)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed.push({ index: i, word, error: message });
      console.error(`  ✗ failed: ${message}`);
    }
  }

  console.log(
    JSON.stringify({ ok: failed.length === 0, reimaged: ok, failed: failed.length, failures: failed }, null, 2),
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

async function main() {
  await loadEnv();
  const argv = process.argv.slice(2);
  const type = parseType(argv);
  if (!type) {
    console.error(
      "Usage:\n  yarn generate-grammar-guide --type meaning|usage --word 근데\n  yarn generate-grammar-guide --type meaning --batch-file scripts/data/grammar-meaning-batch.txt",
    );
    process.exit(1);
  }

  const forceLocal = argv.includes("--local-render");
  const reimage = argv.includes("--reimage");

  const idFlag = argv.find((a) => a.startsWith("--id="));
  const idFromFlag = idFlag ? parseInt(idFlag.slice("--id=".length), 10) : NaN;
  const idIdx = argv.indexOf("--id");
  const idFromArg =
    idIdx >= 0 && argv[idIdx + 1] ? parseInt(argv[idIdx + 1]!, 10) : NaN;
  const reimageId = Number.isFinite(idFromFlag)
    ? idFromFlag
    : Number.isFinite(idFromArg)
      ? idFromArg
      : null;

  if (reimage && reimageId) {
    console.log(`Reimaging ${type} guide id=${reimageId}`);
    await reimageGuideById(type, reimageId, forceLocal);
    console.log(JSON.stringify({ ok: true, id: reimageId }, null, 2));
    process.exit(0);
  }

  const batchFile = parseBatchFile(argv);
  if (batchFile && reimage) {
    await runReimageBatch(type, batchFile, parseStartIndex(argv), forceLocal);
    return;
  }

  if (batchFile) {
    await runBatchFromFile(
      type,
      batchFile,
      parseStartIndex(argv),
      forceLocal,
      argv.includes("--skip-existing"),
    );
    return;
  }

  const word = parseWord(argv);
  if (!word) {
    console.error(
      "Usage:\n  yarn generate-grammar-guide --type meaning|usage --word 근데\n  yarn generate-grammar-guide --type meaning --batch-file scripts/data/grammar-meaning-batch.txt",
    );
    process.exit(1);
  }

  console.log(`Generating ${type} guide for: ${word}`);
  const { id, slug } = await generateGuideForWord(type, word, forceLocal);
  console.log(
    JSON.stringify({ ok: true, type, id, slug, url: guideUrl(type, id, slug) }, null, 2),
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
