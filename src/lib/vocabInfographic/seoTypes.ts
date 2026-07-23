import type { VocabInfographicFormatId } from "./formats";

export type VocabSeoWord = {
  hangul: string;
  romanization?: string;
  english: string;
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
  imageAlt: string;
  words: VocabSeoWord[];
  tags: string[];
  /** Short learner blurb (tweet cleaned). */
  intro: string;
  updatedAt: string;
};

export type VocabSeoPublishedFile = {
  generatedAt: string;
  pages: VocabSeoPage[];
};
