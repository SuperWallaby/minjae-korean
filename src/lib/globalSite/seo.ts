import type { Metadata } from "next";
import {
  getGlobalPin,
  globalPinPageImagePath,
  globalSiteBase,
  type GlobalPinPage,
} from "@/lib/globalSite/catalog";

export function pinCanonicalPath(pin: GlobalPinPage): string {
  return `/pin/${encodeURIComponent(pin.id)}`;
}

export function pinAbsoluteUrl(pin: GlobalPinPage): string {
  return `${globalSiteBase()}${pinCanonicalPath(pin)}`;
}

function pinShareImage(pin: GlobalPinPage): string {
  const rel = globalPinPageImagePath(pin.imagePath);
  return rel.startsWith("http") ? rel : `${globalSiteBase()}${rel}`;
}

export function buildPinMetadata(pin: GlobalPinPage): Metadata {
  const url = pinAbsoluteUrl(pin);
  const image = pinShareImage(pin);
  const words = pin.words
    .slice(0, 8)
    .map((w) => w.english)
    .filter(Boolean)
    .join(", ");
  const description =
    pin.explanationEn?.slice(0, 160) ||
    pin.description ||
    `Learn ${pin.langName} vocabulary (${words}) with pronunciation audio and example sentences. Free chart for English speakers.`;
  const title = `${pin.titleEn} — words, audio & examples`;
  return {
    title,
    description,
    keywords: [
      pin.langName,
      "vocabulary",
      "learn",
      pin.topicSlug || "",
      "pronunciation",
      "English speakers",
      ...pin.words.slice(0, 6).map((w) => w.english),
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: pin.titleEn,
      description,
      siteName: "Kaja Global",
      images: [{ url: image, alt: pin.titleEn }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: pin.titleEn,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function pinJsonLd(pin: GlobalPinPage) {
  const url = pinAbsoluteUrl(pin);
  const image = pinShareImage(pin);
  const words = pin.words.map((w) => ({
    "@type": "DefinedTerm",
    name: w.target,
    description: w.english,
    inLanguage: pin.lang,
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: globalSiteBase(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: pin.langName,
            item: `${globalSiteBase()}/lang/${pin.lang}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: pin.titleEn,
            item: url,
          },
        ],
      },
      {
        "@type": "LearningResource",
        "@id": url,
        name: pin.titleEn,
        description: pin.description,
        url,
        image,
        inLanguage: ["en", pin.lang],
        learningResourceType: "Vocabulary chart",
        educationalLevel: "Beginner",
        teaches: pin.langName,
        isAccessibleForFree: true,
        keywords: pin.words.map((w) => w.english).join(", "),
        about: words,
      },
    ],
  };
}

export function getPinForJson(id: string) {
  return getGlobalPin(id);
}
