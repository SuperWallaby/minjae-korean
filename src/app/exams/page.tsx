import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import {
  getPlacementSummary,
  getLevelExamSummaries,
  getTopicQuizSummaries,
  getMockExamSummaries,
  type ExamSummary,
} from "@/data/examsList";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean - Exams";

export const metadata: Metadata = {
  title: `Exams | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean - Exams: placement test (등급 받기), level tests (A1–B2), and mock TOPIK. Interactive online assessments.",
  openGraph: {
    title: `Exams | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean - Exams: placement, level tests, and mock TOPIK. Interactive Korean assessments.",
    url: `${SITE_URL}/exams`,
    siteName: "Kaja",
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/exams` },
};

function getExamHref(e: ExamSummary): string {
  if (e.kind === "placement") return "/exams/placement";
  if (e.kind === "level_test") return `/exams/level/${e.slug}`;
  if (e.kind === "topic_quiz") return `/exams/topic/${e.slug}`;
  return `/exams/mock/${e.slug}`;
}

function getExamBadgeLabel(e: ExamSummary): string {
  if (e.kind === "placement") return "Placement";
  if (e.kind === "level_test") return e.targetLevel ?? "Level";
  return "Mock TOPIK";
}

function getExamEditHref(e: ExamSummary): string {
  if (e.kind === "placement") return "/exams/placement/edit";
  if (e.kind === "level_test") return `/exams/level/${e.slug}/edit`;
  if (e.kind === "topic_quiz") return `/exams/topic/${e.slug}/edit`;
  return `/exams/mock/${e.slug}/edit`;
}

export default function ExamsHubPage() {
  const exams: ExamSummary[] = [
    getPlacementSummary(),
    ...getLevelExamSummaries(),
    ...getTopicQuizSummaries(),
    ...getMockExamSummaries(),
  ];

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Exams
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Placement, level tests, and mock TOPIK. Take an interactive
            assessment online.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <div
              key={`${e.kind}-${e.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            >
              <Link href={getExamHref(e)} className="flex flex-1 flex-col">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                  {e.imageThumb?.trim() ? (
                    <Image
                      src={e.imageThumb}
                      alt={e.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      e.kind === "placement"
                        ? "bg-primary/90 text-primary-foreground"
                        : e.kind === "mock_topik"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {getExamBadgeLabel(e)}
                  </span>
                  <h3 className="mt-2 font-serif font-semibold tracking-tight line-clamp-2">
                    {e.title}
                  </h3>
                  {e.description ? (
                    <p className="mt-auto pt-2 text-xs text-muted-foreground line-clamp-2">
                      {e.description}
                    </p>
                  ) : null}
                </div>
              </Link>
              {process.env.NODE_ENV !== "production" && (
                <Link
                  href={getExamEditHref(e)}
                  className="absolute right-2 top-2 z-10 rounded border border-border bg-background/90 px-2 py-1 text-xs backdrop-blur hover:bg-muted"
                >
                  Edit
                </Link>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
