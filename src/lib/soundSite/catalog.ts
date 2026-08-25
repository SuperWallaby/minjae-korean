import catalog from "@/data/soundPins/published.json";
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

export function soundPinCardImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".card.webp");
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

export function soundPinPageImagePath(imagePath: string): string {
  const path = imagePath.replace(/\.png$/i, ".webp");
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
