/**
 * Grammar spotlight cards — one sentence, parallel KO/EN coral highlight
 * (Eggbun-style grammar flashcard). Merged into ALL_VOCAB_BUNDLES.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

export type GrammarSpotlightData = {
  /** Short pattern label for SEO / pin title, e.g. "-고 있다" */
  grammarLabel: string;
  /** English gloss of the pattern, e.g. "present progressive" */
  grammarEnglish: string;
  /** Korean before the highlight (may be empty) */
  koreanBefore: string;
  /** Korean grammar span (coral) */
  koreanHighlight: string;
  /** Korean after highlight (may be empty) */
  koreanAfter: string;
  /** English before highlight */
  englishBefore: string;
  /** English span parallel to koreanHighlight */
  englishHighlight: string;
  /** English after */
  englishAfter: string;
  /** Scene for the illustration (no lettering except tiny zzz-like marks) */
  scene: string;
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
  grammarSpotlight?: GrammarSpotlightData;
};

function g(
  slug: string,
  data: GrammarSpotlightData,
  priority: BundlePriority = "high",
): VocabBundle {
  const ko = `${data.koreanBefore}${data.koreanHighlight}${data.koreanAfter}`.trim();
  return {
    id: `gram-${slug}`,
    format: "grammar_spotlight",
    title: `${data.grammarLabel} — ${data.grammarEnglish}`,
    count: 1,
    fit: `Grammar spotlight — ${data.grammarLabel} (${data.grammarEnglish})`,
    priority,
    tags: ["grammar", "spotlight", "sentence", data.grammarLabel],
    preview: [ko, `${data.englishBefore}${data.englishHighlight}${data.englishAfter}`.trim()],
    grammarSpotlight: data,
  };
}

/** Seed wave — high-frequency beginner grammar beats. */
export const GRAMMAR_SPOTLIGHT_WAVE_BUNDLES: VocabBundle[] = [
  g("progressive-sleeping", {
    grammarLabel: "-고 있다",
    grammarEnglish: "present progressive",
    koreanBefore: "고양이가 ",
    koreanHighlight: "자고 있다",
    koreanAfter: ".",
    englishBefore: "The cat ",
    englishHighlight: "is sleeping",
    englishAfter: ".",
    scene:
      "cute ginger tabby cat lying on its back asleep on a soft cushion, tiny orange zzz floating above — soft cream doodle sticker style, no other text",
  }),
  g("progressive-raining", {
    grammarLabel: "-고 있다",
    grammarEnglish: "present progressive",
    koreanBefore: "밖에 비가 ",
    koreanHighlight: "오고 있다",
    koreanAfter: ".",
    englishBefore: "It ",
    englishHighlight: "is raining",
    englishAfter: " outside.",
    scene:
      "cute window view with soft rain drops and a small umbrella doodle — pastel cream sticker illustration, no text",
  }),
  g("want-to-go", {
    grammarLabel: "-고 싶다",
    grammarEnglish: "want to",
    koreanBefore: "한국에 ",
    koreanHighlight: "가고 싶다",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "want to go",
    englishAfter: " to Korea.",
    scene:
      "cute travel suitcase with a tiny Korean flag sticker and airplane doodle in soft sky — cream pastel, no text",
  }),
  g("try-please", {
    grammarLabel: "-아/어 보세요",
    grammarEnglish: "please try",
    koreanBefore: "한번 ",
    koreanHighlight: "해보세요",
    koreanAfter: ".",
    englishBefore: "Please ",
    englishHighlight: "try it",
    englishAfter: ".",
    scene:
      "cute hand offering a small tasting spoon with a smile spark — soft cream doodle, no text",
  }),
  g("must-go", {
    grammarLabel: "-아야/어야 해요",
    grammarEnglish: "have to",
    koreanBefore: "지금 ",
    koreanHighlight: "가야 해요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "have to go",
    englishAfter: " now.",
    scene:
      "cute character glancing at a round clock while holding a bag, soft hurry vibe — cream pastel doodle, no text",
  }),
  g("dont-worry", {
    grammarLabel: "-지 마세요",
    grammarEnglish: "don't",
    koreanBefore: "",
    koreanHighlight: "걱정하지 마세요",
    koreanAfter: ".",
    englishBefore: "",
    englishHighlight: "Don't worry",
    englishAfter: ".",
    scene:
      "cute soft character giving a gentle thumbs-up with calming sparkles — cream pastel sticker, no text",
  }),
  g("future-meet", {
    grammarLabel: "-ㄹ/을 거예요",
    grammarEnglish: "will / going to",
    koreanBefore: "내일 ",
    koreanHighlight: "만날 거예요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "will meet",
    englishAfter: " tomorrow.",
    scene:
      "cute calendar page with tomorrow circled and two tiny friends waving — cream pastel doodle, no text",
  }),
  g("please-help", {
    grammarLabel: "-아/어 주세요",
    grammarEnglish: "please do for me",
    koreanBefore: "",
    koreanHighlight: "도와주세요",
    koreanAfter: ".",
    englishBefore: "",
    englishHighlight: "Please help",
    englishAfter: ".",
    scene:
      "cute character lifting a heavy box with sparkles asking for help — cream pastel sticker, no text",
  }),
  g("because", {
    grammarLabel: "-아서/어서",
    grammarEnglish: "because / so",
    koreanBefore: "비가 ",
    koreanHighlight: "와서",
    koreanAfter: " 못 갔어요.",
    englishBefore: "",
    englishHighlight: "Because it rained",
    englishAfter: ", I couldn't go.",
    scene:
      "cute rainy street with closed shop door and tiny puddles — soft cream doodle, no text",
  }),
  g("before-sleep", {
    grammarLabel: "-기 전에",
    grammarEnglish: "before doing",
    koreanBefore: "",
    koreanHighlight: "자기 전에",
    koreanAfter: " 이를 닦아요.",
    englishBefore: "",
    englishHighlight: "Before sleeping",
    englishAfter: ", I brush my teeth.",
    scene:
      "cute bedtime scene: toothbrush and fluffy pillow with soft moon — cream pastel doodle, no text",
  }),
];
