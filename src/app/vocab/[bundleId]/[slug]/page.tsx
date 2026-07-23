import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabSeoArticle } from "@/components/vocab-infographic/VocabSeoArticle";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  getVocabSeoPageById,
  listTopVocabSeoForStaticParams,
} from "@/lib/vocabInfographic/repo";
import {
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.titleEn,
    description: page.description,
    image: page.imageUrl,
    dateModified: page.updatedAt,
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Vocab", href: "/vocab" },
              { label: page.title },
            ]}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <VocabSeoArticle page={page} />
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
