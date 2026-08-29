import catalog from "@/data/soundPins/published.json";
import { pinCdnUrl } from "@/lib/mediaUrl";
import { soundSiteOrigin } from "@/lib/soundSite/brand";
import type { SoundTtsFields } from "@/lib/soundSite/voices";

export type SoundPinWord = {
  english: string;
  gloss?: string;
  ipa?: string;
} & SoundTtsFields;

export type SoundPinExample = {
  english: string;
  gloss?: string;
  ipa?: string;
} & SoundTtsFields;

export type SoundPinPage = {
  id: string;
  titleEn: string;
  slug: string;
  imagePath: string;
  words: SoundPinWord[];
  examples?: SoundPinExample[];
  description?: string;
  /** Optional pin format tag (simple_upgrade, slang_card, …). */
  format?: string;
  partner?: "preply" | "italki" | string;
  publishedAt?: string;
};

export type SoundPinCatalog = {
  version: number;
  generatedAt?: string;
  site: string;
  teaches: "en";
  audience: "en";
  pages: SoundPinPage[];
};

export function getSoundCatalog(): SoundPinCatalog {
  return catalog as SoundPinCatalog;
}

export function soundSiteBase(): string {
  return getSoundCatalog().site?.replace(/\/+$/, "") || soundSiteOrigin();
}

export function listSoundPins(): SoundPinPage[] {
  return getSoundCatalog().pages || [];
}

export function getSoundPin(id: string): SoundPinPage | null {
  const needle = String(id || "").trim();
  if (!needle) return null;
  return (
    listSoundPins().find((p) => p.id === needle || p.slug === needle) || null
  );
}

/** Canonical listen URL on sound.eigopin.com */
export function soundPinPath(pin: Pick<SoundPinPage, "slug" | "id">): string {
  const slug = String(pin.slug || pin.id || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `/sound-of/${encodeURIComponent(slug || pin.id)}`;
}

export function soundPinAbsoluteUrl(
  pin: Pick<SoundPinPage, "slug" | "id">,
): string {
  return `${soundSiteBase()}${soundPinPath(pin)}`;
}

export function relatedSoundPins(
  pin: Pick<SoundPinPage, "id"> & { format?: string },
  limit = 8,
): SoundPinPage[] {
  const pages = listSoundPins();
  const out: SoundPinPage[] = [];
  const seen = new Set<string>([pin.id]);
  const fmt = String(pin.format || "").trim();
  const sameFormat = fmt
    ? pages.filter(
        (p) =>
          p.id !== pin.id &&
          String((p as { format?: string }).format || "") === fmt,
      )
    : [];
  for (const p of [...sameFormat, ...pages]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export function soundPinCardImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".card.webp");
  if (/^https?:\/\//i.test(path)) return path;
  return pinCdnUrl(path);
}

export function soundPinPageImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(path)) return path;
  return pinCdnUrl(path);
}
