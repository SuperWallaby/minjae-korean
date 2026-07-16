import type { KoreanQuizItem } from "./types";

export function quizCdnOriginFromImageUrl(
  imageUrl?: string | null,
): string | undefined {
  const raw = imageUrl?.trim();
  if (!raw || raw.startsWith("data:")) return undefined;
  try {
    return new URL(raw).origin;
  } catch {
    return undefined;
  }
}

function quizR2PublicBaseUrl(): string | undefined {
  return (
    process.env.KOREAN_QUIZ_R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "")
  );
}

/** Same R2 public origin as quiz illustrations (korean-quiz bucket). */
export function resolveQuizCdnOrigin(
  item: Pick<KoreanQuizItem, "imageUrl">,
): string | undefined {
  return quizCdnOriginFromImageUrl(item.imageUrl) || quizR2PublicBaseUrl();
}

/**
 * Public CDN for `system/quiz-tts/*` — always the quiz R2 bucket, not the image
 * host (kajakorean.com file proxy vs korean-quiz CDN mismatch broke example TTS).
 */
export function resolveQuizTtsCdnOrigin(
  item: Pick<KoreanQuizItem, "imageUrl">,
): string | undefined {
  return quizR2PublicBaseUrl() || quizCdnOriginFromImageUrl(item.imageUrl);
}

export function publicUrlForR2Key(
  key: string,
  cdnOrigin?: string,
): string | null {
  const base = cdnOrigin?.replace(/\/$/, "");
  if (!base) return null;
  const normalizedKey = key.replace(/^\//, "");
  return `${base}/${normalizedKey}`;
}
