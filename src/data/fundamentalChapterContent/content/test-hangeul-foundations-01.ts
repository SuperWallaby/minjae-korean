import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Hangeul Foundations" },
    {
      type: "paragraph",
      text:
        "Quick review of consonants, vowels, syllable blocks, simple reading, batchim basics, and liaison.",
    },
    {
      type: "test",
      title: "Foundations quiz",
      questions: [
        {
          prompt: "Hangul is written as…",
          choices: [
            "Individual letters in a line (like English)",
            "Syllable blocks made of consonant + vowel (+ batchim)",
            "Only consonants",
            "Only vowels",
          ],
          answer: "Syllable blocks made of consonant + vowel (+ batchim)",
        },
        {
          prompt: "Which one has batchim (final consonant)?",
          choices: ["가", "나", "강", "다"],
          answer: "강",
        },
        {
          prompt: "Which vowel is a combined vowel?",
          choices: ["ㅏ", "ㅗ", "ㅘ", "ㅣ"],
          answer: "ㅘ",
        },
        {
          prompt: "Which consonant is tense (쌍자음)?",
          choices: ["ㄱ", "ㄲ", "ㅋ", "ㅎ"],
          answer: "ㄲ",
        },
        {
          prompt:
            "If the next syllable starts with ㅇ, what often happens to the batchim sound?",
          choices: ["It disappears", "It links to the next syllable", "It becomes a vowel", "Nothing changes ever"],
          answer: "It links to the next syllable",
        },
        {
          prompt: "Pick the best breakdown for 한국어.",
          choices: ["한+국+어", "하+ㄴ+국+어", "한국+어", "한+구+거"],
          answer: "한+국+어",
        },
      ],
    },
  ],
};

