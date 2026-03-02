import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Weekdays + Today/Tomorrow/Yesterday" },
    {
      type: "paragraph",
      text: "Learn the days of the week in Korean and the most common time words: today, tomorrow, and yesterday. These show up in almost every conversation.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Key words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Romanization"],
      rows: [
        { word: "오늘", phonetic: "today", meaning: "oneul" },
        { word: "내일", phonetic: "tomorrow", meaning: "naeil" },
        { word: "어제", phonetic: "yesterday", meaning: "eoje" },
        { word: "요일", phonetic: "day of the week", meaning: "yoil" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Days of the week" },
    {
      type: "callout",
      emoji: "💡",
      text: "Pattern: (day name) + 요일. Example: 월요일 = Monday.",
    },
    {
      type: "soundword_table",
      headers: ["English", "Korean", "Romanization"],
      rows: [
        { word: "Monday", phonetic: "월요일", meaning: "woryoil" },
        { word: "Tuesday", phonetic: "화요일", meaning: "hwayoil" },
        { word: "Wednesday", phonetic: "수요일", meaning: "suyoil" },
        { word: "Thursday", phonetic: "목요일", meaning: "mogyoil" },
        { word: "Friday", phonetic: "금요일", meaning: "geumyoil" },
        { word: "Saturday", phonetic: "토요일", meaning: "toyoil" },
        { word: "Sunday", phonetic: "일요일", meaning: "iryoil" },
      ],
    },
    {
      type: "callout",
      emoji: "🗣️",
      text: "In fast speech, 요일 can sound like “yoil / yuil” depending on the speaker. Focus on recognizing the pattern.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Common phrases" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Breakdown"],
      rows: [
        { word: "오늘 뭐 해요?", phonetic: "What are you doing today?", meaning: "오늘 + 뭐 + 해요" },
        { word: "내일 시간 있어요?", phonetic: "Do you have time tomorrow?", meaning: "내일 + 시간 + 있어요" },
        { word: "어제 뭐 했어요?", phonetic: "What did you do yesterday?", meaning: "어제 + 뭐 + 했어요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Asking and answering" },
    {
      type: "soundword_table",
      headers: ["Question", "Meaning", "Sample answer"],
      rows: [
        { word: "오늘 무슨 요일이에요?", phonetic: "What day is it today?", meaning: "오늘 월요일이에요." },
        { word: "내일은요?", phonetic: "How about tomorrow?", meaning: "내일은 화요일이에요." },
        { word: "어제는요?", phonetic: "How about yesterday?", meaning: "어제는 일요일이었어요." },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Tip: Use -은/는 to switch topics smoothly: 오늘은…, 내일은…, 어제는…",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Say these out loud. Try to answer quickly without translating in your head.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Focus"],
      rows: [
        { word: "Today is Monday.", phonetic: "오늘은 월요일이에요.", meaning: "오늘 + 요일" },
        { word: "Tomorrow is Friday.", phonetic: "내일은 금요일이에요.", meaning: "내일 + 요일" },
        { word: "Yesterday was Sunday.", phonetic: "어제는 일요일이었어요.", meaning: "어제 + past tense" },
        { word: "What day is it today?", phonetic: "오늘 무슨 요일이에요?", meaning: "question pattern" },
        { word: "I’m free on Saturday.", phonetic: "토요일에 시간 있어요.", meaning: "요일 + 에" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize weekdays instantly and use 오늘/내일/어제 naturally in questions and answers.",
    },
  ],
};