import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Directions & Movement" },
    {
      type: "paragraph",
      text: "Learn core direction words used for navigation and describing location. You’ll also practice a few essential phrases for asking where something is and giving simple directions.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Basic directions" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "왼쪽", phonetic: "left", meaning: "Location side" },
        { word: "오른쪽", phonetic: "right", meaning: "Location side" },
        { word: "앞", phonetic: "front", meaning: "In front of" },
        { word: "뒤", phonetic: "back", meaning: "Behind" },
        { word: "위", phonetic: "up / above", meaning: "Above" },
        { word: "아래", phonetic: "down / below", meaning: "Below" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Useful place-position words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example idea"],
      rows: [
        { word: "옆", phonetic: "next to", meaning: "옆에 있어요 (It’s next to...)" },
        { word: "근처", phonetic: "nearby", meaning: "근처예요 (It’s nearby)" },
        { word: "건너편", phonetic: "across from", meaning: "건너편에 있어요" },
        { word: "안", phonetic: "inside", meaning: "안에 있어요" },
        { word: "밖", phonetic: "outside", meaning: "밖에 있어요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Movement and direction words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "가다", phonetic: "to go", meaning: "movement verb" },
        { word: "오다", phonetic: "to come", meaning: "movement verb" },
        { word: "들어가다", phonetic: "to go in", meaning: "enter" },
        { word: "나가다", phonetic: "to go out", meaning: "exit" },
        { word: "돌다", phonetic: "to turn", meaning: "often used with 왼쪽/오른쪽" },
        { word: "쭉", phonetic: "straight (for a while)", meaning: "쭉 가세요" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "쭉 means “straight / keep going” (usually for more than just a few steps).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Particles you’ll see a lot" },
    {
      type: "soundword_table",
      headers: ["Particle", "Use", "Example"],
      rows: [
        { word: "에", phonetic: "to / at", meaning: "학교에 가요 (go to school), 집에 있어요 (at home)" },
        { word: "에서", phonetic: "from / at (place of action)", meaning: "집에서 가요 (go from home), 여기에서 만나요 (meet here)" },
        { word: "으로/로", phonetic: "toward / by / into", meaning: "왼쪽으로 가세요 (go to the left)" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Asking where something is" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example answer"],
      rows: [
        { word: "어디예요?", phonetic: "Where is it?", meaning: "저기예요. (It’s over there.)" },
        { word: "어디에 있어요?", phonetic: "Where is it located?", meaning: "오른쪽에 있어요. (It’s on the right.)" },
        { word: "…어디예요?", phonetic: "Where is …?", meaning: "화장실 어디예요? (Where is the restroom?)" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Giving simple directions" },
    {
      type: "callout",
      emoji: "🧭",
      text: "A simple direction formula: (place)에서 + 쭉 + (left/right)으로 + 가세요.",
    },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Notes"],
      rows: [
        { word: "쭉 가세요.", phonetic: "Go straight.", meaning: "Most common starter" },
        { word: "왼쪽으로 가세요.", phonetic: "Go to the left.", meaning: "Use -으로/로" },
        { word: "오른쪽으로 도세요.", phonetic: "Turn right.", meaning: "도세요 = polite ‘turn’" },
        { word: "건너편에 있어요.", phonetic: "It’s across from (it).", meaning: "Location description" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Read the prompts and respond using direction words + 에/으로/로.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Focus"],
      rows: [
        { word: "Where is the restroom?", phonetic: "화장실 어디예요?", meaning: "어디예요" },
        { word: "It’s on the left.", phonetic: "왼쪽에 있어요.", meaning: "location + 에" },
        { word: "Go straight.", phonetic: "쭉 가세요.", meaning: "쭉" },
        { word: "Turn right.", phonetic: "오른쪽으로 도세요.", meaning: "으로/로" },
        { word: "It’s across from the café.", phonetic: "카페 건너편에 있어요.", meaning: "건너편" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: understand and use core direction words to ask for and give simple directions.",
    },
  ],
};