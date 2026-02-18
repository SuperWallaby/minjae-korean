/**
 * @deprecated 리스트는 grammarChapterList, 본문은 grammarChapterContent + BlockRenderer 사용.
 * 하위 호환용: grammarChapters 는 리스트만 노출 (content 없음).
 */
import { grammarChapterList } from "./grammarChapterList";

export type GrammarChapter = {
  number: number;
  title: string;
  content?: string;
};

export type GrammarData = {
  chapters: GrammarChapter[];
};

/** 리스트만 포함 (용량 절약). 본문은 grammarChapterContent + BlockRenderer. */
export const grammarChapters: GrammarData = {
  chapters: grammarChapterList.sections.flatMap((s) =>
    s.chapters.map((ch) => ({ number: ch.number, title: ch.title })),
  ),
};
