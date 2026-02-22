"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type StudentReview = {
  quote: string;
  meta: string;
};

export interface ReviewsScrollerHandle {
  scrollBy: (dir: -1 | 1) => void;
}

export const ReviewsScroller = React.forwardRef<
  ReviewsScrollerHandle,
  {
    items: StudentReview[];
    className?: string;
  }
>(({ items, className }, ref) => {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateCurtains = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft > 4;
    const right = max > 4 && el.scrollLeft < max - 4;
    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  React.useEffect(() => {
    updateCurtains();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateCurtains();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateCurtains, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateCurtains);
    };
  }, [updateCurtains, items.length]);

  React.useImperativeHandle(ref, () => ({
    scrollBy: (dir: -1 | 1) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({ left: dir * 360, behavior: "smooth" });
    },
  }));

  const hashToIndex = (s: string, mod: number) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % mod;
  };

  const initialsFrom = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return "S";

    // Hangul: use first 1–2 characters for a natural look
    const hangul = trimmed.match(/[가-힣]/g);
    if (hangul?.length) return hangul.slice(0, 2).join("");

    // Latin/number: first letters of up to 2 words
    const words = trimmed
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const initials = words
      .slice(0, 2)
      .map((w) => (w[0] ?? "").toUpperCase())
      .join("");

    return initials || trimmed.slice(0, 2).toUpperCase();
  };

  const avatarBgFromSeed = (seed: string) => {
    const palette = [
      "bg-[color:var(--included-1)]",
      "bg-[color:var(--included-2)]",
      "bg-[color:var(--included-3)]",
      "bg-[color:var(--included-4)]",
    ];
    return palette[hashToIndex(seed, palette.length)];
  };

  return (
    <div
      className={cn("relative w-full max-w-full overflow-hidden", className)}
    >
      <div className="relative">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,var(--bg-canvas),transparent)] transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,var(--bg-canvas),transparent)] transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={scrollerRef}
          className="flex max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-4 pl-4 sm:pl-0 sm:pr-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((r) => (
            <div
              key={r.quote}
              className={cn(
                "relative flex min-h-[280px] w-[calc(100vw-2rem)] max-w-[420px] shrink-0 snap-start flex-col overflow-hidden rounded-[36px] bg-white p-6 sm:w-[340px]",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute left-6 top-4 font-serif text-5xl leading-none opacity-20",
                )}
              >
                “
              </div>
              <div className="min-h-0 flex-1 pt-9 text-lg leading-snug text-foreground">
                {r.quote}
              </div>

              <div className="mt-auto flex shrink-0 items-center gap-3 pt-6">
                <div
                  className={cn(
                    "grid size-10 place-items-center overflow-hidden rounded-full ",
                    avatarBgFromSeed(`${r.meta}|${r.quote}`),
                  )}
                >
                  <span className="text-xs font-semibold tracking-wide text-foreground/70">
                    {initialsFrom(r.meta)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.meta}</div>
                  {/* <div className="text-xs text-muted-foreground">{r.meta}</div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
});

ReviewsScroller.displayName = "ReviewsScroller";
