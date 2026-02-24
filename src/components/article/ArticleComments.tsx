"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

type Comment = {
  id: string;
  authorName: string;
  authorId?: string;
  text: string;
  createdAt: string;
};

type Props = {
  scope: "blog" | "news" | "grammar" | "expressions";
  slug: string;
  onCommentAdded?: () => void;
  /** When true, the comment icon button is hidden (e.g. when ArticleActionBar is used above). */
  hideCommentButton?: boolean;
};

function commentPagePath(scope: string, slug: string): string {
  if (scope === "blog" || scope === "news") return `/${scope}/article/${slug}`;
  return `/${scope}/${slug}`;
}

export const ArticleComments = React.forwardRef<
  { openForm: () => void },
  Props
>(function ArticleComments({ scope, slug, onCommentAdded, hideCommentButton }, ref) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<{ name: string; id: string } | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  React.useImperativeHandle(ref, () => ({
    openForm() {
      setOpen(true);
    },
  }));
  const [text, setText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(
        `/api/public/comments?scope=${encodeURIComponent(scope)}&slug=${encodeURIComponent(slug)}`,
      );
      const json = await res.json().catch(() => ({}));
      if (json?.ok && Array.isArray(json.comments)) {
        setComments(json.comments);
      }
    } finally {
      setLoading(false);
    }
  }, [scope, slug]);

  React.useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.user) setUser({ name: json.user.name ?? "Member", id: json.user.id ?? "" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.text);
  };
  const handleEditSave = async () => {
    if (!editingId || !editText.trim()) return;
    const res = await fetch(`/api/public/comments/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: editText.trim() }),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.ok) {
      setEditingId(null);
      setEditText("");
      await fetchComments();
      onCommentAdded?.();
    }
  };
  const handleDelete = async (commentId: string) => {
    if (!commentId || deletingId) return;
    setDeletingId(commentId);
    const res = await fetch(`/api/public/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    setDeletingId(null);
    if (json?.ok) {
      await fetchComments();
      onCommentAdded?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scope, slug, text: text.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok) {
        setText("");
        setOpen(false);
        await fetchComments();
        onCommentAdded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-10 flex justify-end">
        <span className="inline-flex size-8 items-center justify-center text-muted-foreground/50">
          <MessageCircle className="size-4" />
        </span>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {comments.length > 0 && (
        <div className="mb-4 border-t border-border pt-6">
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-medium text-foreground">{c.authorName}</span>
                  <span className="text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {user?.id && c.authorId === user.id && editingId !== c.id && (
                    <span className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-50"
                      >
                        {deletingId === c.id ? "…" : "Delete"}
                      </button>
                    </span>
                  )}
                </div>
                {editingId === c.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-border px-2 py-1.5 text-sm"
                      autoFocus
                    />
                    <span className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setEditText(""); }}
                        className="text-xs text-muted-foreground underline"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditSave}
                        className="text-xs font-medium text-primary"
                      >
                        Save
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-foreground/90">{c.text}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popup-style comment form when opened from action bar */}
      {open && hideCommentButton ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Write a comment"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-(--shadow-modal)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-foreground">Add a comment</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {user ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="min-h-[80px] w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={submitting}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submitting ? "…" : "Post"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link
                  href={`/login?next=${encodeURIComponent(commentPagePath(scope, slug))}`}
                  className="underline hover:text-foreground"
                >
                  Sign in
                </Link>
                {" to comment."}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {(open || !hideCommentButton) && !(open && hideCommentButton) && (
        <div className="flex items-center justify-end gap-2">
          {open && (
            <form
              onSubmit={handleSubmit}
              className="mr-2 flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-end"
            >
              {user ? (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="min-h-[60px] flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={submitting}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!text.trim() || submitting}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {submitting ? "…" : "Post"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link href={`/login?next=${encodeURIComponent(commentPagePath(scope, slug))}`} className="underline hover:text-foreground">
                    Sign in
                  </Link>
                  {" to comment."}
                </p>
              )}
            </form>
          )}
          {!hideCommentButton && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              title="Comment"
              aria-label="Comment"
            >
              <MessageCircle className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});
