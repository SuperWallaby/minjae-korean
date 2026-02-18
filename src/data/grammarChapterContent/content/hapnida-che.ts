import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "합니다 — -습니다/ㅂ니다" },

    { type: "heading_3", text: "-습니다/ㅂ니다 = formal polite style. (합니다)" },

    { type: "heading_2", text: "When to use" },
    { type: "bulleted_list_item", text: "News / announcements" },
    { type: "bulleted_list_item", text: "Presentations" },
    { type: "bulleted_list_item", text: "Customer service" },

    { type: "heading_2", text: "Form" },

    { type: "heading_3", text: "Consonant ending → -습니다" },
    { type: "bulleted_list_item", text: "먹다 → 먹습니다" },
    { type: "bulleted_list_item", text: "읽다 → 읽습니다" },

    { type: "heading_3", text: "Vowel ending → -ㅂ니다" },
    { type: "bulleted_list_item", text: "가다 → 갑니다" },
    { type: "bulleted_list_item", text: "오다 → 옵니다" },

    { type: "heading_2", text: "Steps (very simple)" },
    { type: "numbered_list_item", text: "Take 다 off: 가다 → 가" },
    { type: "numbered_list_item", text: "If 끝 sound is vowel → add ㅂ니다: 가 → 갑니다" },
    { type: "numbered_list_item", text: "If 끝 sound is consonant → add 습니다: 먹 → 먹습니다" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "갑니다." },
    { type: "numbered_list_item", text: "옵니다." },
    { type: "numbered_list_item", text: "먹습니다." },
    { type: "numbered_list_item", text: "읽습니다." },
    { type: "numbered_list_item", text: "합니다." },
    { type: "numbered_list_item", text: "좋습니다." },
    { type: "numbered_list_item", text: "감사합니다." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "Vowel → ㅂ니다. Consonant → 습니다." },
  ],
};