import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "해체 — -아/어" },

    { type: "heading_3", text: "-아/어 = casual style. (해체)" },

    { type: "heading_2", text: "When to use" },
    { type: "bulleted_list_item", text: "Close friends" },
    { type: "bulleted_list_item", text: "Kids" },
    { type: "bulleted_list_item", text: "Only when it is OK" },

    { type: "heading_2", text: "Rule (very easy)" },

    { type: "heading_3", text: "1) If it has ㅏ or ㅗ → -아" },
    { type: "bulleted_list_item", text: "가다 → 가" },
    { type: "bulleted_list_item", text: "보다 → 봐" },
    { type: "bulleted_list_item", text: "오다 → 와" },

    { type: "heading_3", text: "2) Other vowels → -어" },
    { type: "bulleted_list_item", text: "먹다 → 먹어" },
    { type: "bulleted_list_item", text: "마시다 → 마셔" },
    { type: "bulleted_list_item", text: "읽다 → 읽어" },

    { type: "heading_3", text: "3) 하다 → 해" },
    { type: "bulleted_list_item", text: "하다 → 해" },
    { type: "bulleted_list_item", text: "공부하다 → 공부해" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "가." },
    { type: "numbered_list_item", text: "와." },
    { type: "numbered_list_item", text: "봐." },
    { type: "numbered_list_item", text: "먹어." },
    { type: "numbered_list_item", text: "마셔." },
    { type: "numbered_list_item", text: "읽어." },
    { type: "numbered_list_item", text: "해." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "Easy: ㅏ/ㅗ → 아. Others → 어. 하다 → 해." },
  ],
};