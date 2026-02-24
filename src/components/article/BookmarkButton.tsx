"use client";

import * as React from "react";
import { Bookmark } from "lucide-react";

type Props = {
  scope: string;
  slug: string;
  className?: string;
};

export function BookmarkButton({ scope, slug, className = "" }: Props) {
  const [bookmarked, setBookmarked] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const fetchState = React.useCallback(async () => {
    const res = await fetch(
      `/api/public/article-actions?scope=${encodeURIComponent(scope)}&slug=${encodeURIComponent(slug)}`,
      { credentials: "include" },
    );
    const json = await res.json().catch(() => ({}));
    if (json?.ok) setBookmarked(!!json.bookmarked);
    setLoaded(true);
  }, [scope, slug]);

  React.useEffect(() => {
    fetchState();
  }, [fetchState]);

  React.useEffect(() => {
    const onChanged = () => fetchState();
    window.addEventListener("bookmarks-changed", onChanged);
    return () => window.removeEventListener("bookmarks-changed", onChanged);
  }, [fetchState]);

  const handleClick = async () => {
    if (pending || !loaded) return;
    setPending(true);
    try {
      const res = await fetch("/api/public/article-actions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        setBookmarked(json.bookmarked);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bookmarks-changed"));
        }
      }
    } finally {
      setPending(false);
    }
  };

  if (!loaded) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50 data-[active=true]:text-included-2 data-[active=true]:hover:text-included-2 ${className}`}
      title="북마크"
      aria-label={bookmarked ? "북마크 해제" : "북마크"}
      data-active={bookmarked}
    >
      <Bookmark
        className="size-5"
        fill={bookmarked ? "currentColor" : "none"}
      />
    </button>
  );
}
