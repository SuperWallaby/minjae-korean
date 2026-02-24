"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

/**
 * Shows a bookmark link icon when the user has one or more saved bookmarks.
 * Use in the article header and in the site navigation.
 */
export function BookmarkNavIcon() {
  const [count, setCount] = React.useState<number | null>(null);

  const fetchCount = React.useCallback(() => {
    fetch("/api/public/article-actions/bookmarks", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json.bookmarks)) {
          setCount(json.bookmarks.length);
        } else {
          setCount(0);
        }
      })
      .catch(() => setCount(0));
  }, []);

  React.useEffect(() => {
    fetchCount();
    const onChanged = () => fetchCount();
    window.addEventListener("bookmarks-changed", onChanged);
    return () => window.removeEventListener("bookmarks-changed", onChanged);
  }, [fetchCount]);

  if (count === null || count === 0) return null;

  return (
    <Link
      href="/bookmarks"
      className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted/50 hover:text-included-2-foreground"
      title="Saved articles"
      aria-label={`${count} saved article${count !== 1 ? "s" : ""}`}
    >
      <Bookmark className="size-5 fill-included-2 text-included-2" />
    </Link>
  );
}
