import { azureChatCompletion, readAzureOpenAIConfig } from "@/lib/azureOpenAI";
import { synthesizeEdgeTtsMp3 } from "@/lib/edgeTtsServer";

import { choiceEnglishGloss } from "./englishGloss";
import {
  buildQuizExampleTtsR2Key,
  getFromR2,
  isR2Configured,
  uploadToR2,
} from "./objectStorage";
import { publicUrlForR2Key, resolveQuizTtsCdnOrigin } from "./quizMedia";
import {
  correctLabelFromItem,
  patchKoreanQuizWordExplanation,
  patchWordExplanationExampleTts,
} from "./store";
import type { KoreanQuizItem, WordExplanationExample } from "./types";

/** Same Edge voice as korean-quiz Flutter app example TTS. */
export const WORD_EXPLANATION_EDGE_VOICE = "ko-KR-SunHiNeural";

export type WordExplanationBundle = {
  explanation: string;
  examples: WordExplanationExample[];
};

export type WordExplanationExamplePublic = {
  korean: string;
  english: string;
  ttsUrl?: string;
};

const inflight = new Map<string, Promise<WordExplanationBundle>>();

function englishGlossForCorrect(item: KoreanQuizItem): string {
  const choice = item.choices.find((row) => row.id === item.correctChoiceId);
  return choiceEnglishGloss(choice ?? {});
}

export function hasCachedWordExplanation(item: KoreanQuizItem): boolean {
  return (
    Boolean(item.wordExplanation?.trim()) &&
    (item.wordExplanationExamples?.length ?? 0) >= 2
  );
}

export function bundleFromItem(item: KoreanQuizItem): WordExplanationBundle {
  return {
    explanation: item.wordExplanation!.trim(),
    examples: item.wordExplanationExamples ?? [],
  };
}

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenced?.[1]?.trim() ?? trimmed;
}

function parseBundle(raw: string): WordExplanationBundle {
  const parsed = JSON.parse(stripJsonFence(raw)) as {
    explanation?: unknown;
    examples?: unknown;
  };
  const explanation =
    typeof parsed.explanation === "string" ? parsed.explanation.trim() : "";
  if (explanation.length < 20) {
    throw new Error("Explanation too short.");
  }

  if (!Array.isArray(parsed.examples)) {
    throw new Error("Examples missing.");
  }

  const examples: WordExplanationExample[] = [];
  for (const row of parsed.examples) {
    if (!row || typeof row !== "object") continue;
    const korean =
      typeof (row as { korean?: unknown }).korean === "string"
        ? (row as { korean: string }).korean.trim()
        : "";
    const english =
      typeof (row as { english?: unknown }).english === "string"
        ? (row as { english: string }).english.trim()
        : "";
    if (!korean || !english) continue;
    examples.push({ korean, english });
  }

  if (examples.length < 2) {
    throw new Error("Need at least 2 examples.");
  }

  return {
    explanation,
    examples: examples.slice(0, 3),
  };
}

async function generateWordExplanation(
  item: KoreanQuizItem,
): Promise<WordExplanationBundle> {
  if (!readAzureOpenAIConfig()) {
    throw new Error("AI explanation is not configured.");
  }

  const korean = correctLabelFromItem(item);
  if (!korean) {
    throw new Error("Correct answer label not found.");
  }

  const english = englishGlossForCorrect(item);
  const topic = item.topic?.trim() || "general vocabulary";
  const sentenceStem = item.sentenceStem?.trim();
  const illustrationEnglish = item.illustrationEnglish?.trim();

  const contextLines = [
    `Korean word: ${korean}`,
    english ? `English gloss: ${english}` : null,
    `Topic: ${topic}`,
    sentenceStem ? `Example sentence (Korean): ${sentenceStem}` : null,
    illustrationEnglish ? `Image hint (English): ${illustrationEnglish}` : null,
    item.type === "sentence_blank"
      ? "Quiz type: fill-in-the-blank sentence"
      : "Quiz type: picture vocabulary",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Write a short English explanation and example sentences for Korean learners about this word.

${contextLines}

Return JSON only:
{"explanation":"...","examples":[{"korean":"...","english":"..."}, ...]}

Rules for explanation:
- 2–4 sentences in clear, friendly English
- Explain what the word means and how it is used
- Beginner-friendly — no linguistics jargon
- English only (you may include the Korean word once in parentheses)

Rules for examples:
- Exactly 2 or 3 natural Korean example sentences using the word
- Each example must include an English translation
- Keep sentences short and everyday (A1–A2 level)
- Korean sentences must use the target word naturally`;

  const raw = await azureChatCompletion(
    [
      {
        role: "system",
        content: "You write beginner-friendly Korean vocabulary explanations. Reply with JSON only.",
      },
      { role: "user", content: prompt },
    ],
    { maxTokens: 900, temperature: 0.35 },
  );

  if (!raw) {
    throw new Error("Failed to generate explanation.");
  }

  return parseBundle(raw);
}

/** Load cached explanation or generate + persist to shared korean_quiz_items. */
export async function ensureKoreanQuizWordExplanation(
  item: KoreanQuizItem,
): Promise<WordExplanationBundle> {
  if (hasCachedWordExplanation(item)) {
    return bundleFromItem(item);
  }

  const pending = inflight.get(item.id);
  if (pending) return pending;

  const work = (async () => {
    const bundle = await generateWordExplanation(item);
    await patchKoreanQuizWordExplanation(item.id, {
      wordExplanation: bundle.explanation,
      wordExplanationExamples: bundle.examples,
    });
    return bundle;
  })().finally(() => {
    inflight.delete(item.id);
  });

  inflight.set(item.id, work);
  return work;
}

export function wordExplanationExamplesForResponse(
  examples: WordExplanationExample[],
  cdnOrigin?: string,
): WordExplanationExamplePublic[] {
  return examples.map((example) => ({
    korean: example.korean,
    english: example.english,
    ttsUrl: example.ttsR2Key
      ? publicUrlForR2Key(example.ttsR2Key, cdnOrigin) ?? undefined
      : undefined,
  }));
}

export async function resolveWordExplanationExampleTtsUrl(
  item: KoreanQuizItem,
  exampleIndex: number,
): Promise<{ url: string; cached: boolean }> {
  const examples = item.wordExplanationExamples ?? [];
  const example = examples[exampleIndex];
  if (!example) {
    throw new Error("Example not found.");
  }

  const voice = WORD_EXPLANATION_EDGE_VOICE;
  const text = example.korean.trim();
  if (!text) {
    throw new Error("Example text is empty.");
  }

  const r2Key =
    example.ttsR2Key?.trim() ??
    buildQuizExampleTtsR2Key(item.id, exampleIndex, voice);
  const origin = resolveQuizTtsCdnOrigin(item);

  if (isR2Configured()) {
    const cached = await getFromR2(r2Key);
    if (cached?.body.length) {
      const url = publicUrlForR2Key(r2Key, origin);
      if (!url) throw new Error("Quiz CDN origin is not configured.");
      if (!example.ttsR2Key?.trim()) {
        await patchWordExplanationExampleTts(item.id, exampleIndex, r2Key);
      }
      return { url, cached: true };
    }
  }

  if (!isR2Configured()) {
    throw new Error("Object storage is not configured.");
  }

  const mp3 = await synthesizeEdgeTtsMp3(text, { voice });
  await uploadToR2({
    key: r2Key,
    body: mp3,
    contentType: "audio/mpeg",
  });
  await patchWordExplanationExampleTts(item.id, exampleIndex, r2Key);

  const url = publicUrlForR2Key(r2Key, origin);
  if (!url) throw new Error("Quiz CDN origin is not configured.");
  return { url, cached: false };
}
