/** Affiliate + global.kajakorean.com helpers. */

export const GLOBAL_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_GLOBAL_SITE_ORIGIN?.trim() ||
  "https://global.kajakorean.com";

export const PREPLY_AFFILIATE_URL =
  process.env.PREPLY_AFFILIATE_URL?.trim() ||
  "https://preply.sjv.io/c/7574725/1987575/24422";

export const ITALKI_AFFILIATE_URL =
  process.env.ITALKI_AFFILIATE_URL?.trim() ||
  "https://www.italki.com/en/affshare?ref=af33117569";

export type AffiliatePartner = "preply" | "italki";

export function buildAffiliateDestination(opts: {
  partner: AffiliatePartner;
  lang?: string;
  pinId?: string;
  campaign?: string;
}): string {
  const base =
    opts.partner === "italki" ? ITALKI_AFFILIATE_URL : PREPLY_AFFILIATE_URL;
  try {
    const u = new URL(base);
    u.searchParams.set("utm_source", "global_kajakorean");
    u.searchParams.set("utm_medium", "affiliate_redirect");
    u.searchParams.set(
      "utm_campaign",
      opts.campaign || "global-pin-cta",
    );
    if (opts.lang) u.searchParams.set("utm_content", opts.lang);
    if (opts.pinId) u.searchParams.set("utm_term", opts.pinId);
    return u.toString();
  } catch {
    return base;
  }
}

export function globalPinPath(id: string): string {
  return `/pin/${encodeURIComponent(id)}`;
}

export function globalLangPath(code: string): string {
  return `/lang/${encodeURIComponent(code)}`;
}

export function globalGoPath(
  partner: AffiliatePartner,
  q?: { lang?: string; pin?: string },
): string {
  const params = new URLSearchParams();
  if (q?.lang) params.set("lang", q.lang);
  if (q?.pin) params.set("pin", q.pin);
  const qs = params.toString();
  return `/go/${partner}${qs ? `?${qs}` : ""}`;
}
