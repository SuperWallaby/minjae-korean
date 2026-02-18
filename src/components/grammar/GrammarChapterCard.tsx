"use client";

import Link from "next/link";

import type { GrammarChapterListItem } from "@/data/grammarTypes";

type Props = {
  chapter: GrammarChapterListItem;
  /** 이 챕터 진행률 0–100. 1–99만 Continue+% 표시, 0·100은 CTA 없음 */
  progress: number;
  /** 방문한 카드는 배경색 아주 약간 구분 */
  isVisited: boolean;
};

/** 숫자 구간별 배지 배경 — 시각 리듬 (0 / 1–9 / 10–18 / 19–27 / 28+) */
function badgeClassByNumber(n: number): string {
  if (n === 0) return "bg-included-1 text-badge-muted-foreground";
  if (n <= 9) return "bg-included-2 text-foreground";
  if (n <= 18) return "bg-included-3 text-foreground";
  if (n <= 27) return "bg-[var(--level-4-bg)] text-foreground";
  return "bg-[var(--level-5-bg)] text-foreground";
}

export function GrammarChapterCard({ chapter, progress, isVisited }: Props) {
  const showCta = progress > 0 && progress < 100;
  const cta = showCta ? `Continue ${progress}%` : null;

  return (
    <Link
      href={`/grammar/${chapter.slug}`}
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
