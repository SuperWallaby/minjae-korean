import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getLevelExamSummary, LEVEL_EXAM_SLUGS } from "@/data/examsList";
import { ExamEditClient } from "@/app/exams/_components/ExamEditClient";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LEVEL_EXAM_SLUGS.map((e) => ({ slug: e.slug }));
}

export default async function LevelExamEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV === "production") return notFound();

  const { slug } = await params;
  const exam = getLevelExamSummary(slug);
  if (!exam) return notFound();

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <Link href="/exams/level" className="hover:text-foreground">
            Level
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/exams/level/${slug}`} className="hover:text-foreground">
            {exam.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
          Edit: {exam.title}
        </h1>
        <div className="mt-6">
          <ExamEditClient
            slug={slug}
            title={exam.title}
            backHref={`/exams/level/${slug}`}
          />
        </div>
      </Container>
    </div>
  );
}
