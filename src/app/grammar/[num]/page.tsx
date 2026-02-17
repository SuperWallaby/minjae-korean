import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { grammarChapters } from "@/data/grammarChapters";

export const runtime = "nodejs";

export default async function GrammarChapterPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num: numParam } = await params;
  const num = parseInt(numParam, 10);
  const { chapters } = grammarChapters;

  if (Number.isNaN(num) || num < 1 || num > chapters.length) {
    return notFound();
  }

  const chapter = chapters.find((ch) => ch.number === num);
  if (!chapter) return notFound();

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div className="mb-6">
          <Link
            href="/grammar"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Grammar
          </Link>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">
            Chapter {chapter.number}
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {chapter.title}
          </h1>
        </div>

        <div className="mt-10 whitespace-pre-wrap rounded-2xl border border-border bg-card p-5 text-[15px] leading-7">
          {chapter.content}
        </div>
      </Container>
    </div>
  );
}
