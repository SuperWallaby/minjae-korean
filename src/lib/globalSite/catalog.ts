import { cache } from "react";
import catalog from "@/data/globalPins/published.json";
import { FILE_CDN } from "@/lib/mediaUrl";
import {
  isPronounceSiteDeployment,
  pronounceSiteOrigin,
} from "@/lib/pronounceSite/brand";

export {
  getGlobalLang,
  GLOBAL_LANG_META,
  globalLangMeta,
} from "@/lib/globalSite/langMeta";
export {
  globalPinCardImagePath,
  globalPinPageImagePath,
} from "@/lib/globalSite/pinImages";

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
  /** French: France (fr-FR). */
  ttsFr?: string;
  /** French: Canada / Québec (fr-CA). */
  ttsCa?: string;
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
  ttsFr?: string;
  ttsCa?: string;
};

export type KoReadingLine = {
  ko: string;
  en: string;
  speaker?: string;
  speakerKo?: string;
  voiceId?: string;
};

export type KoReadingCue = {
  lineIndex: number;
  startMs: number;
  endMs: number;
};

export type KoReadingTrack = {
  voiceId: string;
  label: string;
  ttsUrl: string;
  cues: KoReadingCue[];
};

export type KoReading = {
  mode: "dialogue" | "monologue";
  format: "reading_dialogue" | "reading_monologue";
  lines: KoReadingLine[];
  tracks: KoReadingTrack[];
  defaultTrack?: string;
  /** Optional on-pin scene label. Page H1 is titleEn (how-to / in Korean). */
  sceneEn?: string;
  sceneKo?: string;
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
  explanationEn?: string;
  /** Korean reading pins (dialogue / monologue). */
  reading?: KoReading;
};

export type GlobalPinCatalog = {
  version: number;
  generatedAt: string;
  site: string;
  languages: { code: string; name: string }[];
  pages: GlobalPinPage[];
};

/** Legacy monolith — still uploaded for old deploys. Live pages use index + lang shards. */
export const GLOBAL_CATALOG_CDN_KEY = "global/catalog/published.json";
export const GLOBAL_CATALOG_INDEX_KEY = "global/catalog/index.json";

export type GlobalPinListing = {
  id: string;
  lang: string;
  langName: string;
  titleEn: string;
  slug: string;
  imagePath: string;
  topicSlug?: string;
  publishedAt?: string;
};

export type GlobalPinIndex = {
  version: number;
  generatedAt?: string;
  site: string;
  languages: { code: string; name: string }[];
  pages: GlobalPinListing[];
};

function catalogCdnBase(): string {
  return (
    process.env.NEXT_PUBLIC_GLOBAL_CATALOG_CDN?.trim().replace(/\/+$/, "") ||
    FILE_CDN
  );
}

export function globalCatalogCdnUrl(): string {
  return `${catalogCdnBase()}/${GLOBAL_CATALOG_CDN_KEY}`;
}

export function globalCatalogIndexCdnUrl(): string {
  return `${catalogCdnBase()}/${GLOBAL_CATALOG_INDEX_KEY}`;
}

export function globalCatalogLangCdnUrl(lang: string): string {
  return `${catalogCdnBase()}/global/catalog/${lang}.json`;
}

export function normalizeGlobalLangCode(code: string): string | null {
  const c = String(code || "")
    .trim()
    .toLowerCase();
  if (!/^[a-z]{2,8}$/.test(c)) return null;
  return c;
}

/** Pin ids are `{stem}__{lang}` (all current charts). */
export function langCodeFromGlobalPinId(id: string): string | null {
  const m = String(id || "")
    .trim()
    .match(/__([a-z]{2,8})$/i);
  return m ? m[1]!.toLowerCase() : null;
}

function isCatalog(raw: unknown): raw is GlobalPinCatalog {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray((raw as GlobalPinCatalog).pages)
  ) {
    return false;
  }
  const pages = (raw as GlobalPinCatalog).pages;
  if (pages.length === 0) return true;
  return Array.isArray(pages[0]?.words);
}

function isIndex(raw: unknown): raw is GlobalPinIndex {
  return Boolean(
    raw &&
      typeof raw === "object" &&
      Array.isArray((raw as GlobalPinIndex).languages) &&
      Array.isArray((raw as GlobalPinIndex).pages),
  );
}

function listingFromPage(p: GlobalPinPage): GlobalPinListing {
  return {
    id: p.id,
    lang: p.lang,
    langName: p.langName,
    titleEn: p.titleEn,
    slug: p.slug,
    imagePath: p.imagePath,
    ...(p.topicSlug ? { topicSlug: p.topicSlug } : {}),
    ...(p.publishedAt ? { publishedAt: p.publishedAt } : {}),
  };
}

/** Listing rows are enough for cards / sitemap (no words/TTS). */
function pageFromListing(row: GlobalPinListing): GlobalPinPage {
  return {
    id: row.id,
    lang: row.lang,
    langName: row.langName,
    titleEn: row.titleEn,
    slug: row.slug,
    imagePath: row.imagePath,
    words: [],
    partner: "preply",
    description: "",
    ...(row.topicSlug ? { topicSlug: row.topicSlug } : {}),
    ...(row.publishedAt ? { publishedAt: row.publishedAt } : {}),
  };
}

async function fetchJson(
  url: string,
  tags: string[],
): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60, tags },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Repo snapshot baked into the deploy — fallback + generateStaticParams. */
export function getGlobalCatalogBundled(): GlobalPinCatalog {
  return catalog as GlobalPinCatalog;
}

function indexFromBundled(): GlobalPinIndex {
  const bundled = getGlobalCatalogBundled();
  return {
    version: bundled.version,
    generatedAt: bundled.generatedAt,
    site: bundled.site,
    languages: bundled.languages,
    pages: (bundled.pages || []).map(listingFromPage),
  };
}

/**
 * Lightweight listing (no words/TTS). Home, sitemap, lang counts.
 * Deduped per request via React cache.
 */
export const getGlobalIndex = cache(async (): Promise<GlobalPinIndex> => {
  const json = await fetchJson(globalCatalogIndexCdnUrl(), [
    "global-catalog",
    "global-catalog-index",
  ]);
  if (isIndex(json) && json.pages.length > 0) return json;
  return indexFromBundled();
});

/**
 * Full pins for one language (~250–350KB vs ~2.3MB monolith).
 */
export const getGlobalLangCatalog = cache(
  async (lang: string): Promise<GlobalPinCatalog> => {
    const code = normalizeGlobalLangCode(lang);
    const bundled = getGlobalCatalogBundled();
    const fallback = (): GlobalPinCatalog => ({
      version: bundled.version,
      generatedAt: bundled.generatedAt,
      site: bundled.site,
      languages: bundled.languages,
      pages: code
        ? (bundled.pages || []).filter(
            (p) => p.lang.toLowerCase() === code,
          )
        : [],
    });
    if (!code) return fallback();
    const json = await fetchJson(globalCatalogLangCdnUrl(code), [
      "global-catalog",
      `global-catalog-${code}`,
    ]);
    if (isCatalog(json)) return json;
    return fallback();
  },
);

/**
 * Languages + listing pages (not full word payloads).
 * For a language's charts with TTS/words, use listGlobalPins({ lang }).
 */
export async function getGlobalCatalog(): Promise<GlobalPinCatalog> {
  const index = await getGlobalIndex();
  return {
    version: index.version,
    generatedAt: index.generatedAt || "",
    site: index.site,
    languages: index.languages,
    pages: (index.pages || []).map(pageFromListing),
  };
}

export function globalSiteBase(): string {
  if (isPronounceSiteDeployment()) {
    return pronounceSiteOrigin();
  }
  return (
    getGlobalCatalogBundled().site?.replace(/\/+$/, "") ||
    "https://getpronounce.net"
  );
}

export async function listGlobalPins(opts?: {
  lang?: string;
}): Promise<GlobalPinPage[]> {
  const code = opts?.lang ? normalizeGlobalLangCode(opts.lang) : null;
  const pages = code
    ? (await getGlobalLangCatalog(code)).pages || []
    : (await getGlobalCatalog()).pages || [];
  return [...pages].sort((a, b) => {
    const ta = Date.parse(a.publishedAt || "") || 0;
    const tb = Date.parse(b.publishedAt || "") || 0;
    if (tb !== ta) return tb - ta;
    return String(b.id).localeCompare(String(a.id));
  });
}

/** Mix of languages for the homepage — avoids dumping all charts. */
export async function featuredHomePins(perLang = 2): Promise<GlobalPinPage[]> {
  const cat = await getGlobalCatalog();
  const out: GlobalPinPage[] = [];
  for (const lang of cat.languages) {
    const pins = (cat.pages || []).filter(
      (p) => p.lang.toLowerCase() === lang.code.toLowerCase(),
    );
    out.push(...pins.slice(0, perLang));
  }
  return out;
}

export async function getGlobalPin(
  id: string,
  langHint?: string,
): Promise<GlobalPinPage | null> {
  const needle = String(id || "").trim();
  if (!needle) return null;

  const hinted = langHint ? normalizeGlobalLangCode(langHint) : null;
  const fromId = langCodeFromGlobalPinId(needle);
  const langs: string[] = [];
  for (const c of [hinted, fromId]) {
    if (c && !langs.includes(c)) langs.push(c);
  }

  for (const lang of langs) {
    const pages = (await getGlobalLangCatalog(lang)).pages || [];
    const hit = pages.find((p) => p.id === needle || p.slug === needle);
    if (hit) return hit;
  }

  const index = await getGlobalIndex();
  const row = index.pages.find((p) => p.id === needle || p.slug === needle);
  if (row) {
    const pages = (await getGlobalLangCatalog(row.lang)).pages || [];
    return pages.find((p) => p.id === needle || p.slug === needle) || null;
  }
  return null;
}

/** Same language + other-language versions of the same topic. */
export async function relatedGlobalPins(
  pin: GlobalPinPage,
  limit = 8,
): Promise<GlobalPinPage[]> {
  const sameLangPages = (await getGlobalLangCatalog(pin.lang)).pages || [];
  const index = await getGlobalIndex();
  const sameLang = sameLangPages.filter(
    (p) => p.id !== pin.id && p.lang === pin.lang,
  );
  const sameTopic = index.pages
    .filter(
      (p) =>
        p.id !== pin.id &&
        Boolean(pin.topicSlug) &&
        p.topicSlug === pin.topicSlug &&
        p.lang !== pin.lang,
    )
    .map(pageFromListing);
  const moreFromIndex = index.pages
    .filter((p) => p.id !== pin.id)
    .map(pageFromListing);
  const out: GlobalPinPage[] = [];
  const seen = new Set<string>();
  for (const p of [...sameTopic, ...sameLang, ...moreFromIndex]) {
    if (p.id === pin.id || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
