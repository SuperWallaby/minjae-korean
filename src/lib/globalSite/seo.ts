import type { Metadata } from "next";
import { atlasLangPath, atlasPinPath } from "@/lib/atlasRoutes";
import {
  getGlobalPin,
  globalPinPageImagePath,
  globalSiteBase,
  type GlobalPinPage,
} from "@/lib/globalSite/catalog";
import { firstSentence } from "@/lib/globalSite/copy";
import { isPronounceSiteDeployment } from "@/lib/pronounceSite/brand";

export function pinCanonicalPath(pin: GlobalPinPage): string {
  return atlasPinPath(pin);
}

function atlasSiteName(): string {
  return isPronounceSiteDeployment() ? "GetPronounce" : "Kaja Global";
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
  const title = `${pin.titleEn} — pronunciation & listen`;
  const description =
    firstSentence(
      pin.explanationEn ||
        pin.description ||
        `Learn ${pin.langName} vocabulary (${words}) with pronunciation audio.`,
    ).slice(0, 160) ||
    `Learn ${pin.langName} vocabulary (${words}) with pronunciation audio.`;
  return {
    title,
    description,
    keywords: [
      pin.langName,
      "pronunciation",
      "how to pronounce",
      "listen",
      "vocabulary",
      "learn",
      pin.topicSlug || "",
      "English speakers",
      ...pin.words.slice(0, 6).map((w) => w.english),
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: pin.titleEn,
      description,
      siteName: atlasSiteName(),
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
            item: `${globalSiteBase()}${atlasLangPath(pin.lang)}`,
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
