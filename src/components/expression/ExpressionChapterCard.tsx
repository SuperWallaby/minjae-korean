"use client";

import Link from "next/link";

import type { ExpressionChapterListItem } from "@/data/expressionTypes";

type Props = {
  chapter: ExpressionChapterListItem;
};

function badgeClassByNumber(n: number): string {
  if (n === 0) return "bg-included-1 text-badge-muted-foreground";
  if (n <= 9) return "bg-included-2 text-foreground";
  if (n <= 18) return "bg-included-3 text-foreground";
  if (n <= 27) return "bg-[var(--level-4-bg)] text-foreground";
  return "bg-[var(--level-5-bg)] text-foreground";
}

export function ExpressionChapterCard({ chapter }: Props) {
  return (
    <Link
      href={`/expressions/${chapter.slug}`}
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 outline-none transition duration-200 hover:-translate-y-1 hover:border-border hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4"
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
    </Link>
  );
}
