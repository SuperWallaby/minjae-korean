import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabHowToSayArticle } from "@/components/vocab-detail/VocabHowToSayArticle";
import { WhenToUseRelated } from "@/components/when-to-use/WhenToUseRelated";
import { SITE_NAME } from "@/lib/siteBrand";
import { listRelatedVocabForQuiz } from "@/lib/vocabCompare/repo";
import { toVocabHowToSayPage } from "@/lib/vocabDetail/project";
import {
  buildVocabHowToSayArticleJsonLd,
  buildVocabHowToSayBreadcrumbJsonLd,
  buildVocabHowToSayFaqJsonLd,
} from "@/lib/vocabDetail/seo";
import {
  vocabDetailSiteBaseUrl,
  vocabHowToSayCanonicalUrl,
  vocabHowToSayPath,
} from "@/lib/vocabDetail/slug";
import {
  getWhenToUsePageById,
  listTopWhenToUseForStaticParams,
} from "@/lib/whenToUse/repo";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamicParams = true;

const baseUrl = vocabDetailSiteBaseUrl();

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const top = await listTopWhenToUseForStaticParams(2000);
    return top.map((row) => ({ id: row.id, slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const source = await getWhenToUsePageById(id);
  if (!source) return { title: "Not Found" };
  const page = toVocabHowToSayPage(source);

  const canonical = vocabHowToSayCanonicalUrl(baseUrl, page.id, page.slug);
  const keywords = [
    page.english,
    page.korean,
    page.romanization?.replace(/[\[\]]/g, "").trim(),
    `how to say ${page.english} in korean`,
    `how do you say ${page.english} in korean`,
    "korean vocabulary",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title: { absolute: `${page.titleEn} | Kaja Korean` },
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

export default async function VocabHowToSayDetailPage({ params }: Props) {
  const { id, slug: slugRaw } = await params;
  const source = await getWhenToUsePageById(id);
  if (!source) return notFound();
  const page = toVocabHowToSayPage(source);

  const slugDecoded = decodeURIComponent(slugRaw);
  if (slugDecoded !== page.slug) {
    permanentRedirect(vocabHowToSayPath(page.id, page.slug));
  }

  const canonical = vocabHowToSayCanonicalUrl(baseUrl, page.id, page.slug);
  const faqJsonLd = buildVocabHowToSayFaqJsonLd(page, canonical);
  const articleJsonLd = buildVocabHowToSayArticleJsonLd(page, canonical);
  const breadcrumbJsonLd = buildVocabHowToSayBreadcrumbJsonLd(
    page,
    baseUrl,
    canonical,
  );
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
              { label: "Home", href: "/" },
              { label: "Vocab detail", href: "/vocab/detail" },
              { label: page.titleEn },
            ]}
          />
          <div className="mt-6 space-y-10">
            <VocabHowToSayArticle page={page} />
            <WhenToUseRelated items={related} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
