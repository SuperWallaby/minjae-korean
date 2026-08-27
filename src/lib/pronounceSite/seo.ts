import type { Metadata } from "next";
import {
  PRONOUNCE_SITE_DESCRIPTION,
  PRONOUNCE_SITE_NAME,
} from "@/lib/pronounceSite/brand";
import {
  type PronouncePinPage,
  pronouncePinAbsoluteUrl,
  pronouncePinFocusTerm,
  pronouncePinPageImagePath,
} from "@/lib/pronounceSite/catalog";

export function pronouncePinSeoTitle(pin: PronouncePinPage): string {
  const focus = pronouncePinFocusTerm(pin);
  const py = pin.words?.[0]?.pinyin;
  return py
    ? `How to pronounce ${focus} (${py}) — listen in Mandarin`
    : `How to pronounce ${focus} — listen in Mandarin`;
}

export function pronouncePinSeoDescription(pin: PronouncePinPage): string {
  if (pin.description?.trim()) return pin.description.trim();
  const focus = pronouncePinFocusTerm(pin);
  const py = pin.words?.[0]?.pinyin;
  return `Hear ${focus}${py ? ` (${py})` : ""} in Mainland Mandarin, Taiwan Mandarin, and Hong Kong Cantonese — female & male voices, slow and normal speed.`;
}

export function buildPronouncePinMetadata(pin: PronouncePinPage): Metadata {
  const title = pronouncePinSeoTitle(pin);
  const description = pronouncePinSeoDescription(pin);
  const url = pronouncePinAbsoluteUrl(pin);
  const image = pronouncePinPageImagePath(pin.imagePath);
  const focus = pronouncePinFocusTerm(pin);

  return {
    title,
    description,
    keywords: [
      `${focus} pronunciation`,
      `how to say ${focus} in Chinese`,
      pin.words?.[0]?.pinyin || "pinyin",
      "Mandarin pronunciation",
      "Cantonese pronunciation",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${PRONOUNCE_SITE_NAME}`,
      description,
      url,
      siteName: PRONOUNCE_SITE_NAME,
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

export function pronouncePinJsonLd(pin: PronouncePinPage) {
  const url = pronouncePinAbsoluteUrl(pin);
  const focus = pronouncePinFocusTerm(pin);
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: pronouncePinSeoTitle(pin),
    description: pronouncePinSeoDescription(pin),
    url,
    inLanguage: "zh",
    teaches: focus,
    learningResourceType: "pronunciation chart",
  };
}

export { pronouncePinFocusTerm };
