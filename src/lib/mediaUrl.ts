/**
 * Normalize third-party / legacy media hosts onto kajakorean CDNs.
 * English-speaking visitors pay for every extra origin (DNS + TLS).
 */

export const FILE_CDN = "https://file.kajakorean.com";
export const QUIZ_MEDIA_CDN = "https://quiz-media.kajakorean.com";

const R2_DEV_HOST =
  /^https:\/\/pub-[a-z0-9]+\.r2\.dev(?=\/|$)/i;
const FANCAMRANK_FILE =
  /^https:\/\/file\.fancamrank\.com(?=\/|$)/i;

/** Rewrite known legacy hosts; leave other URLs untouched. */
export function normalizePublicMediaUrl(
  url: string | null | undefined,
): string {
  const raw = String(url || "").trim();
  if (!raw || raw.startsWith("data:") || raw.startsWith("/")) return raw;

  if (R2_DEV_HOST.test(raw)) {
    return raw.replace(R2_DEV_HOST, QUIZ_MEDIA_CDN);
  }
  if (FANCAMRANK_FILE.test(raw)) {
    // Same object key after migration script copies into kajakorean bucket.
    return raw.replace(FANCAMRANK_FILE, FILE_CDN);
  }
  return raw;
}

/** Absolute CDN URL for global pin plate variants. */
export function globalPinCdnOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_GLOBAL_PIN_CDN?.trim().replace(/\/+$/, "") ||
    FILE_CDN
  );
}
