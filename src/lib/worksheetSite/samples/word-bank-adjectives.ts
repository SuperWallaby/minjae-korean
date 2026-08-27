import type { WorksheetRecord } from "@/lib/worksheetSite/types";

/** English prompt + Korean adjective bank — learners fill Hangul. */
export const wordBankAdjectivesSample: WorksheetRecord = {
  slug: "word-bank-adjectives",
  topic: "adjectives",
  locale: "ko",
  definition: {
    template: "word-bank-fill",
    title: "형용사를 써 봐요",
    wordBankColumns: 4,
    wordBank: [
      "크다",
      "작다",
      "빠르다",
      "느리다",
      "예쁘다",
      "맛있다",
      "덥다",
      "춥다",
      "많다",
      "적다",
      "길다",
      "짧다",
    ],
    sentences: [
      { text: "The elephant is ___.", blankIndex: 0 },
      { text: "The mouse is ___.", blankIndex: 0 },
      { text: "The cheetah is ___.", blankIndex: 0 },
      { text: "The turtle is ___.", blankIndex: 0 },
      { text: "This flower is ___.", blankIndex: 0 },
      { text: "This kimchi is ___.", blankIndex: 0 },
      { text: "Summer in Korea is ___.", blankIndex: 0 },
      { text: "Winter in Seoul is ___.", blankIndex: 0 },
      { text: "There are ___ people on the subway.", blankIndex: 0 },
      { text: "I have ___ money today.", blankIndex: 0 },
      { text: "The Han River is ___.", blankIndex: 0 },
      { text: "This pencil is ___.", blankIndex: 0 },
    ],
  },
};
