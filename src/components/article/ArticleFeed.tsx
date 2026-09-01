"use client";

import Image from "next/image";
import Link from "next/link";

import { RelativeDate } from "@/components/article/RelativeDate";
import styles from "@/components/site/home-blog.module.css";
import { BLOG_FALLBACK_COVER } from "@/data/blogPosts/cover";
import {
  displayLevel,
  levelBadgeClass,
  levelLabel,
  type ReadingLevel,
} from "@/lib/levelDisplay";
import { normalizePublicMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

export type ArticleFeedItem = {
  slug: string;
  title: string;
  imageThumb?: string;
  imageLarge?: string;
  level?: number;
  createdAt?: string;
  /** Plain-text body preview (Reddit-style). */
  excerpt?: string;
};

type ArticleFeedProps = {
  articles: ArticleFeedItem[];
  /** 첫 번째 글을 메이저 카드로 표시 (기본 true) */
  showMajor?: boolean;
  /** 링크 베이스 경로 (기본 /news/article, 블로그는 /blog/article) */
  basePath?: string;
  /** Optional fallback when a card has no image fields */
  fallbackCover?: string;
  /** When false, render a plain title list (no covers / major hero card). */
  showCovers?: boolean;
  /**
   * On viewports below `sm`, only the first N items render visibly;
   * the rest stay for desktop. Pair with `moreHref` for a mobile CTA.
   */
  mobileVisibleCount?: number;
  moreHref?: string;
  moreLabel?: string;
  /** Tighter title + 1-line excerpt (home preview). */
  compact?: boolean;
};

function resolveFeedCover(
  item: ArticleFeedItem,
  fallbackCover: string,
): string {
  return normalizePublicMediaUrl(
    item.imageThumb?.trim() ||
      item.imageLarge?.trim() ||
      fallbackCover,
  );
}

export function ArticleFeed({
  articles,
  showMajor = true,
  basePath = "/news/article",
  fallbackCover = BLOG_FALLBACK_COVER,
  showCovers = true,
  mobileVisibleCount,
  moreHref,
  moreLabel = "More",
  compact = false,
}: ArticleFeedProps) {
  if (articles.length === 0) return null;

  if (!showCovers) {
    return (
      <div>
        <ul className={styles.storyList}>
          {articles.map((p, index) => {
            const hide =
              typeof mobileVisibleCount === "number" &&
              index >= mobileVisibleCount;
            const thumb = resolveFeedCover(p, fallbackCover);
            const hasThumb = Boolean(
              p.imageThumb?.trim() || p.imageLarge?.trim(),
            );
            return (
              <li
                key={p.slug}
                className={cn(styles.storyItem, hide && "max-sm:hidden")}
              >
                <Link
                  href={`${basePath}/${encodeURIComponent(p.slug)}`}
                  className={cn(
                    styles.storyLink,
                    hasThumb && styles.storyLinkWithThumb,
                  )}
                >
                  <div className={styles.storyCopy}>
                    <div className={styles.storyMeta}>
                      <span>Minjae</span>
                      <span aria-hidden>·</span>
                      <RelativeDate iso={p.createdAt} />
                    </div>
                    <h3
                      className={cn(
                        styles.storyTitle,
                        compact && styles.storyTitleCompact,
                      )}
                    >
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p
                        className={cn(
                          styles.storyExcerpt,
                          compact
                            ? styles.storyExcerptCompact
                            : styles.storyExcerptFull,
                        )}
                      >
                        {p.excerpt}
                      </p>
                    ) : null}
                  </div>
                  {hasThumb ? (
                    <div className={styles.storyThumb} aria-hidden>
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {moreHref &&
        typeof mobileVisibleCount === "number" &&
        articles.length > mobileVisibleCount ? (
          <div className="flex justify-center pt-4 sm:hidden">
            <Link href={moreHref} className={styles.textLink}>
              {moreLabel}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  const major = showMajor ? articles[0] : null;
  const rest = showMajor ? articles.slice(1) : articles;
  const majorCover = major ? resolveFeedCover(major, fallbackCover) : "";
  const hideOnMobile = (absoluteIndex: number) =>
    typeof mobileVisibleCount === "number" &&
    absoluteIndex >= mobileVisibleCount;

  return (
    <div className="space-y-6">
      {major ? (
        <Link
          href={`${basePath}/${encodeURIComponent(major.slug)}`}
          className={cn(
            "group block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            hideOnMobile(0) && "max-sm:hidden",
          )}
        >
          <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 sm:aspect-2/1">
            <Image
              src={majorCover}
              alt={major.title}
              fill
              className="object-cover transition group-hover:scale-[1.02]"
              unoptimized={false}
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
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
              <RelativeDate
                iso={major.createdAt}
                className="mt-1 text-xs text-white/80"
              />
            </div>
          </div>
        </Link>
      ) : null}

      {rest.length > 0 ? (
        <div
          className={cn(
            major ? "mt-6" : "",
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {rest.map((p, index) => {
            const absoluteIndex = showMajor ? index + 1 : index;
            return (
              <Link
                key={p.slug}
                href={`${basePath}/${encodeURIComponent(p.slug)}`}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  hideOnMobile(absoluteIndex) && "max-sm:hidden",
                )}
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted/20">
                  <Image
                    src={resolveFeedCover(p, fallbackCover)}
                    alt={p.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <h4 className="font-serif font-semibold tracking-tight line-clamp-2">
                    {p.title}
                  </h4>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        levelBadgeClass((p.level ?? 1) as ReadingLevel),
                      )}
                    >
                      {displayLevel((p.level ?? 1) as ReadingLevel)}{" "}
                      {levelLabel((p.level ?? 1) as ReadingLevel)}
                    </span>
                    <RelativeDate
                      iso={p.createdAt}
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {moreHref &&
      typeof mobileVisibleCount === "number" &&
      articles.length > mobileVisibleCount ? (
        <div className="flex justify-center sm:hidden">
          <Link
            href={moreHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-2 text-sm font-semibold text-[var(--quiz-text)]"
          >
            {moreLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
