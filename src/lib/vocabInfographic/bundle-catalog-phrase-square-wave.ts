/**
 * phrase_square seed wave — one spoken line per 1:1 solid pin.
 * L1 gloss defaults to English; multilingual upload can swap gloss only.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

export type PhraseSquareData = {
  /** Learner-language meaning (EN or localized). */
  gloss: string;
  hangul: string;
  romanization: string;
  /** Illustration scene (no text). */
  scene: string;
  /** Optional solid hex; otherwise hashed from hangul. */
  bgColor?: string;
  /** Optional BCP-47-ish code for board routing (es, en, …). */
  lang?: string;
};

type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
  phraseSquare?: PhraseSquareData;
};

function p(
  slug: string,
  data: PhraseSquareData,
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `psq-${slug}`,
    format: "phrase_square",
    title: data.gloss,
    count: 1,
    fit: `1:1 solid phrase — ${data.hangul}`,
    priority,
    tags: ["phrase", "spoken", "square", data.hangul, data.lang || "en"],
    preview: [data.gloss, data.hangul, data.romanization],
    phraseSquare: data,
  };
}

/** First wave — everyday spoken lines (EN gloss). */
export const PHRASE_SQUARE_WAVE_BUNDLES: VocabBundle[] = [
  p("cant-sleep", {
    gloss: "I can't sleep.",
    hangul: "잠이 안 와",
    romanization: "jami an wa",
    scene: "hugging a light blue pillow in bed, restless, tiny sleepless sparkles near head",
    bgColor: "#E882B0",
  }),
  p("im-hungry", {
    gloss: "I'm hungry.",
    hangul: "배고파",
    romanization: "baegopa",
    scene: "rubbing tummy next to a simple rice bowl, hungry sparkles",
    bgColor: "#FF6B4A",
  }),
  p("lets-go", {
    gloss: "Let's go!",
    hangul: "가자",
    romanization: "gaja",
    scene: "pointing forward excitedly, motion lines, backpack on",
    bgColor: "#3D8BFF",
  }),
  p("its-okay", {
    gloss: "It's okay.",
    hangul: "괜찮아요",
    romanization: "gwaenchanayo",
    scene: "gentle reassuring hand gesture, soft warm smile",
    bgColor: "#2BB673",
  }),
  p("wait-a-sec", {
    gloss: "Wait a second.",
    hangul: "잠깐만",
    romanization: "jamkkanman",
    scene: "holding up one hand in a pause gesture, tiny clock sparkle",
    bgColor: "#FF9F1C",
  }),
  p("i-miss-you", {
    gloss: "I miss you.",
    hangul: "보고 싶어",
    romanization: "bogo sipeo",
    scene: "looking at a phone with a soft heart, longing pose",
    bgColor: "#E63956",
  }),
  p("so-tired", {
    gloss: "I'm so tired.",
    hangul: "너무 피곤해",
    romanization: "neomu pigonhae",
    scene: "slumped over a desk with tiny zzz, coffee cup nearby",
    bgColor: "#7C5CFF",
  }),
  p("thank-you", {
    gloss: "Thank you.",
    hangul: "고마워",
    romanization: "gomawo",
    scene: "bowing slightly with a grateful smile, small gift box",
    bgColor: "#00A8A8",
  }),
  p("dont-worry", {
    gloss: "Don't worry.",
    hangul: "걱정 마",
    romanization: "geokjeong ma",
    scene: "thumbs-up / reassuring wave, calm smile",
    bgColor: "#5C6BC0",
  }),
  p("see-you", {
    gloss: "See you later.",
    hangul: "나중에 봐",
    romanization: "najunge bwa",
    scene: "waving goodbye, soft motion lines",
    bgColor: "#F4A261",
  }),
  // Spanish-gloss samples (same Hangul — multilingual boards)
  p("cant-sleep-es", {
    gloss: "No tengo sueño.",
    hangul: "잠이 안 와",
    romanization: "jami an wa",
    scene: "hugging a light blue pillow in bed, restless, tiny sleepless sparkles near head",
    bgColor: "#E882B0",
    lang: "es",
  }),
  p("im-hungry-es", {
    gloss: "Tengo hambre.",
    hangul: "배고파",
    romanization: "baegopa",
    scene: "rubbing tummy next to a simple rice bowl, hungry sparkles",
    bgColor: "#FF6B4A",
    lang: "es",
  }),
];
