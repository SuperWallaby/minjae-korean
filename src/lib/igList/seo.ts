import { SITE_NAME } from "@/lib/siteBrand";
import { SITE_ORIGIN } from "@/lib/siteUrl";

import type { IgListSeoPage } from "./seoTypes";

/** ASCII SEO slug from an IG list title. */
export function slugifyIgListTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
  return base || "korean-phrases";
}

export function igListTitleEn(title: string): string {
  const t = title.trim();
  if (!t) return "Korean phrases list";
  if (/\bin korean\b/i.test(t)) return t;
  if (/^korean phrases for\b/i.test(t)) return t;
  return t;
}

export function igListPath(setId: string, slug: string): string {
  return `/list/${encodeURIComponent(setId)}/${encodeURIComponent(slug)}`;
}

export function igListCanonicalUrl(
  baseUrl: string,
  setId: string,
  slug: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}${igListPath(setId, slug)}`;
}

export function igListSiteBaseUrl(): string {
  return SITE_ORIGIN;
}

export function igListDescription(
  titleEn: string,
  phrases: { hangul: string; english: string }[],
): string {
  const sample = phrases
    .slice(0, 4)
    .map((p) => `${p.hangul} (${p.english})`)
    .join(", ");
  if (sample) {
    return `${titleEn} — learn ${sample} and more natural Korean phrases. Free carousel for English speakers.`;
  }
  return `${titleEn} — natural Korean phrases for English speakers. Free Instagram-style list from Kaja Korean.`;
}

export function igListIntro(
  subtitle: string | undefined,
  phrases: { hangul: string; english: string; blurb?: string }[],
): string {
  const sub = String(subtitle || "").trim();
  if (sub) return sub;
  const first = phrases.find((p) => p.blurb?.trim());
  if (first?.blurb) return first.blurb.trim();
  if (phrases.length) {
    return `Save these ${phrases.length} Korean phrases and use them the next time the moment hits.`;
  }
  return "Natural Korean phrases for real-life moments.";
}

export function igListBreadcrumbItems(page: IgListSeoPage) {
  return [
    { label: "Home", href: "/" },
    { label: "Phrase lists", href: "/list" },
    { label: page.titleEn, href: igListPath(page.setId, page.slug) },
  ];
}

export function buildIgListArticleJsonLd(page: IgListSeoPage, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: [page.coverUrl.startsWith("http") ? page.coverUrl : `${SITE_ORIGIN}${page.coverUrl}`],
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    mainEntityOfPage: canonical,
    dateModified: page.updatedAt || undefined,
  };
}

export function buildIgListBreadcrumbJsonLd(
  page: IgListSeoPage,
  baseUrl: string,
  canonical: string,
) {
  const items = igListBreadcrumbItems(page);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item:
        i === items.length - 1
          ? canonical
          : `${baseUrl.replace(/\/+$/, "")}${item.href}`,
    })),
  };
}

export function buildIgListFaqJsonLd(page: IgListSeoPage, canonical: string) {
  const body = page.cards.filter((c) => c.kind !== "cover" && c.hangul);
  const faqs = body.slice(0, 6).map((c) => ({
    "@type": "Question",
    name: `How do you say "${c.english}" in Korean?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: c.blurb
        ? `${c.hangul}${c.romanization ? ` [${c.romanization}]` : ""}. ${c.blurb}`
        : `${c.hangul}${c.romanization ? ` [${c.romanization}]` : ""} means "${c.english}".`,
    },
  }));
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs,
    url: canonical,
  };
}
