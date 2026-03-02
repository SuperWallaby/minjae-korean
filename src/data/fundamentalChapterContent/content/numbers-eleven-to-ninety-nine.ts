import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Building 11–99" },
    {
      type: "paragraph",
      text: "Now you’ll learn how to build bigger numbers. Korean still uses two systems: Sino-Korean for many “number-like” contexts, and Native Korean for counting (especially with counters).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Sino-Korean: 10s + 1–9" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Rule: (tens) + (ones). Example: 21 = 이십 + 일 → 이십일.",
    },
    {
      type: "soundword_table",
      headers: ["Tens", "Korean", "Romanization"],
      rows: [
        { word: "10", phonetic: "십", meaning: "sip" },
        { word: "20", phonetic: "이십", meaning: "i-sip" },
        { word: "30", phonetic: "삼십", meaning: "sam-sip" },
        { word: "40", phonetic: "사십", meaning: "sa-sip" },
        { word: "50", phonetic: "오십", meaning: "o-sip" },
        { word: "60", phonetic: "육십", meaning: "yuk-sip" },
        { word: "70", phonetic: "칠십", meaning: "chil-sip" },
        { word: "80", phonetic: "팔십", meaning: "pal-sip" },
        { word: "90", phonetic: "구십", meaning: "gu-sip" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Number", "Korean", "How it’s built"],
      rows: [
        { word: "11", phonetic: "십일", meaning: "십 + 일" },
        { word: "12", phonetic: "십이", meaning: "십 + 이" },
        { word: "15", phonetic: "십오", meaning: "십 + 오" },
        { word: "19", phonetic: "십구", meaning: "십 + 구" },
        { word: "21", phonetic: "이십일", meaning: "이십 + 일" },
        { word: "34", phonetic: "삼십사", meaning: "삼십 + 사" },
        { word: "58", phonetic: "오십팔", meaning: "오십 + 팔" },
        { word: "99", phonetic: "구십구", meaning: "구십 + 구" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "In many everyday contexts (prices, dates, minutes, phone numbers), Sino-Korean is the default.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Native Korean: special tens words" },
    {
      type: "callout",
      emoji: "🧠",
      text: "Native Korean has unique words for 20, 30, 40… You combine them with 1–9 to make 21–29, 31–39, etc.",
    },
    {
      type: "soundword_table",
      headers: ["Tens", "Native Korean", "Romanization"],
      rows: [
        { word: "20", phonetic: "스물", meaning: "seumul" },
        { word: "30", phonetic: "서른", meaning: "seoreun" },
        { word: "40", phonetic: "마흔", meaning: "maheun" },
        { word: "50", phonetic: "쉰", meaning: "swin" },
        { word: "60", phonetic: "예순", meaning: "yesun" },
        { word: "70", phonetic: "일흔", meaning: "ilheun" },
        { word: "80", phonetic: "여든", meaning: "yeodeun" },
        { word: "90", phonetic: "아흔", meaning: "aheun" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Number", "Native Korean", "How it’s built"],
      rows: [
        { word: "21", phonetic: "스물하나", meaning: "스물 + 하나" },
        { word: "22", phonetic: "스물둘", meaning: "스물 + 둘" },
        { word: "25", phonetic: "스물다섯", meaning: "스물 + 다섯" },
        { word: "30", phonetic: "서른", meaning: "tens word" },
        { word: "31", phonetic: "서른하나", meaning: "서른 + 하나" },
        { word: "44", phonetic: "마흔넷", meaning: "마흔 + 넷" },
        { word: "58", phonetic: "쉰여덟", meaning: "쉰 + 여덟" },
        { word: "99", phonetic: "아흔아홉", meaning: "아흔 + 아홉" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Native counting with counters (very common)" },
    {
      type: "callout",
      emoji: "✅",
      text: "Before a counter, Native numbers often use short forms: 하나→한, 둘→두, 셋→세, 넷→네, 스물→스무.",
    },
    {
      type: "soundword_table",
      headers: ["Number", "With counter (example)", "Meaning"],
      rows: [
        { word: "21", phonetic: "스물한 개", meaning: "21 items" },
        { word: "22", phonetic: "스물두 명", meaning: "22 people" },
        { word: "24", phonetic: "스물네 살", meaning: "24 years old" },
        { word: "30", phonetic: "서른 살", meaning: "30 years old" },
      ],
    },
    {
      type: "callout",
      emoji: "👂",
      text: "Don’t worry about mastering counters yet—just get used to seeing the short forms in real sentences.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Say each number in both systems (when possible). Focus on building tens + ones smoothly.",
    },
    {
      type: "soundword_table",
      headers: ["Number", "Sino-Korean", "Native Korean"],
      rows: [
        { word: "11", phonetic: "십일", meaning: "(usually not used for counting)" },
        { word: "18", phonetic: "십팔", meaning: "(usually not used for counting)" },
        { word: "21", phonetic: "이십일", meaning: "스물하나" },
        { word: "26", phonetic: "이십육", meaning: "스물여섯" },
        { word: "33", phonetic: "삼십삼", meaning: "서른셋" },
        { word: "47", phonetic: "사십칠", meaning: "마흔일곱" },
        { word: "58", phonetic: "오십팔", meaning: "쉰여덟" },
        { word: "99", phonetic: "구십구", meaning: "아흔아홉" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: build numbers instantly (tens + ones) and recognize the Native tens words (스물, 서른, 마흔…).",
    },
  ],
};