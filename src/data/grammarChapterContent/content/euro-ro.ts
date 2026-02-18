import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "으로/로 — To / By / With" },

    { type: "heading_3", text: "으로/로 can mean “to”, “by”, or “with” (a tool)." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 으로 (집으로, 버스로)" },
    { type: "bulleted_list_item", text: "받침 X → 로 (학교로, 차로)" },
    { type: "bulleted_list_item", text: "ㄹ 받침 → 로 (길로, 서울로)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "1) Direction (to)" },
    { type: "bulleted_list_item", text: "집으로 가요." },
    { type: "bulleted_list_item", text: "왼쪽으로 가요." },

    { type: "heading_3", text: "2) Method (by)" },
    { type: "bulleted_list_item", text: "버스로 가요. (by bus)" },
    { type: "bulleted_list_item", text: "택시로 가요. (by taxi)" },

    { type: "heading_3", text: "3) Tool (with)" },
    { type: "bulleted_list_item", text: "펜으로 써요. (with a pen)" },
    { type: "bulleted_list_item", text: "손으로 해요. (with hands)" },


    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "집으로 가요." },
    { type: "numbered_list_item", text: "학교로 가요." },
    { type: "numbered_list_item", text: "버스로 가요." },
    { type: "numbered_list_item", text: "차로 가요." },
    { type: "numbered_list_item", text: "펜으로 써요." },
    { type: "numbered_list_item", text: "손으로 해요." },
    { type: "numbered_list_item", text: "왼쪽으로 가요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "으로/로 = direction / method / tool." },
  ],
};