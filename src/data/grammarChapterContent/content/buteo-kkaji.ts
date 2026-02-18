import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "부터 / 까지 — From / To" },

    { type: "heading_3", text: "부터 = from. 까지 = to / until." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "부터: start (from)" },
    { type: "bulleted_list_item", text: "까지: end (to / until)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Time" },
    { type: "bulleted_list_item", text: "9시부터 5시까지" },
    { type: "bulleted_list_item", text: "월요일부터 금요일까지" },

    { type: "heading_3", text: "Place" },
    { type: "bulleted_list_item", text: "집에서 학교까지" },
    { type: "bulleted_list_item", text: "부산부터 서울까지" },

    { type: "heading_3", text: "Only one side is OK" },
    { type: "bulleted_list_item", text: "9시부터 일해요. (start only)" },
    { type: "bulleted_list_item", text: "5시까지 일해요. (end only)" },


    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "9시부터 5시까지 일해요." },
    { type: "numbered_list_item", text: "월요일부터 금요일까지 가요." },
    { type: "numbered_list_item", text: "지금부터 시작해요." },
    { type: "numbered_list_item", text: "5시까지 있어요." },
    { type: "numbered_list_item", text: "집에서 학교까지 가요." },
    { type: "numbered_list_item", text: "부산부터 서울까지 가요." },
    { type: "numbered_list_item", text: "오늘부터 공부해요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "부터 = start (from). 까지 = end (to/until)." },
  ],
};