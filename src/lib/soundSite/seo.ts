import type { Metadata } from "next";
import {
  SOUND_SITE_DESCRIPTION,
  SOUND_SITE_NAME,
} from "@/lib/soundSite/brand";
import {
  type SoundPinPage,
  soundPinPageImagePath,
  soundSiteBase,
} from "@/lib/soundSite/catalog";

export function buildSoundPinMetadata(pin: SoundPinPage): Metadata {
  const title = pin.titleEn;
  const description =
    pin.description ||
    `Hear “${pin.titleEn}” — English pronunciation chart with female and male voices.`;
  const url = `${soundSiteBase()}/pin/${encodeURIComponent(pin.id)}`;
  const image = soundPinPageImagePath(pin.imagePath);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SOUND_SITE_NAME}`,
      description,
      url,
      siteName: SOUND_SITE_NAME,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function soundPinJsonLd(pin: SoundPinPage) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: pin.titleEn,
    description: pin.description || SOUND_SITE_DESCRIPTION,
    inLanguage: "en",
    url: `${soundSiteBase()}/pin/${encodeURIComponent(pin.id)}`,
    learningResourceType: "vocabulary chart",
    provider: {
      "@type": "Organization",
      name: SOUND_SITE_NAME,
      url: soundSiteBase(),
    },
  };
}
