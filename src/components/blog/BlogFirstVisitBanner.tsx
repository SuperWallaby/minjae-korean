"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "minjae-blog-explanation-seen";

function getSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function setSeen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function BlogFirstVisitBanner() {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (getSeen()) return;
    setVisible(true);
    const mq = window.matchMedia("(min-width: 640px)");
    setIsMobile(!mq.matches);
    const handler = () => setIsMobile(!window.matchMedia("(min-width: 640px)").matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted]);

  const dismiss = React.useCallback(() => {
    setSeen();
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  // Mobile: popup with image slot + text
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:hidden">
        <div
          className="absolute inset-0 bg-black/50"
          aria-hidden
          onClick={dismiss}
        />
        <div
          className="relative z-10 w-full max-w-[100vw] rounded-t-2xl border-t border-border bg-card shadow-lg"
          role="dialog"
          aria-label="Blog tip"
        >
          {/* Image slot: replace with your image (e.g. <Image src="..." />) */}
          <div
            className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-2xl bg-muted/30"
            data-blog-popup-image
          >
            {/* Your image goes here */}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Click to view explanation.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 rounded-full p-0"
              aria-label="Close"
              onClick={dismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: fixed small ribbon at bottom of screen
  return (
    <button
      type="button"
      onClick={dismiss}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-center gap-2",
        "bg-primary py-2 text-center text-xs font-medium text-primary-foreground",
        "hover:opacity-95 active:opacity-90 transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      aria-label="Dismiss: Click to view explanation"
    >
      <span>Click to view explanation.</span>
      <X className="size-3.5 opacity-80" aria-hidden />
    </button>
  );
}
