import type { WorksheetRecord } from "@/lib/worksheetSite/types";

export const hangulWritingSample: WorksheetRecord = {
  slug: "hangul-writing",
  topic: "hangul",
  locale: "ko",
  definition: {
    template: "hangul-writing",
    title: "한글 쓰기",
    instruction: "Trace and rewrite each letter.",
    characters: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ"],
    traceCount: 4,
  },
};
