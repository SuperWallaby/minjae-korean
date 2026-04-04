import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getExam, getExamItems, getTopicQuizSummary, TOPIC_QUIZ_SLUGS } from "@/data/examsList";
import { TopicQuizClient } from "./TopicQuizClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export function generateStaticParams() {
  return TOPIC_QUIZ_SLUGS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exam = getTopicQuizSummary(slug);
  if (!exam) return { title: "Not Found" };
  const META_KEYWORD = "Study Korean - Exams";
  const url = `${SITE_URL}/exams/topic/${slug}`;
  const metaTitle = `${exam.title} | ${META_KEYWORD} | Kaja`;
  const metaDescription =
    exam.description ?? `Study Korean - topic quiz ${exam.title}.`;
  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: { title: metaTitle, description: metaDescription, url, siteName: "Kaja", type: "website" },
    alternates: { canonical: url },
  };
}

export default async function TopicQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const summary = getTopicQuizSummary(slug);
  if (!summary) return notFound();

  const exam = await getExam("topic_quiz", slug);
  const items = await getExamItems("topic_quiz", slug);

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{summary.title}</span>
        </nav>

        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {summary.title}
        </h1>
        {summary.description ? (
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {summary.description}
          </p>
        ) : null}

        <div className="mt-8">
          {exam && items.length > 0 ? (
            <TopicQuizClient exam={exam} items={items} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No exam data available.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/exams"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to Exams
          </Link>
          {process.env.NODE_ENV !== "production" && (
            <Link
              href={`/exams/topic/${slug}/edit`}
              className="rounded border border-border bg-muted/50 px-3 py-1.5 text-sm hover:bg-muted"
            >
              Edit
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}

