import { SITE_NAME } from "@/lib/siteBrand";

import {
  vocabCompareCanonicalUrl,
  vocabCompareTitleEn,
} from "./slug";
import type { VocabComparePage } from "./types";

export function buildVocabCompareFaqJsonLd(
  page: VocabComparePage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: canonicalUrl,
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the difference between ${page.left.english} and ${page.right.english} in Korean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: page.contrast,
        },
      },
      {
        "@type": "Question",
        name: `How do you say ${page.left.english} vs ${page.right.english} in Korean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${page.left.english} is ${page.left.korean}. ${page.right.english} is ${page.right.korean}. ${page.contrast}`,
        },
      },
    ],
  };
}

export function buildVocabCompareArticleJsonLd(
  page: VocabComparePage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: [page.left.imageUrl, page.right.imageUrl],
    inLanguage: "en",
    about: [
      {
        "@type": "Thing",
        name: page.left.korean,
        alternateName: page.left.english,
      },
      {
        "@type": "Thing",
        name: page.right.korean,
        alternateName: page.right.english,
      },
    ],
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function buildVocabCompareBreadcrumbJsonLd(
  page: VocabComparePage,
  baseUrl: string,
  canonicalUrl: string,
) {
  const root = baseUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: root },
      {
        "@type": "ListItem",
        position: 2,
        name: "Vocab compare",
        item: `${root}/vocab/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.titleEn || vocabCompareTitleEn(page.left.english, page.right.english),
        item: canonicalUrl,
      },
    ],
  };
}

export function vocabCompareSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kajakorean.com"
  ).replace(/\/+$/, "");
}

export { vocabCompareCanonicalUrl };
