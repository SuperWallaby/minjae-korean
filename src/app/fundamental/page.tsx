import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { SITE_NAME } from "@/lib/siteBrand";

import { FundamentalChapterListClient } from "@/components/fundamental/FundamentalChapterListClient";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { fundamentalChapterList } from "@/data/fundamentalChapterList";

export const runtime = "nodejs";

const SITE_URL = SITE_ORIGIN;

const META_KEYWORD = "Study Korean Fundamentals";

export const metadata: Metadata = {
  title: { absolute: `Fundamental | ${META_KEYWORD} | What is this in Korean` },
  description:
    "Study Korean Fundamentals: Hangeul, pronunciation, numbers, time, and essential words for complete beginners.",
  robots: { index: false, follow: false },
  openGraph: {
    title: `Fundamental | ${META_KEYWORD} | What is this in Korean`,
    description:
      "Study Korean Fundamentals: Hangeul, pronunciation, numbers, time, and essential words for complete beginners.",
    url: `${SITE_URL}/fundamental`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/og.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Fundamental`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Fundamental | ${META_KEYWORD} | What is this in Korean`,
    description:
      "Study Korean Fundamentals: Hangeul, pronunciation, numbers, time, and essential words for complete beginners.",
    images: [`${SITE_URL}/brand/og.png`],
  },
  alternates: { canonical: `${SITE_URL}/fundamental` },
};

export default function FundamentalPage() {
  const { sections } = fundamentalChapterList;

  return (
    <MarketingPage containerClassName="max-w-4xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title="Fundamental"
            lead="Beginner starter pack — Hangul, pronunciation, numbers, time & date, and essential words."
          />

          {sections.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No chapters yet.
            </div>
          ) : (
            <div className="mt-8">
              <FundamentalChapterListClient sections={sections} />
            </div>
          )}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
