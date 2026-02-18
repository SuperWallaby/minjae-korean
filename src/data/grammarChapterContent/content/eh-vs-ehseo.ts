import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "에 vs 에서 — Place" },

    { type: "heading_3", text: "에 = to / at. 에서 = in / from (action happens there)." },

    { type: "heading_2", text: "에 (to / at)" },
    { type: "bulleted_list_item", text: "Go to a place: 학교에 가요." },
    { type: "bulleted_list_item", text: "Be at a place: 집에 있어요." },
    { type: "bulleted_list_item", text: "Time point: 3시에 와요." },

    { type: "heading_2", text: "에서 (in / from)" },
    { type: "bulleted_list_item", text: "Action in a place: 학교에서 공부해요." },
    { type: "bulleted_list_item", text: "From a place: 집에서 와요." },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "에: destination / location / time" },
    { type: "bulleted_list_item", text: "카페에 가요. (to)" },
    { type: "bulleted_list_item", text: "카페에 있어요. (at)" },
    { type: "bulleted_list_item", text: "3시에 가요. (time)" },

    { type: "heading_3", text: "에서: action place / start place" },
    { type: "bulleted_list_item", text: "카페에서 커피 마셔요. (action)" },
    { type: "bulleted_list_item", text: "집에서 왔어요. (from)" },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text:
        "Often you can skip 에/에서 in short talk if the place is clear. But beginners can keep it.",
    },
    { type: "bulleted_list_item", text: "카페 가요. (카페에 가요)" },
    { type: "bulleted_list_item", text: "집 왔어요. (집에서 왔어요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "학교에 가요." },
    { type: "numbered_list_item", text: "학교에서 공부해요." },
    { type: "numbered_list_item", text: "집에 있어요." },
    { type: "numbered_list_item", text: "집에서 왔어요." },
    { type: "numbered_list_item", text: "카페에 가요." },
    { type: "numbered_list_item", text: "카페에서 커피 마셔요." },
    { type: "numbered_list_item", text: "3시에 와요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "에 = to/at/time. 에서 = action place/from." },
  ],
};