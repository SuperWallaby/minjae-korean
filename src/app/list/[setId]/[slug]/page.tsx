import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { IgListSeoArticle, IgListSeoRelated } from "@/components/ig-list/IgListSeoArticle";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import {
  getIgListSeoPageById,
  listRelatedIgListSeoPages,
  listTopIgListSeoForStaticParams,
} from "@/lib/igList/repo";
import {
  buildIgListArticleJsonLd,
  buildIgListBreadcrumbJsonLd,
  buildIgListFaqJsonLd,
  igListBreadcrumbItems,
  igListCanonicalUrl,
  igListPath,
  igListSiteBaseUrl,
} from "@/lib/igList/seo";
import { SITE_NAME } from "@/lib/siteBrand";

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = igListSiteBaseUrl();

type Props = {
  params: Promise<{ setId: string; slug: string }>;
};

export async function generateStaticParams() {
  return listTopIgListSeoForStaticParams(200).map((row) => ({
    setId: row.setId,
    slug: row.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setId } = await params;
  const page = getIgListSeoPageById(setId);
  if (!page) return { title: "Not Found" };

  const canonical = igListCanonicalUrl(baseUrl, page.setId, page.slug);
  const coverAbs = page.coverUrl.startsWith("http")
    ? page.coverUrl
    : `${baseUrl}${page.coverUrl}`;

  return {
    title: { absolute: `${page.titleEn} | Kaja Korean` },
    description: page.description,
    keywords: [
      page.title,
      page.titleEn,
      ...page.cards
        .filter((c) => c.hangul)
        .slice(0, 6)
        .flatMap((c) => [c.english, c.hangul]),
      "korean phrases",
      "learn korean",
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: page.titleEn,
      description: page.description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [{ url: coverAbs, width: 1080, height: 1350, alt: page.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.titleEn,
      description: page.description,
      images: [coverAbs],
    },
    alternates: { canonical },
  };
}

export default async function IgListSeoDetailPage({ params }: Props) {
  const { setId, slug } = await params;
  const page = getIgListSeoPageById(setId);
  if (!page) notFound();

  if (slug !== page.slug) {
    permanentRedirect(igListPath(page.setId, page.slug));
  }

  const canonical = igListCanonicalUrl(baseUrl, page.setId, page.slug);
  const breadcrumbItems = igListBreadcrumbItems(page);
  const articleJsonLd = buildIgListArticleJsonLd(page, canonical);
  const faqJsonLd = buildIgListFaqJsonLd(page, canonical);
  const breadcrumbJsonLd = buildIgListBreadcrumbJsonLd(page, baseUrl, canonical);
  const related = listRelatedIgListSeoPages(page.setId, 8);

  return (
    <MarketingPage containerClassName="max-w-3xl">
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketingShell>
        <Breadcrumb items={breadcrumbItems} />
        <MarketingShellBody>
          <IgListSeoArticle page={page} />
          <div className="mt-12">
            <IgListSeoRelated pages={related} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
