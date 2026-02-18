import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "을/를 — Object" },

    { type: "heading_3", text: "을/를 shows the object. Object = what you do." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 을 (밥을, 책을)" },
    { type: "bulleted_list_item", text: "받침 X → 를 (물을, 커피를)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "What do you eat / see / buy?" },
    { type: "bulleted_list_item", text: "뭐 먹어요?" },
    { type: "bulleted_list_item", text: "밥을 먹어요." },

    { type: "heading_3", text: "Like / want" },
    { type: "bulleted_list_item", text: "커피를 좋아해요." },
    { type: "bulleted_list_item", text: "물을 원해요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "In simple talk, you can skip 을/를 when the object is clear.",
    },
    { type: "bulleted_list_item", text: "밥 먹어요. (밥을 먹어요)" },
    { type: "bulleted_list_item", text: "물 마셔요. (물을 마셔요)" },
    { type: "bulleted_list_item", text: "책 읽어요. (책을 읽어요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "밥을 먹어요." },
    { type: "numbered_list_item", text: "물을 마셔요." },
    { type: "numbered_list_item", text: "책을 읽어요." },
    { type: "numbered_list_item", text: "영화를 봐요." },
    { type: "numbered_list_item", text: "커피를 좋아해요." },
    { type: "numbered_list_item", text: "빵을 사요." },
    { type: "numbered_list_item", text: "이거를 주세요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "을/를 = object. Clear object? You can skip it." },
  ],
};