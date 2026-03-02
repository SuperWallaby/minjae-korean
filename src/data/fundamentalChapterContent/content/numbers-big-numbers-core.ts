import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Big Number Essentials" },
    {
      type: "paragraph",
      text: "For big numbers, Korean mainly uses Sino-Korean. Learn the core units (100, 1,000, 10,000) and how to read phone numbers and addresses.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core units: 백 / 천 / 만" },
    {
      type: "soundword_table",
      headers: ["Unit", "Korean", "Romanization"],
      rows: [
        { word: "100", phonetic: "백", meaning: "baek" },
        { word: "1,000", phonetic: "천", meaning: "cheon" },
        { word: "10,000", phonetic: "만", meaning: "man" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "Important: 만 = 10,000. Korean groups large numbers by 만 (10,000), not by thousand.",
    },

    { type: "divider" },

    { type: "heading_2", text: "How to build numbers" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Rule: (multiplier) + (unit). If the multiplier is 1, it’s often omitted. Example: 100 = 백 (not 일백).",
    },
    {
      type: "soundword_table",
      headers: ["Number", "Korean", "Built from"],
      rows: [
        { word: "100", phonetic: "백", meaning: "(일)백" },
        { word: "200", phonetic: "이백", meaning: "이 + 백" },
        { word: "1,000", phonetic: "천", meaning: "(일)천" },
        { word: "3,000", phonetic: "삼천", meaning: "삼 + 천" },
        { word: "10,000", phonetic: "만", meaning: "(일)만" },
        { word: "20,000", phonetic: "이만", meaning: "이 + 만" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Common examples (everyday scale)" },
    {
      type: "soundword_table",
      headers: ["Number", "Korean", "Reading tip"],
      rows: [
        { word: "1,234", phonetic: "천이백삼십사", meaning: "천 + 이백 + 삼십 + 사" },
        { word: "9,999", phonetic: "구천구백구십구", meaning: "No 만 yet" },
        { word: "10,000", phonetic: "만", meaning: "New grouping starts here" },
        { word: "12,345", phonetic: "만이천삼백사십오", meaning: "만 + 이천 + 삼백 + 사십 + 오" },
        { word: "50,000", phonetic: "오만", meaning: "Often seen in prices" },
        { word: "100,000", phonetic: "십만", meaning: "십 + 만" },
        { word: "1,000,000", phonetic: "백만", meaning: "백 + 만" },
      ],
    },
    {
      type: "callout",
      emoji: "🧠",
      text: "Quick landmark: 100,000 = 십만, 1,000,000 = 백만.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Zero: 영 vs 공" },
    {
      type: "soundword_table",
      headers: ["0", "Korean", "Used for"],
      rows: [
        { word: "0", phonetic: "영 (yeong)", meaning: "math, counting, formal number reading" },
        { word: "0", phonetic: "공 (gong)", meaning: "phone numbers, codes (very common)" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Phone numbers" },
    {
      type: "paragraph",
      text: "Phone numbers are usually read digit-by-digit. Hyphens show natural breaks.",
    },
    {
      type: "soundword_table",
      headers: ["Digit", "Korean", "Romanization"],
      rows: [
        { word: "0", phonetic: "공 / 영", meaning: "gong / yeong" },
        { word: "1", phonetic: "일", meaning: "il" },
        { word: "2", phonetic: "이", meaning: "i" },
        { word: "3", phonetic: "삼", meaning: "sam" },
        { word: "4", phonetic: "사", meaning: "sa" },
        { word: "5", phonetic: "오", meaning: "o" },
        { word: "6", phonetic: "육", meaning: "yuk" },
        { word: "7", phonetic: "칠", meaning: "chil" },
        { word: "8", phonetic: "팔", meaning: "pal" },
        { word: "9", phonetic: "구", meaning: "gu" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Example", "Read as", "Tip"],
      rows: [
        { word: "010-1234-5678", phonetic: "공일공 / 일이삼사 / 오육칠팔", meaning: "Most common style: digit-by-digit" },
        { word: "02-345-6789", phonetic: "공이 / 삼사오 / 육칠팔구", meaning: "Read each chunk smoothly" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "In phone numbers, 공 for 0 is extremely common. Either 공 or 영 is understood.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Addresses (very basic)" },
    {
      type: "paragraph",
      text: "Korean addresses often include building numbers. These are typically read as Sino-Korean numbers (not Native).",
    },
    {
      type: "soundword_table",
      headers: ["Type", "Example", "Read as (approx.)"],
      rows: [
        { word: "Street/building number", phonetic: "12번", meaning: "십이번 (12 + 번)" },
        { word: "Floor", phonetic: "3층", meaning: "삼층 (3 + 층)" },
        { word: "Room/Unit", phonetic: "101호", meaning: "일공일호 (often digit-by-digit)" },
      ],
    },
    {
      type: "callout",
      emoji: "🏠",
      text: "Tip: For unit numbers like 101호, people often read the digits (일-공-일) instead of saying 백일.",
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize 백/천/만, build big numbers quickly, and read phone numbers and common address numbers confidently.",
    },
  ],
};