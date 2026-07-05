import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { GrammarComparisonExamples } from "@/components/grammar-comparison/GrammarComparisonExamples";
import { GrammarComparisonHero } from "@/components/grammar-comparison/GrammarComparisonHero";
import { GrammarComparisonInfographic } from "@/components/grammar-comparison/GrammarComparisonInfographic";
import { GrammarComparisonQuiz } from "@/components/grammar-comparison/GrammarComparisonQuiz";
import { GrammarComparisonRelated } from "@/components/grammar-comparison/GrammarComparisonRelated";
import { GrammarComparisonTable } from "@/components/grammar-comparison/GrammarComparisonTable";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import {
  buildComparisonBreadcrumbJsonLd,
  buildComparisonFaqJsonLd,
} from "@/lib/grammarComparisonSeo";
import {
  getComparisonById,
  incrementViewCount,
  listRelatedComparisons,
  listTopComparisonsForStaticParams,
} from "@/lib/grammarComparisonsRepo";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";
const baseUrl = SITE_URL.replace(/\/+$/, "");

/** First URL segment is numeric id; second is Korean SEO slug (ignored for DB lookup). */
function parseComparisonId(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function comparisonCanonical(id: number, seoSlug: string) {
  return `${baseUrl}/grammar/${id}/${encodeURIComponent(seoSlug)}`;
}

export async function generateStaticParams() {
  try {
    const top = await listTopComparisonsForStaticParams(200);
    return top.map((c) => ({ slug: String(c.id), subslug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}): Promise<Metadata> {
  const { slug: idRaw } = await params;
  const id = parseComparisonId(idRaw);
  if (!id) return { title: "Not Found" };

  const comparison = await getComparisonById(id);
  if (!comparison) return { title: "Not Found" };

  const title = comparison.titleEn;
  const description = comparison.summaryEn;
  const canonical = comparisonCanonical(comparison.id, comparison.slug);
  const ogImage = comparison.imageUrl ?? `${baseUrl}/brand/og.png`;

  return {
    title: `${title} | Kaja`,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Kaja",
      type: "article",
      images: comparison.imageUrl
        ? [{ url: ogImage, width: 640, height: 393, alt: comparison.imageAlt ?? title }]
        : [{ url: `${baseUrl}/brand/og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(comparison.imageUrl ? { images: [ogImage] } : { images: [`${baseUrl}/brand/og.png`] }),
    },
    alternates: { canonical },
  };
}

export default async function GrammarComparisonPage({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>;
}) {
  const { slug: idRaw, subslug: subslugRaw } = await params;
  const id = parseComparisonId(idRaw);
  if (!id) return notFound();

  const comparison = await getComparisonById(id);
  if (!comparison) return notFound();

  const subslugDecoded = decodeURIComponent(subslugRaw);
  if (subslugDecoded !== comparison.slug) {
    permanentRedirect(comparisonCanonical(comparison.id, comparison.slug));
  }

  void incrementViewCount(id);

  const wordNames = comparison.items.map((item) => item.wordName);
  const related = await listRelatedComparisons(id, wordNames, 8);

  const canonical = comparisonCanonical(comparison.id, comparison.slug);
  const faqJsonLd = buildComparisonFaqJsonLd(comparison, canonical);
  const breadcrumbJsonLd = buildComparisonBreadcrumbJsonLd(
    comparison,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb
            items={[
              { label: "Grammar", href: "/grammar" },
              { label: "Comparisons", href: "/grammar/compare" },
              { label: comparison.titleEn },
            ]}
          />

          <div className="mt-6 space-y-10">
            <GrammarComparisonHero comparison={comparison} />
            <GrammarComparisonInfographic comparison={comparison} />
            <GrammarComparisonTable items={comparison.items} />
            <GrammarComparisonExamples examples={comparison.examples} />
            <GrammarComparisonQuiz quizzes={comparison.quizzes} />
            <GrammarComparisonRelated currentId={comparison.id} related={related} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
