import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabDifferenceArticle } from "@/components/vocab-detail/VocabDifferenceArticle";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  buildVocabCompareCatalog,
  getVocabComparePage,
} from "@/lib/vocabCompare/repo";
import { orderedPairIds } from "@/lib/vocabCompare/slug";
import { toVocabDifferencePage } from "@/lib/vocabDetail/project";
import {
  buildVocabDifferenceArticleJsonLd,
  buildVocabDifferenceBreadcrumbJsonLd,
  buildVocabDifferenceFaqJsonLd,
} from "@/lib/vocabDetail/seo";
import {
  vocabDetailSiteBaseUrl,
  vocabDifferenceCanonicalUrl,
  vocabDifferencePath,
} from "@/lib/vocabDetail/slug";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamicParams = true;

const baseUrl = vocabDetailSiteBaseUrl();

type Props = {
  params: Promise<{ leftId: string; rightId: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const top = await buildVocabCompareCatalog(400);
    return top.map((row) => {
      const page = toVocabDifferencePage(row);
      return {
        leftId: page.leftId,
        rightId: page.rightId,
        slug: page.slug,
      };
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leftId, rightId } = await params;
  const source = await getVocabComparePage(leftId, rightId);
  if (!source) return { title: "Not Found" };
  const page = toVocabDifferencePage(source);

  const canonical = vocabDifferenceCanonicalUrl(
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
      `difference between ${page.left.english} and ${page.right.english}`,
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

export default async function VocabDifferenceDetailPage({ params }: Props) {
  const { leftId, rightId, slug: slugRaw } = await params;
  const ordered = orderedPairIds(leftId, rightId);
  if (leftId !== ordered.leftId || rightId !== ordered.rightId) {
    const source = await getVocabComparePage(ordered.leftId, ordered.rightId);
    if (!source) return notFound();
    const page = toVocabDifferencePage(source);
    permanentRedirect(
      vocabDifferencePath(page.leftId, page.rightId, page.slug),
    );
  }

  const source = await getVocabComparePage(leftId, rightId);
  if (!source) return notFound();
  const page = toVocabDifferencePage(source);

  const slugDecoded = decodeURIComponent(slugRaw);
  if (slugDecoded !== page.slug) {
    permanentRedirect(
      vocabDifferencePath(page.leftId, page.rightId, page.slug),
    );
  }

  const canonical = vocabDifferenceCanonicalUrl(
    baseUrl,
    page.leftId,
    page.rightId,
    page.slug,
  );
  const faqJsonLd = buildVocabDifferenceFaqJsonLd(page, canonical);
  const articleJsonLd = buildVocabDifferenceArticleJsonLd(page, canonical);
  const breadcrumbJsonLd = buildVocabDifferenceBreadcrumbJsonLd(
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
              { label: "Home", href: "/" },
              { label: "Vocab detail", href: "/vocab/detail" },
              { label: page.titleEn },
            ]}
          />
          <div className="mt-6">
            <VocabDifferenceArticle page={page} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
