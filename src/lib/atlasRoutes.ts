/**
 * URL paths for atlas sites.
 * getpronounce.net: apex = Chinese, other langs at /{code}/
 * global.kajakorean.com (legacy): /lang/{code}, /pin/{id}
 */

import { isPronounceSiteDeployment } from "@/lib/pronounceSite/brand";

/** Languages with a path prefix on getpronounce (not zh). */
export const PRONOUNCE_PREFIX_LANGS = [
  "es",
  "fr",
  "de",
  "it",
  "ar",
  "ja",
] as const;

export type PronouncePrefixLang = (typeof PRONOUNCE_PREFIX_LANGS)[number];

const PREFIX_SET = new Set<string>(PRONOUNCE_PREFIX_LANGS);

/** `/jp` → `/ja` */
export function normalizeAtlasLangCode(code: string): string {
  const c = String(code || "")
    .trim()
    .toLowerCase();
  if (c === "jp") return "ja";
  return c;
}

export function isPronounceAtlasRouting(): boolean {
  return isPronounceSiteDeployment();
}

export function atlasLangPath(code: string): string {
  const lang = normalizeAtlasLangCode(code);
  if (isPronounceAtlasRouting()) {
    if (lang === "zh") return "/";
    if (PREFIX_SET.has(lang)) return `/${lang}/`;
    return `/${lang}/`;
  }
  return `/lang/${encodeURIComponent(lang)}`;
}

export function atlasPinPath(pin: { id: string; lang: string }): string {
  const lang = normalizeAtlasLangCode(pin.lang);
  const id = encodeURIComponent(pin.id);
  if (isPronounceAtlasRouting()) {
    if (lang === "zh") return `/pin/${id}`;
    return `/${lang}/pin/${id}`;
  }
  return `/pin/${id}`;
}

/** Map legacy global URLs → getpronounce.net paths (no origin). */
export function globalPathToPronounce(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/" || path === "/lang/zh") return "/";

  const langHub = path.match(/^\/lang\/([a-z]{2})$/);
  if (langHub) {
    const code = normalizeAtlasLangCode(langHub[1]!);
    if (code === "zh") return "/";
    return `/${code}/`;
  }

  const langPin = path.match(/^\/lang\/([a-z]{2})\/pin\/(.+)$/);
  if (langPin) {
    const code = normalizeAtlasLangCode(langPin[1]!);
    const id = langPin[2]!;
    if (code === "zh") return `/pin/${id}`;
    return `/${code}/pin/${id}`;
  }

  const apexPin = path.match(/^\/pin\/(.+)$/);
  if (apexPin) {
    const id = decodeURIComponent(apexPin[1]!);
    const langSuffix = id.match(/__([a-z]{2})$/i)?.[1]?.toLowerCase();
    if (langSuffix && langSuffix !== "zh") {
      return `/${normalizeAtlasLangCode(langSuffix)}/pin/${encodeURIComponent(id)}`;
    }
    return `/pin/${encodeURIComponent(id)}`;
  }

  return path;
}
