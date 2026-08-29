import catalog from "@/data/globalPins/published.json";
import { globalPinCdnOrigin } from "@/lib/mediaUrl";
import {
  isPronounceSiteDeployment,
  pronounceSiteOrigin,
} from "@/lib/pronounceSite/brand";

export type GlobalPinWord = {
  english: string;
  target: string;
  romanization: string;
  /** Static path e.g. /global/audio/{id}/w0.mp3 (Spanish: LatAm default). */
  ttsUrl?: string;
  ttsProvider?: string;
  /** Korean (and similar): male Edge clip alongside default female `ttsUrl`. */
  ttsMaleUrl?: string;
  /** Spanish: Latin America (es-MX) — preferred default for US traffic. */
  ttsLatam?: string;
  /** Spanish: Spain (es-ES). */
  ttsEs?: string;
  /** Optional multi-region Chinese (enrich-pronounce / SoVITS). */
  ttsFemaleCn?: string;
  ttsMaleCn?: string;
  ttsFemaleTw?: string;
  ttsMaleTw?: string;
  ttsFemaleHk?: string;
  ttsMaleHk?: string;
};

export type GlobalPinExample = {
  /** Sentence in the target language */
  target: string;
  english: string;
  ttsUrl?: string;
  ttsProvider?: string;
  /** Korean male Edge clip (pairs with female `ttsUrl`). */
  ttsMaleUrl?: string;
  ttsLatam?: string;
  ttsEs?: string;
};

export type GlobalPinPage = {
  id: string;
  lang: string;
  langName: string;
  titleEn: string;
  slug: string;
  imagePath: string;
  words: GlobalPinWord[];
  examples?: GlobalPinExample[];
  partner: "preply" | "italki" | string;
  description: string;
  topicSlug?: string;
  publishedAt?: string;
  /** Longer SEO blurb (optional). */
  explanationEn?: string;
};

export type GlobalPinCatalog = {
  version: number;
  generatedAt: string;
  site: string;
  languages: { code: string; name: string }[];
  pages: GlobalPinPage[];
};

export function getGlobalCatalog(): GlobalPinCatalog {
  return catalog as GlobalPinCatalog;
}

export function globalSiteBase(): string {
  if (isPronounceSiteDeployment()) {
    return pronounceSiteOrigin();
  }
  return (
    getGlobalCatalog().site?.replace(/\/+$/, "") ||
    "https://getpronounce.net"
  );
}

export function listGlobalPins(opts?: {
  lang?: string;
}): GlobalPinPage[] {
  const pages = getGlobalCatalog().pages || [];
  if (!opts?.lang) return pages;
  const code = opts.lang.toLowerCase();
  return pages.filter((p) => p.lang.toLowerCase() === code);
}

/** Listing thumb: CDN `/global/pins/{id}.card.webp` (top-cropped; bust when crop changes) */
export function globalPinCardImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".card.webp");
  const bust = "v=top";
  if (/^https?:\/\//i.test(path)) {
    return path.includes("?") ? `${path}&${bust}` : `${path}?${bust}`;
  }
  const abs = `${globalPinCdnOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
  return `${abs}?${bust}`;
}

/** Detail / OG: CDN `/global/pins/{id}.webp` */
export function globalPinPageImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(path)) return path;
  return `${globalPinCdnOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Mix of languages for the homepage — avoids dumping all 84 full charts. */
export function featuredHomePins(perLang = 2): GlobalPinPage[] {
  const out: GlobalPinPage[] = [];
  for (const lang of getGlobalCatalog().languages) {
    out.push(...listGlobalPins({ lang: lang.code }).slice(0, perLang));
  }
  return out;
}

export function getGlobalPin(id: string): GlobalPinPage | null {
  const needle = String(id || "").trim();
  if (!needle) return null;
  return (
    getGlobalCatalog().pages.find(
      (p) => p.id === needle || p.slug === needle,
    ) || null
  );
}

export function getGlobalLang(code: string) {
  const c = String(code || "")
    .trim()
    .toLowerCase();
  return getGlobalCatalog().languages.find((l) => l.code === c) || null;
}

export const GLOBAL_LANG_META: Record<
  string,
  { native: string; dir?: "rtl"; rail: string }
> = {
  es: { native: "Español", rail: "#b4471e" },
  fr: { native: "Français", rail: "#2f4d73" },
  de: { native: "Deutsch", rail: "#9a6b12" },
  it: { native: "Italiano", rail: "#2c6a4a" },
  ar: { native: "العربية", dir: "rtl", rail: "#5b3d86" },
  ja: { native: "日本語", rail: "#a31d18" },
  zh: { native: "中文", rail: "#b91c1c" },
};

export function globalLangMeta(code: string) {
  const c = String(code || "").toLowerCase();
  return GLOBAL_LANG_META[c] || { native: code, rail: "#1b1511" };
}

/** Same language + other-language versions of the same topic. */
export function relatedGlobalPins(
  pin: GlobalPinPage,
  limit = 8,
): GlobalPinPage[] {
  const pages = getGlobalCatalog().pages || [];
  const sameLang = pages.filter(
    (p) => p.id !== pin.id && p.lang === pin.lang,
  );
  const sameTopic = pages.filter(
    (p) =>
      p.id !== pin.id &&
      pin.topicSlug &&
      p.topicSlug === pin.topicSlug &&
      p.lang !== pin.lang,
  );
  const out: GlobalPinPage[] = [];
  const seen = new Set<string>();
  for (const p of [...sameTopic, ...sameLang, ...pages]) {
    if (p.id === pin.id || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
