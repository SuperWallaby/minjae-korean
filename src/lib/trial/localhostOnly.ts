/** Paths for the public 30-minute free trial offer. */

/** GetPronounce Korean hub + pin pages (`/ko`, `/ko/...`). */
export function isPronounceKoreanPath(pathname?: string): boolean {
  const path = String(pathname || "");
  return path === "/ko" || path.startsWith("/ko/");
}

export const FREE_KOREAN_CLASS_SLUG = "free-korean-class";

export function freeKoreanClassPath(surface: "kaja" | "pronounce"): string {
  return surface === "pronounce"
    ? `/ko/${FREE_KOREAN_CLASS_SLUG}`
    : `/${FREE_KOREAN_CLASS_SLUG}`;
}

export function isFreeKoreanClassPath(pathname?: string): boolean {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  return (
    path === `/${FREE_KOREAN_CLASS_SLUG}` ||
    path === `/ko/${FREE_KOREAN_CLASS_SLUG}`
  );
}
