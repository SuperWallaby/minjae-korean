/**
 * Default Azure GPT-image size for news covers / hero art.
 * API allows 1536×1024 (landscape); closest wide preset to ~16:9 / 16:10 in practice.
 */
export const NEWS_COVER_IMAGE_SIZE = "1536x1024" as const;

/** Each paragraph independently gets an inline illustration in full-auto (0–1). */
export const NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY = 0.15;

/** Hard cap on paragraph illustrations per article in full-auto. */
export const NEWS_PARAGRAPH_IMAGE_MAX = 2;
