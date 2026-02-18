import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "은/는 — Topic" },

    { type: "heading_3", text: "은/는 tells the topic. Topic = what we talk about." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 은 (책은, 밥은)" },
    { type: "bulleted_list_item", text: "받침 X → 는 (저는, 학교는)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Use it when you talk about X" },
    { type: "bulleted_list_item", text: "저는 민재예요. (topic: me)" },
    { type: "bulleted_list_item", text: "학교는 커요. (topic: school)" },

    { type: "heading_3", text: "Use it for A vs B" },
    { type: "bulleted_list_item", text: "커피는 좋아요. 물은 좋아요." },
    { type: "bulleted_list_item", text: "저는 좋아요. 너는 좋아요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text:
        "In simple talk, you can skip 은/는 when the topic is clear."
    },
    { type: "bulleted_list_item", text: "저 학생이에요. (저는 학생이에요)" },
    { type: "bulleted_list_item", text: "이거 물이에요. (이거는 물이에요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "저는 민재예요." },
    { type: "numbered_list_item", text: "저는 학생이에요." },
    { type: "numbered_list_item", text: "이거는 물이에요." },
    { type: "numbered_list_item", text: "이거는 밥이에요." },
    { type: "numbered_list_item", text: "학교는 커요." },
    { type: "numbered_list_item", text: "집은 작아요." },
    { type: "numbered_list_item", text: "책은 좋아요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "은/는 = topic. Clear topic? You can skip it." },
  ],
};
