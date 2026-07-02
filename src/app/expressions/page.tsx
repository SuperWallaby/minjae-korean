import type { Metadata } from "next";

import { ExpressionChapterListClient } from "@/components/expression/ExpressionChapterListClient";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { expressionChapterList } from "@/data/expressionChapterList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean Expressions";

export const metadata: Metadata = {
  title: `Korean Expressions | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean Expressions: essential expressions with ready-to-use frames. Perfect for beginners who want to speak immediately.",
  openGraph: {
    title: `Korean Expressions | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Expressions: essential expressions with ready-to-use frames.",
    url: `${SITE_URL}/expressions`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korean Expressions | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Expressions: essential expressions with ready-to-use frames.",
  },
  alternates: { canonical: `${SITE_URL}/expressions` },
};

export default function ExpressionsPage() {
  const { sections } = expressionChapterList;

  return (
    <MarketingPage containerClassName="max-w-4xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title="Korean Expressions"
            lead="Ready-to-use Korean frames you can speak immediately."
          />

          {sections.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No chapters yet.
            </div>
          ) : (
            <div className="mt-8">
              <ExpressionChapterListClient sections={sections} />
            </div>
          )}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
