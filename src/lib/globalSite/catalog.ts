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
