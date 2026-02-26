"use client";

import Image from "next/image";
import Link from "next/link";

import {
  displayLevel,
  formatNewsDate,
  levelBadgeClass,
  levelLabel,
  type ReadingLevel,
} from "@/lib/levelDisplay";
import { cn } from "@/lib/utils";

export type ArticleFeedItem = {
  slug: string;
  title: string;
  imageThumb?: string;
  imageLarge?: string;
  level?: number;
  createdAt?: string;
};

type ArticleFeedProps = {
  articles: ArticleFeedItem[];
  /** 첫 번째 글을 메이저 카드로 표시 (기본 true) */
  showMajor?: boolean;
  /** 링크 베이스 경로 (기본 /news/article, 블로그는 /blog/article) */
  basePath?: string;
};

export function ArticleFeed({
  articles,
  showMajor = true,
  basePath = "/news/article",
}: ArticleFeedProps) {
  if (articles.length === 0) return null;

  const major = showMajor ? articles[0] : null;
  const rest = showMajor ? articles.slice(1) : articles;

  return (
    <div className="space-y-6">
      {/* 상단 메이저 카드 */}
      {major ? (
        <Link
          href={`${basePath}/${encodeURIComponent(major.slug)}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 sm:aspect-2/1">
            {major.imageLarge?.trim() || major.imageThumb?.trim() ? (
              <Image
                src={
                  major.imageLarge?.trim() ||
                  major.imageThumb?.trim() ||
                  ""
                }
                alt={major.title}
                fill
                className="object-cover transition group-hover:scale-[1.02]"
                unoptimized
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  levelBadgeClass((major.level ?? 1) as ReadingLevel),
                )}
              >
                {displayLevel((major.level ?? 1) as ReadingLevel)}{" "}
                {levelLabel((major.level ?? 1) as ReadingLevel)}
              </span>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {major.title}
              </h2>
              <p className="mt-1 text-xs text-white/80">
                {formatNewsDate(major.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      {/* 하단 3단 그리드 */}
      {rest.length > 0 ? (
        <div
          className={cn(
            major ? "mt-6" : "",
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`${basePath}/${encodeURIComponent(p.slug)}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                {p.imageThumb?.trim() || p.imageLarge?.trim() ? (
                  <Image
                    src={
                      p.imageThumb?.trim() || p.imageLarge?.trim() || ""
                    }
                    alt={p.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <Image
                    src="/placeholders/post-1.svg"
                    alt="Article"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h4 className="font-serif font-semibold tracking-tight line-clamp-2">
                  {p.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      levelBadgeClass((p.level ?? 1) as ReadingLevel),
                    )}
                  >
                    {displayLevel((p.level ?? 1) as ReadingLevel)}{" "}
                    {levelLabel((p.level ?? 1) as ReadingLevel)}
                  </span>
                  <p className="mt-auto pt-2 text-xs text-muted-foreground">
                    {formatNewsDate(p.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
