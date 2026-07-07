#!/usr/bin/env node
/**
 * Remove low-quality grammar comparisons from MongoDB (+ optional R2 image).
 *
 *   npx tsx scripts/cleanup-grammar-comparisons.ts              # dry-run
 *   npx tsx scripts/cleanup-grammar-comparisons.ts --apply      # delete + AI on borderline
 *   npx tsx scripts/cleanup-grammar-comparisons.ts --apply --no-ai  # heuristic only
 */
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { comparisonWordsFromSlug } from "../src/lib/grammarComparisonSlug.ts";
import {
  deleteComparisonById,
  listAllComparisonSlugs,
} from "../src/lib/grammarComparisonsRepo.ts";
import {
  isDefiniteLowQuality,
  isLearnerQualityComparison,
} from "./lib/grammar-batch-quality.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
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
    throw new Error("Missing Azure OpenAI config for AI review.");
  }
  return { endpoint, apiKey, apiVersion, deployments };
}

const AI_REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "decision", "reason"],
        properties: {
          slug: { type: "string" },
          decision: { type: "string", enum: ["keep", "remove"] },
          reason: { type: "string" },
        },
      },
    },
  },
};

type ReviewRow = { slug: string; decision: "keep" | "remove"; reason: string };

async function azureReviewBatch(
  rows: Array<{ slug: string; words: string[]; titleEn: string }>,
): Promise<ReviewRow[]> {
  const { endpoint, apiKey, apiVersion, deployments } = readAzureConfig();
  const list = rows
    .map(
      (r, i) =>
        `${i + 1}. slug=${r.slug} | words=${r.words.join(", ")} | titleEn=${r.titleEn}`,
    )
    .join("\n");

  const messages = [
    {
      role: "system" as const,
      content: `You curate grammar comparison pages for English-speaking Korean learners (B1–B2).
Decide keep vs remove for each comparison.

REMOVE when:
- Random unrelated nouns (e.g. water bill vs internet, front-end vs back-end dev jargon)
- Prefix+verb vs base verb nobody searches (e.g. suddenly-exercise vs exercise)
- Trivial speech-level pairs (X하다 vs X해) with no real nuance lesson
- Tech/product/shopping vocabulary with no grammar insight
- Category lists (two hobbies, two appliances) learners would not Google

KEEP when:
- Particles, endings, honorifics, grammar concepts
- Synonyms / near-synonyms with real usage nuance (미안 vs 죄송, 에 vs 에서)
- Verbs/adjectives learners confuse (가다 vs 오다, 먹다 vs 드시다)
- Time/discourse adverbs with nuance (벌써 vs 이미, 하지만 vs 그런데)

Be strict on REMOVE for vocabulary nobody would search.`,
    },
    {
      role: "user" as const,
      content: `Review each comparison. Return one result per slug.\n\n${list}`,
    },
  ];

  let lastErr: Error | null = null;
  for (const deployment of deployments) {
    const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        messages,
        max_completion_tokens: 4096,
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "grammar_comparison_review",
            strict: true,
            schema: AI_REVIEW_SCHEMA,
          },
        },
      }),
      signal: AbortSignal.timeout(120_000),
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
      lastErr = new Error(data?.error?.message || text || `HTTP ${res.status}`);
      continue;
    }
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      lastErr = new Error("Empty AI response");
      continue;
    }
    const parsed = JSON.parse(content) as { results: ReviewRow[] };
    return parsed.results ?? [];
  }
  throw lastErr ?? new Error("Azure review failed");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function deleteR2Image(id: number, slug: string): Promise<void> {
  const { hasR2Config, deleteR2Object } = await import("./lib/r2_upload.mjs");
  if (!hasR2Config()) return;
  const key = `grammar-comparisons/${id}/${slug}.webp`;
  try {
    await deleteR2Object(key);
  } catch {
    // ignore missing objects
  }
}

async function main() {
  await loadEnv();
  const apply = hasFlag("--apply");
  const useAi = hasFlag("--ai") || (apply && !hasFlag("--no-ai"));
  const minId = (() => {
    const flag = process.argv.find((a) => a.startsWith("--min-id="));
    if (flag) return parseInt(flag.slice("--min-id=".length), 10) || 0;
    return 0;
  })();

  const all = await listAllComparisonSlugs();
  const scoped = minId > 0 ? all.filter((r) => r.id >= minId) : all;

  const definiteRemove: typeof scoped = [];
  const aiReview: typeof scoped = [];
  const keep: typeof scoped = [];

  for (const row of scoped) {
    const words = comparisonWordsFromSlug(row.slug);
    if (isDefiniteLowQuality(words)) {
      definiteRemove.push(row);
    } else if (!isLearnerQualityComparison(words)) {
      aiReview.push(row);
    } else {
      keep.push(row);
    }
  }

  console.log(
    `Scanned ${scoped.length} (DB total ${all.length}): definite_remove=${definiteRemove.length}, ai_review=${aiReview.length}, keep=${keep.length}`,
  );

  const aiRemove: typeof scoped = [];
  const aiKeep: typeof scoped = [];

  if (useAi && aiReview.length > 0) {
    console.log(`AI reviewing ${aiReview.length} borderline rows...`);
    const batches = chunk(aiReview, 12);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]!;
      process.stdout.write(`  batch ${i + 1}/${batches.length}...`);
      const reviews = await azureReviewBatch(
        batch.map((r) => ({
          slug: r.slug,
          words: comparisonWordsFromSlug(r.slug),
          titleEn: r.titleEn,
        })),
      );
      const bySlug = new Map(reviews.map((r) => [r.slug, r]));
      for (const row of batch) {
        const review = bySlug.get(row.slug);
        if (!review || review.decision === "remove") {
          aiRemove.push(row);
        } else {
          aiKeep.push(row);
        }
      }
      console.log(" done");
      await new Promise((r) => setTimeout(r, 600));
    }
  } else if (aiReview.length > 0) {
    console.log(`Skipping AI — ${aiReview.length} borderline rows would stay (use --apply for AI review).`);
  }

  const removeSet = new Map<number, (typeof scoped)[0]>();
  for (const row of definiteRemove) removeSet.set(row.id, row);
  for (const row of aiRemove) removeSet.set(row.id, row);

  const toRemove = [...removeSet.values()].sort((a, b) => a.id - b.id);

  const report = {
    mode: apply ? "apply" : "dry-run",
    scanned: scoped.length,
    definiteRemove: definiteRemove.length,
    aiReviewed: aiReview.length,
    aiRemove: aiRemove.length,
    aiKeep: aiKeep.length,
    finalRemove: toRemove.length,
    removed: [] as Array<{ id: number; slug: string }>,
  };

  const logPath = join(ROOT, ".tmp/grammar-cleanup-report.json");
  fs.mkdirSync(join(ROOT, ".tmp"), { recursive: true });

  for (const row of toRemove) {
    const words = comparisonWordsFromSlug(row.slug);
    if (!isDefiniteLowQuality(words) && isLearnerQualityComparison(words)) {
      console.log(`SKIP (learner-quality) id=${row.id} ${row.slug}`);
      continue;
    }
    console.log(`${apply ? "DELETE" : "WOULD DELETE"} id=${row.id} ${row.slug}`);
    if (apply) {
      await deleteR2Image(row.id, row.slug);
      const ok = await deleteComparisonById(row.id);
      if (ok) report.removed.push({ id: row.id, slug: row.slug });
    }
  }

  fs.writeFileSync(
    logPath,
    JSON.stringify(
      {
        ...report,
        wouldRemove: toRemove.map((r) => ({
          id: r.id,
          slug: r.slug,
          titleKo: r.titleKo,
        })),
        aiKept: aiKeep.map((r) => ({ id: r.id, slug: r.slug })),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `\n${apply ? "Deleted" : "Would delete"} ${toRemove.length}. Report: ${logPath}`,
  );
  if (!apply) {
    console.log("Run with --apply to delete (+ AI review on borderline). --no-ai skips AI.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
