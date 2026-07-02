import type { Metadata } from "next";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import { listBlogPosts } from "@/data/blogPosts";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean";

export const metadata: Metadata = {
  title: `Blog | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean: notes and posts about Korean learning, teaching, and practice.",
  openGraph: {
    title: `Blog | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean: notes and posts about Korean learning, teaching, and practice.",
    url: `${SITE_URL}/blog`,
    siteName: "Kaja",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/og.png`,
        width: 1200,
        height: 630,
        alt: "Kaja Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean: notes and posts about Korean learning, teaching, and practice.",
    images: [`${SITE_URL}/brand/og.png`],
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage() {
  const feedItems = await listBlogPosts(100);

  return (
    <MarketingPage containerClassName="max-w-5xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Blog"
            title="Notes on learning Korean"
            lead="Posts about Korean learning, teaching, and practice."
          />

          {feedItems.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No posts yet.
            </div>
          ) : (
            <div className="mt-8">
              <ArticleFeed
                articles={feedItems}
                basePath="/blog/article"
                showMajor
              />
            </div>
          )}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
