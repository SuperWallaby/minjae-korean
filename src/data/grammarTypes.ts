/**
 * Grammar: 리스트용(가벼운 JSON) / 내용용(블록 JSON) 분리.
 * 내용은 노션처럼 블록 단위로 구성.
 */

/** 리스트 전용 — 목차·네비용. slug = URL 경로(의미 있는 문자열). */
export type GrammarChapterListItem = {
  id: string;
  /** URL용. 예: eun-neun, eh-vs-ehseo (인덱스 X) */
  slug: string;
  number: number;
  title: string;
  /** 한 줄 설명: "이 챕터에서 뭘 배우는지" */
  description?: string;
  /** 예: 문장 12개 · 4분 · 퀴즈 6개 */
  meta?: {
    sentences?: number;
    minutes?: number;
    quizzes?: number;
  };
};

/** 섹션 = 그룹 레이블 + 중첩된 챕터 배열 */
export type GrammarSection = {
  title: string;
  /** 화면에 표시: "Particles (조사)", "Speech Levels (문체)" 등 */
  displayTitle: string;
  /** 목록 페이지 앵커용 (브레드커럼에서 목록으로 이동 시 스크롤) */
  anchor?: string;
  /** 필터 칩 매칭용 */
  filterKey?: "조사" | "연결" | "시제" | "문체" | "능의추" | "인용" | "높임";
  chapters: GrammarChapterListItem[];
};

export type GrammarChapterList = {
  sections: GrammarSection[];
};

/** 블록 공통: 인라인 텍스트 (나중에 bold/italic 등 확장 가능) */
export type RichText = { type?: "text"; text: string };

/** 단어 + 발음 URL (vocabulary 스타일, news/recap과 동일) */
export type SoundwordBlock = {
  type: "soundword";
  /** 표기 (e.g. "가", "기역") */
  word: string;
  /** 재생할 오디오 URL */
  sound: string;
  /** 발음 기호 (optional) */
  phonetic?: string;
  /** 뜻/설명 (optional) */
  meaning?: string;
};

/** 노션 스타일 블록 타입 */
export type GrammarBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading_1"; text: string }
  | { type: "heading_2"; text: string }
  | { type: "heading_3"; text: string }
  | { type: "bulleted_list_item"; text: string }
  | { type: "numbered_list_item"; text: string }
  | { type: "quote"; text: string }
  | { type: "code"; language?: string; code: string }
  | { type: "divider" }
  | { type: "callout"; emoji?: string; text: string }
  | SoundwordBlock;

/** 챕터별 본문 — 블록 배열 (내용 JSON에서만 사용) */
export type GrammarChapterContent = {
  blocks: GrammarBlock[];
};

/** 챕터 id → 본문 블록 (내용 JSON 한 번 로드 시) */
export type GrammarContentMap = Record<string, GrammarChapterContent>;
