import type { Metadata } from "next";
import {
  jaPinPageImagePath,
  jaSiteBase,
  isJaPinSeoPublic,
  type JaEnPinPage,
} from "@/lib/jaSite/catalog";
import { EIGOCHART_NAME } from "@/lib/jaSite/brand";

export function pinCanonicalPath(pin: JaEnPinPage): string {
  return `/pin/${encodeURIComponent(pin.id)}`;
}

export function pinAbsoluteUrl(pin: JaEnPinPage): string {
  return `${jaSiteBase()}${pinCanonicalPath(pin)}`;
}

function pinShareImage(pin: JaEnPinPage): string {
  const rel = jaPinPageImagePath(pin.imagePath);
  return rel.startsWith("http") ? rel : `${jaSiteBase()}${rel}`;
}

function pinWords(pin: JaEnPinPage, limit = 8): string {
  return pin.words
    .slice(0, limit)
    .map((w) => w.english)
    .filter(Boolean)
    .join("、");
}

export function buildJaPinMetadata(pin: JaEnPinPage): Metadata {
  const url = pinAbsoluteUrl(pin);
  const image = pinShareImage(pin);
  const words = pinWords(pin);
  const title = `${pin.titleJa}の発音（アメリカ・イギリス・オーストラリア）`;
  const description = `${pin.titleJa}。${words}の発音を米・英・豪の3アクセントで聞き比べ。日本人向け英語発音チャート。`;
  const seoPublic = isJaPinSeoPublic(pin);
  return {
    title,
    description,
    keywords: [
      "英語発音",
      "発音聞き比べ",
      "アメリカ英語 発音",
      "イギリス英語 発音",
      "オーストラリア英語 発音",
      "ネイティブ発音",
      pin.titleJa,
      pin.topicSlug || "",
      ...pin.words.slice(0, 6).map((w) => w.english),
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: EIGOCHART_NAME,
      images: [{ url: image, alt: `${pin.titleJa}の発音チャート` }],
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    // Live for Pinterest destination before pin succeeds; index only after public.
    robots: seoPublic
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export function jaPinJsonLd(pin: JaEnPinPage) {
  const url = pinAbsoluteUrl(pin);
  const image = pinShareImage(pin);
  const description = `${pin.titleJa}の発音。アメリカ・イギリス・オーストラリア英語を聞き比べ。${pinWords(pin, 6)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ホーム",
            item: jaSiteBase(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: pin.titleJa,
            item: url,
          },
        ],
      },
      {
        "@type": "LearningResource",
        "@id": url,
        name: `${pin.titleJa}の発音`,
        description,
        url,
        image,
        inLanguage: ["ja", "en"],
        learningResourceType: "Pronunciation",
        educationalLevel: "Intermediate",
        teaches: "English pronunciation (US, UK, AU)",
        isAccessibleForFree: true,
        keywords: [
          "英語発音",
          "アメリカ英語",
          "イギリス英語",
          "オーストラリア英語",
          ...pin.words.map((w) => w.english),
        ].join(", "),
      },
    ],
  };
}
