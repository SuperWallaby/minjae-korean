import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { ArticleActionsAndComments } from "@/components/article/ArticleActionsAndComments";
import { BlockRenderer } from "@/components/grammar/BlockRenderer";
import { GrammarRecordVisit } from "@/components/grammar/GrammarRecordVisit";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Container } from "@/components/site/Container";
import { getChapterContent } from "@/data/grammarChapterContent";
import {
  getAllChapters,
  getChapterBySlug,
  getSectionAnchorForChapter,
  getSectionDisplayTitleForChapter,
  grammarChapterList,
} from "@/data/grammarChapterList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(grammarChapterList, slug);
  if (!chapter) return { title: "Not Found" };

  const title = `${chapter.title} — Korean Grammar`;
  const description =
    chapter.description ??
    `Learn Korean grammar: ${chapter.title}. Short chapter with examples and practice.`;
  const url = `${SITE_URL}/grammar/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Kaja",
      type: "article",
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og.png"],
    },
    alternates: { canonical: url },
  };
}

export default async function GrammarChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapterBySlug(grammarChapterList, slug);
  if (!chapter) return notFound();

  const chapters = getAllChapters(grammarChapterList);
  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter =
    index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const sectionTitle = getSectionDisplayTitleForChapter(
    grammarChapterList,
    chapter.id,
  );
  const sectionAnchor = getSectionAnchorForChapter(grammarChapterList, chapter.id);
  const listHash = sectionAnchor ? `#${encodeURIComponent(sectionAnchor)}` : "";
  const content = await getChapterContent(slug);
  const blocks = content?.blocks ?? [];
  const shareUrl = `${SITE_URL.replace(/\/+$/, "")}/grammar/${encodeURIComponent(slug)}`;
  const baseUrl = SITE_URL.replace(/\/+$/, "");
  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Grammar", item: `${baseUrl}/grammar` },
      ...(sectionAnchor
        ? [{ "@type": "ListItem" as const, position: 3, name: sectionTitle, item: `${baseUrl}/grammar${listHash}` }]
        : []),
      {
        "@type": "ListItem" as const,
        position: sectionAnchor ? 4 : 3,
        name: chapter.title,
        item: shareUrl,
      },
    ],
  };

  return (
    <div className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <GrammarRecordVisit chapterId={chapter.id} />
      <Container className="max-w-4xl">
        <Breadcrumb
          items={[
            { label: "Grammar", href: "/grammar" },
            { label: sectionTitle, href: `/grammar${listHash}` },
            { label: chapter.title },
          ]}
        />

        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {chapter.title}
        </h1>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-10">
          <BlockRenderer blocks={blocks} />
        </div>

        <ArticleActionsAndComments
          scope="grammar"
          slug={slug}
          shareUrl={shareUrl}
          shareTitle={chapter.title}
        />

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          {prevChapter ? (
            <Link
              href={`/grammar/${prevChapter.slug}`}
              className="rounded-xl inline-flex items-center gap-2 border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-included-1"
            >
              <ArrowLeftIcon className="h-4 w-4" /> {prevChapter.title}
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/grammar/${nextChapter.slug}`}
              className="rounded-xl text-right justify-end inline-flex items-center gap-2 border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-included-1 sm:ml-auto"
            >
              {nextChapter.title} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
