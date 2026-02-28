"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PinButtonProps = {
  slug: string;
  pinned: boolean;
  type: "news" | "blog";
  className?: string;
};

export function PinButton({ slug, pinned, type, className }: PinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const next = !pinned;
      if (type === "news") {
        const res = await fetch(
          `/api/admin/articles/${encodeURIComponent(slug)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pinned: next }),
          },
        );
        if (!res.ok) return;
      } else {
        const res = await fetch("/api/blog/overrides", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, pinned: next }),
        });
        if (!res.ok) return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={pinned ? "핀 해제" : "상단 고정"}
      className={cn(
        "absolute right-2 top-2 z-10 rounded-full p-2 transition-colors",
        "bg-black/50 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        pinned && "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      aria-label={pinned ? "핀 해제" : "상단 고정"}
    >
      <PinIcon className={cn("size-5", pinned && "rotate-0")} strokeWidth={2} />
    </button>
  );
}
