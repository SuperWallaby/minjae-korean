import Link from "next/link";
import { SITE_NAME } from "@/lib/siteBrand";
import type { Metadata } from "next";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import type { ArticleFeedItem } from "@/components/article/ArticleFeed";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { listDramas } from "@/lib/dramaRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const META_KEYWORD = "Study Korean with Dramas";

export const metadata: Metadata = {
  title: `Drama | ${META_KEYWORD} | What is this in Korean`,
  description:
    "Study Korean with Dramas: learn Korean through drama clips. Click on lines to see translations, explanations, and vocabulary.",
  alternates: { canonical: `${SITE_URL.replace(/\/+$/, "")}/drama` },
  openGraph: {
    title: `Drama | ${META_KEYWORD} | What is this in Korean`,
    description:
      "Study Korean with Dramas: learn Korean through drama clips. Click on lines to see translations, explanations, and vocabulary.",
    url: `${SITE_URL.replace(/\/+$/, "")}/drama`,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Drama | ${META_KEYWORD} | What is this in Korean`,
    description:
      "Study Korean with Dramas: learn Korean through drama clips. Click on lines to see translations, explanations, and vocabulary.",
  },
};

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function toFeedItem(
  d: Awaited<ReturnType<typeof listDramas>>[number],
): ArticleFeedItem {
  return {
    slug: d.slug,
    title: d.title,
    imageThumb: d.images?.thumb,
    imageLarge: d.images?.large,
    createdAt: d.createdAt,
  };
}

export default async function DramaPage() {
  const items = await listDramas(100);
  const isDev = devOnly();
  const feedItems = items.map(toFeedItem);

  return (
    <MarketingPage containerClassName="max-w-5xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title="Korean Drama"
            lead="Learn Korean through drama. Click on lines to see translations and explanations."
            action={
              isDev ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[var(--quiz-border)]"
                >
                  <Link href="/drama/new">New drama</Link>
                </Button>
              ) : undefined
            }
          />

          {feedItems.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No dramas yet.
            </div>
          ) : (
            <div className="mt-8">
              <ArticleFeed
                articles={feedItems}
                basePath="/drama"
                showMajor
              />
            </div>
          )}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
