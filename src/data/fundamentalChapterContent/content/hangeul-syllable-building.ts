import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Syllable Building" },
    {
      type: "paragraph",
      text: "Combining consonants and vowels into blocks (가/나/다). Click a cell to hear the syllable.",
    },

    { type: "heading_2", text: "모음 × 자음 조합 (가, 나, 다, …)" },

    {
      type: "hangeul_syllable_table",
      consonants: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"],
      vowels: ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"],
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "💡",
      text: "A syllable block is made by combining a consonant + vowel. Example: ㄱ + ㅏ = 가",
    },
    {
      type: "callout",
      emoji: "✍️",
      text: "Placement rule: with vertical vowels (ㅏㅓㅣ), the vowel goes to the right; with horizontal vowels (ㅗㅜㅡ), the vowel goes below.",
    },
  ],
};
