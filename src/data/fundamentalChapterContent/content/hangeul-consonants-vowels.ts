import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Consonants & Vowels" },
    {
      type: "paragraph",
      text: "한글의 기본 자음(ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ)과 모음(ㅏㅓㅗㅜㅡㅣ 등)을 익혀 봅시다.",
    },
    { type: "heading_2", text: "Basic consonants (자음)" },
    {
      type: "bulleted_list_item",
      text: "ㄱ (기역), ㄴ (니은), ㄷ (디귿), ㄹ (리을), ㅁ (미음), ㅂ (비읍), ㅅ (시옷), ㅇ (이응), ㅈ (지읒), ㅊ (치읓), ㅋ (키읔), ㅌ (티읕), ㅍ (피읍), ㅎ (히읗)",
    },
    { type: "heading_2", text: "Basic vowels (모음)" },
    {
      type: "bulleted_list_item",
      text: "ㅏ (a), ㅓ (eo), ㅗ (o), ㅜ (u), ㅡ (eu), ㅣ (i)",
    },
    { type: "divider" },
    {
      type: "callout",
      emoji: "💡",
      text: "자음과 모음을 조합하면 글자 블록이 됩니다. 예: ㄱ + ㅏ = 가",
    },
  ],
};
