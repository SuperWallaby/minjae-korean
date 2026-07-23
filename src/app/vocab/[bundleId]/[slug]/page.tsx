import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabSeoArticle } from "@/components/vocab-infographic/VocabSeoArticle";
import { VocabSeoRelated } from "@/components/vocab-infographic/VocabSeoRelated";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  getVocabSeoPageById,
  listRelatedVocabSeoPages,
  listTopVocabSeoForStaticParams,
} from "@/lib/vocabInfographic/repo";
import {
  buildVocabSeoArticleJsonLd,
  buildVocabSeoBreadcrumbJsonLd,
  buildVocabSeoFaqJsonLd,
  vocabSeoBreadcrumbItems,
  vocabSeoCanonicalUrl,
  vocabSeoPath,
  vocabSeoSiteBaseUrl,
} from "@/lib/vocabInfographic/seo";

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = vocabSeoSiteBaseUrl();

type Props = {
  params: Promise<{ bundleId: string; slug: string }>;
};

export async function generateStaticParams() {
  return listTopVocabSeoForStaticParams(800).map((row) => ({
    bundleId: row.bundleId,
    slug: row.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bundleId } = await params;
  const page = getVocabSeoPageById(bundleId);
  if (!page) return { title: "Not Found" };

  const canonical = vocabSeoCanonicalUrl(baseUrl, page.bundleId, page.slug);
  const keywords = [
    page.title,
    page.titleEn,
    ...page.words.slice(0, 6).flatMap((w) => [w.english, w.hangul]),
    ...page.tags,
    "korean vocabulary",
    "korean word chart",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${page.titleEn} | What is this in Korean`,
    description: page.description,
    keywords,
    openGraph: {
      title: page.titleEn,
      description: page.description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [
        {
          url: page.imageUrl,
          width: 1024,
          height: 1024,
          alt: page.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.titleEn,
      description: page.description,
      images: [page.imageUrl],
    },
    alternates: { canonical },
  };
}

export default async function VocabSeoDetailPage({ params }: Props) {
  const { bundleId, slug } = await params;
  const page = getVocabSeoPageById(bundleId);
  if (!page) notFound();

  if (slug !== page.slug) {
    permanentRedirect(vocabSeoPath(page.bundleId, page.slug));
  }

  const canonical = vocabSeoCanonicalUrl(baseUrl, page.bundleId, page.slug);
  const breadcrumbItems = vocabSeoBreadcrumbItems(page);
  const articleJsonLd = buildVocabSeoArticleJsonLd(page, canonical);
  const faqJsonLd = buildVocabSeoFaqJsonLd(page, canonical);
  const breadcrumbJsonLd = buildVocabSeoBreadcrumbJsonLd(
    page,
    baseUrl,
    canonical,
  );
  const related = listRelatedVocabSeoPages(page.bundleId, 14);

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb items={breadcrumbItems} />
          <div className="space-y-10">
            <VocabSeoArticle page={page} />
            <VocabSeoRelated items={related} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
