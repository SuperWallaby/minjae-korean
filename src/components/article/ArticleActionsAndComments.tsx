"use client";

import * as React from "react";
import type { ActionBarScope } from "@/components/article/ArticleActionBar";
import { ArticleActionBar } from "@/components/article/ArticleActionBar";
import { ArticleComments } from "@/components/article/ArticleComments";

type Props = {
  scope: ActionBarScope;
  slug: string;
  shareUrl: string;
  shareTitle?: string;
};

export function ArticleActionsAndComments({
  scope,
  slug,
  shareUrl,
  shareTitle,
}: Props) {
  const [data, setData] = React.useState<{
    likeCount: number;
    liked: boolean;
    bookmarked: boolean;
    commentCount: number;
  } | null>(null);
  const commentsRef = React.useRef<{ openForm: () => void }>(null);

  const fetchActions = React.useCallback(async () => {
    try {
      const res = await fetch(
        `/api/public/article-actions?scope=${encodeURIComponent(scope)}&slug=${encodeURIComponent(slug)}`,
      );
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        setData({
          likeCount: json.likeCount ?? 0,
          liked: !!json.liked,
          bookmarked: !!json.bookmarked,
          commentCount: json.commentCount ?? 0,
        });
      }
    } catch {
      // ignore
    }
  }, [scope, slug]);

  React.useEffect(() => {
    void fetchActions();
  }, [fetchActions]);

  if (data === null) {
    return null;
  }

  return (
    <div className="mt-10">
      <ArticleActionBar
        scope={scope}
        slug={slug}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
        commentCount={data.commentCount}
        likeCount={data.likeCount}
        liked={data.liked}
        bookmarked={data.bookmarked}
        onCommentClick={() => commentsRef.current?.openForm()}
      />
      <ArticleComments
        ref={commentsRef}
        scope={scope}
        slug={slug}
        onCommentAdded={fetchActions}
        hideCommentButton
      />
    </div>
  );
}
