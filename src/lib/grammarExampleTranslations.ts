import type { ComparisonExample } from "@/lib/grammarComparisonsRepo";
import { getMongoDb } from "@/lib/mongo";

function readAzureConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/$/, "");
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
    throw new Error("Azure OpenAI chat is not configured for example translations");
  }
  return { endpoint, apiKey, apiVersion, deployments };
}

async function azureTranslateSentences(sentences: string[]): Promise<string[]> {
  const unique = [...new Set(sentences.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const { endpoint, apiKey, apiVersion, deployments } = readAzureConfig();
  const messages = [
    {
      role: "system" as const,
      content:
        "Translate each Korean sentence into natural, concise English for learners. Return JSON only: {\"translations\":[\"...\"]}. Same order as input. Max 12 words per translation.",
    },
    {
      role: "user" as const,
      content: JSON.stringify({ sentences: unique }),
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
        max_completion_tokens: 1200,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(120_000),
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      lastErr = new Error(text.slice(0, 400) || `Azure HTTP ${res.status}`);
      continue;
    }
    const data = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      lastErr = new Error("Azure returned empty translation content");
      continue;
    }
    const parsed = JSON.parse(content) as { translations?: string[] };
    const translations = Array.isArray(parsed.translations)
      ? parsed.translations.map((row) => String(row ?? "").trim())
      : [];
    if (translations.length !== unique.length) {
      lastErr = new Error("Azure translation count mismatch");
      continue;
    }
    const bySentence = new Map(unique.map((sentence, index) => [sentence, translations[index]!]));
    return sentences.map((sentence) => bySentence.get(sentence.trim()) ?? "");
  }

  throw lastErr ?? new Error("Azure example translation failed");
}

/** Fill missing translationEn via Azure and persist to comparison_examples. */
export async function ensureComparisonExampleTranslations(
  comparisonId: number,
  examples: ComparisonExample[],
): Promise<ComparisonExample[]> {
  const needs = examples.filter((ex) => !ex.translationEn?.trim() && ex.sentence.trim());
  if (needs.length === 0) return examples;

  const translations = await azureTranslateSentences(needs.map((ex) => ex.sentence));
  const bySentence = new Map(
    needs.map((ex, index) => [ex.sentence.trim(), translations[index] ?? ""]),
  );

  const db = await getMongoDb();
  const col = db.collection("comparison_examples");
  const merged = examples.map((ex) => {
    const translationEn = ex.translationEn?.trim() || bySentence.get(ex.sentence.trim()) || "";
    return translationEn ? { ...ex, translationEn } : ex;
  });

  await Promise.all(
    merged
      .filter((ex) => ex.translationEn?.trim())
      .map((ex) =>
        col.updateMany(
          { comparisonId, sentence: ex.sentence },
          { $set: { translationEn: ex.translationEn!.trim() } },
        ),
      ),
  );

  return merged;
}
