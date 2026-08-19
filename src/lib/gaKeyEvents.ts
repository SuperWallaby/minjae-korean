/**
 * GA4 key events for Kaja conversion reporting.
 * Measurement ID: G-9D5H1C2BSP (NEXT_PUBLIC_GA_ID).
 *
 * Manual one-time setup (GA4 Admin → Events):
 * 1. Deploy event instrumentation.
 * 2. Trigger a test affiliate click and newsletter subscribe.
 * 3. Mark these event names as Key events.
 */
export const GA_MEASUREMENT_ID_DEFAULT = "G-9D5H1C2BSP";

export const GA_KEY_EVENTS = [
  {
    name: "affiliate_click",
    description: "italki / Preply / Amazon / 1:1 affiliate CTA click",
    params: ["partner", "placement", "page_path", "pin_id", "lang", "asin"],
  },
  {
    name: "newsletter_subscribe",
    description: "Email newsletter subscribe success",
    params: ["source"],
  },
] as const;
