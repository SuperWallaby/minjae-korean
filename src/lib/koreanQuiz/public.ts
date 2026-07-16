import { resolveAnswerTtsPlaybackUrl } from "./tts";
import { shuffle } from "./shuffle";
import { illustrationEnglishBelowImage } from "./englishGloss";
import { resolveRomanizationDisplay } from "./romanization";
import { publicUrlForR2Key, resolveQuizCdnOrigin } from "./quizMedia";
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

/** First usable example sentence for the answer word (with TTS URL when cached). */
function representativeExample(
  item: KoreanQuizItem,
): KoreanQuizPreparedExample | undefined {
  const examples = item.wordExplanationExamples ?? [];
  const origin = resolveQuizCdnOrigin(item);
  for (let index = 0; index < examples.length; index += 1) {
    const example = examples[index];
    const korean = example?.korean?.trim();
    const english = example?.english?.trim();
    if (!korean || !english) continue;
    const ttsUrl = example.ttsR2Key
      ? publicUrlForR2Key(example.ttsR2Key, origin) ?? undefined
      : undefined;
    return { index, korean, english, ttsUrl };
  }
  return undefined;
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
  const example = representativeExample(item);

  const base = {
    id: item.id,
    type,
    correctChoiceId: item.correctChoiceId,
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
    ...(example ? { example } : {}),
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
