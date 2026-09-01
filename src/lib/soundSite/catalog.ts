import bundled from "@/data/soundPins/published.json";
import { FILE_CDN, pinCdnUrl } from "@/lib/mediaUrl";
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

/** Live catalog on R2 — publish uploads here; pages read this at runtime. */
export const SOUND_CATALOG_CDN_KEY = "sound/catalog/published.json";

export function soundCatalogCdnUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SOUND_CATALOG_CDN?.trim().replace(/\/+$/, "") ||
    FILE_CDN;
  return `${base}/${SOUND_CATALOG_CDN_KEY}`;
}

function isCatalog(raw: unknown): raw is SoundPinCatalog {
  return Boolean(
    raw &&
      typeof raw === "object" &&
      Array.isArray((raw as SoundPinCatalog).pages),
  );
}

/** Repo snapshot baked into the deploy — fallback if CDN is down. */
export function getSoundCatalogBundled(): SoundPinCatalog {
  return bundled as SoundPinCatalog;
}

/**
 * Prefer CDN catalog (new pins without redeploy), fall back to bundled JSON.
 * Cached ~60s via Next fetch revalidate.
 */
export async function getSoundCatalog(): Promise<SoundPinCatalog> {
  try {
    const res = await fetch(soundCatalogCdnUrl(), {
      next: { revalidate: 60, tags: ["sound-catalog"] },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const json: unknown = await res.json();
      if (isCatalog(json)) return json;
    }
  } catch {
    /* CDN miss / timeout → bundled */
  }
  return getSoundCatalogBundled();
}

export function soundSiteBase(): string {
  return (
    getSoundCatalogBundled().site?.replace(/\/+$/, "") || soundSiteOrigin()
  );
}

export async function listSoundPins(): Promise<SoundPinPage[]> {
  return (await getSoundCatalog()).pages || [];
}

/** Home/related cards — drop TTS blobs from the RSC payload. */
export function soundPinForCard(pin: SoundPinPage): SoundPinPage {
  return {
    id: pin.id,
    titleEn: pin.titleEn,
    slug: pin.slug,
    imagePath: pin.imagePath,
    format: pin.format,
    words: (pin.words || []).map((w) => ({ english: w.english })),
  };
}

export async function getSoundPin(id: string): Promise<SoundPinPage | null> {
  const needle = String(id || "").trim();
  if (!needle) return null;
  const pages = await listSoundPins();
  return pages.find((p) => p.id === needle || p.slug === needle) || null;
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

export async function relatedSoundPins(
  pin: Pick<SoundPinPage, "id"> & { format?: string },
  limit = 8,
): Promise<SoundPinPage[]> {
  const pages = await listSoundPins();
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
