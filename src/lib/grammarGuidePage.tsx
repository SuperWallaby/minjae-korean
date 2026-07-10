import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
import { notFound, permanentRedirect } from "next/navigation";

import { GrammarComparisonExamples } from "@/components/grammar-comparison/GrammarComparisonExamples";
import { GrammarComparisonQuiz } from "@/components/grammar-comparison/GrammarComparisonQuiz";
import { GrammarGuideContent } from "@/components/grammar-guide/GrammarGuideContent";
import { GrammarGuideHero } from "@/components/grammar-guide/GrammarGuideHero";
import { GrammarGuideInfographic } from "@/components/grammar-guide/GrammarGuideInfographic";
import { GrammarGuideRelated } from "@/components/grammar-guide/GrammarGuideRelated";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import {
  buildGuideBreadcrumbJsonLd,
  buildGuideFaqJsonLd,
} from "@/lib/grammarGuideSeo";
import { grammarRomanizationVariants } from "@/lib/grammarRomanization";
import {
  formatGrammarPatternDisplay,
  formatUsageGuideTitleEn,
} from "@/lib/grammarPatternDisplay";
import {
  getGrammarGuideById,
  getGrammarGuideByWord,
  guideBasePath,
  guideCanonicalUrl,
  incrementGrammarGuideViewCount,
  listRelatedGrammarGuides,
  listTopGuidesForStaticParams,
  type GrammarGuide,
  type GrammarGuideType,
} from "@/lib/grammarGuidesRepo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";
const baseUrl = SITE_URL.replace(/\/+$/, "");

const BREADCRUMB_INDEX: Record<GrammarGuideType, string> = {
  meaning: "What does it mean?",
  usage: "How to use",
  "how-to-say": "How to say it",
};

function parseGuideId(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function createGuideStaticParams(type: GrammarGuideType) {
  return async function generateStaticParams() {
    try {
      const top = await listTopGuidesForStaticParams(type, 500);
      return top.map((g) => ({ slug: String(g.id), subslug: g.slug }));
    } catch {
      return [];
    }
  };
}

export function createGuideMetadata(type: GrammarGuideType) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string; subslug: string }>;
  }): Promise<Metadata> {
    const { slug: idRaw } = await params;
    const id = parseGuideId(idRaw);
    if (!id) return { title: "Not Found" };

    const guide = await getGrammarGuideById(id);
    if (!guide || guide.type !== type) return { title: "Not Found" };

    const title =
      guide.type === "usage"
        ? formatUsageGuideTitleEn(guide.wordName)
        : guide.titleEn;
    const description = guide.summaryEn;
    const canonical = guideCanonicalUrl(baseUrl, guide);
    const ogImage = guide.imageUrl ?? `${baseUrl}/brand/og.png`;
    const keywordSeed =
      guide.type === "usage"
        ? formatGrammarPatternDisplay(guide.wordName)
        : guide.type === "how-to-say"
          ? guide.englishPhrase || guide.wordName
          : guide.wordName;
    const intentKeyword =
      type === "meaning"
        ? "what does mean"
        : type === "usage"
          ? "how to use korean"
          : "how to say in korean";
    const keywords = [
      keywordSeed,
      guide.wordName,
      ...(guide.englishPhrase ? [guide.englishPhrase] : []),
      ...grammarRomanizationVariants(guide.wordName),
      intentKeyword,
    ].join(", ");

    return {
      title: `${title} | What is this in Korean`,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SITE_NAME,
        type: "article",
        images: guide.imageUrl
          ? [{ url: ogImage, width: 640, height: 393, alt: guide.imageAlt ?? title }]
          : [{ url: `${baseUrl}/brand/og.png`, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(guide.imageUrl ? { images: [ogImage] } : { images: [`${baseUrl}/brand/og.png`] }),
      },
      alternates: { canonical },
    };
  };
}

export function createGuidePage(type: GrammarGuideType) {
  return async function GrammarGuideDetailPage({
    params,
  }: {
    params: Promise<{ slug: string; subslug: string }>;
  }) {
    const { slug: idRaw, subslug: subslugRaw } = await params;
    const id = parseGuideId(idRaw);
    if (!id) return notFound();

    const guide = await getGrammarGuideById(id);
    if (!guide || guide.type !== type) return notFound();

    const subslugDecoded = decodeURIComponent(subslugRaw);
    if (subslugDecoded !== guide.slug) {
      permanentRedirect(guideCanonicalUrl(baseUrl, guide));
    }

    void incrementGrammarGuideViewCount(id);

    const related = await listRelatedGrammarGuides(type, id, 8);
    let crossGuide: {
      type: GrammarGuideType;
      guide: GrammarGuide;
    } | null = null;
    if (type === "how-to-say") {
      const meaningGuide = await getGrammarGuideByWord("meaning", guide.wordName);
      if (meaningGuide && meaningGuide.id !== guide.id) {
        crossGuide = { type: "meaning", guide: meaningGuide };
      }
    } else {
      const crossType: GrammarGuideType =
        type === "meaning" ? "usage" : "meaning";
      const crossGuideDoc = await getGrammarGuideByWord(crossType, guide.wordName);
      if (crossGuideDoc && crossGuideDoc.id !== guide.id) {
        crossGuide = { type: crossType, guide: crossGuideDoc };
      }
    }
    const canonical = guideCanonicalUrl(baseUrl, guide);
    const faqJsonLd = buildGuideFaqJsonLd(guide, canonical);
    const breadcrumbJsonLd = buildGuideBreadcrumbJsonLd(guide, baseUrl, canonical);
    const indexPath = guideBasePath(type);

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
                { label: BREADCRUMB_INDEX[type], href: indexPath },
                { label: guide.titleEn },
              ]}
            />

            <div className="mt-6 space-y-10">
              <GrammarGuideHero guide={guide} />
              <GrammarGuideInfographic guide={guide} />
              <GrammarGuideContent guide={guide} />
              <GrammarComparisonExamples examples={guide.examples} />
              <GrammarComparisonQuiz quizzes={guide.quizzes} />
              <GrammarGuideRelated
                type={type}
                currentId={guide.id}
                related={related}
                crossGuide={crossGuide}
              />
            </div>
          </MarketingShellBody>
        </MarketingShell>
      </MarketingPage>
    );
  };
}

export type { GrammarGuide };
