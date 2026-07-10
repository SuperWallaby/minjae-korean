export type DifficultyTier = "A" | "B" | "C";

export type DifficultyPreference = "auto" | DifficultyTier;

export type KoreanQuizStatus = "pending" | "approved" | "rejected";

export type KoreanQuizType = "image_mcq" | "sentence_blank";

export type KoreanQuizChoice = {
  id: string;
  label: string;
  english?: string;
};

/** Shared with korean-quiz app — stored on the same `korean_quiz_items` docs. */
export type WordExplanationExample = {
  korean: string;
  english: string;
  ttsR2Key?: string;
};

export type KoreanQuizItem = {
  id: string;
  type?: KoreanQuizType;
  status: KoreanQuizStatus;
  choices: KoreanQuizChoice[];
  correctChoiceId: string;
  imageUrl: string;
  imageR2Key: string;
  answerTtsR2Key?: string;
  answerTtsText?: string;
  answerTtsPrompt?: string;
  /** Bumps when answer TTS is replaced — cache-bust browser/CDN. */
  answerTtsUpdatedAt?: string;
  /** Bumps when slow answer TTS is replaced. */
  answerTtsSlowUpdatedAt?: string;
  /** Format-8 illustration hint — only when source clip had an english line (auto-video-korean). */
  illustrationEnglish?: string;
  /** Legacy display flag; vocab quiz now shows the English gloss whenever available. */
  showIllustrationEnglish?: boolean;
  /** Optional stored romanization; auto-generated from correct label when missing. */
  romanization?: string;
  sentenceStem?: string;
  difficulty: number | DifficultyTier;
  topic?: string;
  contentHash: string;
  answerKey?: string;
  stats: { attempts: number; correct: number };
  createdAt: string;
  approvedAt?: string;
  /** Learner-facing English explanation — shared with korean-quiz Flutter app. */
  wordExplanation?: string;
  wordExplanationExamples?: WordExplanationExample[];
  wordExplanationGeneratedAt?: string;
};

export type KoreanQuizQueueEntry = {
  quizId: string;
  weight: number;
  topic?: string;
};

export type KoreanQuizDeviceQueue = {
  deviceId: string;
  items: KoreanQuizQueueEntry[];
  updatedAt: string;
  /** Last served quiz IDs — refill excludes these for QUIZ_REAPPEAR_COOLDOWN. */
  recentServedQuizIds?: string[];
  /** @deprecated topic blocks removed */
  activeTopic?: string | null;
  /** @deprecated topic blocks removed */
  topicBlockRemaining?: number;
};

export type KoreanQuizAttempt = {
  id: string;
  deviceId: string;
  quizId: string;
  choiceId: string;
  correct: boolean;
  elapsedMs: number;
  createdAt: string;
};

export type KoreanQuizDelivery = {
  id: string;
  deviceId: string;
  quizId: string;
  outcome: "correct" | "incorrect";
  deliveredAt: string;
  attemptId?: string;
};

export type KoreanQuizPreparedChoice = {
  id: string;
  label: string;
  english: string;
};

export type KoreanQuizPrepared = {
  id: string;
  type: KoreanQuizType;
  imageUrl?: string;
  sentenceStem?: string;
  choices: KoreanQuizPreparedChoice[];
  correctChoiceId: string;
  answerTtsUrl?: string;
  answerTtsSlowUrl?: string;
  /** English gloss below the illustration (format 8), not with the answer reveal. */
  illustrationEnglish?: string;
  /** Bracketed pronunciation shown below Korean answer on reveal. */
  romanization?: string;
};

export type KoreanQuizQueueResponse = {
  quizzes: KoreanQuizPrepared[];
  refreshPending?: boolean;
};

/** Content QA — flagged from vocab-quiz player for later review in korean-quiz admin. */
export type KoreanQuizReviewFlag = {
  quizId: string;
  flaggedAt: string;
  source: "vocab-quiz";
};

export type KoreanQuizFlaggedItem = {
  id: string;
  imageUrl?: string;
  correctLabel: string;
  correctEnglish: string;
  topic?: string;
  flaggedAt: string;
};

export type KoreanQuizAttemptResponse = {
  ok: true;
  correct: boolean;
};
