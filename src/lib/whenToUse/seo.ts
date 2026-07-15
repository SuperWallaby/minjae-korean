import { SITE_NAME } from "@/lib/siteBrand";
import { whenToUseCanonicalUrl, whenToUseTitleEn } from "./slug";
import type { WhenToUsePage } from "./types";

export function buildWhenToUseFaqJsonLd(page: WhenToUsePage, canonicalUrl: string) {
  const gloss = page.english;
  const hangul = page.korean;
  const firstExample = page.examples[0];

  const mainEntity = [
    {
      "@type": "Question",
      name: `When do I use ${gloss} in Korean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: page.explanation,
      },
    },
    {
      "@type": "Question",
      name: `What does ${hangul} mean in Korean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${hangul} means “${gloss}” in Korean. ${page.explanation}`,
      },
    },
  ];

  if (firstExample) {
    mainEntity.push({
      "@type": "Question",
      name: `How do you use ${gloss} (${hangul}) in a sentence?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${firstExample.korean} — ${firstExample.english}`,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
    url: canonicalUrl,
  };
}

export function buildWhenToUseArticleJsonLd(
  page: WhenToUsePage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: [page.imageUrl],
    inLanguage: "en",
    about: {
      "@type": "Thing",
      name: page.korean,
      alternateName: page.english,
      description: page.explanation,
    },
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function buildWhenToUseBreadcrumbJsonLd(
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
        name: "When to use",
        item: `${root}/when-to-use`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.titleEn || whenToUseTitleEn(page.english),
        item: canonicalUrl,
      },
    ],
  };
}

export function whenToUseSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kajakorean.com"
  ).replace(/\/+$/, "");
}

export { whenToUseCanonicalUrl };
