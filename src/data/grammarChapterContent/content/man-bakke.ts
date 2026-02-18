import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "만, 밖에 — Only" },

    { type: "heading_3", text: "만 = only. 밖에 + negative = only." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "만: only (neutral)" },
    { type: "bulleted_list_item", text: "밖에: only, but it needs a negative verb" },

    { type: "heading_2", text: "How to use" },

    { type: "heading_3", text: "만" },
    { type: "bulleted_list_item", text: "물만 마셔요. (only water)" },
    { type: "bulleted_list_item", text: "저만 가요. (only me)" },

    { type: "heading_3", text: "밖에 + negative" },
    { type: "bulleted_list_item", text: "물밖에 안 마셔요. (only water)" },
    { type: "bulleted_list_item", text: "저밖에 없어요. (only me / nobody else)" },

    { type: "heading_3", text: "Easy rule" },
    { type: "bulleted_list_item", text: "만 = OK in any sentence" },
    { type: "bulleted_list_item", text: "밖에 = use 안/못/없어요" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "물만 마셔요." },
    { type: "numbered_list_item", text: "빵만 먹어요." },
    { type: "numbered_list_item", text: "저만 알아요." },
    { type: "numbered_list_item", text: "물밖에 안 마셔요." },
    { type: "numbered_list_item", text: "빵밖에 안 먹어요." },
    { type: "numbered_list_item", text: "저밖에 없어요." },
    { type: "numbered_list_item", text: "돈밖에 없어요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "Rule: 만 = only. 밖에 = only + negative (안/못/없어요)." },
  ],
};