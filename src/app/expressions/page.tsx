import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { ExpressionChapterListClient } from "@/components/expression/ExpressionChapterListClient";
import { expressionChapterList } from "@/data/expressionChapterList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export const metadata: Metadata = {
  title: "Korean Expressions",
  description:
    "Learn essential Korean expressions with ready-to-use frames. Perfect for beginners who want to speak immediately.",
  openGraph: {
    title: "Korean Expressions | Kaja",
    description:
      "Learn essential Korean expressions with ready-to-use frames.",
    url: `${SITE_URL}/expressions`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korean Expressions | Kaja",
    description:
      "Learn essential Korean expressions with ready-to-use frames.",
  },
  alternates: { canonical: `${SITE_URL}/expressions` },
};

export default function ExpressionsPage() {
  const { sections } = expressionChapterList;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Kaja! Korean Expressions.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Ready-to-use Korean frames you can speak immediately
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No chapters yet.
          </div>
        ) : (
          <ExpressionChapterListClient sections={sections} />
        )}
      </Container>
    </div>
  );
}
