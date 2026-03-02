import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Top 10 Counters" },
    {
      type: "paragraph",
      text: "Counters are used when you count things in Korean. The number system depends on the counter: some use Native Korean, and some use Sino-Korean.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick rule: which number system?" },
    {
      type: "soundword_table",
      headers: ["Counter type", "Number system", "Examples"],
      rows: [
        { word: "Counting things/people/age", phonetic: "Native Korean", meaning: "개, 명, 살, 마리, 잔, 권 (often)" },
        { word: "Time (minutes) / money", phonetic: "Sino-Korean", meaning: "분, 원" },
        { word: "Time (hours)", phonetic: "Native Korean", meaning: "시 (1–12 for hours)" },
        { word: "Order/attempts", phonetic: "Sino-Korean (common)", meaning: "번" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "Native Korean often changes form before a counter: 하나→한, 둘→두, 셋→세, 넷→네, 스물→스무.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Most common counter forms (Native Korean)" },
    {
      type: "soundword_table",
      headers: ["Number", "Base", "Before counters"],
      rows: [
        { word: "1", phonetic: "하나", meaning: "한" },
        { word: "2", phonetic: "둘", meaning: "두" },
        { word: "3", phonetic: "셋", meaning: "세" },
        { word: "4", phonetic: "넷", meaning: "네" },
        { word: "20", phonetic: "스물", meaning: "스무" },
      ],
    },

    { type: "divider" },

    // 1) 개
    { type: "heading_2", text: "개 — items / general counting" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 개", phonetic: "1 item", meaning: "하나 → 한" },
        { word: "두 개", phonetic: "2 items", meaning: "둘 → 두" },
        { word: "스무 개", phonetic: "20 items", meaning: "스물 → 스무" },
      ],
    },

    // 2) 명
    { type: "heading_2", text: "명 — people" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 명", phonetic: "1 person", meaning: "Native Korean" },
        { word: "세 명", phonetic: "3 people", meaning: "셋 → 세" },
        { word: "네 명", phonetic: "4 people", meaning: "넷 → 네" },
      ],
    },

    // 3) 살
    { type: "heading_2", text: "살 — age" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "열 살", phonetic: "10 years old", meaning: "Native Korean" },
        { word: "스물네 살", phonetic: "24 years old", meaning: "스물 + 네" },
        { word: "서른 살", phonetic: "30 years old", meaning: "Native tens word" },
      ],
    },

    { type: "divider" },

    // 4) 번
    { type: "heading_2", text: "번 — times / attempts / order" },
    {
      type: "callout",
      emoji: "📝",
      text: "번 often uses Sino-Korean numbers in everyday speech: 일 번, 이 번, 삼 번…",
    },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 번", phonetic: "once", meaning: "Native form is very common too" },
        { word: "두 번", phonetic: "twice", meaning: "Native form is very common too" },
        { word: "3번", phonetic: "number 3 / third", meaning: "Often read as 삼 번" },
      ],
    },

    // 5) 시
    { type: "heading_2", text: "시 — hours (clock time)" },
    {
      type: "callout",
      emoji: "⏰",
      text: "For hours (1–12), Native Korean is common: 한 시, 두 시… Minutes (분) use Sino-Korean.",
    },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 시", phonetic: "1 o’clock", meaning: "하나 → 한" },
        { word: "두 시", phonetic: "2 o’clock", meaning: "둘 → 두" },
        { word: "열두 시", phonetic: "12 o’clock", meaning: "Native Korean" },
      ],
    },

    // 6) 분
    { type: "heading_2", text: "분 — minutes" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "5분", phonetic: "5 minutes", meaning: "오 분 (Sino)" },
        { word: "10분", phonetic: "10 minutes", meaning: "십 분" },
        { word: "30분", phonetic: "30 minutes", meaning: "삼십 분" },
      ],
    },

    { type: "divider" },

    // 7) 원
    { type: "heading_2", text: "원 — Korean won (money)" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Read as"],
      rows: [
        { word: "1,000원", phonetic: "₩1,000", meaning: "천 원" },
        { word: "5,000원", phonetic: "₩5,000", meaning: "오천 원" },
        { word: "10,000원", phonetic: "₩10,000", meaning: "만 원" },
      ],
    },

    // 8) 잔
    { type: "heading_2", text: "잔 — cups / glasses" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 잔", phonetic: "one cup/glass", meaning: "Native Korean" },
        { word: "두 잔", phonetic: "two cups/glasses", meaning: "둘 → 두" },
        { word: "세 잔", phonetic: "three cups/glasses", meaning: "셋 → 세" },
      ],
    },

    { type: "divider" },

    // 9) 마리
    { type: "heading_2", text: "마리 — animals" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 마리", phonetic: "one animal", meaning: "Native Korean" },
        { word: "두 마리", phonetic: "two animals", meaning: "둘 → 두" },
        { word: "세 마리", phonetic: "three animals", meaning: "셋 → 세" },
      ],
    },

    // 10) 권
    { type: "heading_2", text: "권 — books (volumes)" },
    {
      type: "soundword_table",
      headers: ["Example", "Meaning", "Note"],
      rows: [
        { word: "한 권", phonetic: "one book", meaning: "Native Korean" },
        { word: "두 권", phonetic: "two books", meaning: "둘 → 두" },
        { word: "세 권", phonetic: "three books", meaning: "셋 → 세" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer example", "System"],
      rows: [
        { word: "3 people", phonetic: "세 명", meaning: "Native" },
        { word: "2 cups", phonetic: "두 잔", meaning: "Native" },
        { word: "10 minutes", phonetic: "십 분", meaning: "Sino" },
        { word: "5,000 won", phonetic: "오천 원", meaning: "Sino" },
        { word: "4 books", phonetic: "네 권", meaning: "Native" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: use counters naturally by pairing the right system (Native vs Sino) with the right counter.",
    },
  ],
};