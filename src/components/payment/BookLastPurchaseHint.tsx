"use client";

import * as React from "react";
import Link from "next/link";

import {
  LAST_STRIPE_PURCHASE_STORAGE_KEY,
  type LastStripePurchaseStored,
} from "@/lib/stripePurchase";

/**
 * If this browser saved a recent book checkout session, show a shortcut back to
 * `/payment/success?session_id=…` (same flow as after payment).
 */
export function BookLastPurchaseHint() {
  const [href, setHref] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_STRIPE_PURCHASE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      const p =
        parsed && typeof parsed === "object"
          ? (parsed as LastStripePurchaseStored)
          : null;
      if (!p?.sessionId || p.product !== "book_launch") return;
      setHref(
        `/payment/success?session_id=${encodeURIComponent(p.sessionId)}`,
      );
    } catch {
      // ignore
    }
  }, []);

  if (!href) return null;

  return (
    <div className="mb-5 rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        This device has a recent book purchase.{" "}
      </span>
      <Link
        href={href}
        className="font-medium text-primary underline underline-offset-2 hover:text-foreground"
      >
        Open the download page
      </Link>
    </div>
  );
}
