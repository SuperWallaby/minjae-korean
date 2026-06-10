#!/usr/bin/env node
/**
 * Convert the best YouTube digest transcript into the site's article JSON,
 * using Azure OpenAI by default (or direct OpenAI when explicitly requested),
 * then optionally register it through the local admin APIs and run the same
 * auto-generation phases used by the article editor.
 *
 * Usage:
 *   node scripts/youtube_digest_to_news_article.mjs
 *   node scripts/youtube_digest_to_news_article.mjs --register
 *   node scripts/youtube_digest_to_news_article.mjs --register --full
 *
 * Env:
 *   YOUTUBE_NEWS_PROVIDER=azure|openai|auto  (default azure)
 *   OPENAI_API_KEY
 *   OPENAI_MODEL=gpt-5.5
 *   Azure OpenAI chat:
 *     AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY,
 *     YOUTUBE_NEWS_AZURE_DEPLOYMENT or AZURE_OPENAI_RESPONSES_DEPLOYMENT
 *     or AZURE_OPENAI_CHAT_DEPLOYMENTS / AZURE_OPENAI_DEPLOYMENT_CHAT / AZURE_OPENAI_DEPLOYMENT
 *     Defaults to the verified Azure Responses deployment `gpt-5.4-pro` when unset.
 *     YOUTUBE_NEWS_AZURE_API=responses|chat|auto  (default responses)
 *     YOUTUBE_NEWS_AZURE_MAX_OUTPUT_TOKENS=10000
 *   YOUTUBE_NEWS_INPUT=.tmp/youtube-personal-digest.json
 *   YOUTUBE_NEWS_OUT=.tmp/youtube-news-article.json
 *   YOUTUBE_NEWS_BASE_URL=http://localhost:3000
 *   YOUTUBE_NEWS_LLM_HEARTBEAT_MS=25000   (LLM 대기 중 stderr heartbeat 간격, 최소 5000)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env.local");
const DEFAULT_INPUT = join(ROOT, ".tmp", "youtube-personal-digest.json");
const DEFAULT_OUT = join(ROOT, ".tmp", "youtube-news-article.json");
const AGENT_DEBUG_LOG = join(ROOT, ".cursor", "debug-dce0aa.log");

function agentLogLine(payload) {
  try {
    appendFileSync(
      AGENT_DEBUG_LOG,
      `${JSON.stringify({ sessionId: "dce0aa", ...payload, timestamp: Date.now() })}\n`,
    );
  } catch {
    /* ignore */
  }
}

/** Match `NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY` in src/lib/newsCoverDefaults.ts */
const NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY = 0.3;

function loadEnvLocal() {
  if (!existsSync(ENV_PATH)) return;
  const raw = readFileSync(ENV_PATH, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
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

function parseArgs(argv) {
  const has = (flag) => argv.includes(flag);
  const val = (flag, fallback = null) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    input: val("--input", process.env.YOUTUBE_NEWS_INPUT || DEFAULT_INPUT),
    out: val("--out", process.env.YOUTUBE_NEWS_OUT || DEFAULT_OUT),
    index: Number.parseInt(val("--index", "0"), 10) || 0,
    register: has("--register"),
    full: has("--full"),
    baseUrl: val(
      "--base-url",
      process.env.YOUTUBE_NEWS_BASE_URL || "http://localhost:3000",
    ).replace(/\/+$/, ""),
  };
}

function mustReadJson(path) {
  const abs = resolve(ROOT, path);
  return JSON.parse(readFileSync(abs, "utf8"));
}

function pickDigestResult(inputPath, index) {
  const data = mustReadJson(inputPath);
  const results = Array.isArray(data.results) ? data.results : [];
  const item = results[index];
  if (!item) throw new Error(`No digest result at index ${index}`);
  const transcript = String(item.textForPersonalSummary || "").trim();
  if (!transcript) throw new Error("Digest result is missing textForPersonalSummary");
  return item;
}

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "slug",
    "articleCode",
    "levels",
    "level",
    "title",
    "introductionEn",
    "audio",
    "imageThumb",
    "imageLarge",
    "paragraphs",
    "vocabulary",
    "questions",
    "discussion",
    "createdAt",
    "updatedAt",
    "readingCues",
  ],
  properties: {
    slug: { type: "string" },
    articleCode: { type: "string" },
    levels: { type: "array", items: { type: "number" } },
    level: { type: "number" },
    title: { type: "string" },
    introductionEn: { type: "string" },
    audio: { type: ["string", "null"] },
    imageThumb: { type: ["string", "null"] },
    imageLarge: { type: ["string", "null"] },
    paragraphs: {
      type: "array",
      items: { $ref: "#/$defs/Paragraph" },
    },
    vocabulary: {
      type: "array",
      items: { $ref: "#/$defs/Vocab" },
    },
    questions: {
      type: "array",
      items: { type: "string" },
    },
    discussion: {
      type: "array",
      items: { type: "string" },
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    readingCues: {
      type: "array",
      items: { $ref: "#/$defs/ReadingCue" },
    },
  },
  $defs: {
    Paragraph: {
      type: "object",
      additionalProperties: false,
      required: ["subtitle", "content", "image", "youtube"],
      properties: {
        subtitle: { type: "string" },
        content: { type: "string" },
        image: { type: ["string", "null"] },
        youtube: { type: ["string", "null"] },
      },
    },
    Vocab: {
      type: "object",
      additionalProperties: false,
      required: [
        "word",
        "description_en",
        "example",
        "sound",
        "image",
        "phonetic",
        "exampleSound",
      ],
      properties: {
        word: { type: "string" },
        description_en: { type: "string" },
        example: { type: "string" },
        sound: { type: ["string", "null"] },
        image: { type: ["string", "null"] },
        phonetic: { type: ["string", "null"] },
        exampleSound: { type: ["string", "null"] },
      },
    },
    ReadingCue: {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "text",
        "kind",
        "paragraphIndex",
        "sentenceIndex",
        "order",
        "startMs",
        "endMs",
      ],
      properties: {
        id: { type: "string" },
        text: { type: "string" },
        kind: { type: "string", enum: ["subtitle", "sentence"] },
        paragraphIndex: { type: "integer" },
        sentenceIndex: { type: "integer" },
        order: { type: "integer" },
        startMs: { type: "integer" },
        endMs: { type: "integer" },
      },
    },
  },
};

const ARTICLE_SYSTEM_PROMPT = `You transform a long transcript into the site's fixed Korean article JSON.

Outcome:
- One valid JSON object only.
- Korean, first-person teacher voice.
- The article must feel useful and worth reading, not like a literal transcript translation.
- introductionEn must be a concise, natural English introduction (2-3 sentences) for admins/SEO. It should explain why the article is useful or interesting.

Reading level (mandatory — pick exactly ONE band and set JSON fields to match):
- Infer how much you must simplify the Korean for the learner and the topic (vocabulary density, sentence length, 한자어/뉴스체, abstract ideas).
- Set integer \`level\` to 1–5 and set \`levels\` to a non-empty array of those integers (usually \`levels: [level]\` only). Do not default to 3 without thinking.
- The five band names below are rubric labels only — never paste them into title, subtitles, or body.

Band → level:
1) "진짜 진짜 아주 아주 쉽게" → level 1: 초입문. 아주 짧은 문장, 고빈도 어휘, 뉴스어·한자어 최소화, 개념은 풀어서 설명.
2) "아주아주 쉽게" → level 2: 입문 상단. 여전히 짧고 쉬운 말 위주, 어려운 말 나오면 바로 풀어 말함.
3) "아주 쉽게" → level 3: 초중급. 쉬운 글말 위주, 필요할 때만 짧게 보조 설명.
4) "쉽게" → level 4: 중급 독해용. 뉴스 느낌은 살리되 문장·어휘는 한 번 정리해서 읽기 부담 줄임.
5) "아무말도 하지않기" → level 5: 상급. 난이도 부연·"쉬운 말로" 같은 메타 설명 없이 자연스러운 한국어로 전달; 군더더기 없이 밀도 있게.

The Korean in paragraphs and vocabulary MUST match the chosen level (do not write level-1 Korean while setting level 5, etc.).

Hard rules:
- Do not use third-person/meta phrases such as "이 코치는", "그는", "그녀는", "영상에서는", "이 글에서는".
- Never use the characters \`:\` (ASCII colon) or \`：\` (fullwidth colon) in \`title\` or in any \`paragraphs[].subtitle\`. Do not write "주제: 부제" patterns — use a comma, question, middle dot (·), or split the idea without a colon.
- paragraphs[].subtitle must be Korean.
- Rewrite, compress, and teach. Do not translate line by line.
- Do not invent facts beyond the transcript. When uncertain, soften the claim.
- audio, imageThumb, imageLarge, paragraphs[].image, paragraphs[].youtube, vocabulary[].sound, vocabulary[].image, vocabulary[].exampleSound are null.
- readingCues are Minimal mode only: p0 subtitle + first two p0 sentences.

Content target:
- 6-10 paragraphs.
- Each paragraph content is 2-4 short Korean sentences (for level 5, sentences may be slightly longer if still clear).
- Vocabulary is 4-6 Korean words with English meanings and simple Korean examples (example difficulty should match level).
- questions: 3 comprehension questions in Korean.
- discussion: 3 conversation questions in Korean.`;

function buildArticleUserPrompt(result) {
  const now = new Date().toISOString();
  return `Create the fixed article JSON from this YouTube transcript.

Before writing paragraphs: choose exactly one reading band (level 1–5) using the rubric in the system message ("진짜 진짜 아주 아주 쉽게" … "아무말도 하지않기") and set level + levels to match the Korean you will actually write.
Do not use ':' or '：' in the Korean title or any paragraph subtitle.

Source metadata:
- title: ${result.title || ""}
- url: ${result.url || ""}
- channel: ${result.channelTitle || ""}
- search query: ${result.query || ""}
- durationSeconds: ${result.durationSeconds ?? ""}
- preTranscriptAi: ${JSON.stringify(result.preTranscriptAi ?? null)}

Use this ISO timestamp for both createdAt and updatedAt: ${now}
Make slug and articleCode lowercase English with hyphens.

Transcript:
${String(result.textForPersonalSummary || "").trim()}`;
}

function responseOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (typeof c.text === "string") chunks.push(c.text);
    }
  }
  return chunks.join("").trim();
}

function chatOutputText(data) {
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

function readAzureChatConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const raw = process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.trim();
  let deployments = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  if (!deployments.length) {
    const single =
      process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
      process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
    if (single) deployments = [single];
  }
  if (!endpoint || !apiKey || !deployments.length) return null;
  return { endpoint, apiKey, apiVersion, deployments };
}

function readAzureConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const explicit =
    process.env.YOUTUBE_NEWS_AZURE_DEPLOYMENT?.trim() ||
    process.env.AZURE_OPENAI_RESPONSES_DEPLOYMENT?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT_RESPONSES?.trim() ||
    "gpt-5.4-pro";
  const chat = readAzureChatConfig();
  const deployments = explicit
    ? [explicit, ...(chat?.deployments || []).filter((d) => d !== explicit)]
    : chat?.deployments || [];
  if (!endpoint || !apiKey || !deployments.length) return null;
  return { endpoint, apiKey, apiVersion, deployments };
}

function slugify(value, fallback = "youtube-article") {
  const s = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || `${fallback}-${Date.now().toString(36)}`;
}

function splitSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?。！？]|[다요죠까네돼])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Site style: no "주제: 부제" colons in title or paragraph subtitles (AI sometimes emits U+003A / U+FF1A). */
function stripDisplayColons(text) {
  return String(text || "")
    .replace(/\uFF1A/g, ", ")
    .replace(/:/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,+/g, ", ")
    .trim();
}

function normalizeArticleJson(article) {
  const now = new Date().toISOString();
  const title = stripDisplayColons(String(article.title || "").trim());
  if (!title) throw new Error("Generated article missing title");
  const paragraphs = Array.isArray(article.paragraphs) ? article.paragraphs : [];
  if (paragraphs.length < 1) throw new Error("Generated article missing paragraphs");

  const normalizedParagraphs = paragraphs.map((p) => ({
    subtitle: stripDisplayColons(String(p?.subtitle || "").trim()),
    content: String(p?.content || "").trim(),
    image: typeof p?.image === "string" && p.image.trim() ? p.image.trim() : null,
    youtube: typeof p?.youtube === "string" && p.youtube.trim() ? p.youtube.trim() : null,
  }));

  const p0 = normalizedParagraphs[0];
  const p0Sentences = splitSentences(p0?.content || "");
  const cue0Text = p0?.subtitle || title;
  const cue1Text = p0Sentences[0] || p0?.content || title;
  const cue2Text = p0Sentences[1] || p0Sentences[0] || p0?.content || title;
  const readingCues = [
    {
      id: "p0-subtitle",
      text: cue0Text,
      kind: "subtitle",
      paragraphIndex: 0,
      sentenceIndex: 0,
      order: 0,
      startMs: 0,
      endMs: 1800,
    },
    {
      id: "p0-s0",
      text: cue1Text,
      kind: "sentence",
      paragraphIndex: 0,
      sentenceIndex: 0,
      order: 1,
      startMs: 2000,
      endMs: 5600,
    },
    {
      id: "p0-s1",
      text: cue2Text,
      kind: "sentence",
      paragraphIndex: 0,
      sentenceIndex: 1,
      order: 2,
      startMs: 6000,
      endMs: 9800,
    },
  ];

  const clampLevel = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 3;
    return Math.min(5, Math.max(1, Math.round(x)));
  };
  const level = clampLevel(article.level);
  const rawLevels = Array.isArray(article.levels) ? article.levels : [];
  const levelsSet = new Set(
    rawLevels.map((n) => clampLevel(n)).filter((n) => n >= 1 && n <= 5),
  );
  if (!levelsSet.size) levelsSet.add(level);
  const levels = Array.from(levelsSet).sort((a, b) => a - b);

  return {
    slug: slugify(article.slug || article.articleCode || title),
    articleCode: slugify(article.articleCode || article.slug || title),
    levels,
    level,
    title,
    introductionEn: String(article.introductionEn || "").trim(),
    audio: typeof article.audio === "string" && article.audio.trim() ? article.audio.trim() : null,
    imageThumb:
      typeof article.imageThumb === "string" && article.imageThumb.trim()
        ? article.imageThumb.trim()
        : null,
    imageLarge:
      typeof article.imageLarge === "string" && article.imageLarge.trim()
        ? article.imageLarge.trim()
        : null,
    paragraphs: normalizedParagraphs,
    vocabulary: Array.isArray(article.vocabulary)
      ? article.vocabulary.map((v) => ({
          word: String(v?.word || "").trim(),
          description_en: String(v?.description_en || "").trim(),
          example: String(v?.example || "").trim(),
          sound: typeof v?.sound === "string" && v.sound.trim() ? v.sound.trim() : null,
          image: typeof v?.image === "string" && v.image.trim() ? v.image.trim() : null,
          phonetic:
            typeof v?.phonetic === "string" && v.phonetic.trim() ? v.phonetic.trim() : null,
          exampleSound:
            typeof v?.exampleSound === "string" && v.exampleSound.trim()
              ? v.exampleSound.trim()
              : null,
        }))
      : [],
    questions: Array.isArray(article.questions) ? article.questions.map(String).slice(0, 3) : [],
    discussion: Array.isArray(article.discussion)
      ? article.discussion.map(String).slice(0, 3)
      : [],
    createdAt: typeof article.createdAt === "string" && article.createdAt ? article.createdAt : now,
    updatedAt: typeof article.updatedAt === "string" && article.updatedAt ? article.updatedAt : now,
    readingCues,
  };
}

/** stderr heartbeat while waiting on LLM HTTP (OpenAI / Azure). */
async function withLlmHeartbeat(phaseLabel, fn) {
  const ms = Math.max(
    5000,
    Number.parseInt(process.env.YOUTUBE_NEWS_LLM_HEARTBEAT_MS || "25000", 10) || 25000,
  );
  const started = Date.now();
  let tick = 0;
  const id = setInterval(() => {
    tick += 1;
    const elapsedSec = Math.round((Date.now() - started) / 1000);
    console.error(
      `[youtube-article] … LLM 처리 중 — ${phaseLabel} (${elapsedSec}s, #${tick})`,
    );
  }, ms);
  try {
    return await fn();
  } finally {
    clearInterval(id);
  }
}

async function generateArticleJson(result) {
  const provider = (process.env.YOUTUBE_NEWS_PROVIDER || "azure").trim().toLowerCase();
  if (provider === "azure") return generateArticleJsonWithAzure(result);
  if (provider === "auto" && readAzureChatConfig()) return generateArticleJsonWithAzure(result);

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    if (provider === "openai") throw new Error("OPENAI_API_KEY is required for openai provider");
    return generateArticleJsonWithAzure(result);
  }
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
  console.error(`  · provider: OpenAI Responses (${model})`);
  return withLlmHeartbeat(`OpenAI Responses · ${model}`, async () => {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: ARTICLE_SYSTEM_PROMPT },
          { role: "user", content: buildArticleUserPrompt(result) },
        ],
        reasoning: { effort: process.env.OPENAI_REASONING_EFFORT || "medium" },
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "korean_teacher_article",
            schema: ARTICLE_SCHEMA,
            strict: true,
          },
        },
      }),
      signal: AbortSignal.timeout(300_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        data?.error?.message || data?.message || `OpenAI Responses API HTTP ${res.status}`,
      );
    }
    const text = responseOutputText(data);
    if (!text) throw new Error("OpenAI returned empty output text");
    return normalizeArticleJson(JSON.parse(text));
  });
}

async function azureChatArticleJson(result, deployment, useStructuredOutput) {
  return withLlmHeartbeat(`Azure chat · ${deployment}`, async () => {
    const azure = readAzureChatConfig();
    if (!azure) {
      throw new Error(
        "OPENAI_API_KEY is missing, and Azure OpenAI chat env vars are incomplete.",
      );
    }
    const url = `${azure.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(azure.apiVersion)}`;
    const body = {
      messages: [
        { role: "system", content: ARTICLE_SYSTEM_PROMPT },
        { role: "user", content: buildArticleUserPrompt(result) },
      ],
      max_completion_tokens:
        Number.parseInt(process.env.YOUTUBE_NEWS_AZURE_MAX_OUTPUT_TOKENS || "10000", 10) ||
        10000,
      temperature: 0.15,
      top_p: 0.9,
      response_format: useStructuredOutput
        ? {
            type: "json_schema",
            json_schema: {
              name: "korean_teacher_article",
              strict: true,
              schema: ARTICLE_SCHEMA,
            },
          }
        : { type: "json_object" },
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azure.apiKey,
        "Api-Key": azure.apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300_000),
    });
    const text = await res.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || text || `Azure OpenAI HTTP ${res.status}`;
      throw new Error(msg);
    }
    const content = chatOutputText(data);
    if (!content) throw new Error("Azure OpenAI returned empty content");
    return normalizeArticleJson(JSON.parse(content));
  });
}

async function azureResponsesArticleJson(result, deployment, useStructuredOutput, useReasoning) {
  return withLlmHeartbeat(
    `Azure responses · ${deployment}${useReasoning ? " · reasoning" : ""}`,
    async () => {
      const azure = readAzureConfig();
      if (!azure) {
        throw new Error("Azure OpenAI env vars are incomplete.");
      }
      const urls = [
        `${azure.endpoint}/openai/v1/responses`,
        `${azure.endpoint}/openai/v1/responses?api-version=preview`,
      ];
      const body = {
        model: deployment,
        instructions: ARTICLE_SYSTEM_PROMPT,
        input: buildArticleUserPrompt(result),
        max_output_tokens:
          Number.parseInt(process.env.YOUTUBE_NEWS_AZURE_MAX_OUTPUT_TOKENS || "10000", 10) ||
          10000,
        text: {
          verbosity: process.env.YOUTUBE_NEWS_AZURE_VERBOSITY || "medium",
          format: useStructuredOutput
            ? {
                type: "json_schema",
                name: "korean_teacher_article",
                schema: ARTICLE_SCHEMA,
                strict: true,
              }
            : { type: "json_object" },
        },
      };
      if (useReasoning) {
        body.reasoning = {
          effort: process.env.YOUTUBE_NEWS_AZURE_REASONING_EFFORT || "medium",
        };
      }

      let lastErr = null;
      for (const url of urls) {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": azure.apiKey,
            "Api-Key": azure.apiKey,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(300_000),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          lastErr = new Error(
            data?.error?.message ||
              data?.message ||
              `Azure Responses API HTTP ${res.status}`,
          );
          continue;
        }
        const text = responseOutputText(data);
        if (!text) throw new Error("Azure Responses API returned empty output");
        return normalizeArticleJson(JSON.parse(text));
      }
      throw lastErr || new Error("Azure Responses API failed");
    },
  );
}

async function generateArticleJsonWithAzure(result) {
  const azure = readAzureConfig();
  if (!azure) {
    throw new Error(
      "OPENAI_API_KEY is missing, and Azure OpenAI chat env vars are incomplete.",
    );
  }
  const apiMode = (process.env.YOUTUBE_NEWS_AZURE_API || "responses").trim().toLowerCase();
  let lastErr = null;
  for (const deployment of azure.deployments) {
    if (apiMode !== "chat") {
      console.error(`  · provider: Azure OpenAI responses (${deployment})`);
      try {
        return await azureResponsesArticleJson(result, deployment, true, true);
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (/reasoning\.effort|reasoning/i.test(msg)) {
          console.error("  · reasoning unsupported; retrying Responses without reasoning");
          try {
            return await azureResponsesArticleJson(result, deployment, true, false);
          } catch (inner) {
            lastErr = inner;
          }
        }
        if (/response_format|json_schema|schema|format/i.test(msg)) {
          console.error("  · structured output unsupported; retrying JSON mode");
          try {
            return await azureResponsesArticleJson(result, deployment, false, false);
          } catch (inner) {
            lastErr = inner;
          }
        }
        if (apiMode === "responses") continue;
      }
    }

    if (apiMode !== "responses") {
      console.error(`  · provider: Azure OpenAI chat (${deployment})`);
      try {
        return await azureChatArticleJson(result, deployment, true);
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (!/response_format|json_schema|schema/i.test(msg)) continue;
        console.error("  · structured output unsupported; retrying JSON mode");
        try {
          return await azureChatArticleJson(result, deployment, false);
        } catch (inner) {
          lastErr = inner;
        }
      }
    }
  }
  throw lastErr || new Error("Azure OpenAI chat failed");
}

async function fetchWithContext(url, init, label) {
  try {
    return await fetch(url, init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const c =
      err instanceof Error && err.cause != null
        ? ` [cause: ${String(err.cause)}]`
        : "";
    throw new Error(`${label}: ${msg}${c} — ${url}`);
  }
}

async function postJson(baseUrl, path, body) {
  const root = String(baseUrl || "").replace(/\/+$/, "");
  const url = `${root}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetchWithContext(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    `POST ${path}`,
  );
  const rawText = await res.text();
  const ct = res.headers.get("content-type") || "";
  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }
  // #region agent log
  agentLogLine({
    hypothesisId: "H1-H4",
    location: "youtube_digest_to_news_article.mjs:postJson",
    message: "postJson response",
    data: {
      path,
      url,
      status: res.status,
      contentType: ct,
      snippet: rawText.replace(/\s+/g, " ").slice(0, 240),
      baseUrlEnv: process.env.YOUTUBE_NEWS_BASE_URL || null,
    },
  });
  // #endregion
  if (!res.ok || !json?.ok) {
    const preview = rawText.replace(/\s+/g, " ").slice(0, 360);
    const detail =
      json && typeof json === "object" && json.error != null
        ? String(json.error)
        : json == null
          ? `(non-JSON body, content-type=${ct}) ${preview}`
          : JSON.stringify(json);
    throw new Error(`${path} failed: HTTP ${res.status}: ${detail}`);
  }
  return json;
}

async function putJson(baseUrl, path, body) {
  const root = String(baseUrl || "").replace(/\/+$/, "");
  const url = `${root}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetchWithContext(
    url,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    `PUT ${path}`,
  );
  const rawText = await res.text();
  const ct = res.headers.get("content-type") || "";
  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }
  // #region agent log
  agentLogLine({
    hypothesisId: "H1-H4",
    location: "youtube_digest_to_news_article.mjs:putJson",
    message: "putJson response",
    data: {
      path,
      url,
      status: res.status,
      contentType: ct,
      snippet: rawText.replace(/\s+/g, " ").slice(0, 240),
    },
  });
  // #endregion
  if (!res.ok || !json?.ok) {
    const preview = rawText.replace(/\s+/g, " ").slice(0, 360);
    const detail =
      json && typeof json === "object" && json.error != null
        ? String(json.error)
        : json == null
          ? `(non-JSON body, content-type=${ct}) ${preview}`
          : JSON.stringify(json);
    throw new Error(`${path} failed: HTTP ${res.status}: ${detail}`);
  }
  return json;
}

function articleTtsText(article) {
  return (article.paragraphs || [])
    .flatMap((p) => [p.subtitle?.trim(), p.content?.trim()].filter(Boolean))
    .filter(Boolean)
    .join("\n");
}

async function runFullAutomation(baseUrl, article) {
  const patch = {};
  const ttsText = articleTtsText(article);
  console.error("  │ (풀 자동화 세부 — API마다 대기 시간 있음)");
  if (ttsText) {
    console.error("  ├─ edge-tts (본문 음성)");
    const tts = await postJson(baseUrl, "/api/admin/tts/word", { text: ttsText });
    patch.audio = tts.url;
    patch.readingCues = [];
  }

  console.error("  ├─ 커버 이미지 (Azure)");
  const cover = await postJson(baseUrl, "/api/admin/news/cover-image", {
    title: article.title,
    target: "large",
  });
  patch.imageLarge = cover.url;

  console.error("  ├─ 썸네일");
  const thumb = await postJson(baseUrl, "/api/admin/news/thumbnail-from-url", {
    imageUrl: cover.url,
  });
  patch.imageThumb = thumb.url;

  const paragraphs = (article.paragraphs || []).map((p) => ({ ...p }));
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (!p?.subtitle && !p?.content) continue;
    const label = `  ├─ 문단 이미지 ${i + 1}/${paragraphs.length}`;
    if (Math.random() >= NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY) {
      console.error(`${label} (건너뜀)`);
      paragraphs[i] = { ...p, image: null };
      continue;
    }
    console.error(`${label}`);
    const img = await postJson(baseUrl, "/api/admin/news/paragraph-image", {
      subtitle: p.subtitle || "",
      content: p.content || "",
    });
    paragraphs[i] = { ...p, image: img.url };
    await new Promise((r) => setTimeout(r, 1000));
  }
  patch.paragraphs = paragraphs;

  const vocabulary = (article.vocabulary || []).map((v) => ({ ...v }));
  console.error(`  ├─ 어휘 자동화 (${vocabulary.length}개)`);
  for (let i = 0; i < vocabulary.length; i++) {
    const v = vocabulary[i];
    console.error(`  │  └─ 어휘 ${i + 1}/${vocabulary.length}`);
    if (v.word?.trim()) {
      const wordSound = await postJson(baseUrl, "/api/admin/tts/word", {
        text: v.word.trim(),
      });
      v.sound = wordSound.url;
    }
    if (v.example?.trim()) {
      const exampleSound = await postJson(baseUrl, "/api/admin/tts/word", {
        text: v.example.trim(),
      });
      v.exampleSound = exampleSound.url;
    }
    if (v.word?.trim()) {
      const root = String(baseUrl || "").replace(/\/+$/, "");
      const u = new URL(`${root}/api/admin/unsplash/smart-search`);
      u.searchParams.set("q", v.word.trim());
      const res = await fetchWithContext(
        u.toString(),
        {},
        "GET /api/admin/unsplash/smart-search",
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && json.url) v.image = json.url;
    }
    vocabulary[i] = v;
  }
  patch.vocabulary = vocabulary;
  return patch;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const totalPhases =
    !args.register ? 2 : args.full ? 5 : 3;

  console.error("\n[youtube-article] ─────────────────────────────────────────");
  console.error("[youtube-article] 기사 파이프라인 시작");
  console.error(`[youtube-article] API 베이스: ${args.baseUrl}`);
  console.error(
    `[youtube-article] 등록: ${args.register ? "예" : "아니오"} | 풀 자동화: ${args.full ? "예" : "아니오"} | 단계 수: ${totalPhases}`,
  );
  console.error("[youtube-article] ─────────────────────────────────────────\n");

  const result = pickDigestResult(args.input, args.index);

  console.error(
    `[youtube-article] [1/${totalPhases}] 소스: ${result.title || result.videoId || "digest"} — LLM으로 기사 JSON 생성 중…`,
  );
  const article = await generateArticleJson(result);
  const vid = String(result.videoId ?? "").trim();
  if (vid) {
    article.sourceYoutubeVideoId = vid;
  }

  const outAbs = resolve(ROOT, args.out);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, JSON.stringify(article, null, 2), "utf8");
  console.error(
    `[youtube-article] [2/${totalPhases}] 로컬 JSON 저장 완료 → ${outAbs}`,
  );

  if (!args.register) {
    console.error(`[youtube-article] [완료] 등록 생략 (--register 없음)\n`);
    console.log(JSON.stringify({ ok: true, out: outAbs, registered: false }, null, 2));
    return;
  }

  console.error(
    `[youtube-article] [3/${totalPhases}] DB에 기사 생성 중… POST ${args.baseUrl}/api/admin/articles`,
  );
  const created = await postJson(args.baseUrl, "/api/admin/articles", article);
  let saved = created.data.article;
  console.error(
    `[youtube-article] [3/${totalPhases}] 완료 — slug=${saved.slug}`,
  );

  if (args.full) {
    console.error(
      `[youtube-article] [4/${totalPhases}] 풀 자동화(Edge TTS → 커버 → 문단 이미지 → 썸네일 → 어휘)…`,
    );
    const patch = await runFullAutomation(args.baseUrl, saved);
    console.error(
      `[youtube-article] [5/${totalPhases}] 서버에 변경사항 반영 중… PUT merge`,
    );
    const updated = await putJson(
      args.baseUrl,
      `/api/admin/articles/${encodeURIComponent(saved.slug)}`,
      patch,
    );
    saved = updated.data.article;
  } else {
    console.error(
      `[youtube-article] 풀 자동화 생략 (--full 없음; 등록만 완료)`,
    );
  }

  const finalOut = {
    ok: true,
    out: outAbs,
    registered: true,
    full: args.full,
    slug: saved.slug,
    url: `${args.baseUrl}/news/article/${encodeURIComponent(saved.slug)}/edit`,
  };
  console.error("\n[youtube-article] ─────────────────────────────────────────");
  console.error("[youtube-article] 전체 완료");
  console.error(`[youtube-article] 편집: ${finalOut.url}`);
  console.error("[youtube-article] ─────────────────────────────────────────\n");
  console.log(JSON.stringify(finalOut, null, 2));
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`\n✗ ${msg}`);
  if (
    /DUPLICATE_YOUTUBE|이미 이 영상으로 만든 기사|failed: HTTP 409/i.test(msg)
  ) {
    console.error(
      "  · 같은 YouTube 영상으로 이미 기사가 있습니다. 다른 영상으로 다시 실행하세요.",
    );
  }
  if (
    /넣을 수 없|삽입할 수 없|cannot be inserted|cannot insert|json_schema|response_format|Invalid schema|content filter|ResponsibleAI|policy violation/i.test(
      msg,
    )
  ) {
    console.error(
      "  · LLM/스키마·정책으로 이 영상은 기사 JSON을 만들지 못했습니다. `yarn make-auto`는 자동으로 다른 영상을 찾습니다.",
    );
  }
  if (e instanceof Error && e.cause != null) {
    console.error(`  cause: ${String(e.cause)}`);
  }
  if (e instanceof Error && e.stack) {
    console.error(e.stack);
  }
  console.error("");
  process.exit(1);
});
