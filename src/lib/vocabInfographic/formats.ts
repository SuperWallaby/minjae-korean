/**
 * Kaja vocab infographic formats — pattern definitions only.
 * Do NOT copy competitor example topics/layouts verbatim in image prompts.
 * Always brand: kajakorean.com + footer capybara logo (logo-for-footer.png).
 */

export const VOCAB_INFOGRAPHIC_BRAND = {
  siteUrl: "kajakorean.com",
  tagline: "Kaja Korean",
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

/** Left vs right — one near-synonym / confusable pair (NOT opposites). */
export type VocabSimilarFormat = {
  id: "similar_split";
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

/**
 * Concept comparison rows — grammar/logic words explained with simple diagrams
 * (e.g. stick-figure markup for everybody / somebody / anybody / nobody).
 */
export type VocabConceptRowsFormat = {
  id: "concept_rows";
  name: string;
  pattern: string;
  typicalRows: string;
  rowStructure: string;
  visualStyle: string;
  titlePattern: string;
  aspectRatio: "3:4" | "4:5";
  whenToUse: string;
};

/** Polished daily-phrase stack — fewer lines, designed (not a plain text dump). */
export type VocabPhraseStackFormat = {
  id: "phrase_stack";
  name: string;
  pattern: string;
  typicalCount: string;
  rowStructure: string;
  visualStyle: string;
  titlePattern: string;
  aspectRatio: "3:4" | "4:5";
  whenToUse: string;
};

/**
 * TOPIK I ↔ II upgrade table — beginner/casual Hangul on the left,
 * more formal / written / exam-level Hangul on the right (same meaning rows).
 */
export type VocabTopikUpgradeFormat = {
  id: "topik_upgrade";
  name: string;
  pattern: string;
  typicalRows: string;
  rowStructure: string;
  visualStyle: string;
  titlePattern: string;
  aspectRatio: "3:4" | "4:5";
  whenToUse: string;
};

export type VocabInfographicFormatId =
  | "grid_cluster"
  | "antonym_split"
  | "similar_split"
  | "super_list"
  | "quiz_comment"
  | "concept_rows"
  | "phrase_stack"
  | "topik_upgrade"
  | "phrase_square";

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

export const VOCAB_SIMILAR_SPLIT_FORMAT: VocabSimilarFormat = {
  id: "similar_split",
  name: "비슷한말 스플릿",
  pattern:
    "Exactly one near-synonym / confusable pair (NOT opposites). Same vertical split as antonym_split, " +
    "but both sides feel close in meaning — difference shown via situation + a tiny nuance badge. " +
    "One Korean word per side with locked Hangul.",
  pairCount: 1,
  sideStructure:
    "scene illustration → English → Hangul → [romanization] → tiny nuance gloss",
  layout: "vertical split, mirrored structure, shared English pair title header (e.g. 'Know vs Understand')",
  titlePattern: "{Word A} vs {Word B}",
  aspectRatio: "4:5",
  whenToUse:
    "Learner traps: honorific pairs, know/understand, spicy/hot, borrow/lend, size/quantity. " +
    "One pair per post — never pack three+ near-synonyms.",
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

export const VOCAB_CONCEPT_ROWS_FORMAT: VocabConceptRowsFormat = {
  id: "concept_rows",
  name: "개념 비교 패널",
  pattern:
    "Compare 3–4 related grammar/logic words using ORIGINAL Kaja scene panels — NOT competitor " +
    "stick-figure + red-circle/X row charts. Prefer a 2×2 card grid. " +
    "Each panel teaches meaning through a simple situation beat, not a busy illustration.",
  typicalRows: "3–4 panels",
  rowStructure: "simple scene + Hangul + [romanization] + short English gloss",
  visualStyle:
    "SIMPLER art: soft flat pastel, few props, 1–2 characters max, clean empty backgrounds, " +
    "large clear Hangul. Avoid crowded café/classroom detail, tiny props, and busy backgrounds. " +
    "FORBIDDEN: stick-figure oval/X charts, flag ornaments, finger-heart logos, save-for-later badges.",
  titlePattern: "{Concept set} in Korean",
  aspectRatio: "3:4",
  whenToUse:
    "Grammar contrast sets where a situation beat teaches better than a vocab grid " +
    "(indefinites, demonstratives, polite vs casual). Keep scenes minimal and readable.",
};

export const VOCAB_PHRASE_STACK_FORMAT: VocabPhraseStackFormat = {
  id: "phrase_stack",
  name: "일상 표현 스택",
  pattern:
    "A short curated stack of everyday Korean phrases (questions or one-liners) for English speakers. " +
    "Fewer lines than a dump list — typically 7–8 — so each row stays large and readable. " +
    "Do NOT copy plain white text-only competitor dumps; this must feel designed.",
  typicalCount: "7–8 phrases",
  rowStructure: "number badge | Hangul (largest) | [romanization] | English gloss",
  visualStyle:
    "Soft cream/blush canvas, teal number pills, rounded soft row cards with light separators, " +
    "friendly title band + small header illustration (chat bubbles / phone / café vibe). " +
    "Generous spacing. No dense 15+ line walls of text. No competitor watermarks.",
  titlePattern: "{Theme} Korean phrases",
  aspectRatio: "3:4",
  whenToUse:
    "Feeling-check questions, cafe orders, meetup openers — snackable spoken Korean sets.",
};

export const VOCAB_TOPIK_UPGRADE_FORMAT: VocabTopikUpgradeFormat = {
  id: "topik_upgrade",
  name: "TOPIK I↔II 업그레이드",
  pattern:
    "Two-column upgrade table: LEFT = TOPIK I (beginner / casual spoken), RIGHT = TOPIK II " +
    "(more formal, written, or exam-ready). 6–8 aligned rows — same meaning, better wording. " +
    "Hangul is primary; romanization small; English is a tiny shared gloss only.",
  typicalRows: "6–8 pairs",
  rowStructure:
    "TOPIK I Hangul + [rom]  ↔  TOPIK II Hangul + [rom]  (+ tiny English meaning)",
  visualStyle:
    "Soft cream/blush portrait card. Twin rounded pill headers: 'TOPIK I' (soft teal) and " +
    "'TOPIK II' (soft coral/rose). Clean two-column Hangul list, generous row spacing. " +
    "Optional tiny cute footer vibe stickers (student vs polished learner) — ORIGINAL Kaja art. " +
    "FORBIDDEN: competitor watermarks, dog memes, IELTS branding, purple clone layouts.",
  titlePattern: "{Theme}: TOPIK I → II",
  aspectRatio: "3:4",
  whenToUse:
    "Level-up posts: speaking verbs, opinions, study/work verbs, polite upgrades. " +
    "One theme per card — do not mix unrelated domains.",
};

/**
 * Single everyday phrase on a vibrant 1:1 solid — L1 gloss → Hangul → (rom) → ill.
 * Sharp compositor (`phrase_square_pin.mjs`); AI draws illustration only.
 */
export type VocabPhraseSquareFormat = {
  id: "phrase_square";
  name: string;
  pattern: string;
  structure: string;
  visualStyle: string;
  titlePattern: string;
  aspectRatio: "1:1";
  whenToUse: string;
};

export const VOCAB_PHRASE_SQUARE_FORMAT: VocabPhraseSquareFormat = {
  id: "phrase_square",
  name: "한마디 스퀘어",
  pattern:
    "One spoken Korean phrase for L2 learners. Top = meaning in the learner's language " +
    "(English or localized gloss), center = large Hangul, under it = romanization in parentheses, " +
    "lower half = one cute scene illustration on a flat solid color background.",
  structure: "L1 gloss → Hangul (hero) → (romanization) → illustration → brand corner",
  visualStyle:
    "Vibrant solid square (pink/blue/coral/teal…), all text white, no cream card frame. " +
    "Illustration = gpt-image-2 brand CAPYBARA doodle painted into the solid bg (not a pasted sticker). " +
    "Brand mark = logo-for-footer.png + Kaja Korean. " +
    "FORBIDDEN: sticker cutouts, Korea flag badges, competitor watermarks, dense lists, portrait 2:3.",
  titlePattern: "{Phrase meaning}",
  aspectRatio: "1:1",
  whenToUse:
    "Snackable everyday lines (can't sleep, I'm hungry, let's go). One phrase per pin. " +
    "Great for multilingual boards — swap only the L1 gloss.",
};

export const VOCAB_INFOGRAPHIC_FORMATS = {
  grid_cluster: VOCAB_GRID_CLUSTER_FORMAT,
  antonym_split: VOCAB_ANTONYM_SPLIT_FORMAT,
  similar_split: VOCAB_SIMILAR_SPLIT_FORMAT,
  super_list: VOCAB_SUPER_LIST_FORMAT,
  quiz_comment: VOCAB_QUIZ_COMMENT_FORMAT,
  concept_rows: VOCAB_CONCEPT_ROWS_FORMAT,
  phrase_stack: VOCAB_PHRASE_STACK_FORMAT,
  topik_upgrade: VOCAB_TOPIK_UPGRADE_FORMAT,
  phrase_square: VOCAB_PHRASE_SQUARE_FORMAT,
} as const;
