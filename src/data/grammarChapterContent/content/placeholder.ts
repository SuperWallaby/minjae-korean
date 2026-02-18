import type { GrammarChapterContent } from "../../grammarTypes";

/** 최소 placeholder — 각 챕터 파일에서 재사용하지 않고 복사해 두어 청크 분리 유지 */
export const placeholderBlocks: GrammarChapterContent["blocks"] = [
  { type: "paragraph", text: "Content for this chapter." },
];
