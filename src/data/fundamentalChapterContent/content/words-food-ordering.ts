import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Food & Ordering" },
    {
      type: "paragraph",
      text: "Learn essential food words and the most common phrases for ordering at a café or restaurant. With just a few patterns, you can order politely and smoothly.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "물", phonetic: "water", meaning: "Very common request" },
        { word: "밥", phonetic: "rice / meal", meaning: "Often means ‘meal’" },
        { word: "커피", phonetic: "coffee", meaning: "Loanword" },
        { word: "차", phonetic: "tea", meaning: "Also means ‘car’ by context" },
        { word: "메뉴", phonetic: "menu", meaning: "Loanword" },
        { word: "주문", phonetic: "order (noun)", meaning: "주문할게요 (I’ll order)" },
        { word: "포장", phonetic: "to-go / takeout", meaning: "For takeout" },
        { word: "매장", phonetic: "dine-in / in-store", meaning: "매장에서 먹어요" },
        { word: "계산", phonetic: "payment / checkout", meaning: "계산할게요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Most useful ordering phrases" },
    {
      type: "callout",
      emoji: "✅",
      text: "The #1 pattern: N + 주세요 (Please give me N). It works for almost everything.",
    },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "When to use"],
      rows: [
        { word: "… 주세요.", phonetic: "Please give me …", meaning: "Polite ordering" },
        { word: "… 있어요?", phonetic: "Do you have …?", meaning: "Check availability" },
        { word: "… 없어요.", phonetic: "We don’t have … / I don’t have …", meaning: "Common response" },
        { word: "이거요.", phonetic: "This one, please.", meaning: "Pointing at a menu" },
        { word: "주문할게요.", phonetic: "I’ll order.", meaning: "Start ordering" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Takeout vs dine-in" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example"],
      rows: [
        { word: "포장이에요.", phonetic: "It’s to-go.", meaning: "포장이에요. (To-go, please.)" },
        { word: "매장이에요.", phonetic: "It’s for here.", meaning: "매장이에요. (For here.)" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "In cafés, staff may ask: 포장이세요? (To-go?) You can answer: 네, 포장이에요 / 아니요, 매장이에요.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Payment (계산)" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example"],
      rows: [
        { word: "계산할게요.", phonetic: "I’ll pay / Check please.", meaning: "At the counter or table" },
        { word: "카드로 할게요.", phonetic: "I’ll pay by card.", meaning: "Very common" },
        { word: "현금으로 할게요.", phonetic: "I’ll pay in cash.", meaning: "Also common" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini dialogues" },
    {
      type: "soundword_table",
      headers: ["Situation", "Korean", "Meaning"],
      rows: [
        { word: "Ordering", phonetic: "커피 한 잔 주세요.", meaning: "One coffee, please." },
        { word: "Availability", phonetic: "물 있어요?", meaning: "Do you have water?" },
        { word: "To-go", phonetic: "포장이에요.", meaning: "To-go, please." },
        { word: "For here", phonetic: "매장이에요.", meaning: "For here, please." },
        { word: "Paying", phonetic: "계산할게요.", meaning: "I’ll pay." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Try saying the Korean sentence out loud. Replace the item word to make new orders.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Focus"],
      rows: [
        { word: "Ask for water.", phonetic: "물 주세요.", meaning: "주세요" },
        { word: "Order one coffee.", phonetic: "커피 한 잔 주세요.", meaning: "counter + 주세요" },
        { word: "Ask if there is a menu.", phonetic: "메뉴 있어요?", meaning: "있어요?" },
        { word: "Say it’s to-go.", phonetic: "포장이에요.", meaning: "포장/매장" },
        { word: "Say you’ll pay by card.", phonetic: "카드로 할게요.", meaning: "결제 표현" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: order politely using 주세요, answer 포장/매장, and handle simple payment phrases.",
    },
  ],
};