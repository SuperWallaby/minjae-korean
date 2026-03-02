import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Daily Life" },
    {
      type: "paragraph",
      text: "Learn core everyday words you’ll need for simple tasks: sharing your name, checking time and dates, handling money, and giving basic personal info like phone number and address.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "핸드폰", phonetic: "phone / cellphone", meaning: "Also said as 휴대폰" },
        { word: "시간", phonetic: "time", meaning: "time in general" },
        { word: "돈", phonetic: "money", meaning: "general word" },
        { word: "이름", phonetic: "name", meaning: "used in introductions" },
        { word: "주소", phonetic: "address", meaning: "home/address info" },
        { word: "날짜", phonetic: "date", meaning: "calendar date" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Useful related words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example idea"],
      rows: [
        { word: "번호", phonetic: "number", meaning: "전화번호 (phone number)" },
        { word: "전화번호", phonetic: "phone number", meaning: "전화번호가 뭐예요?" },
        { word: "현금", phonetic: "cash", meaning: "현금 있어요?" },
        { word: "카드", phonetic: "card", meaning: "카드 돼요?" },
        { word: "오늘", phonetic: "today", meaning: "오늘 날짜" },
        { word: "내일", phonetic: "tomorrow", meaning: "내일 시간" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Asking and answering (most common)" },
    {
      type: "callout",
      emoji: "✅",
      text: "These patterns cover a lot: 뭐예요? (what is it?), 몇…? (how many/how much?), 있어요? (do you have/is there?).",
    },
    {
      type: "soundword_table",
      headers: ["Question", "Meaning", "Sample answer"],
      rows: [
        { word: "이름이 뭐예요?", phonetic: "What’s your name?", meaning: "제 이름은 민재예요." },
        { word: "전화번호가 뭐예요?", phonetic: "What’s your phone number?", meaning: "010-1234-5678이에요." },
        { word: "주소가 뭐예요?", phonetic: "What’s your address?", meaning: "주소는 …예요." },
        { word: "지금 몇 시예요?", phonetic: "What time is it now?", meaning: "오후 두 시예요." },
        { word: "오늘 날짜가 뭐예요?", phonetic: "What’s today’s date?", meaning: "오늘은 3월 1일이에요." },
        { word: "얼마예요?", phonetic: "How much is it?", meaning: "오천 원이에요." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini practice (fill in the blank)" },
    {
      type: "paragraph",
      text: "Say the answer out loud. Replace the blank with your own information.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer frame", "Focus"],
      rows: [
        { word: "Name", phonetic: "제 이름은 ____예요.", meaning: "introductions" },
        { word: "Phone", phonetic: "전화번호는 ____이에요.", meaning: "numbers" },
        { word: "Address", phonetic: "주소는 ____예요.", meaning: "address word" },
        { word: "Time", phonetic: "지금 ____ 시 ____ 분이에요.", meaning: "time pattern" },
        { word: "Price", phonetic: "____ 원이에요.", meaning: "money pattern" },
      ],
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: handle basic daily-life questions (name, phone number, time, date, price) using simple patterns.",
    },
  ],
};