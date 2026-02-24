"use client";

import * as React from "react";
import {
  MessageCircle,
  Bookmark,
  Share2,
  HandMetal,
  Link2,
} from "lucide-react";
import {
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

export type ActionBarScope = "blog" | "news" | "grammar" | "expressions";

type Props = {
  scope: ActionBarScope;
  slug: string;
  shareUrl: string;
  shareTitle?: string;
  commentCount: number;
  likeCount: number;
  liked: boolean;
  bookmarked: boolean;
  onCommentClick: () => void;
  disabled?: boolean;
};

function shareLinks(url: string) {
  const encoded = encodeURIComponent(url);
  return [
    { id: "copy", label: "Copy link", href: "#", isCopy: true, Icon: Link2 },
    {
      id: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encoded}`,
      Icon: FaXTwitter,
    },
    {
      id: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      Icon: FaFacebookF,
    },
    {
      id: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      Icon: FaLinkedinIn,
    },
  ];
}

export function ArticleActionBar({
  scope,
  slug,
  shareUrl,
  shareTitle = "",
  commentCount,
  likeCount,
  liked,
  bookmarked,
  onCommentClick,
  disabled,
}: Props) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [likeCountState, setLikeCountState] = React.useState(likeCount);
  const [likedState, setLikedState] = React.useState(liked);
  const [bookmarkedState, setBookmarkedState] = React.useState(bookmarked);
  const [likeAnimating, setLikeAnimating] = React.useState(false);
  const [clapPending, setClapPending] = React.useState(false);
  const [likePending, setLikePending] = React.useState(false);
  const [bookmarkPending, setBookmarkPending] = React.useState(false);
  const shareRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setLikeCountState(likeCount);
    setLikedState(liked);
    setBookmarkedState(bookmarked);
  }, [likeCount, liked, bookmarked]);

  React.useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [shareOpen]);

  const _handleClap = async () => {
    if (clapPending || disabled) return;
    setClapPending(true);
    try {
      await fetch("/api/public/article-actions/clap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug }),
      });
    } finally {
      setClapPending(false);
    }
  };

  const handleLike = async () => {
    if (likePending || disabled) return;
    setLikePending(true);
    try {
      const res = await fetch("/api/public/article-actions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        const newLiked = json.liked;
        setLikedState(newLiked);
        setLikeCountState(
          json.likeCount ?? likeCountState + (newLiked ? 1 : -1),
        );
        if (newLiked) {
          setLikeAnimating(true);
          setTimeout(() => setLikeAnimating(false), 500);
        }
      }
    } finally {
      setLikePending(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkPending || disabled) return;
    setBookmarkPending(true);
    try {
      const res = await fetch("/api/public/article-actions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        setBookmarkedState(json.bookmarked);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bookmarks-changed"));
        }
      }
    } finally {
      setBookmarkPending(false);
    }
  };

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle || document.title,
          url: shareUrl,
          text: shareTitle || undefined,
        });
        setShareOpen(false);
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setShareOpen((o) => !o);
  };

  const handleShareItem = (
    e: React.MouseEvent,
    item: { id: string; label: string; href: string; isCopy?: boolean },
  ) => {
    e.preventDefault();
    if (item.isCopy) {
      void navigator.clipboard
        .writeText(shareUrl)
        .then(() => setShareOpen(false));
      return;
    }
    window.open(
      item.href,
      "_blank",
      "noopener,noreferrer,width=600,height=400",
    );
    setShareOpen(false);
  };

  const links = shareLinks(shareUrl);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 ">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={likePending || disabled}
          className="inline-flex items-center gap-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50 data-[active=true]:text-included-2 data-[active=true]:hover:text-included-2"
          title="좋아요"
          aria-label="좋아요"
          data-active={likedState}
        >
          <span
            className={
              likeAnimating ? "animate-like-pop inline-block" : "inline-block"
            }
          >
            <HandMetal
              className="size-5"
              style={likedState ? { fill: "currentColor" } : undefined}
            />
          </span>
          {likeCountState > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-included-1 px-1.5 text-xs font-medium tabular-nums text-included-2-foreground">
              {likeCountState}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onCommentClick}
          className="inline-flex items-center gap-1.5 rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          title="댓글"
          aria-label="댓글"
        >
          <MessageCircle className="size-5" />
          {commentCount > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-included-1 px-1.5 text-xs font-medium tabular-nums text-included-2-foreground">
              {commentCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkPending || disabled}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50 data-[active=true]:text-included-2 data-[active=true]:hover:text-included-2"
          title="북마크"
          aria-label="북마크"
          data-active={bookmarkedState}
        >
          <Bookmark
            className="size-5"
            fill={bookmarkedState ? "currentColor" : "none"}
          />
        </button>

        <div className="relative" ref={shareRef}>
          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="공유하기"
            aria-label="공유하기"
            aria-expanded={shareOpen}
          >
            <Share2 className="size-5" />
          </button>
          {shareOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-popover py-1 shadow-md">
              <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-border bg-popover" />
              {links.map((item) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => handleShareItem(e, item)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted/50"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
