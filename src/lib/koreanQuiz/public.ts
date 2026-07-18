import { resolveAnswerTtsPlaybackUrl } from "./tts";
import { shuffle } from "./shuffle";
import { illustrationEnglishBelowImage } from "./englishGloss";
import { resolveRomanizationDisplay } from "./romanization";
import { publicUrlForR2Key, resolveQuizTtsCdnOrigin } from "./quizMedia";
import { normalizeDifficulty } from "./difficulty";
import type {
  KoreanQuizItem,
  KoreanQuizPrepared,
  KoreanQuizPreparedExample,
} from "./types";

function correctLabelFromItem(
  item: Pick<KoreanQuizItem, "choices" | "correctChoiceId">,
): string {
  for (const choice of item.choices) {
    if (choice.id === item.correctChoiceId) return choice.label;
  }
  return "";
}

/** Below-illustration hint — same rules as korean-quiz app (flag + optional choice fallback). */
function illustrationEnglishFromItem(item: KoreanQuizItem): string | undefined {
  return illustrationEnglishBelowImage(item);
}

/** How many example sentences to show on the reveal screen (matches korean-quiz app). */
export const REVEAL_EXAMPLE_COUNT = 2;

/**
 * Reveal-screen examples: the first usable sentences.
 * Generation puts the most representative everyday sentences at the front.
 */
function representativeExamples(
  item: KoreanQuizItem,
  limit = REVEAL_EXAMPLE_COUNT,
): KoreanQuizPreparedExample[] {
  const examples = item.wordExplanationExamples ?? [];
  const origin = resolveQuizTtsCdnOrigin(item);
  const out: KoreanQuizPreparedExample[] = [];
  for (let index = 0; index < examples.length; index += 1) {
    if (out.length >= limit) break;
    const example = examples[index];
    const korean = example?.korean?.trim();
    const english = example?.english?.trim();
    if (!korean || !english) continue;
    const ttsUrl = example.ttsR2Key
      ? publicUrlForR2Key(example.ttsR2Key, origin) ?? undefined
      : undefined;
    out.push({ index, korean, english, ttsUrl });
  }
  return out;
}

export async function toKoreanQuizPrepared(
  item: KoreanQuizItem,
): Promise<KoreanQuizPrepared> {
  const type = item.type ?? "image_mcq";
  const [answerTtsUrl, answerTtsSlowUrl] = await Promise.all([
    resolveAnswerTtsPlaybackUrl(item, "normal"),
    resolveAnswerTtsPlaybackUrl(item, "slow"),
  ]);
  const correctLabel = correctLabelFromItem(item);
  const examples = representativeExamples(item);

  const base = {
    id: item.id,
    type,
    correctChoiceId: item.correctChoiceId,
    difficulty: normalizeDifficulty(item.difficulty),
    choices: shuffle(item.choices).map((choice) => ({
      id: choice.id,
      label: choice.label,
      english: choice.english?.trim() ?? "",
    })),
    ...(answerTtsUrl ? { answerTtsUrl } : {}),
    ...(answerTtsSlowUrl ? { answerTtsSlowUrl } : {}),
    illustrationEnglish: illustrationEnglishFromItem(item),
    romanization: resolveRomanizationDisplay(
      correctLabel,
      item.romanization,
    ),
    ...(examples.length > 0 ? { examples } : {}),
  };

  if (type === "sentence_blank") {
    return {
      ...base,
      sentenceStem: item.sentenceStem?.trim() || undefined,
      imageUrl: item.imageUrl?.trim() || undefined,
    };
  }

  return {
    ...base,
    imageUrl: item.imageUrl,
  };
}
