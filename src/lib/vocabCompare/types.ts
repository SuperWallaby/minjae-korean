export type VocabCompareSide = {
  id: string;
  slug: string;
  korean: string;
  english: string;
  imageUrl: string;
  imageAlt: string;
  explanation: string;
  whenToUsePath?: string;
};

export type VocabComparePage = {
  leftId: string;
  rightId: string;
  slug: string;
  titleEn: string;
  description: string;
  contrast: string;
  contrastSource: "cached" | "fallback";
  left: VocabCompareSide;
  right: VocabCompareSide;
  topic?: string;
  updatedAt?: string;
};

export type VocabCompareListItem = {
  leftId: string;
  rightId: string;
  slug: string;
  titleEn: string;
  left: Pick<VocabCompareSide, "korean" | "english" | "imageUrl" | "imageAlt">;
  right: Pick<VocabCompareSide, "korean" | "english" | "imageUrl" | "imageAlt">;
  updatedAt?: string;
};

/** Min cosine similarity to form a compare/related pair. */
export const VOCAB_COMPARE_MIN_SCORE = 0.55;
/** Max similar neighbors considered per word when building pairs. */
export const VOCAB_COMPARE_NEIGHBORS = 1;
