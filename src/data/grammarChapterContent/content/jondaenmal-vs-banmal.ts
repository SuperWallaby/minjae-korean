import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "존댓말 vs 반말 — Speech level" },

    { type: "heading_3", text: "존댓말 = polite. 반말 = casual." },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "존댓말 (polite)" },
    { type: "bulleted_list_item", text: "Use with strangers" },
    { type: "bulleted_list_item", text: "Use with older people" },
    { type: "bulleted_list_item", text: "Use at work / school" },

    { type: "heading_3", text: "반말 (casual)" },
    { type: "bulleted_list_item", text: "Use with close friends" },
    { type: "bulleted_list_item", text: "Use with kids" },
    { type: "bulleted_list_item", text: "Often: only after “말 놓을까요?”" },

    { type: "heading_2", text: "Basic endings" },

    { type: "heading_3", text: "존댓말: -요" },
    { type: "bulleted_list_item", text: "가요 / 먹어요 / 좋아요" },
    { type: "bulleted_list_item", text: "예요 / 이에요" },

    { type: "heading_3", text: "반말: -아/-어" },
    { type: "bulleted_list_item", text: "가 / 먹어 / 좋아" },
    { type: "bulleted_list_item", text: "야 / 이야" },

    { type: "heading_2", text: "Mini examples" },
    { type: "heading_3", text: "Same meaning" },
    { type: "bulleted_list_item", text: "존댓말: 지금 가요." },
    { type: "bulleted_list_item", text: "반말: 지금 가." },
    { type: "bulleted_list_item", text: "존댓말: 뭐예요?" },
    { type: "bulleted_list_item", text: "반말: 뭐야?" },

    { type: "heading_2", text: "Safe tip" },
    { type: "bulleted_list_item", text: "Start with 존댓말. It is always safe." },
    { type: "bulleted_list_item", text: "Use 반말 only when you are sure." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "Safe rule: Start with -요 (존댓말)." },
  ],
};