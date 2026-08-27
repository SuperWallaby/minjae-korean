import catalog from "@/data/jaPins/published.json";
import { eigoChartOrigin } from "@/lib/jaSite/brand";
import { jaEnHasAllAccents, type JaEnTtsFields } from "@/lib/jaSite/accents";

/** English word taught to Japanese speakers. */
export type JaEnPinWord = JaEnTtsFields & {
  english: string;
  ja: string;
  kana: string;
};

export type JaEnPinExample = JaEnTtsFields & {
  english: string;
  ja: string;
};

export type JaEnPinPage = {
  id: string;
  slug: string;
  titleJa: string;
  titleEn: string;
  imagePath: string;
  words: JaEnPinWord[];
  examples?: JaEnPinExample[];
  partner: "preply" | "italki" | string;
  description: string;
  explanationJa?: string;
  topicSlug?: string;
  publishedAt?: string;
  /** Set only after a successful Pinterest upload — sitemap/home/index use this. */
  pinterestPinnedAt?: string;
  withCharacter?: boolean;
};

export type JaEnPinCatalog = {
  version: number;
  generatedAt: string;
  site: string;
  audience: "ja";
  teaches: "en";
  pages: JaEnPinPage[];
};

export function getJaCatalog(): JaEnPinCatalog {
  return catalog as JaEnPinCatalog;
}

export function jaSiteBase(): string {
  return eigoChartOrigin();
}

export function listJaPins(): JaEnPinPage[] {
  return getJaCatalog().pages || [];
}

/** Pins that are public on Pinterest — SEO sitemap / home listing. */
export function listJaPinsPublic(): JaEnPinPage[] {
  return listJaPins().filter((p) => Boolean(p.pinterestPinnedAt));
}

export function isJaPinSeoPublic(pin: JaEnPinPage): boolean {
  return Boolean(pin.pinterestPinnedAt);
}

export function getJaPin(id: string): JaEnPinPage | null {
  const needle = String(id || "").trim();
  if (!needle) return null;
  return (
    listJaPins().find((p) => p.id === needle || p.slug === needle) || null
  );
}

export function relatedJaPins(pin: JaEnPinPage, limit = 8): JaEnPinPage[] {
  const pages = listJaPinsPublic();
  const out: JaEnPinPage[] = [];
  const seen = new Set<string>([pin.id]);
  const sameTopic = pages.filter(
    (p) => p.id !== pin.id && pin.topicSlug && p.topicSlug === pin.topicSlug,
  );
  for (const p of [...sameTopic, ...pages]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

/** Listing thumb: `/ja/pins/{id}.card.webp` on the EigoChart host. */
export function jaPinCardImagePath(imagePath: string): string {
  const webp = imagePath.replace(/\.png$/i, ".card.webp");
  if (/^https?:\/\//i.test(webp)) return webp;
  return webp.startsWith("/") ? webp : `/${webp}`;
}

/** Detail / OG: `/ja/pins/{id}.webp` */
export function jaPinPageImagePath(imagePath: string): string {
  const webp = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(webp)) return webp;
  return webp.startsWith("/") ? webp : `/${webp}`;
}

export function jaPinHasListenAudio(pin: JaEnPinPage): boolean {
  const words = pin.words || [];
  if (!words.length) return false;
  return words.every((w) => !w.english?.trim() || jaEnHasAllAccents(w));
}

/** Pinterest destination — live pin page only. Never homepage or affiliate. */
export function jaPinPinterestUrl(pin: JaEnPinPage): string {
  const u = new URL(`/pin/${encodeURIComponent(pin.id)}`, `${jaSiteBase()}/`);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_campaign", "eigochart-pin");
  return u.toString();
}
