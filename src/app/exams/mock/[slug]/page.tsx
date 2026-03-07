import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getMockExamSummary, MOCK_EXAM_SLUGS } from "@/data/examsList";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export function generateStaticParams() {
  return MOCK_EXAM_SLUGS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exam = getMockExamSummary(slug);
  if (!exam) return { title: "Not Found" };
  const url = `${SITE_URL}/exams/mock/${slug}`;
  return {
    title: `${exam.title} | Exams`,
    description: exam.description ?? `Mock TOPIK: ${exam.title}.`,
    openGraph: {
      title: `${exam.title} | Kaja`,
      url,
      siteName: "Kaja",
      type: "website",
    },
    alternates: { canonical: url },
  };
}

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exam = getMockExamSummary(slug);
  if (!exam) return notFound();

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <Link href="/exams#mock" className="hover:text-foreground">
            Mock TOPIK
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{exam.title}</span>
        </nav>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {exam.title}
        </h1>
        {exam.description && (
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {exam.description}
          </p>
        )}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Exam engine will load here. (Blueprint + items for slug: {slug})
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/exams"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to Exams
          </Link>
        </div>
      </Container>
    </div>
  );
}
