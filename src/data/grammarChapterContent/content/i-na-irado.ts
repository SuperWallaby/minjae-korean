import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "(이)나, (이)라도 — Or / At least" },

    { type: "heading_3", text: "(이)나 = “or”. (이)라도 = “at least”." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 이나 / 이라도 (밥이나, 밥이라도)" },
    { type: "bulleted_list_item", text: "받침 X → 나 / 라도 (물나 X → 물이나 / 물라도 X → 물이라도)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "(이)나: this or that" },
    { type: "bulleted_list_item", text: "커피나 물 주세요. (coffee or water)" },
    { type: "bulleted_list_item", text: "토요일이나 일요일에 가요. (Sat or Sun)" },

    { type: "heading_3", text: "(이)라도: not best, but OK" },
    { type: "bulleted_list_item", text: "물이라도 주세요. (at least water)" },
    { type: "bulleted_list_item", text: "10분이라도 쉬어요. (at least 10 minutes)" },

    { type: "heading_3", text: "Easy feeling" },
    { type: "bulleted_list_item", text: "(이)나 = choose one" },
    { type: "bulleted_list_item", text: "(이)라도 = small choice is OK" },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "You can skip it, but then the “or / at least” feeling is gone.",
    },
    { type: "bulleted_list_item", text: "커피 주세요. (커피나 물 주세요)" },
    { type: "bulleted_list_item", text: "물 주세요. (물이라도 주세요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "커피나 물 주세요." },
    { type: "numbered_list_item", text: "빵이나 먹어요." },
    { type: "numbered_list_item", text: "토요일이나 일요일에 가요." },
    { type: "numbered_list_item", text: "물이라도 주세요." },
    { type: "numbered_list_item", text: "빵이라도 먹어요." },
    { type: "numbered_list_item", text: "10분이라도 쉬어요." },
    { type: "numbered_list_item", text: "집에라도 가요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "(이)나 = or. (이)라도 = at least." },
  ],
};