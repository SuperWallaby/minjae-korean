import catalog from "@/data/globalPins/published.json";

export type GlobalPinWord = {
  english: string;
  target: string;
  romanization: string;
  /** Static path e.g. /global/audio/{id}/w0.mp3 */
  ttsUrl?: string;
  ttsProvider?: string;
};

export type GlobalPinExample = {
  /** Sentence in the target language */
  target: string;
  english: string;
  ttsUrl?: string;
  ttsProvider?: string;
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
  return (
    getGlobalCatalog().site?.replace(/\/+$/, "") ||
    "https://global.kajakorean.com"
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

/** Listing thumb: `/global/pins/{id}.card.webp` */
export function globalPinCardImagePath(imagePath: string): string {
  return imagePath.replace(/\.png$/i, ".card.webp");
}

/** Detail / OG: `/global/pins/{id}.webp` */
export function globalPinPageImagePath(imagePath: string): string {
  return imagePath.replace(/\.png$/i, ".webp");
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
