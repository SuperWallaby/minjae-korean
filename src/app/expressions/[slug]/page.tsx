import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { ArticleActionsAndComments } from "@/components/article/ArticleActionsAndComments";
import { Container } from "@/components/site/Container";
import { ExpressionRenderer } from "@/components/expression/ExpressionRenderer";
import {
  getAllExpressionChapters,
  getExpressionChapterBySlug,
} from "@/data/expressionChapterList";
import { getExpressionChapterContent } from "@/data/expressionChapterContent";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getExpressionChapterBySlug(slug);
  if (!chapter) return {};

  const canonical = `${SITE_URL}/expressions/${slug}`;
  return {
    title: `${chapter.title} | Korean Expressions`,
    description:
      chapter.description ??
      "Learn Korean expressions with ready-to-use frames.",
    alternates: { canonical },
    openGraph: {
      title: `${chapter.title} | Korean Expressions`,
      description:
        chapter.description ??
        "Learn Korean expressions with ready-to-use frames.",
      url: canonical,
      siteName: "Kaja",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${chapter.title} | Korean Expressions`,
      description:
        chapter.description ??
        "Learn Korean expressions with ready-to-use frames.",
    },
  };
}

export default async function ExpressionChapterPage({ params }: Props) {
  const { slug } = await params;
  const chapter = getExpressionChapterBySlug(slug);
  if (!chapter) notFound();

  const chapters = getAllExpressionChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter =
    index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const content = await getExpressionChapterContent(slug);
  if (!content) notFound();

  const { header } = content;
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/expressions/${encodeURIComponent(slug)}`;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/expressions"
              className="hover:text-foreground transition-colors"
            >
              Expressions
            </Link>
            <span>/</span>
            <span>#{chapter.number}</span>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {header.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{header.goal}</p>
        </div>

        {/* Content */}
        <ExpressionRenderer content={content} />

        <ArticleActionsAndComments
          scope="expressions"
          slug={slug}
          shareUrl={canonical}
          shareTitle={header.title}
        />

        {/* Footer: Prev / Next */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          {prevChapter ? (
            <Link
              href={`/expressions/${encodeURIComponent(prevChapter.slug)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted/50"
            >
              <ArrowLeftIcon className="h-4 w-4" /> {prevChapter.title}
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/expressions/${encodeURIComponent(nextChapter.slug)}`}
              className="inline-flex items-center justify-end gap-2 rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted/50 sm:ml-auto"
            >
              {nextChapter.title} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
