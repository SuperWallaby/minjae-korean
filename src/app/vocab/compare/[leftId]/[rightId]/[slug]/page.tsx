import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabCompareArticle } from "@/components/vocab-compare/VocabCompareArticle";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  getVocabComparePage,
  listTopVocabCompareForStaticParams,
} from "@/lib/vocabCompare/repo";
import {
  buildVocabCompareArticleJsonLd,
  buildVocabCompareBreadcrumbJsonLd,
  buildVocabCompareFaqJsonLd,
  vocabCompareCanonicalUrl,
  vocabCompareSiteBaseUrl,
} from "@/lib/vocabCompare/seo";
import { orderedPairIds } from "@/lib/vocabCompare/slug";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamicParams = true;

const baseUrl = vocabCompareSiteBaseUrl();

type Props = {
  params: Promise<{ leftId: string; rightId: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const top = await listTopVocabCompareForStaticParams(400);
    return top.map((row) => ({
      leftId: row.leftId,
      rightId: row.rightId,
      slug: row.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leftId, rightId } = await params;
  const page = await getVocabComparePage(leftId, rightId);
  if (!page) return { title: "Not Found" };

  const canonical = vocabCompareCanonicalUrl(
    baseUrl,
    page.leftId,
    page.rightId,
    page.slug,
  );

  return {
    title: `${page.titleEn} | What is this in Korean`,
    description: page.description,
    keywords: [
      page.left.english,
      page.right.english,
      page.left.korean,
      page.right.korean,
      `${page.left.english} vs ${page.right.english}`,
      "korean vocabulary comparison",
    ].join(", "),
    openGraph: {
      title: page.titleEn,
      description: page.description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [
        {
          url: page.left.imageUrl,
          width: 640,
          height: 640,
          alt: page.left.imageAlt,
        },
        {
          url: page.right.imageUrl,
          width: 640,
          height: 640,
          alt: page.right.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.titleEn,
      description: page.description,
      images: [page.left.imageUrl],
    },
    alternates: { canonical },
  };
}

export default async function VocabCompareDetailPage({ params }: Props) {
  const { leftId, rightId, slug: slugRaw } = await params;
  const ordered = orderedPairIds(leftId, rightId);
  if (leftId !== ordered.leftId || rightId !== ordered.rightId) {
    const page = await getVocabComparePage(ordered.leftId, ordered.rightId);
    if (!page) return notFound();
    permanentRedirect(
      vocabCompareCanonicalUrl(baseUrl, page.leftId, page.rightId, page.slug),
    );
  }

  const page = await getVocabComparePage(leftId, rightId);
  if (!page) return notFound();

  const slugDecoded = decodeURIComponent(slugRaw);
  if (slugDecoded !== page.slug) {
    permanentRedirect(
      vocabCompareCanonicalUrl(baseUrl, page.leftId, page.rightId, page.slug),
    );
  }

  const canonical = vocabCompareCanonicalUrl(
    baseUrl,
    page.leftId,
    page.rightId,
    page.slug,
  );
  const faqJsonLd = buildVocabCompareFaqJsonLd(page, canonical);
  const articleJsonLd = buildVocabCompareArticleJsonLd(page, canonical);
  const breadcrumbJsonLd = buildVocabCompareBreadcrumbJsonLd(
    page,
    baseUrl,
    canonical,
  );

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
          <Breadcrumb
            items={[
              { label: "Vocab compare", href: "/vocab/compare" },
              { label: page.titleEn },
            ]}
          />
          <div className="mt-6">
            <VocabCompareArticle page={page} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
