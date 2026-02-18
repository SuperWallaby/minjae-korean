import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "해요체 만들기 — -아요/어요" },

    { type: "heading_3", text: "-아요/어요 = polite style. (해요체)" },

    { type: "heading_2", text: "Rule" },

    { type: "heading_3", text: "1) If it has ㅏ or ㅗ → -아요" },
    { type: "bulleted_list_item", text: "가다 → 가요" },
    { type: "bulleted_list_item", text: "보다 → 봐요" },
    { type: "bulleted_list_item", text: "오다 → 와요" },

    { type: "heading_3", text: "2) Other vowels → -어요" },
    { type: "bulleted_list_item", text: "먹다 → 먹어요" },
    { type: "bulleted_list_item", text: "마시다 → 마셔요" },
    { type: "bulleted_list_item", text: "읽다 → 읽어요" },

    { type: "heading_3", text: "3) 하다 → 해요" },
    { type: "bulleted_list_item", text: "하다 → 해요" },
    { type: "bulleted_list_item", text: "공부하다 → 공부해요" },

    { type: "heading_2", text: "Steps" },
    { type: "numbered_list_item", text: "Take 다 off: 가다 → 가" },
    { type: "numbered_list_item", text: "Add -아요 or -어요: 가 → 가요" },
    { type: "numbered_list_item", text: "Or: 하다 → 해요" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "가요." },
    { type: "numbered_list_item", text: "와요." },
    { type: "numbered_list_item", text: "봐요." },
    { type: "numbered_list_item", text: "먹어요." },
    { type: "numbered_list_item", text: "마셔요." },
    { type: "numbered_list_item", text: "읽어요." },
    { type: "numbered_list_item", text: "해요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "Easy: ㅏ/ㅗ → 아요. Others → 어요. 하다 → 해요." },
  ],
};