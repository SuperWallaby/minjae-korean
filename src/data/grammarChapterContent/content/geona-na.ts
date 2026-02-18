import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "거나 / 나 — Or" },

    { type: "heading_3", text: "거나 connects verbs. 나 connects nouns." },

    { type: "heading_2", text: "Form" },

    { type: "heading_3", text: "거나 (verb or verb)" },
    { type: "bulleted_list_item", text: "A거나 B (do A or do B)" },
    { type: "bulleted_list_item", text: "가거나 먹어요. (go or eat)" },

    { type: "heading_3", text: "나 (noun or noun)" },
    { type: "bulleted_list_item", text: "A나 B (A or B)" },
    { type: "bulleted_list_item", text: "커피나 물 (coffee or water)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Choose one" },
    { type: "bulleted_list_item", text: "집에 가거나 여기 있어요." },
    { type: "bulleted_list_item", text: "커피나 물 주세요." },

    { type: "heading_3", text: "Do this, or do that" },
    { type: "bulleted_list_item", text: "영화 보거나 책 읽어요." },
    { type: "bulleted_list_item", text: "밥 먹거나 빵 먹어요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "커피나 물 주세요." },
    { type: "numbered_list_item", text: "빵이나 밥 먹어요." },
    { type: "numbered_list_item", text: "집에 가거나 여기 있어요." },
    { type: "numbered_list_item", text: "영화 보거나 책 읽어요." },
    { type: "numbered_list_item", text: "주말에 쉬거나 공부해요." },
    { type: "numbered_list_item", text: "지금 자거나 나중에 자요." },
    { type: "numbered_list_item", text: "택시나 버스로 가요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "거나 = verb or verb. 나 = noun or noun." },
  ],
};