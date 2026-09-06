/**
 * Chrome copy (header/footer) on getpronounce.net — keyed by path language.
 * Apex is Chinese; /ko, /ja, /es… must not keep Chinese taglines.
 */
import {
  atlasLangPath,
  normalizeAtlasLangCode,
  PRONOUNCE_PREFIX_LANGS,
} from "@/lib/atlasRoutes";

const PREFIX = new Set<string>(PRONOUNCE_PREFIX_LANGS);

export type PronounceChromeCopy = {
  lang: string;
  homeHref: string;
  blurb: string;
  tagline: string;
};

const COPY: Record<string, Omit<PronounceChromeCopy, "lang" | "homeHref">> = {
  zh: {
    blurb: "How to say it in Chinese — Mandarin and Cantonese audio.",
    tagline: "Hear how Chinese sounds",
  },
  ko: {
    blurb: "How to say it in Korean.",
    tagline: "How to pronounce Korean — listen, then say it back.",
  },
  ja: {
    blurb: "How to say it in Japanese.",
    tagline: "Basic Japanese words and common phrases.",
  },
  es: {
    blurb: "Common Spanish phrases.",
    tagline: "How to say hello in Spanish — listen and repeat.",
  },
  fr: {
    blurb: "Common French phrases and basic French words.",
    tagline: "How to say it in French.",
  },
  de: {
    blurb: "Basic German words and common phrases.",
    tagline: "How to say hello in German.",
  },
  it: {
    blurb: "Basic Italian words and common phrases.",
    tagline: "How to say it in Italian.",
  },
  ar: {
    blurb: "Arabic pronunciation.",
    tagline: "How to say it in Arabic.",
  },
};

function homeHrefForLang(lang: string): string {
  return atlasLangPath(lang);
}

/** Path → atlas lang. `/jp` counts as Japanese. Chinese lives at `/` and `/pin`. */
export function pronounceLangFromPath(
  pathname: string | null | undefined,
): string {
  let path = String(pathname || "/").replace(/\/+$/, "") || "/";
  if (path.startsWith("/pronounce-site")) {
    path = path.slice("/pronounce-site".length) || "/";
  }
  if (
    path === "/" ||
    path === "/pin" ||
    path.startsWith("/pin/") ||
    path.startsWith("/pinyin") ||
    path.startsWith("/words") ||
    path.startsWith("/go")
  ) {
    return "zh";
  }
  const m = path.match(/^\/([a-z]{2})(\/|$)/i);
  if (!m) return "zh";
  const code = normalizeAtlasLangCode(m[1]!);
  return PREFIX.has(code) ? code : "zh";
}

export function pronounceChromeCopyForLang(lang: string): PronounceChromeCopy {
  const resolved = PREFIX.has(normalizeAtlasLangCode(lang))
    ? normalizeAtlasLangCode(lang)
    : "zh";
  const row = COPY[resolved] || COPY.zh!;
  return {
    lang: resolved,
    homeHref: homeHrefForLang(resolved),
    blurb: row.blurb,
    tagline: row.tagline,
  };
}

export function pronounceChromeCopy(
  pathname: string | null | undefined,
): PronounceChromeCopy {
  return pronounceChromeCopyForLang(pronounceLangFromPath(pathname));
}
