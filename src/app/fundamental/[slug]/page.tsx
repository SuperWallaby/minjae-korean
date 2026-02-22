import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { BlockRenderer } from "@/components/grammar/BlockRenderer";
import { FundamentalRecordVisit } from "@/components/fundamental/FundamentalRecordVisit";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Container } from "@/components/site/Container";
import { getChapterContent } from "@/data/fundamentalChapterContent";
import {
  fundamentalChapterList,
  getAllChapters,
  getChapterBySlug,
  getSectionAnchorForChapter,
  getSectionDisplayTitleForChapter,
} from "@/data/fundamentalChapterList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(fundamentalChapterList, slug);
  if (!chapter) return { title: "Not Found" };

  const title = `${chapter.title} — Fundamental`;
  const description =
    chapter.description ??
    `Learn: ${chapter.title}. Short chapter with examples.`;
  const url = `${SITE_URL}/fundamental/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Kaja",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export default async function FundamentalChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapterBySlug(fundamentalChapterList, slug);
  if (!chapter) return notFound();

  const chapters = getAllChapters(fundamentalChapterList);
  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter =
    index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const sectionTitle = getSectionDisplayTitleForChapter(
    fundamentalChapterList,
    chapter.id,
  );
  const sectionAnchor = getSectionAnchorForChapter(
    fundamentalChapterList,
    chapter.id,
  );
  const listHash = sectionAnchor ? `#${encodeURIComponent(sectionAnchor)}` : "";
  const content = await getChapterContent(slug);
  const blocks = content?.blocks ?? [];

  return (
    <div className="py-12 sm:py-16">
      <FundamentalRecordVisit chapterId={chapter.id} />
      <Container className="max-w-4xl">
        <Breadcrumb
          items={[
            { label: "Fundamental", href: "/fundamental" },
            { label: sectionTitle, href: `/fundamental${listHash}` },
            { label: chapter.title },
          ]}
        />

        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Chapter {chapter.number}
        </h1>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-10">
          <BlockRenderer blocks={blocks} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          {prevChapter ? (
            <Link
              href={`/fundamental/${prevChapter.slug}`}
              className="inline-flex gap-2 rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-included-1"
            >
              <ArrowLeftIcon className="h-4 w-4" /> {prevChapter.title}
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/fundamental/${nextChapter.slug}`}
              className="inline-flex justify-end gap-2 rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-included-1 sm:ml-auto"
            >
              {nextChapter.title} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
