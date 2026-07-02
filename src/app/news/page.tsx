import Link from "next/link";
import type { Metadata } from "next";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { listArticles } from "@/lib/articlesRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean Reading";

export const metadata: Metadata = {
  title: `Korean News & Reading | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean Reading: short news and articles for reading practice, vocabulary, and prompts. Leveled content for learners.",
  openGraph: {
    title: `Korean News & Reading | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Reading: news and articles for reading practice, vocabulary, and prompts.",
    url: `${SITE_URL}/news`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korean News & Reading | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Reading: news and articles for reading practice, vocabulary, and prompts.",
  },
  alternates: { canonical: `${SITE_URL}/news` },
};

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export default async function NewsPage() {
  const items = await listArticles(100);
  const isDev = devOnly();

  return (
    <MarketingPage containerClassName="max-w-5xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Practice"
            title="Kaja News — readings & listening"
            lead="Articles for Korean learning, reading, vocabulary, and prompts."
            action={
              isDev ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[var(--quiz-border)]"
                >
                  <Link href="/news/article/new">New article</Link>
                </Button>
              ) : undefined
            }
          />

          {items.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No articles yet.
            </div>
          ) : (
            <div className="mt-8">
              <ArticleFeed articles={items} showMajor />
            </div>
          )}

          <section
            className="mt-12 border-t border-[var(--quiz-border)] pt-8 text-xs text-[var(--quiz-text-muted)]"
            aria-label="About this page"
          >
            <h2 className="sr-only">Quick answers for discovery</h2>
            <dl className="space-y-3">
              <div>
                <dt className="font-medium text-[var(--quiz-text)]">
                  Can I practice Korean reading with these articles?
                </dt>
                <dd className="mt-1">
                  Yes. This page lists short news and articles for learners.
                  Each piece has leveled content, vocabulary support, and
                  prompts so you can practice reading and expand your Korean.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--quiz-text)]">
                  What level are the articles?
                </dt>
                <dd className="mt-1">
                  Articles are tagged by level (e.g. beginner to advanced). You
                  can choose what fits you and use them for reading practice,
                  vocabulary building, or discussion prompts.
                </dd>
              </div>
            </dl>
          </section>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
