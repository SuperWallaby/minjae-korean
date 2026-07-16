import type { KoreanQuizItem } from "./types";

/** CDN where korean-quiz app stores quiz images + answer/example TTS. */
export const DEFAULT_QUIZ_MEDIA_CDN = "https://quiz-media.kajakorean.com";

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
  return process.env.KOREAN_QUIZ_R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
}

/** Same R2 public origin as quiz illustrations (korean-quiz bucket). */
export function resolveQuizCdnOrigin(
  item: Pick<KoreanQuizItem, "imageUrl">,
): string | undefined {
  return (
    quizCdnOriginFromImageUrl(item.imageUrl) ||
    quizR2PublicBaseUrl() ||
    DEFAULT_QUIZ_MEDIA_CDN
  );
}

/**
 * Public CDN for `system/quiz-tts/*`.
 * Do NOT use site `R2_PUBLIC_BASE_URL` (e.g. file.fancamrank.com) — that bucket
 * is unrelated and returns 404 HTML, so the speaker button appears dead.
 */
export function resolveQuizTtsCdnOrigin(
  item: Pick<KoreanQuizItem, "imageUrl">,
): string {
  return (
    quizR2PublicBaseUrl() ||
    quizCdnOriginFromImageUrl(item.imageUrl) ||
    DEFAULT_QUIZ_MEDIA_CDN
  );
}

export function publicUrlForR2Key(
  key: string,
  cdnOrigin?: string,
): string | null {
  const base = (cdnOrigin || DEFAULT_QUIZ_MEDIA_CDN).replace(/\/$/, "");
  if (!base) return null;
  const normalizedKey = key.replace(/^\//, "");
  return `${base}/${normalizedKey}`;
}

/** True when the quiz CDN already has this object (HEAD 2xx). */
export async function quizMediaObjectExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) return true;
    // Some CDNs disallow HEAD — try a tiny range GET.
    if (res.status === 403 || res.status === 405) {
      const get = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-1" },
        signal: AbortSignal.timeout(8_000),
      });
      return get.ok || get.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}
