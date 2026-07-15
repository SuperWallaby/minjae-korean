import type { KoreanQuizItem, WordExplanationExample } from "@/lib/koreanQuiz/types";

export type WhenToUseExample = {
  korean: string;
  english: string;
  ttsUrl?: string;
};

export type WhenToUsePage = {
  id: string;
  slug: string;
  korean: string;
  english: string;
  romanization?: string;
  titleEn: string;
  description: string;
  explanation: string;
  examples: WhenToUseExample[];
  imageUrl: string;
  imageAlt: string;
  answerTtsUrl?: string;
  topic?: string;
  updatedAt?: string;
};

export type WhenToUseListItem = {
  id: string;
  slug: string;
  korean: string;
  english: string;
  titleEn: string;
  imageUrl: string;
  imageAlt: string;
  topic?: string;
  updatedAt?: string;
};

/** Approved + cached explanation with at least this many examples. */
export const WHEN_TO_USE_MIN_EXAMPLES = 2;

export type SeoReadyQuizDoc = Pick<
  KoreanQuizItem,
  | "id"
  | "status"
  | "choices"
  | "correctChoiceId"
  | "imageUrl"
  | "imageR2Key"
  | "illustrationEnglish"
  | "answerTtsR2Key"
  | "answerTtsUpdatedAt"
  | "romanization"
  | "topic"
  | "wordExplanation"
  | "wordExplanationExamples"
  | "wordExplanationGeneratedAt"
  | "approvedAt"
> & {
  wordExplanationExamplesReviewed?: boolean;
};

export type StoredExample = WordExplanationExample;
