import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Liaison Basics (연음)" },
    {
      type: "paragraph",
      text:
        "When a final consonant is followed by a vowel in the next syllable, the sound often links to the next syllable. This is one of the most important reading patterns in Korean.",
    },
    { type: "divider" },
    { type: "heading_2", text: "Core pattern" },
    {
      type: "callout",
      emoji: "➡️",
      text:
        "If the next syllable starts with ㅇ, try connecting smoothly instead of stopping hard.",
    },
    {
      type: "soundword_table",
      headers: ["Written", "Breakdown", "Often sounds like"],
      rows: [
        { word: "한국어", phonetic: "한 + 국 + 어", meaning: "han-gu-geo" },
        { word: "먹어요", phonetic: "먹 + 어 + 요", meaning: "meo-geo-yo" },
        { word: "있어요", phonetic: "있 + 어 + 요", meaning: "i-sseo-yo (later rules refine)" },
        { word: "밥을", phonetic: "밥 + 을", meaning: "ba-beul" },
      ],
    },
    {
      type: "callout",
      emoji: "🧠",
      text:
        "Don’t overthink: just practice recognizing ㅇ as a cue to connect sounds.",
    },
  ],
};

