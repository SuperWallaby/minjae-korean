import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { WhenToUseArticle } from "@/components/when-to-use/WhenToUseArticle";
import { WhenToUseRelated } from "@/components/when-to-use/WhenToUseRelated";
import { SITE_NAME } from "@/lib/siteBrand";
import { listRelatedVocabForQuiz } from "@/lib/vocabCompare/repo";
import {
  getWhenToUsePageById,
  listTopWhenToUseForStaticParams,
} from "@/lib/whenToUse/repo";
import {
  buildWhenToUseArticleJsonLd,
  buildWhenToUseBreadcrumbJsonLd,
  buildWhenToUseFaqJsonLd,
  whenToUseCanonicalUrl,
  whenToUseSiteBaseUrl,
} from "@/lib/whenToUse/seo";

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = whenToUseSiteBaseUrl();

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const top = await listTopWhenToUseForStaticParams(500);
    return top.map((row) => ({ id: row.id, slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const page = await getWhenToUsePageById(id);
  if (!page) return { title: "Not Found" };

  const canonical = whenToUseCanonicalUrl(baseUrl, page.id, page.slug);
  const keywords = [
    page.english,
    page.korean,
    page.romanization?.replace(/[\[\]]/g, "").trim(),
    `when to use ${page.english}`,
    `when to use ${page.korean}`,
    "korean vocabulary",
    "what does it mean in korean",
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
          width: 640,
          height: 640,
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

export default async function WhenToUseDetailPage({ params }: Props) {
  const { id, slug: slugRaw } = await params;
  const page = await getWhenToUsePageById(id);
  if (!page) return notFound();

  const slugDecoded = decodeURIComponent(slugRaw);
  if (slugDecoded !== page.slug) {
    permanentRedirect(whenToUseCanonicalUrl(baseUrl, page.id, page.slug));
  }

  const canonical = whenToUseCanonicalUrl(baseUrl, page.id, page.slug);
  const faqJsonLd = buildWhenToUseFaqJsonLd(page, canonical);
  const articleJsonLd = buildWhenToUseArticleJsonLd(page, canonical);
  const breadcrumbJsonLd = buildWhenToUseBreadcrumbJsonLd(page, baseUrl, canonical);
  const related = await listRelatedVocabForQuiz(page.id, 6);

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
              { label: "When to use", href: "/when-to-use" },
              { label: page.titleEn },
            ]}
          />
          <div className="mt-6 space-y-10">
            <WhenToUseArticle page={page} />
            <WhenToUseRelated items={related} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
