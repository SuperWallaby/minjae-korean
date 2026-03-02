import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "0–10" },
    {
      type: "paragraph",
      text: "Korean uses two number systems: Native Korean (used for counting things and age) and Sino-Korean (used for dates, money, phone numbers, and more). In this chapter, learn 0–10 in both systems.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Two number systems" },
    {
      type: "soundword_table",
      headers: ["System", "Used for (common)", "Examples"],
      rows: [
        { word: "Native Korean", phonetic: "counting", meaning: "people, items, age, hours" },
        { word: "Sino-Korean", phonetic: "numbers", meaning: "dates, minutes, prices, phone numbers" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "There is no single “correct” system. The context decides which one to use.",
    },

    { type: "divider" },

    { type: "heading_2", text: "0–10 (Sino-Korean)" },
    {
      type: "soundword_table",
      headers: ["Number", "Korean", "Romanization"],
      rows: [
        { word: "0", phonetic: "영 / 공", meaning: "yeong / gong" },
        { word: "1", phonetic: "일", meaning: "il" },
        { word: "2", phonetic: "이", meaning: "i" },
        { word: "3", phonetic: "삼", meaning: "sam" },
        { word: "4", phonetic: "사", meaning: "sa" },
        { word: "5", phonetic: "오", meaning: "o" },
        { word: "6", phonetic: "육", meaning: "yuk" },
        { word: "7", phonetic: "칠", meaning: "chil" },
        { word: "8", phonetic: "팔", meaning: "pal" },
        { word: "9", phonetic: "구", meaning: "gu" },
        { word: "10", phonetic: "십", meaning: "sip" },
      ],
    },
    {
      type: "callout",
      emoji: "🗣️",
      text: "0 can be 영 or 공. In everyday counting and math, 영 is common. In phone numbers, 공 is also common.",
    },

    { type: "divider" },

    { type: "heading_2", text: "1–10 (Native Korean)" },
    {
      type: "soundword_table",
      headers: ["Number", "Korean", "Romanization"],
      rows: [
        { word: "1", phonetic: "하나", meaning: "hana" },
        { word: "2", phonetic: "둘", meaning: "dul" },
        { word: "3", phonetic: "셋", meaning: "set" },
        { word: "4", phonetic: "넷", meaning: "net" },
        { word: "5", phonetic: "다섯", meaning: "daseot" },
        { word: "6", phonetic: "여섯", meaning: "yeoseot" },
        { word: "7", phonetic: "일곱", meaning: "ilgop" },
        { word: "8", phonetic: "여덟", meaning: "yeodeol" },
        { word: "9", phonetic: "아홉", meaning: "ahop" },
        { word: "10", phonetic: "열", meaning: "yeol" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Very common short forms (before counters)" },
    {
      type: "callout",
      emoji: "✅",
      text: "When counting with a counter (like “2 people”, “4 items”), some Native Korean numbers often change shape.",
    },
    {
      type: "soundword_table",
      headers: ["Base form", "Counter form", "Example idea"],
      rows: [
        { word: "하나", phonetic: "한", meaning: "한 명 (1 person)" },
        { word: "둘", phonetic: "두", meaning: "두 개 (2 items)" },
        { word: "셋", phonetic: "세", meaning: "세 명 (3 people)" },
        { word: "넷", phonetic: "네", meaning: "네 개 (4 items)" },
        { word: "스물", phonetic: "스무", meaning: "스무 살 (20 years old) (preview)" },
      ],
    },
    {
      type: "callout",
      emoji: "👂",
      text: "Note: 네 (4) can sound like 내 (“my”). Context usually makes it clear.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini practice (read aloud)" },
    {
      type: "soundword_table",
      headers: ["Native", "Sino", "Try to say"],
      rows: [
        { word: "하나 / 일", phonetic: "1", meaning: "hana / il" },
        { word: "둘 / 이", phonetic: "2", meaning: "dul / i" },
        { word: "셋 / 삼", phonetic: "3", meaning: "set / sam" },
        { word: "넷 / 사", phonetic: "4", meaning: "net / sa" },
        { word: "열 / 십", phonetic: "10", meaning: "yeol / sip" },
      ],
    },

    { type: "divider" },

    { type: "callout", emoji: "🎯", text: "Chapter goal: instantly recognize 0–10 and know when to use Native vs Sino-Korean. Next, we’ll use counters and simple counting phrases." },
  ],
};