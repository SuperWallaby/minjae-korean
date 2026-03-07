import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import {
  getPlacementSummary,
  LEVEL_EXAM_SLUGS,
  MOCK_EXAM_SLUGS,
  type ExamSummary,
} from "@/data/examsList";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export const metadata: Metadata = {
  title: "Exams",
  description:
    "Korean placement test (등급 받기), level tests (A1–B2), and mock TOPIK. Interactive online assessments.",
  openGraph: {
    title: "Exams | Kaja",
    description:
      "Placement, level tests, and mock TOPIK. Interactive Korean assessments.",
    url: `${SITE_URL}/exams`,
    siteName: "Kaja",
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/exams` },
};

function getExamHref(e: ExamSummary): string {
  if (e.kind === "placement") return "/exams/placement";
  if (e.kind === "level_test") return `/exams/level/${e.slug}`;
  return `/exams/mock/${e.slug}`;
}

function getExamBadgeLabel(e: ExamSummary): string {
  if (e.kind === "placement") return "Placement";
  if (e.kind === "level_test") return e.targetLevel ?? "Level";
  return "Mock TOPIK";
}

export default function ExamsHubPage() {
  const placement = getPlacementSummary();
  const rest: ExamSummary[] = [...LEVEL_EXAM_SLUGS, ...MOCK_EXAM_SLUGS];

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

        {/* Featured: Placement */}
        <Link
          href={getExamHref(placement)}
          className="group mt-10 block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 sm:aspect-2/1">
            {placement.imageThumb?.trim() ? (
              <Image
                src={placement.imageThumb}
                alt={placement.title}
                fill
                className="object-cover transition group-hover:scale-[1.02]"
                unoptimized
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground">
                {getExamBadgeLabel(placement)}
              </span>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {placement.title}
              </h2>
              {placement.description ? (
                <p className="mt-1 text-sm text-white/90">
                  {placement.description}
                </p>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Card grid: Level tests + Mock TOPIK */}
        {rest.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((e) => (
              <Link
                key={`${e.kind}-${e.slug}`}
                href={getExamHref(e)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
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
                      e.kind === "mock_topik"
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
            ))}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
