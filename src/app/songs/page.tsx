import Image from "next/image";
import Link from "next/link";
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
import { listSongs } from "@/lib/songsRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const META_KEYWORD = "Study Korean with Songs";

export const metadata: Metadata = {
  title: `Korean Songs | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean with Songs: learn Korean through music. Click on lyrics to see translations, explanations, and vocabulary.",
  alternates: { canonical: `${SITE_URL.replace(/\/+$/, "")}/songs` },
  openGraph: {
    title: `Songs | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean with Songs: learn Korean through music. Click on lyrics to see translations, explanations, and vocabulary.",
    url: `${SITE_URL.replace(/\/+$/, "")}/songs`,
    type: "website",
    siteName: "Kaja",
  },
  twitter: {
    card: "summary_large_image",
    title: `Songs | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean with Songs: learn Korean through music. Click on lyrics to see translations, explanations, and vocabulary.",
  },
};

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function toFeedItem(
  s: Awaited<ReturnType<typeof listSongs>>[number],
): ArticleFeedItem {
  return {
    slug: s.slug,
    title: s.title,
    imageThumb: s.images?.thumb,
    imageLarge: s.images?.large,
    createdAt: s.createdAt,
  };
}

export default async function SongsPage() {
  const items = await listSongs(100);
  const isDev = devOnly();
  const feedItems = items.map(toFeedItem);

  return (
    <MarketingPage containerClassName="max-w-5xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title={
              <span className="inline-flex items-center gap-2">
                <Image
                  alt=""
                  width={40}
                  height={40}
                  src="/meme/offical/song.webp"
                  className="size-10"
                />
                Korean Songs
              </span>
            }
            lead="Learn Korean through music. Click on lyrics to see translations and explanations."
            action={
              isDev ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[var(--quiz-border)]"
                >
                  <Link href="/songs/new">New song</Link>
                </Button>
              ) : undefined
            }
          />

          {feedItems.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No songs yet.
            </div>
          ) : (
            <div className="mt-8">
              <ArticleFeed
                articles={feedItems}
                basePath="/songs"
                showMajor
              />
            </div>
          )}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
