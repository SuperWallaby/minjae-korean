import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
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
  title: `Korean Grammar | ${META_KEYWORD} | What is this in Korean`,
  description:
    "Study Korean Grammar: particles, tense, speech levels, and more. Short chapters with simple examples and quick practice.",
  openGraph: {
    title: `Korean Grammar | ${META_KEYWORD} | What is this in Korean`,
    description:
      "Study Korean Grammar: particles, tense, speech levels, and more in short chapters.",
    url: `${SITE_URL}/grammar`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korean Grammar | ${META_KEYWORD} | What is this in Korean`,
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

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <section className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-5">
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

            <section className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-5">
              <h2 className="text-lg font-bold text-[var(--quiz-text)]">
                What does it mean?
              </h2>
              <p className="mt-2 text-sm text-[var(--quiz-text-sub)]">
                Clear meaning guides for Korean words and patterns learners search for.
              </p>
              <Link
                href="/grammar/meaning"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline hover:text-emerald-950"
              >
                Browse meaning guides →
              </Link>
            </section>

            <section className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-5">
              <h2 className="text-lg font-bold text-[var(--quiz-text)]">
                How to use
              </h2>
              <p className="mt-2 text-sm text-[var(--quiz-text-sub)]">
                Practical usage guides — when and how native speakers actually use it.
              </p>
              <Link
                href="/grammar/usage"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline hover:text-emerald-950"
              >
                Browse usage guides →
              </Link>
            </section>
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
