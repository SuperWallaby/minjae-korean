import { SITE_NAME } from "@/lib/siteBrand";
import type { VocabComparePage } from "@/lib/vocabCompare/types";
import type { WhenToUsePage } from "@/lib/whenToUse/types";

import {
  differenceBetweenTitleEn,
  howToSayVocabTitleEn,
  vocabDetailSiteBaseUrl,
} from "./slug";

export function buildVocabDifferenceFaqJsonLd(
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
        name: `How do you say ${page.left.english} and ${page.right.english} in Korean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${page.left.english} is ${page.left.korean}. ${page.right.english} is ${page.right.korean}. ${page.contrast}`,
        },
      },
    ],
  };
}

export function buildVocabDifferenceArticleJsonLd(
  page: VocabComparePage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: [
      {
        "@type": "ImageObject",
        url: page.left.imageUrl,
        caption: page.left.imageAlt,
      },
      {
        "@type": "ImageObject",
        url: page.right.imageUrl,
        caption: page.right.imageAlt,
      },
    ],
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

export function buildVocabDifferenceBreadcrumbJsonLd(
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
        name: "Vocab detail",
        item: `${root}/vocab/detail`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name:
          page.titleEn ||
          differenceBetweenTitleEn(page.left.english, page.right.english),
        item: canonicalUrl,
      },
    ],
  };
}

export function buildVocabHowToSayFaqJsonLd(
  page: WhenToUsePage,
  canonicalUrl: string,
) {
  const firstExample = page.examples[0];
  const mainEntity = [
    {
      "@type": "Question",
      name: `How do you say ${page.english} in Korean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${page.english} in Korean is ${page.korean}. ${page.explanation}`,
      },
    },
    {
      "@type": "Question",
      name: `What does ${page.korean} mean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${page.korean} means “${page.english}” in Korean. ${page.explanation}`,
      },
    },
  ];

  if (firstExample) {
    mainEntity.push({
      "@type": "Question",
      name: `How do you use ${page.english} (${page.korean}) in a sentence?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${firstExample.korean} — ${firstExample.english}`,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: canonicalUrl,
    mainEntity,
  };
}

export function buildVocabHowToSayArticleJsonLd(
  page: WhenToUsePage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: [
      {
        "@type": "ImageObject",
        url: page.imageUrl,
        caption: page.imageAlt,
      },
    ],
    inLanguage: "en",
    about: {
      "@type": "Thing",
      name: page.korean,
      alternateName: page.english,
      description: page.explanation,
    },
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function buildVocabHowToSayBreadcrumbJsonLd(
  page: WhenToUsePage,
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
        name: "Vocab detail",
        item: `${root}/vocab/detail`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.titleEn || howToSayVocabTitleEn(page.english),
        item: canonicalUrl,
      },
    ],
  };
}

export { vocabDetailSiteBaseUrl };
