import { SITE_NAME } from "@/lib/siteBrand";

import type { VocabSeoPage } from "./seoTypes";

/** ASCII SEO slug from a vocab bundle title. */
export function slugifyVocabBundleTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\bvs\.?\b/g, "vs")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
  return base || "vocab";
}

/** H1 / title tag — keep “in Korean” for long-tail. */
export function vocabSeoTitleEn(catalogTitle: string): string {
  const t = catalogTitle.trim();
  if (!t) return "Korean vocabulary set";
  if (/\bin korean\b/i.test(t)) return t;
  return `${t} in Korean`;
}

export function vocabSeoPath(bundleId: string, slug: string): string {
  return `/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(slug)}`;
}

export function vocabSeoCanonicalUrl(
  baseUrl: string,
  bundleId: string,
  slug: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}${vocabSeoPath(bundleId, slug)}`;
}

export function vocabSeoSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com"
  );
}

/** Drop hashtags / heavy emoji noise from tweet for page intro. */
export function cleanVocabTweetIntro(tweetText: string): string {
  const lines = tweetText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^#/.test(l) && !/^https?:\/\//i.test(l));

  const kept: string[] = [];
  for (const line of lines) {
    const cleaned = line
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/#[\p{L}\p{N}_]+/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) continue;
    // Skip pure bullet word lines for intro — those live in the table.
    if (/^[🔸🔹🔴🔵🟢🟡⚫⚪]\s/.test(cleaned) && cleaned.length < 80) continue;
    kept.push(cleaned);
    if (kept.join(" ").length > 220) break;
    if (kept.length >= 2) break;
  }
  return kept.join(" ").trim();
}

export function vocabSeoDescription(
  titleEn: string,
  words: { hangul: string; english: string }[],
): string {
  const sample = words
    .slice(0, 4)
    .map((w) => `${w.hangul} (${w.english})`)
    .join(", ");
  if (sample) {
    return `${titleEn} — ${sample}. Picture vocab chart for Korean learners.`;
  }
  return `${titleEn}. Picture-backed Korean vocabulary group for learners.`;
}

export type VocabSeoBreadcrumbItem = { label: string; href?: string };

/** UI + JSON-LD share the same trail: Home → Vocab charts → page. */
export function vocabSeoBreadcrumbItems(
  page: Pick<VocabSeoPage, "titleEn" | "title">,
): VocabSeoBreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Vocab charts", href: "/vocab" },
    { label: page.titleEn || page.title },
  ];
}

export function vocabSeoHubBreadcrumbItems(): VocabSeoBreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Vocab charts" },
  ];
}

export function buildVocabSeoBreadcrumbJsonLd(
  page: Pick<VocabSeoPage, "titleEn" | "title">,
  baseUrl: string,
  canonicalUrl: string,
) {
  const root = baseUrl.replace(/\/+$/, "");
  const items = vocabSeoBreadcrumbItems(page);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const position = i + 1;
      const isLast = i === items.length - 1;
      const entry: {
        "@type": "ListItem";
        position: number;
        name: string;
        item?: string;
      } = {
        "@type": "ListItem",
        position,
        name: item.label,
      };
      if (isLast) {
        entry.item = canonicalUrl;
      } else if (item.href) {
        entry.item = item.href.startsWith("http")
          ? item.href
          : `${root}${item.href}`;
      }
      return entry;
    }),
  };
}

export function buildVocabSeoHubBreadcrumbJsonLd(baseUrl: string) {
  const root = baseUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: root },
      {
        "@type": "ListItem",
        position: 2,
        name: "Vocab charts",
        item: `${root}/vocab`,
      },
    ],
  };
}

export function buildVocabSeoArticleJsonLd(
  page: VocabSeoPage,
  canonicalUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: page.imageUrl,
    inLanguage: "en",
    dateModified: page.updatedAt,
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    about: page.words.slice(0, 8).map((w) => ({
      "@type": "Thing",
      name: w.hangul,
      alternateName: w.english,
    })),
  };
}

export function buildVocabSeoFaqJsonLd(
  page: VocabSeoPage,
  canonicalUrl: string,
) {
  const explanation =
    page.explanationEn?.trim() ||
    page.description ||
    `A picture chart of related Korean words: ${page.title}.`;
  const wordSample = page.words
    .slice(0, 4)
    .map((w) => `${w.hangul} (${w.english})`)
    .join(", ");

  const mainEntity = [
    {
      "@type": "Question",
      name: `What does ${page.titleEn.replace(/\s+in Korean$/i, "")} mean in Korean?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: explanation,
      },
    },
  ];

  if (wordSample) {
    mainEntity.push({
      "@type": "Question",
      name: `Which Korean words are on the ${page.title} chart?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `This chart includes ${wordSample}${page.words.length > 4 ? ", and more" : ""}.`,
      },
    });
  }

  if (page.examples?.[0]) {
    const ex = page.examples[0];
    mainEntity.push({
      "@type": "Question",
      name: `How can I use these words in a Korean sentence?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${ex.korean} — ${ex.english}`,
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
