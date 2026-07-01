import { answerTtsApiUrl } from "./ttsUrls";
import { resolveAnswerTtsCacheKey } from "./tts";
import { shuffle } from "./shuffle";
import { illustrationEnglishBelowImage } from "./englishGloss";
import { resolveRomanizationDisplay } from "./romanization";
import type { KoreanQuizItem, KoreanQuizPrepared } from "./types";

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

export async function toKoreanQuizPrepared(
  item: KoreanQuizItem,
): Promise<KoreanQuizPrepared> {
  const type = item.type ?? "image_mcq";
  const [normalKey, slowKey] = await Promise.all([
    resolveAnswerTtsCacheKey(item, "normal"),
    resolveAnswerTtsCacheKey(item, "slow"),
  ]);
  const answerTtsUrl = answerTtsApiUrl(item.id, "normal", normalKey);
  const answerTtsSlowUrl = answerTtsApiUrl(item.id, "slow", slowKey);
  const correctLabel = correctLabelFromItem(item);

  const base = {
    id: item.id,
    type,
    correctChoiceId: item.correctChoiceId,
    choices: shuffle(item.choices).map((choice) => ({
      id: choice.id,
      label: choice.label,
      english: choice.english?.trim() ?? "",
    })),
    answerTtsUrl,
    answerTtsSlowUrl,
    illustrationEnglish: illustrationEnglishFromItem(item),
    romanization: resolveRomanizationDisplay(
      correctLabel,
      item.romanization,
    ),
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
