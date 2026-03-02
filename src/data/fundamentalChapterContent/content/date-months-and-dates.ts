import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Months & Dates" },
    {
      type: "paragraph",
      text: "Korean dates use Sino-Korean numbers: (month)월 + (day)일. In this chapter, you’ll practice reading dates like 1월 3일, talking about birthdays, and expressing date ranges.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Key words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "월", phonetic: "month (used after a number)", meaning: "1월 = January" },
        { word: "일", phonetic: "day (used after a number)", meaning: "3일 = the 3rd" },
        { word: "년", phonetic: "year", meaning: "2026년 (year)" },
        { word: "생일", phonetic: "birthday", meaning: "My birthday is..." },
        { word: "부터", phonetic: "from / starting", meaning: "start point" },
        { word: "까지", phonetic: "until / up to", meaning: "end point" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Months: 1월–12월" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Months are just numbers + 월 (Sino-Korean numbers). Example: 9월 = September.",
    },
    {
      type: "soundword_table",
      headers: ["Month", "Korean", "Romanization"],
      rows: [
        { word: "Jan", phonetic: "1월", meaning: "i-wol" },
        { word: "Feb", phonetic: "2월", meaning: "i-wol (different number)" },
        { word: "Mar", phonetic: "3월", meaning: "sam-wol" },
        { word: "Apr", phonetic: "4월", meaning: "sa-wol" },
        { word: "May", phonetic: "5월", meaning: "o-wol" },
        { word: "Jun", phonetic: "6월", meaning: "yu-wol" },
        { word: "Jul", phonetic: "7월", meaning: "chil-wol" },
        { word: "Aug", phonetic: "8월", meaning: "pal-wol" },
        { word: "Sep", phonetic: "9월", meaning: "gu-wol" },
        { word: "Oct", phonetic: "10월", meaning: "si-wol" },
        { word: "Nov", phonetic: "11월", meaning: "sibi-wol" },
        { word: "Dec", phonetic: "12월", meaning: "sibi-wol" },
      ],
    },
    {
      type: "callout",
      emoji: "👂",
      text: "Note: 6월 is often pronounced like 'yu-wol' (not 'yuk-wol'). 10월 is 'si-wol'.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Dates: 1일–31일 (examples)" },
    {
      type: "callout",
      emoji: "✅",
      text: "Dates are numbers + 일 (Sino-Korean). Example: 3일 = the 3rd.",
    },
    {
      type: "soundword_table",
      headers: ["Date", "Korean", "Read as"],
      rows: [
        { word: "1st", phonetic: "1일", meaning: "일일" },
        { word: "2nd", phonetic: "2일", meaning: "이일" },
        { word: "3rd", phonetic: "3일", meaning: "삼일" },
        { word: "10th", phonetic: "10일", meaning: "십일" },
        { word: "11th", phonetic: "11일", meaning: "십일일" },
        { word: "15th", phonetic: "15일", meaning: "십오일" },
        { word: "20th", phonetic: "20일", meaning: "이십일" },
        { word: "21st", phonetic: "21일", meaning: "이십일일" },
        { word: "30th", phonetic: "30일", meaning: "삼십일" },
        { word: "31st", phonetic: "31일", meaning: "삼십일일" },
      ],
    },
    {
      type: "callout",
      emoji: "📝",
      text: "Some dates look repetitive in writing (like 2일 = 이일, 21일 = 이십일일). That’s normal.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Reading full dates" },
    {
      type: "soundword_table",
      headers: ["Written", "Korean", "Breakdown"],
      rows: [
        { word: "1월 3일", phonetic: "일월 삼일", meaning: "1월 + 3일" },
        { word: "5월 10일", phonetic: "오월 십일", meaning: "5월 + 10일" },
        { word: "9월 21일", phonetic: "구월 이십일일", meaning: "9월 + 21일" },
        { word: "12월 31일", phonetic: "십이월 삼십일일", meaning: "12월 + 31일" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Birthdays" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example"],
      rows: [
        { word: "생일이 언제예요?", phonetic: "When is your birthday?", meaning: "question pattern" },
        { word: "제 생일은 3월 7일이에요.", phonetic: "My birthday is March 7th.", meaning: "month + day + 이에요" },
        { word: "생일이 11월이에요.", phonetic: "My birthday is in November.", meaning: "month only" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Pattern: (month)월 (day)일 + 이에요/예요. If you give only the month, you can say (month)월이에요.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Date ranges (from ~ to ~)" },
    {
      type: "callout",
      emoji: "➡️",
      text: "Pattern: A부터 B까지 (from A to B). You can use days, dates, or even months.",
    },
    {
      type: "soundword_table",
      headers: ["Written", "Korean", "Meaning"],
      rows: [
        { word: "3월 1일부터 3월 5일까지", phonetic: "samwol ililbuteo samwol oirilkkaji", meaning: "from Mar 1 to Mar 5" },
        { word: "6월부터 8월까지", phonetic: "yuwolbuteo parwolkkaji", meaning: "from June to August" },
        { word: "월요일부터 금요일까지", phonetic: "woryoilbuteo geumyoilkkaji", meaning: "from Monday to Friday" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Try reading these out loud. Focus on 월 / 일 and the flow of big numbers like 12월, 21일.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Focus"],
      rows: [
        { word: "Read: 4월 2일", phonetic: "사월 이일", meaning: "month + day" },
        { word: "Read: 10월 11일", phonetic: "시월 십일일", meaning: "10월 + 11일" },
        { word: "When is your birthday?", phonetic: "생일이 언제예요?", meaning: "question" },
        { word: "My birthday is 7월 9일.", phonetic: "제 생일은 칠월 구일이에요.", meaning: "full date" },
        { word: "From 1월 to 3월", phonetic: "1월부터 3월까지", meaning: "range" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: read dates quickly (월/일) and use simple birthday and date-range phrases.",
    },
  ],
};