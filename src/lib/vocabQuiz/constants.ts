export const VOCAB_QUIZ_HEADER_LINES = ["WHAT IS THIS CALLED?", "In Korean"] as const;

/** Format 8 object_quiz header — from auto-video-korean/what-is-this-called-in-korean.mp3 */
export const VOCAB_QUIZ_HEADER_AUDIO = "/audio/vocab-quiz-header-en.mp3";

export const VOCAB_QUIZ_SFX = {
  click: "/audio/quiz/click.wav",
  correct: "/audio/quiz/correct.wav",
  wrong: "/audio/quiz/wrong.wav",
  next: "/audio/quiz/next.wav",
  countdown: [
    "/audio/quiz/countdown-1.wav",
    "/audio/quiz/countdown-2.wav",
    "/audio/quiz/countdown-3.wav",
  ],
} as const;

/** Format 8 timing (seconds) */
export const AUTO_TIMING = {
  headerGapSec: 0.2,
  illHoldSec: 0.7,
  countdownSec: 3,
  /** Extra hold on "1" before answer reveal */
  countdownAfterOneSec: 0.1,
  koSlowGapSec: 0.35,
  tailSec: 0.2,
  koSlowPlaybackRate: 0.8,
} as const;

export const DEVICE_ID_KEY = "kaja_vocab_quiz_device_id";
export const SOUND_ENABLED_KEY = "kaja_vocab_quiz_sound";
export const MODE_KEY = "kaja_vocab_quiz_mode";

export type VocabQuizMode = "auto" | "manual" | "studio";
