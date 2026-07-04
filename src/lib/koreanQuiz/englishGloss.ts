import type { KoreanQuizChoice, KoreanQuizItem } from "./types";

/** Latin-script learner gloss — rejects Hanja/CJK dictionary glosses. */
export function isLikelyEnglishGloss(value: string | undefined | null): boolean {
  const text = value?.trim() ?? "";
  if (!text) return false;
  if (/[\u4e00-\u9fff]/.test(text)) return false;
  if (/[\u3040-\u30ff]/.test(text)) return false;
  if (/[\uac00-\ud7a3]/.test(text)) return false;
  return /[A-Za-z]/.test(text);
}

export function choiceEnglishGloss(
  choice: Pick<KoreanQuizChoice, "english">,
): string {
  const english = choice.english?.trim() ?? "";
  return isLikelyEnglishGloss(english) ? english : "";
}

/** English gloss shown below the illustration in the quiz. */
export function illustrationEnglishBelowImage(
  item: Pick<
    KoreanQuizItem,
    | "imageUrl"
    | "illustrationEnglish"
    | "choices"
    | "correctChoiceId"
  >,
): string | undefined {
  if (!item.imageUrl?.trim()) return undefined;

  const explicit = item.illustrationEnglish?.trim();
  if (explicit && isLikelyEnglishGloss(explicit)) return explicit;

  const correct = item.choices.find((choice) => choice.id === item.correctChoiceId);
  const gloss = choiceEnglishGloss(correct ?? {});
  return gloss || undefined;
}
