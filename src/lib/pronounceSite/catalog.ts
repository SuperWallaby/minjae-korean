import catalog from "@/data/pronouncePins/published.json";
import { pinCdnUrl } from "@/lib/mediaUrl";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";
import type { PronounceTtsFields } from "@/lib/pronounceSite/voices";

export type PronouncePinWord = {
  /** Simplified / traditional hanzi */
  chinese: string;
  pinyin?: string;
  english: string;
} & PronounceTtsFields;

export type PronouncePinExample = {
  chinese: string;
  pinyin?: string;
  english: string;
} & PronounceTtsFields;

export type PronouncePinPage = {
  id: string;
  titleEn: string;
  slug: string;
  imagePath: string;
  words: PronouncePinWord[];
  examples?: PronouncePinExample[];
  description?: string;
  format?: string;
  publishedAt?: string;
};

export type PronouncePinCatalog = {
  version: number;
  generatedAt?: string;
  site: string;
  teaches: "zh";
  audience: "en";
  pages: PronouncePinPage[];
};

export function getPronounceCatalog(): PronouncePinCatalog {
  return catalog as PronouncePinCatalog;
}

export function pronounceSiteBase(): string {
  return (
    getPronounceCatalog().site?.replace(/\/+$/, "") || pronounceSiteOrigin()
  );
}

export function listPronouncePins(): PronouncePinPage[] {
  return getPronounceCatalog().pages || [];
}

export function getPronouncePin(idOrSlug: string): PronouncePinPage | null {
  const needle = String(idOrSlug || "").trim();
  if (!needle) return null;
  return (
    listPronouncePins().find((p) => p.id === needle || p.slug === needle) ||
    null
  );
}

/** Canonical: /words/ni-hao */
export function pronouncePinPath(
  pin: Pick<PronouncePinPage, "slug" | "id">,
): string {
  const slug = String(pin.slug || pin.id || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `/words/${encodeURIComponent(slug || pin.id)}`;
}

export function pronouncePinAbsoluteUrl(
  pin: Pick<PronouncePinPage, "slug" | "id">,
): string {
  return `${pronounceSiteBase()}${pronouncePinPath(pin)}`;
}

export function relatedPronouncePins(
  pin: Pick<PronouncePinPage, "id">,
  limit = 8,
): PronouncePinPage[] {
  const pages = listPronouncePins();
  const out: PronouncePinPage[] = [];
  const seen = new Set<string>([pin.id]);
  for (const p of pages) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export function pronouncePinCardImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".card.webp");
  if (/^https?:\/\//i.test(path)) return path;
  return pinCdnUrl(path);
}

export function pronouncePinPageImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(path)) return path;
  return pinCdnUrl(path);
}

export function pronouncePinFocusTerm(pin: PronouncePinPage): string {
  const w = pin.words?.[0];
  return String(w?.chinese || w?.english || pin.titleEn || "").trim();
}
