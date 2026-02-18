import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { grammarChapterList } from "@/data/grammarChapterList";
import { GrammarChapterListClient } from "@/components/grammar/GrammarChapterListClient";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export const metadata: Metadata = {
  title: "Korean Grammar",
  description:
    "Learn real Korean grammar in short chapters: particles, tense, speech levels, and more. Simple examples and quick practice.",
  openGraph: {
    title: "Korean Grammar | Kaja",
    description:
      "Learn real Korean grammar in short chapters: particles, tense, speech levels, and more.",
    url: `${SITE_URL}/grammar`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korean Grammar | Kaja",
    description:
      "Learn real Korean grammar in short chapters: particles, tense, speech levels, and more.",
  },
  alternates: { canonical: `${SITE_URL}/grammar` },
};

export default function GrammarPage() {
  const { sections } = grammarChapterList;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Kaja! Korean Grammar.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Learn real Korean patterns in short chapters with simple examples
            and quick practice
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No chapters yet.
          </div>
        ) : (
          <GrammarChapterListClient sections={sections} />
        )}
      </Container>
    </div>
  );
}
