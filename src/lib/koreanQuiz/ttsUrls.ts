export type AnswerTtsVariant = "normal" | "slow";

/** Same-origin API URL for browser playback (server generates on demand). */
export function answerTtsApiUrl(
  quizId: string,
  variant: AnswerTtsVariant = "normal",
  cacheKey?: string,
): string {
  const base = `/api/vocab-quiz/tts/${encodeURIComponent(quizId)}`;
  const params = new URLSearchParams();
  if (variant === "slow") params.set("variant", "slow");
  const token = cacheKey?.trim();
  if (token) params.set("v", token);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
