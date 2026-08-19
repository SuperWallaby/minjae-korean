import { shouldExcludeFromGaClient } from "@/lib/gaExclusion";

/**
 * Conversion events for Kaja (measurement ID G-9D5H1C2BSP).
 *
 * After deploy, in GA4 Admin → Events → mark as Key events:
 * - affiliate_click (partner, placement, page_path, pin_id?, lang?)
 * - newsletter_subscribe (source)
 *
 * Daily SEO automation should prioritize these over raw traffic.
 */

export type GaEventParams = Record<
  string,
  string | number | boolean | undefined | null
>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function canTrack(): boolean {
  if (typeof window === "undefined") return false;
  if (shouldExcludeFromGaClient(window.location.hostname)) return false;
  return typeof window.gtag === "function";
}

/** Fire a GA4 event via gtag. SSR-safe no-op when unavailable or opted out. */
export function trackGaEvent(name: string, params?: GaEventParams): void {
  if (!name || !canTrack()) return;
  const cleaned: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      cleaned[key] = value;
    }
  }
  window.gtag?.("event", name, cleaned);
}

export function trackAffiliateClick(opts: {
  partner: string;
  placement: string;
  pinId?: string;
  lang?: string;
  asin?: string;
}): void {
  trackGaEvent("affiliate_click", {
    partner: opts.partner,
    placement: opts.placement,
    page_path:
      typeof window !== "undefined" ? window.location.pathname : undefined,
    pin_id: opts.pinId,
    lang: opts.lang,
    asin: opts.asin,
  });
}

export function trackNewsletterSubscribe(source: string): void {
  trackGaEvent("newsletter_subscribe", { source });
}
