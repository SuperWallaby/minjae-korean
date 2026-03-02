import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "With Numbers (Reinforcement)" },
    {
      type: "paragraph",
      text: "Let’s reinforce the most useful number + counter patterns. Focus on using the right number system and the common short forms (한/두/세/네).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick cheat sheet" },
    {
      type: "soundword_table",
      headers: ["Counter", "Use", "Number system"],
      rows: [
        { word: "명", phonetic: "people", meaning: "Native Korean" },
        { word: "개", phonetic: "items", meaning: "Native Korean" },
        { word: "살", phonetic: "age", meaning: "Native Korean" },
        { word: "시", phonetic: "hours", meaning: "Native Korean (1–12)" },
        { word: "분", phonetic: "minutes", meaning: "Sino-Korean" },
        { word: "원", phonetic: "money", meaning: "Sino-Korean" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Short forms before counters: 하나→한, 둘→두, 셋→세, 넷→네, 스물→스무.",
    },

    { type: "divider" },

    { type: "heading_2", text: "People (명)" },
    {
      type: "soundword_table",
      headers: ["Prompt", "Korean", "Tip"],
      rows: [
        { word: "1 person", phonetic: "한 명", meaning: "하나 → 한" },
        { word: "2 people", phonetic: "두 명", meaning: "둘 → 두" },
        { word: "3 people", phonetic: "세 명", meaning: "셋 → 세" },
        { word: "4 people", phonetic: "네 명", meaning: "넷 → 네" },
        { word: "10 people", phonetic: "열 명", meaning: "Native Korean" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Items (개)" },
    {
      type: "soundword_table",
      headers: ["Prompt", "Korean", "Tip"],
      rows: [
        { word: "1 item", phonetic: "한 개", meaning: "short form" },
        { word: "2 items", phonetic: "두 개", meaning: "short form" },
        { word: "4 items", phonetic: "네 개", meaning: "sounds like 내 (my)" },
        { word: "6 items", phonetic: "여섯 개", meaning: "no special short form" },
        { word: "20 items", phonetic: "스무 개", meaning: "스물 → 스무" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Age (살)" },
    {
      type: "soundword_table",
      headers: ["Prompt", "Korean", "Tip"],
      rows: [
        { word: "19 years old", phonetic: "열아홉 살", meaning: "Native Korean" },
        { word: "20 years old", phonetic: "스무 살", meaning: "스물 → 스무" },
        { word: "21 years old", phonetic: "스물한 살", meaning: "스물 + 한" },
        { word: "30 years old", phonetic: "서른 살", meaning: "Native tens word" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Time (시/분)" },
    {
      type: "callout",
      emoji: "⏰",
      text: "Hours use Native Korean + 시. Minutes use Sino-Korean + 분.",
    },
    {
      type: "soundword_table",
      headers: ["Time", "Korean", "Breakdown"],
      rows: [
        { word: "2:00", phonetic: "두 시", meaning: "Native (hour)" },
        { word: "2:10", phonetic: "두 시 십 분", meaning: "Native + Sino" },
        { word: "4:30", phonetic: "네 시 삼십 분", meaning: "Sino minutes" },
        { word: "11:45", phonetic: "열한 시 사십오 분", meaning: "Native + Sino" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Money (원)" },
    {
      type: "soundword_table",
      headers: ["Price", "Korean", "Read as"],
      rows: [
        { word: "₩1,000", phonetic: "천 원", meaning: "1,000 = 천" },
        { word: "₩3,500", phonetic: "삼천오백 원", meaning: "3,000 + 500" },
        { word: "₩10,000", phonetic: "만 원", meaning: "10,000 = 만" },
        { word: "₩25,000", phonetic: "이만오천 원", meaning: "2만 + 5천" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick drill (answer fast)" },
    {
      type: "paragraph",
      text: "Try to answer without translating. Choose the correct number system and counter form.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Check"],
      rows: [
        { word: "3 people", phonetic: "세 명", meaning: "Native + short form" },
        { word: "4 items", phonetic: "네 개", meaning: "Native + short form" },
        { word: "20 years old", phonetic: "스무 살", meaning: "Native + short form" },
        { word: "7 minutes", phonetic: "칠 분", meaning: "Sino" },
        { word: "9:15", phonetic: "아홉 시 십오 분", meaning: "Native + Sino" },
        { word: "₩8,000", phonetic: "팔천 원", meaning: "Sino" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: instantly pair the right counter with the right number system (and use 한/두/세/네 naturally).",
    },
  ],
};