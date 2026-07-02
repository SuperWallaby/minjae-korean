import Link from "next/link";
import type { Metadata } from "next";

import { BookHomeSection } from "@/components/site/BookHomeSection";
import { HomeRenewalSections } from "@/components/site/HomeRenewalSections";
import { VocabQuizHomeSection } from "@/components/site/VocabQuizHomeSection";
import { listArticles } from "@/lib/articlesRepo";
import { listBlogPosts } from "@/data/blogPosts";
import { resolveBlogCoverImage } from "@/data/blogPosts/cover";
import { sampleKoreanQuizHomeCards } from "@/lib/koreanQuiz/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Kaja | Let's Talk in Korean";
  const description =
    "Learn Korean with nuance — vocab quiz, news readings, grammar, and resources from Kaja.";
  const url = SITE_URL.replace(/\/+$/, "");
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Kaja",
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
    news = await listArticles(6);
  } catch {
    news = [];
  }
  try {
    blog = await listBlogPosts(4);
  } catch {
    blog = [];
  }
  try {
    vocabQuizCards = await sampleKoreanQuizHomeCards(12);
  } catch {
    vocabQuizCards = [];
  }
  return (
    <div className="space-y-10 md:space-y-14">
      {/* 1) Hero — vocab quiz app (keep as-is) */}
      <VocabQuizHomeSection cards={vocabQuizCards} />

      {/* 2) Book (keep as-is) */}
      <BookHomeSection />

      <HomeRenewalSections
        news={news}
        blog={blog.map((post) => {
          const cover = resolveBlogCoverImage(post);
          return {
            slug: post.slug,
            title: post.title,
            imageThumb: cover,
            imageLarge: cover,
            level: post.level,
            createdAt: post.createdAt,
          };
        })}
      />
    </div>
  );
}
