import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "와/과, 하고, (이)랑 — And / With" },

    { type: "heading_3", text: "All mean “and / with”. 하고, (이)랑 are common in talk." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 과 / 이랑 (밥과, 밥이랑)" },
    { type: "bulleted_list_item", text: "받침 X → 와 / 랑 (나와, 민재랑)" },
    { type: "bulleted_list_item", text: "하고 = always OK (밥하고, 친구하고)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "와/과 (more formal)" },
    { type: "bulleted_list_item", text: "책과 노트" },
    { type: "bulleted_list_item", text: "친구와 가요." },

    { type: "heading_3", text: "하고 (very common)" },
    { type: "bulleted_list_item", text: "밥하고 물" },
    { type: "bulleted_list_item", text: "친구하고 가요." },

    { type: "heading_3", text: "(이)랑 (very common, casual)" },
    { type: "bulleted_list_item", text: "밥이랑 물" },
    { type: "bulleted_list_item", text: "친구랑 가요." },

    { type: "heading_3", text: "Meaning check: and vs with" },
    { type: "bulleted_list_item", text: "and (list): 빵하고 우유" },
    { type: "bulleted_list_item", text: "with (together): 친구랑 가요." },

    { type: "bulleted_list_item", text: "빵, 우유 주세요. (빵하고 우유 주세요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "빵하고 우유 주세요." },
    { type: "numbered_list_item", text: "빵이랑 우유 주세요." },
    { type: "numbered_list_item", text: "빵과 우유 주세요." },
    { type: "numbered_list_item", text: "친구하고 가요." },
    { type: "numbered_list_item", text: "친구랑 가요." },
    { type: "numbered_list_item", text: "친구와 가요." },
    { type: "numbered_list_item", text: "책과 노트 있어요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "하고/(이)랑 = common. 와/과 = formal." },
  ],
};