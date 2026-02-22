import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { fundamentalChapterList } from "@/data/fundamentalChapterList";
import { FundamentalChapterListClient } from "@/components/fundamental/FundamentalChapterListClient";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export const metadata: Metadata = {
  title: "Fundamental",
  description:
    "Korean fundamentals for complete beginners: Hangeul, pronunciation, numbers, time, and essential words.",
  openGraph: {
    title: "Fundamental | Kaja",
    description:
      "Korean fundamentals for complete beginners: Hangeul, pronunciation, numbers, time, and essential words.",
    url: `${SITE_URL}/fundamental`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundamental | Kaja",
    description:
      "Korean fundamentals for complete beginners: Hangeul, pronunciation, numbers, time, and essential words.",
  },
  alternates: { canonical: `${SITE_URL}/fundamental` },
};

export default function FundamentalPage() {
  const { sections } = fundamentalChapterList;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Fundamental
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Beginner starter pack! Hangul, pronunciation, numbers, time & date,
            and essential words.
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No chapters yet.
          </div>
        ) : (
          <FundamentalChapterListClient sections={sections} />
        )}
      </Container>
    </div>
  );
}
