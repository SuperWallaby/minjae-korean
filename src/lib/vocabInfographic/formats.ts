/**
 * Kaja vocab infographic formats — pattern definitions only.
 * Do NOT copy competitor example topics/layouts verbatim in image prompts.
 * Always brand: kajakorean.com + footer capybara logo (logo-for-footer.png).
 */

export const VOCAB_INFOGRAPHIC_BRAND = {
  siteUrl: "kajakorean.com",
  tagline: "What is this in Korean?",
  logoPath: "public/brand/logo-for-footer.png",
  /** Footer: centered icon + tagline */
  footerPlacement: "bottom-center" as const,
} as const;

/** Homogeneous grid — same category, parallel grammar (mostly adj / -하다). */
export type VocabGridFormat = {
  id: "grid_cluster";
  name: string;
  pattern: string;
  defaultCount: 9;
  allowedCounts: readonly [4, 9, 16];
  gridLayouts: Record<4 | 9 | 16, string>;
  cellStructure: string;
  titlePattern: string;
  aspectRatio: "1:1";
  whenToUse: string;
};

/** Left vs right contrast — one antonym pair per image. */
export type VocabAntonymFormat = {
  id: "antonym_split";
  name: string;
  pattern: string;
  pairCount: 1;
  sideStructure: string;
  layout: string;
  titlePattern: string;
  aspectRatio: "4:5" | "1:1";
  whenToUse: string;
};

/** Tall vertical list — scales to many rows (numbers, money, colors…). */
export type VocabSuperListFormat = {
  id: "super_list";
  name: string;
  pattern: string;
  minItems: 9;
  typicalRange: string;
  rowStructure: string;
  columnLayout: string;
  titlePattern: string;
  aspectRatio: "3:4" | "9:16";
  whenToUse: string;
};

/** 4-choice quiz — answer hidden; CTA drives comments. */
export type VocabQuizCommentFormat = {
  id: "quiz_comment";
  name: string;
  pattern: string;
  optionCount: 4;
  optionStructure: string;
  layout: string;
  titlePattern: string;
  aspectRatio: "4:5";
  whenToUse: string;
};

export type VocabInfographicFormatId =
  | "grid_cluster"
  | "antonym_split"
  | "super_list"
  | "quiz_comment";

export const VOCAB_GRID_CLUSTER_FORMAT: VocabGridFormat = {
  id: "grid_cluster",
  name: "동류 그리드 묶음",
  pattern:
    "One semantic theme; each cell is the same part of speech (taste adj, weather adj, texture -하다, etc.). " +
    "Items feel parallel — learners compare similar words, not a random mix.",
  defaultCount: 9,
  allowedCounts: [4, 9, 16],
  gridLayouts: {
    4: "2×2",
    9: "3×3",
    16: "4×4",
  },
  cellStructure: "illustration → English label → Korean (Hangul) → [romanization]",
  titlePattern: "{Theme} in Korean",
  aspectRatio: "1:1",
  whenToUse:
    "Closed sets where items are peers (tastes, textures, emotions, room objects). " +
    "Use 4 for beginner mini-cards; 16 only when every item stays readable.",
};

export const VOCAB_ANTONYM_SPLIT_FORMAT: VocabAntonymFormat = {
  id: "antonym_split",
  name: "반대말 스플릿",
  pattern:
    "Exactly one opposite pair. Split canvas: left concept vs right concept with contrasting " +
    "background mood (day/night, warm/cool, empty/full). One Korean word per side.",
  pairCount: 1,
  sideStructure: "scene illustration → English (caps) → Korean → [romanization]",
  layout: "vertical split, mirrored structure, shared header",
  titlePattern: "KOREAN — {optional micro-theme}",
  aspectRatio: "4:5",
  whenToUse:
    "High-contrast adjectives/adverbs learners confuse. One pair per post — do not cram multiple pairs.",
};

export const VOCAB_SUPER_LIST_FORMAT: VocabSuperListFormat = {
  id: "super_list",
  name: "슈퍼 나열형",
  pattern:
    "Long enumerated list with a fixed ordering key (size, value, calendar order, spectrum). " +
    "Rows stay scannable; optional left column shows the ordering anchor (digit, swatch, icon).",
  minItems: 9,
  typicalRange: "9–20 rows",
  rowStructure: "anchor (number / color / coin) | Korean | [romanization]",
  columnLayout: "center divider or two-column table; title band on top",
  titlePattern: "{SET NAME} IN KOREAN",
  aspectRatio: "3:4",
  whenToUse:
    "Sets that naturally scale (numbers, money, colors, weekdays, months, counters). " +
    "Prefer portrait canvas so nothing is cropped.",
};

export const VOCAB_QUIZ_COMMENT_FORMAT: VocabQuizCommentFormat = {
  id: "quiz_comment",
  name: "댓글 유도 퀴즈",
  pattern:
    "One English meaning prompt; four plausible Korean distractors (similar nuance or grammar). " +
    "Do NOT reveal the correct answer in the image — learners comment first.",
  optionCount: 4,
  optionStructure: "number badge | Hangul | [romanization]",
  layout:
    "badge top-left (KOREAN WORD QUIZ), direction top-right (English → Korean), " +
    "bold question, 4 stacked option cards left, Kaja boy from refrefref.png (backwards blue cap, beige hoodie) right, comment CTA bar above footer band",
  titlePattern: "KOREAN WORD QUIZ",
  aspectRatio: "4:5",
  whenToUse:
    "Near-synonym or easily confused verbs/adjectives. High engagement — post answer as first reply.",
};

export const VOCAB_INFOGRAPHIC_FORMATS = {
  grid_cluster: VOCAB_GRID_CLUSTER_FORMAT,
  antonym_split: VOCAB_ANTONYM_SPLIT_FORMAT,
  super_list: VOCAB_SUPER_LIST_FORMAT,
  quiz_comment: VOCAB_QUIZ_COMMENT_FORMAT,
} as const;
