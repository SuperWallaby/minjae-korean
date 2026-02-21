"use client";

import Link from "next/link";

import type { FundamentalChapterListItem } from "@/data/fundamentalTypes";

type Props = {
  chapter: FundamentalChapterListItem;
  progress: number;
  isVisited: boolean;
};

function badgeClassByNumber(n: number): string {
  if (n === 0) return "bg-included-1 text-badge-muted-foreground";
  if (n <= 9) return "bg-included-2 text-foreground";
  if (n <= 18) return "bg-included-3 text-foreground";
  if (n <= 27) return "bg-[var(--level-4-bg)] text-foreground";
  return "bg-[var(--level-5-bg)] text-foreground";
}

export function FundamentalChapterCard({ chapter, progress, isVisited }: Props) {
  const showCta = progress > 0 && progress < 100;
  const cta = showCta ? `Continue ${progress}%` : null;

  return (
    <Link
      href={`/fundamental/${chapter.slug}`}
      className={`group flex flex-col gap-2 rounded-2xl border border-border p-4 outline-none transition duration-200 hover:-translate-y-1 hover:border-border hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4 ${
        isVisited
          ? "bg-[color-mix(in_srgb,var(--card)_80%,var(--border))]"
          : "bg-card"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClassByNumber(chapter.number)}`}
            aria-hidden
          >
            {chapter.number}
          </span>
          <h2 className="font-serif text-sm font-medium tracking-tight text-muted-foreground">
            {chapter.title}
          </h2>
        </div>
        {chapter.description ? (
          <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-foreground">
            {chapter.description}
          </p>
        ) : (
          <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-foreground">
            {chapter.title}
          </p>
        )}
      </div>
      {showCta && cta ? (
        <div className="flex shrink-0 items-center gap-2 sm:pl-2">
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-included-1">
            <div
              className="h-full rounded-full bg-included-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition group-hover:bg-included-1"
            aria-hidden
          >
            {cta}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
