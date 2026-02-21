/**
 * Fundamental: 리스트용(가벼운 JSON) / 내용용(블록 JSON) 분리.
 * 내용은 Grammar와 동일한 블록 형식 사용 (BlockRenderer 공유).
 */

/** 리스트 전용 — 목차·네비용. slug = URL 경로. */
export type FundamentalChapterListItem = {
  id: string;
  slug: string;
  number: number;
  title: string;
  description?: string;
  meta?: {
    sentences?: number;
    minutes?: number;
    quizzes?: number;
  };
};

export type FundamentalSection = {
  title: string;
  displayTitle: string;
  anchor?: string;
  filterKey?: string;
  chapters: FundamentalChapterListItem[];
};

export type FundamentalChapterList = {
  sections: FundamentalSection[];
};
