import type { VocabInfographicFormatId } from "./formats";

export type VocabSeoWord = {
  hangul: string;
  romanization?: string;
  english: string;
  ttsUrl?: string;
  /** sovits | edge */
  ttsProvider?: string;
  ttsScore?: number;
};

export type VocabSeoExample = {
  korean: string;
  english: string;
  ttsUrl?: string;
  ttsProvider?: string;
};

export type VocabSeoPage = {
  bundleId: string;
  slug: string;
  format: VocabInfographicFormatId;
  /** Catalog title (e.g. "신선한 vs 상한" theme English). */
  title: string;
  /** SEO H1 — e.g. "Fresh vs stale in Korean". */
  titleEn: string;
  description: string;
  imageUrl: string;
  /** Optional small WebP for hub cards. */
  imageThumbUrl?: string;
  imageAlt: string;
  words: VocabSeoWord[];
  tags: string[];
  /** Short learner blurb (tweet cleaned). */
  intro: string;
  /** Longer English explanation for the group/comparison. */
  explanationEn?: string;
  /** Example sentences using chart words. */
  examples?: VocabSeoExample[];
  updatedAt: string;
  enrichedAt?: string;
};

export type VocabSeoPublishedFile = {
  generatedAt: string;
  pages: VocabSeoPage[];
};
