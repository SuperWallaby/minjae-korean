import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Telling Time" },
    {
      type: "paragraph",
      text: "To tell time in Korean, hours usually use Native Korean numbers, and minutes use Sino-Korean numbers. You can also add 오전 (a.m.) or 오후 (p.m.).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Key words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "시", phonetic: "hour / o’clock", meaning: "Hours: usually Native Korean (1–12)" },
        { word: "분", phonetic: "minute(s)", meaning: "Minutes: usually Sino-Korean" },
        { word: "오전", phonetic: "a.m.", meaning: "Before noon" },
        { word: "오후", phonetic: "p.m.", meaning: "After noon" },
        { word: "정오", phonetic: "noon", meaning: "12:00 p.m." },
        { word: "자정", phonetic: "midnight", meaning: "12:00 a.m." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Hours (Native Korean)" },
    {
      type: "callout",
      emoji: "⏰",
      text: "Hours use Native Korean numbers (1–12) with the counter 시.",
    },
    {
      type: "soundword_table",
      headers: ["Hour", "Korean", "Romanization"],
      rows: [
        { word: "1", phonetic: "한 시", meaning: "han si" },
        { word: "2", phonetic: "두 시", meaning: "du si" },
        { word: "3", phonetic: "세 시", meaning: "se si" },
        { word: "4", phonetic: "네 시", meaning: "ne si" },
        { word: "5", phonetic: "다섯 시", meaning: "daseot si" },
        { word: "6", phonetic: "여섯 시", meaning: "yeoseot si" },
        { word: "7", phonetic: "일곱 시", meaning: "ilgop si" },
        { word: "8", phonetic: "여덟 시", meaning: "yeodeol si" },
        { word: "9", phonetic: "아홉 시", meaning: "ahop si" },
        { word: "10", phonetic: "열 시", meaning: "yeol si" },
        { word: "11", phonetic: "열한 시", meaning: "yeolhan si" },
        { word: "12", phonetic: "열두 시", meaning: "yeoldu si" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Minutes (Sino-Korean)" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Minutes use Sino-Korean numbers + 분. (1분, 10분, 15분, 30분...)",
    },
    {
      type: "soundword_table",
      headers: ["Minutes", "Korean", "Romanization"],
      rows: [
        { word: "00", phonetic: "(no minutes)", meaning: "You can say just “한 시”" },
        { word: "05", phonetic: "오 분", meaning: "o bun" },
        { word: "10", phonetic: "십 분", meaning: "sip bun" },
        { word: "15", phonetic: "십오 분", meaning: "sibo bun" },
        { word: "20", phonetic: "이십 분", meaning: "isip bun" },
        { word: "30", phonetic: "삼십 분", meaning: "samsip bun" },
        { word: "45", phonetic: "사십오 분", meaning: "sasi-o bun" },
        { word: "59", phonetic: "오십구 분", meaning: "osip-gu bun" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Basic pattern" },
    {
      type: "callout",
      emoji: "✅",
      text: "Pattern: (오전/오후) + (hour) + (minutes). Minutes are optional when it’s exactly on the hour.",
    },
    {
      type: "soundword_table",
      headers: ["Time", "Korean", "Breakdown"],
      rows: [
        { word: "1:00 p.m.", phonetic: "오후 한 시", meaning: "오후 + 한 시" },
        { word: "9:10 a.m.", phonetic: "오전 아홉 시 십 분", meaning: "오전 + 아홉 시 + 십 분" },
        { word: "3:15 p.m.", phonetic: "오후 세 시 십오 분", meaning: "오후 + 세 시 + 십오 분" },
        { word: "6:30 p.m.", phonetic: "오후 여섯 시 삼십 분", meaning: "오후 + 여섯 시 + 삼십 분" },
        { word: "12:00 p.m.", phonetic: "정오", meaning: "special word" },
        { word: "12:00 a.m.", phonetic: "자정", meaning: "special word" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Common shortcuts" },
    {
      type: "soundword_table",
      headers: ["Expression", "Meaning", "Example"],
      rows: [
        { word: "정각", phonetic: "exactly on the hour", meaning: "두 시 정각 (exactly 2:00)" },
        { word: "반", phonetic: "half past", meaning: "두 시 반 (2:30)" },
      ],
    },
    {
      type: "callout",
      emoji: "🗣️",
      text: "두 시 반 is very common in speech. Saying ‘삼십 분’ is also correct and clear.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Asking the time" },
    {
      type: "soundword_table",
      headers: ["Question", "Meaning", "Sample answer"],
      rows: [
        { word: "몇 시예요?", phonetic: "What time is it?", meaning: "오후 두 시예요." },
        { word: "지금 몇 시예요?", phonetic: "What time is it now?", meaning: "오전 열한 시 십 분이에요." },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: say times naturally using 시 (Native hours) + 분 (Sino minutes), and add 오전/오후 when needed.",
    },
  ],
};