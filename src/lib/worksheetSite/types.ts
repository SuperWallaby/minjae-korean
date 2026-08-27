/** Worksheet layout kinds — extend as templates grow. */
export type WorksheetTemplate = "match" | "word-bank-fill" | "hangul-writing";

export type WorksheetBorderStyle = "none" | "solid" | "dashed";

export type WorksheetMatchItem = {
  id: string;
  /** Hangul shown on the right (or matched to). */
  label: string;
  /**
   * Approved korean-quiz app illustration only
   * (`quiz-media.kajakorean.com/system/quiz/...`).
   */
  imageUrl?: string;
  quizItemId?: string;
};

export type WorksheetMatchDefinition = {
  template: "match";
  title: string;
  subtitle?: string;
  border?: WorksheetBorderStyle;
  borderColor?: string;
  items: WorksheetMatchItem[];
  /** Shuffled Hangul labels in the right column. */
  labels: string[];
  example?: { itemId: string; label: string };
};

export type WorksheetWordBankFillDefinition = {
  template: "word-bank-fill";
  title: string;
  wordBank: string[];
  wordBankColumns?: number;
  sentences: { text: string; blankIndex: number }[];
};

export type WorksheetHangulWritingDefinition = {
  template: "hangul-writing";
  title: string;
  instruction?: string;
  characters: string[];
  traceCount?: number;
};

export type WorksheetDefinition =
  | WorksheetMatchDefinition
  | WorksheetWordBankFillDefinition
  | WorksheetHangulWritingDefinition;

export type WorksheetRecord = {
  slug: string;
  topic?: string;
  locale?: string;
  filename?: string;
  definition: WorksheetDefinition;
};
