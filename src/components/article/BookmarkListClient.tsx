"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkX } from "lucide-react";

type BookmarkItem = {
  scope: string;
  slug: string;
  title?: string;
  imageThumb?: string;
};

function bookmarkHref(scope: string, slug: string): string {
  switch (scope) {
    case "blog":
      return `/blog/article/${encodeURIComponent(slug)}`;
    case "news":
      return `/news/article/${encodeURIComponent(slug)}`;
    case "grammar":
      return `/grammar/${encodeURIComponent(slug)}`;
    case "expressions":
      return `/expressions/${encodeURIComponent(slug)}`;
    default:
      return scope === "blog"
        ? `/blog/article/${encodeURIComponent(slug)}`
        : `/news/article/${encodeURIComponent(slug)}`;
  }
}

function scopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    blog: "Blog",
    news: "News",
    grammar: "Grammar",
    expressions: "Expressions",
  };
  return labels[scope] ?? scope;
}

type Props = { className?: string };

export function BookmarkListClient({ className = "" }: Props) {
  const [list, setList] = React.useState<BookmarkItem[] | null>(null);

  const fetchList = React.useCallback(() => {
    fetch("/api/public/article-actions/bookmarks?expand=1", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json.bookmarks)) {
          setList(json.bookmarks);
        } else {
          setList([]);
        }
      })
      .catch(() => setList([]));
  }, []);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleRemove = async (
    e: React.MouseEvent,
    scope: string,
    slug: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/public/article-actions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok && !json.bookmarked) {
        fetchList();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bookmarks-changed"));
        }
      }
    } catch {
      // ignore
    }
  };

  if (list === null) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          No saved items. Bookmark posts from Blog, News, Grammar, or
          Expressions to see them here.
        </p>
        <Link
          href="/blog"
          className="mt-4 inline-block text-sm font-medium text-primary underline hover:no-underline"
        >
          Go to Blog
        </Link>
      </div>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {list.map((item, i) => (
        <li key={`${item.scope}-${item.slug}-${i}`}>
          <div className="flex items-stretch gap-0 rounded-lg border border-border bg-card overflow-hidden">
            <Link
              href={bookmarkHref(item.scope, item.slug)}
              className="flex min-w-0 flex-1 items-center gap-3 text-foreground hover:bg-muted/30"
            >
              {item.imageThumb ? (
                <div className="text-[0px] relative h-16 w-24 shrink-0 bg-muted">
                  <Image
                    src={item.imageThumb}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="96px"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="cursor-pointer flex h-16 w-24 shrink-0 items-center justify-center bg-included-1 text-included-2">
                  <Bookmark className="size-6 fill-included-2" />
                </span>
              )}
              <div className="cursor-pointer min-w-0 flex-1 py-3 pr-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {scopeLabel(item.scope)}
                </span>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                  {item.title || item.slug}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={(e) => handleRemove(e, item.scope, item.slug)}
              className="shrink-0 border-l border-border px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              title="북마크 해제"
              aria-label="북마크 해제"
            >
              <BookmarkX className="size-5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
