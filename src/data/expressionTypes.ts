/**
 * Expression: 표현 피드용 타입 정의
 * 카드 기반 UI로 Core Frames, Mini Build, Swap List 등 구성
 */

/** 리스트 전용 — 목차·네비용 */
export type ExpressionChapterListItem = {
  id: string;
  slug: string;
  number: number;
  title: string;
  description?: string;
  meta?: {
    frames?: number;
    minutes?: number;
  };
};

/** 섹션 = 그룹 레이블 + 챕터 배열 */
export type ExpressionSection = {
  title: string;
  displayTitle: string;
  anchor?: string;
  chapters: ExpressionChapterListItem[];
};

export type ExpressionChapterList = {
  sections: ExpressionSection[];
};

/** 헤더 정보 */
export type ExpressionHeader = {
  title: string;
  goal: string;
};

/** Swap 옵션: 칩에 보이는 단어(korean) vs 빈칸에 들어갈 정답(result) — 예: 선생님 → 선생님이에요 */
export type SwapItemWithResult = {
  korean: string;
  english?: string;
  /** 빈칸에 넣을 문자열 (예: "선생님이에요") */
  result: string;
};

/** 예문(프레임) 안에 종속되는 Swap 카테고리 */
export type SwapCategoryWithResult = {
  label: string;
  items: SwapItemWithResult[];
};

/** Core Frame 카드 */
export type CoreFrame = {
  korean: string;
  english: string;
  examples: string[];
  /** 예문 순서대로 재생 URL (examples[i] → exampleAudioUrls[i]) */
  exampleAudioUrls?: string[];
  /** 이 예문 전용 교체 단어 (예문 하나 안에 종속) */
  swapCategories?: SwapCategoryWithResult[];
};

/** Challenge 미션 */
export type ExpressionChallenge = {
  prompt: string;
  inputCount: number;
};

/** 챕터 콘텐츠 전체 */
export type ExpressionChapterContent = {
  header: ExpressionHeader;
  coreFrames: CoreFrame[];
  quickQuestions: string[];
  replyPack: string[];
  challenge: ExpressionChallenge;
};
