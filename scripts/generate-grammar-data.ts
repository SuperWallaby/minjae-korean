#!/usr/bin/env node
/**
 * Generate N-way Korean grammar/ vocabulary comparison pages via Azure OpenAI.
 *
 *   npx tsx scripts/generate-grammar-data.ts --words 그래서,그러니까,그러면
 *   npx tsx scripts/generate-grammar-data.ts 그래서 그러니까
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(join(__dirname, ".."));
}

const COMPARISON_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "slug",
    "titleKo",
    "titleEn",
    "summaryKo",
    "summaryEn",
    "items",
    "examples",
    "quizzes",
    "capybaraQuestionEn",
    "imageAlt",
  ],
  properties: {
    slug: { type: "string" },
    titleKo: { type: "string" },
    titleEn: { type: "string" },
    summaryKo: { type: "string" },
    summaryEn: { type: "string" },
    capybaraQuestionEn: { type: "string" },
    imageAlt: { type: "string" },
    items: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "wordName",
          "meaningKo",
          "meaningEn",
          "ruleKo",
          "ruleEn",
          "situationsKo",
          "situationsEn",
        ],
        properties: {
          wordName: { type: "string" },
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
        },
      },
    },
    examples: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sentence", "isCorrect", "reasonKo", "reasonEn"],
        properties: {
          sentence: { type: "string" },
          isCorrect: { type: "boolean" },
          reasonKo: { type: "string" },
          reasonEn: { type: "string" },
        },
      },
    },
    quizzes: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
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
      },
    },
  },
} as const;

function parseWords(argv: string[]): string[] {
  const wordsFlag = argv.find((a) => a.startsWith("--words="));
  if (wordsFlag) {
    return wordsFlag
      .slice("--words=".length)
      .split(/[,，、]/)
      .map((w) => w.trim())
      .filter(Boolean);
  }
  const idx = argv.indexOf("--words");
  if (idx >= 0 && argv[idx + 1]) {
    return argv[idx + 1]!
      .split(/[,，、]/)
      .map((w) => w.trim())
      .filter(Boolean);
  }
  return argv.filter((a) => !a.startsWith("-")).map((w) => w.trim()).filter(Boolean);
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
      "Missing Azure OpenAI config. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME (or AZURE_OPENAI_CHAT_DEPLOYMENTS).",
    );
  }
  return { endpoint, apiKey, apiVersion, deployments };
}

function buildSystemPrompt(): string {
  return `You are a friendly Korean native "Language Partner" — not a stiff textbook teacher.
Write for B1–B2 Korean learners AND Koreans who want sharper, natural phrasing.
Tone: witty, intuitive, real-life spoken Korean + business nuance when relevant.
Always provide BOTH Korean (_ko) and English (_en) for meanings, rules, reasons, and explanations.

CRITICAL — non-overlapping usage buckets:
- Each word's situationsKo/situationsEn must be MUTUALLY EXCLUSIVE across all compared words.
- No situation label may appear under more than one word.
- Pick short situation labels (2–5 words each), comma-friendly.

Examples: ONLY sentences native speakers would agree are clearly correct (⭕) or clearly wrong (❌).
Never include borderline, context-dependent, or "both could work" cases.
Wrong examples must be common, recognizable mistakes — not debatable pedantry.
reasonEn must be definitive: say why it works or which word to use instead. Ban hedging words: might, sometimes, depends, often, can work, either way, etc.
Quizzes: 2–4 items; options must include the compared words fairly; answer must match one option exactly.

Slug: Korean hyphen-separated, e.g. "그래서-vs-그러니까" (no URL encoding).
summaryKo/summaryEn: 1–2 sentences explaining the nuance (for page intro — NOT a short tagline).
capybaraQuestionEn: English question for the infographic; Korean allowed ONLY as compared word names, e.g. "When to use 그래서 vs 그러니까?" (max 10 words).
situationsEn: 1–3 words each, English only (capybara image). situationsKo: page content only.
imageAlt: concise English alt text describing the comparison for accessibility/SEO.`;
}

function buildUserPrompt(words: string[]): string {
  return `Create a full comparison dictionary entry for these Korean words/phrases: ${words.join(", ")}.

Return JSON matching the schema exactly.
- titleKo/titleEn: catchy comparison title (include all words)
- summaryKo/summaryEn: one-sentence hook explaining the core nuance difference
- items: one entry per input word, same order as given
- 4–8 examples with balanced correct/incorrect — every example must pass a "would a native speaker stake their reputation on this?" test
- 2–4 quiz questions`;
}

async function azureStructuredJson(
  words: string[],
): Promise<Record<string, unknown>> {
  const { endpoint, apiKey, apiVersion, deployments } = readAzureConfig();
  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    { role: "user" as const, content: buildUserPrompt(words) },
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
          name: "grammar_comparison",
          strict: true,
          schema: COMPARISON_JSON_SCHEMA,
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
  raw: Record<string, unknown>,
  words: string[],
  filterExamples: (
    examples: import("../src/lib/grammarComparisonsRepo").ComparisonExample[],
  ) => import("../src/lib/grammarComparisonsRepo").ComparisonExample[],
): import("../src/lib/grammarComparisonsRepo").GeneratedComparisonPayload {
  const slug = String(raw.slug ?? "").trim();
  if (!slug) {
    throw new Error("AI response missing slug");
  }
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items = itemsRaw.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      wordName: String(o.wordName ?? "").trim(),
      meaningKo: String(o.meaningKo ?? "").trim(),
      meaningEn: String(o.meaningEn ?? "").trim(),
      ruleKo: String(o.ruleKo ?? "").trim(),
      ruleEn: String(o.ruleEn ?? "").trim(),
      situationsKo: Array.isArray(o.situationsKo)
        ? o.situationsKo.map((s) => String(s).trim()).filter(Boolean)
        : [],
      situationsEn: Array.isArray(o.situationsEn)
        ? o.situationsEn.map((s) => String(s).trim()).filter(Boolean)
        : [],
    };
  });
  if (items.length < 2) {
    throw new Error("AI response must include at least 2 comparison items");
  }

  const examplesRaw = Array.isArray(raw.examples) ? raw.examples : [];
  const examples = filterExamples(
    examplesRaw.map((row) => {
      const o = row as Record<string, unknown>;
      return {
        sentence: String(o.sentence ?? "").trim(),
        isCorrect: Boolean(o.isCorrect),
        reasonKo: String(o.reasonKo ?? "").trim(),
        reasonEn: String(o.reasonEn ?? "").trim(),
      };
    }),
  );
  if (examples.length < 3) {
    throw new Error(
      "Need at least 3 confident examples after filtering — regenerate or tighten AI output",
    );
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
    `What are the situations for ${words.join(" and ")}?`;
  const imageAlt =
    String(raw.imageAlt ?? "").trim() ||
    `Korean comparison: ${words.join(" vs ")} — when to use each`;

  return {
    slug,
    titleKo: String(raw.titleKo ?? "").trim(),
    titleEn: String(raw.titleEn ?? "").trim(),
    summaryKo: String(raw.summaryKo ?? "").trim(),
    summaryEn: String(raw.summaryEn ?? "").trim(),
    items,
    examples,
    quizzes,
    capybaraQuestionEn,
    imageAlt,
  };
}

async function uploadImage(
  id: number,
  slug: string,
  buffer: Buffer,
): Promise<string | null> {
  const { hasR2Config, uploadBufferToR2 } = await import("./lib/r2_upload.mjs");
  if (!hasR2Config()) {
    console.warn("  · R2 not configured — skipping image upload");
    return null;
  }
  const key = `grammar-comparisons/${id}/${slug}.webp`;
  return uploadBufferToR2(key, buffer, "image/webp");
}

async function renderComparisonWebp(
  questionEn: string,
  items: Array<{
    wordName: string;
    situationsEn: string[];
  }>,
): Promise<Buffer> {
  const remoteBase = process.env.CAPYBARA_RENDER_SERVICE_URL?.trim();
  if (remoteBase) {
    const url = `${remoteBase.replace(/\/+$/, "")}/render-grammar-comparison`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const apiKey = process.env.CAPYBARA_RENDER_API_KEY?.trim();
    if (apiKey) headers["X-API-Key"] = apiKey;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ questionEn, items, outputWidth: 960, webpQuality: 85 }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Remote render failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      );
    }
    return Buffer.from(await res.arrayBuffer());
  }

  const { renderGrammarComparisonImage } = await import(
    "../src/lib/grammarComparisonImage"
  );
  return renderGrammarComparisonImage({ questionEn, items });
}

async function renderAndUploadComparisonImage(
  id: number,
  slug: string,
  questionEn: string,
  items: Array<{
    wordName: string;
    situationsEn: string[];
  }>,
  imageAlt: string,
): Promise<string | null> {
  const { updateComparisonImage } = await import("../src/lib/grammarComparisonsRepo");

  const webp = await renderComparisonWebp(questionEn, items);
  const imageUrl = await uploadImage(id, slug, webp);
  if (imageUrl) {
    await updateComparisonImage(id, imageUrl, imageAlt);
    console.log(`  · image uploaded: ${imageUrl}`);
  }
  return imageUrl;
}

function parseRefreshId(argv: string[]): number | null {
  const flag = argv.find((a) => a.startsWith("--id="));
  if (flag) {
    const n = parseInt(flag.slice("--id=".length), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const idx = argv.indexOf("--id");
  if (idx >= 0 && argv[idx + 1]) {
    const n = parseInt(argv[idx + 1]!, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

async function refreshImageOnly(id: number) {
  const { getComparisonById } = await import("../src/lib/grammarComparisonsRepo");
  const comparison = await getComparisonById(id);
  if (!comparison) throw new Error(`Comparison id=${id} not found`);

  const questionEn =
    comparison.items.length >= 2
      ? `When to use ${comparison.items.map((i) => i.wordName).join(" vs ")}?`
      : comparison.items[0]
        ? `When to use ${comparison.items[0].wordName}?`
        : comparison.titleEn;

  await renderAndUploadComparisonImage(
    comparison.id,
    comparison.slug,
    questionEn,
    comparison.items.map((item) => ({
      wordName: item.wordName,
      situationsEn: item.situationsEn,
    })),
    comparison.imageAlt ?? comparison.titleEn,
  );

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000";
  console.log(
    JSON.stringify(
      {
        ok: true,
        refreshed: true,
        id: comparison.id,
        slug: comparison.slug,
        url: `${site}/grammar/${comparison.id}/${encodeURIComponent(comparison.slug)}`,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

async function main() {
  await loadEnv();
  const argv = process.argv.slice(2);

  if (argv.includes("--refresh-image")) {
    const id = parseRefreshId(argv);
    if (!id) {
      console.error("Usage: yarn generate-grammar --refresh-image --id 1000");
      process.exit(1);
    }
    console.log(`Refreshing image for comparison id=${id}`);
    await refreshImageOnly(id);
    return;
  }

  const words = parseWords(argv);
  if (words.length < 2) {
    console.error(
      "Usage: yarn generate-grammar --words word1,word2[,word3...]\n       yarn generate-grammar --refresh-image --id 1000",
    );
    process.exit(1);
  }

  console.log(`Generating comparison for: ${words.join(", ")}`);
  const raw = await azureStructuredJson(words);
  const { filterConfidentExamples } = await import(
    "../src/lib/grammarComparisonExamples"
  );
  const payload = normalizePayload(raw, words, filterConfidentExamples);

  const { upsertComparisonFromGenerated } = await import(
    "../src/lib/grammarComparisonsRepo"
  );

  const { id, slug, created } = await upsertComparisonFromGenerated(payload);
  console.log(`  · DB ${created ? "created" : "updated"} id=${id} slug=${slug}`);

  try {
    await renderAndUploadComparisonImage(
      id,
      slug,
      payload.capybaraQuestionEn,
      payload.items.map((item) => ({
        wordName: item.wordName,
        situationsEn: item.situationsEn,
      })),
      payload.imageAlt,
    );
  } catch (err) {
    console.warn(
      `  · image generation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000";
  console.log(
    JSON.stringify(
      {
        ok: true,
        id,
        slug,
        url: `${site}/grammar/${id}/${encodeURIComponent(slug)}`,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
