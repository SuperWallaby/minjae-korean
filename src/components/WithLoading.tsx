"use client";

import * as React from "react";

type Props = {
  loading: boolean;
  /**
   * Minimum time (ms) to keep showing the fallback once it becomes visible.
   * Prevents fast flicker when loading toggles quickly.
   */
  minMs?: number;
  /**
   * Optional delay (ms) before showing fallback at all.
   * Useful to avoid showing a loader for extremely fast responses.
   */
  delayMs?: number;
  fallback: React.ReactNode;
  children: React.ReactNode;
};

export function WithLoading({
  loading,
  minMs = 250,
  delayMs = 0,
  fallback,
  children,
}: Props) {
  const [show, setShow] = React.useState(false);
  const shownAtRef = React.useRef<number | null>(null);
  const delayTimerRef = React.useRef<number | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const clearDelay = () => {
      if (delayTimerRef.current != null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
    const clearHide = () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (loading) {
      clearHide();
      if (show) return;
      if (delayMs > 0) {
        clearDelay();
        delayTimerRef.current = window.setTimeout(() => {
          shownAtRef.current = Date.now();
          setShow(true);
        }, delayMs);
      } else {
        shownAtRef.current = Date.now();
        setShow(true);
      }
      return;
    }

    // loading === false
    clearDelay();
    if (!show) return;

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const remaining = Math.max(0, minMs - elapsed);
    clearHide();
    if (remaining === 0) {
      shownAtRef.current = null;
      setShow(false);
    } else {
      hideTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = null;
        setShow(false);
      }, remaining);
    }

    return () => {
      clearDelay();
      clearHide();
    };
  }, [loading, delayMs, minMs, show]);

  if (show) return <>{fallback}</>;
  return <>{children}</>;
}

