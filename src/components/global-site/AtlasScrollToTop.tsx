"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Scroll to top on App Router navigations (atlas / getpronounce / sound / ja). */
export function AtlasScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    scrollWindowToTop();
    // Soft nav can restore scroll after paint — nudge once more.
    const id = window.requestAnimationFrame(() => scrollWindowToTop());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
