import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/siteBrand";
import type { Metadata } from "next";

import { AboutMeHomeSection } from "@/components/site/AboutMeHomeSection";
import { BookHomeSection } from "@/components/site/BookHomeSection";
import { BuyMeCoffeeHomeSection } from "@/components/site/BuyMeCoffeeHomeSection";
import { ExpressionCardsHomeSection } from "@/components/site/ExpressionCardsHomeSection";
import { FindTutorHomeSection } from "@/components/site/FindTutorHomeSection";
import { GrammarHomeSection } from "@/components/site/GrammarHomeSection";
import { HomeRenewalSections } from "@/components/site/HomeRenewalSections";
import { VocabHomeSection } from "@/components/site/VocabHomeSection";
import { VocabQuizHomeSection } from "@/components/site/VocabQuizHomeSection";
import { getExpressionCardSets } from "@/data/expressionCardSets";
import { listArticles } from "@/lib/articlesRepo";
import { listBlogPosts } from "@/data/blogPosts";
import { sampleKoreanQuizHomeCards } from "@/lib/koreanQuiz/store";
import { SITE_ORIGIN, siteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = SITE_NAME;
  const description = SITE_DESCRIPTION;
  const url = SITE_ORIGIN;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og.png"],
    },
  };
}

export default async function Home() {
  let news: Awaited<ReturnType<typeof listArticles>> = [];
  let blog: Awaited<ReturnType<typeof listBlogPosts>> = [];
  let vocabQuizCards: Awaited<ReturnType<typeof sampleKoreanQuizHomeCards>> = [];
  try {
    news = await listArticles(3);
  } catch {
    news = [];
  }
  try {
    blog = await listBlogPosts(3);
  } catch {
    blog = [];
  }
  try {
    vocabQuizCards = await sampleKoreanQuizHomeCards(12);
  } catch {
    vocabQuizCards = [];
  }
  const organizationId = siteUrl("/#organization");
  const teacherId = siteUrl("/#teacher");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": siteUrl("/#website"),
      url: SITE_ORIGIN,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": organizationId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      url: SITE_ORIGIN,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      logo: siteUrl("/brand/icon.png"),
      founder: { "@id": teacherId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": teacherId,
      name: "Minjae",
      jobTitle: "Korean teacher",
      worksFor: { "@id": organizationId },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-10 md:space-y-14">
        {/* 1) Hero — vocab quiz app */}
        <VocabQuizHomeSection cards={vocabQuizCards} />

        {/* 2) 1:1 tutor — higher for conversion (affiliate + coaching) */}
        <FindTutorHomeSection />

        {/* 3) Book */}
        <BookHomeSection />

        {/* 4) Support */}
        <BuyMeCoffeeHomeSection />

        {/* 5) About me */}
        <AboutMeHomeSection />

        {/* 6) Expression cards — auto-video IG List (capybara carousels) */}
        <ExpressionCardsHomeSection sets={getExpressionCardSets()} />

        {/* 7+) Vocab / grammar hubs, news, blog */}
        <VocabHomeSection />
        <GrammarHomeSection />
        <HomeRenewalSections news={news} blog={blog} />
      </div>
    </>
  );
}
