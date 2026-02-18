import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "~보다 — Than" },

    { type: "heading_3", text: "보다 means “than”. Use it to compare." },

    { type: "heading_2", text: "How to use" },
    { type: "bulleted_list_item", text: "A보다 B (B is more)" },
    { type: "bulleted_list_item", text: "A보다 커요. (bigger than A)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Compare two things" },
    { type: "bulleted_list_item", text: "A보다 B가 좋아요." },
    { type: "bulleted_list_item", text: "A보다 더 커요." },

    { type: "heading_3", text: "Often with 더 (more)" },
    { type: "bulleted_list_item", text: "A보다 더 좋아요." },
    { type: "bulleted_list_item", text: "A보다 더 커요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "You can skip it, but then “than” is gone.",
    },
    { type: "bulleted_list_item", text: "이게 더 좋아요. (저거보다 더 좋아요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "커피가 차보다 좋아요." },
    { type: "numbered_list_item", text: "이게 저거보다 커요." },
    { type: "numbered_list_item", text: "오늘이 어제보다 더 추워요." },
    { type: "numbered_list_item", text: "저는 고기보다 생선을 더 좋아해요." },
    { type: "numbered_list_item", text: "버스가 지하철보다 빨라요." },
    { type: "numbered_list_item", text: "이 영화가 저 영화보다 재미있어요." },
    { type: "numbered_list_item", text: "지금이 아침보다 더 좋아요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "보다 = than. Often with 더." },
  ],
};