"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Bumped when onboarding copy changes (e.g. icon → tap sentence). */
const STORAGE_KEY = "minjae-news-reading-hint-seen-v2";

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

function isEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/news/article/new") return true;
  return /\/news\/article\/[^/]+\/edit$/.test(pathname);
}

export function NewsReadingHintBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (isEditorPath(pathname)) return;
    if (getSeen()) return;
    setVisible(true);
    const mq = window.matchMedia("(min-width: 640px)");
    setIsMobile(!mq.matches);
    const handler = () =>
      setIsMobile(!window.matchMedia("(min-width: 640px)").matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted, pathname]);

  const dismiss = React.useCallback(() => {
    setSeen();
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  const message =
    "한국어 문장이나 단락을 눌러 보면 번역·해설을 볼 수 있어요.";

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:hidden">
        <div
          className="absolute inset-0 bg-black/50"
          aria-hidden
          onClick={dismiss}
        />
        <div
          className="relative z-10 w-full max-w-[100vw] rounded-t-2xl border-t border-border bg-card p-4 pb-5 shadow-lg"
          role="dialog"
          aria-label="News reading tip"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-foreground">
              {message}
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

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-100 flex items-center justify-center gap-2",
        "bg-primary px-3 py-2 text-primary-foreground",
      )}
      role="status"
    >
      <p className="text-center text-xs font-medium">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 shrink-0 rounded-full p-0 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
        aria-label="Close"
        onClick={dismiss}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
