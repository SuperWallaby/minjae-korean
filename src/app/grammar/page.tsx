import type { Metadata } from "next";
import Link from "next/link";

import { GrammarChapterListClient } from "@/components/grammar/GrammarChapterListClient";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { grammarChapterList } from "@/data/grammarChapterList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean Grammar";

export const metadata: Metadata = {
  title: `Korean Grammar | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean Grammar: particles, tense, speech levels, and more. Short chapters with simple examples and quick practice.",
  openGraph: {
    title: `Korean Grammar | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Grammar: particles, tense, speech levels, and more in short chapters.",
    url: `${SITE_URL}/grammar`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korean Grammar | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean Grammar: particles, tense, speech levels, and more in short chapters.",
  },
  alternates: { canonical: `${SITE_URL}/grammar` },
};

export default function GrammarPage() {
  const { sections } = grammarChapterList;

  return (
    <MarketingPage containerClassName="max-w-4xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title="Korean Grammar"
            lead="Learn real Korean patterns in short chapters with simple examples and quick practice."
          />

          {sections.length === 0 ? (
            <div className="mt-10 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3 text-sm text-[var(--quiz-text-sub)]">
              No chapters yet.
            </div>
          ) : (
            <div className="mt-8">
              <GrammarChapterListClient sections={sections} />
            </div>
          )}

          <section className="mt-12 rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-5">
            <h2 className="text-lg font-bold text-[var(--quiz-text)]">
              Word & grammar comparisons
            </h2>
            <p className="mt-2 text-sm text-[var(--quiz-text-sub)]">
              Easily confused particles and connectors — side by side with real examples
              and a quick quiz on each page.
            </p>
            <Link
              href="/grammar/compare"
              className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline hover:text-emerald-950"
            >
              Browse comparisons →
            </Link>
          </section>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
