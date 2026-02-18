import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "그리고 / 그래서 / 하지만 — And / So / But" },

    { type: "heading_3", text: "그리고 = and. 그래서 = so. 하지만 = but." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "그리고: add one more (and)" },
    { type: "bulleted_list_item", text: "그래서: result (so)" },
    { type: "bulleted_list_item", text: "하지만: opposite (but)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "그리고 (and)" },
    { type: "bulleted_list_item", text: "커피 마셔요. 그리고 물도 마셔요." },
    { type: "bulleted_list_item", text: "저는 학생이에요. 그리고 저는 한국에 살아요." },

    { type: "heading_3", text: "그래서 (so)" },
    { type: "bulleted_list_item", text: "비 와요. 그래서 집에 있어요." },
    { type: "bulleted_list_item", text: "배고파요. 그래서 밥 먹어요." },

    { type: "heading_3", text: "하지만 (but)" },
    { type: "bulleted_list_item", text: "커피 좋아해요. 하지만 오늘은 안 마셔요." },
    { type: "bulleted_list_item", text: "가고 싶어요. 하지만 시간이 없어요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "You can skip these words. But they make the meaning clear.",
    },
    { type: "bulleted_list_item", text: "비 와요. 집에 있어요. (비 와요. 그래서 집에 있어요.)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "저는 학생이에요. 그리고 저는 한국에 살아요." },
    { type: "numbered_list_item", text: "커피 마셔요. 그리고 물도 마셔요." },
    { type: "numbered_list_item", text: "비 와요. 그래서 집에 있어요." },
    { type: "numbered_list_item", text: "배고파요. 그래서 밥 먹어요." },
    { type: "numbered_list_item", text: "가고 싶어요. 하지만 시간이 없어요." },
    { type: "numbered_list_item", text: "커피 좋아해요. 하지만 오늘은 안 마셔요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "그리고 = and. 그래서 = so. 하지만 = but." },
  ],
};