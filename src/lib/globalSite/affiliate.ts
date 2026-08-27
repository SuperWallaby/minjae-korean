/** Affiliate + global.kajakorean.com helpers. */

export const GLOBAL_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_GLOBAL_SITE_ORIGIN?.trim() ||
  "https://getpronounce.net";

/** Preply Impact deep links by language taught (tutor subject). */
export const PREPLY_BY_LANG = {
  /** English tutors (eigopin / JA learners) */
  en: "https://preply.sjv.io/5kBBGb",
  /** Korean tutors (kajakorean.com) */
  ko: "https://preply.sjv.io/GbYYkn",
  ja: "https://preply.sjv.io/2RBBe0",
  ar: "https://preply.sjv.io/6kRR1Q",
  de: "https://preply.sjv.io/B5YY9B",
  fr: "https://preply.sjv.io/0GBB5O",
  es: "https://preply.sjv.io/bkggKg",
} as const;

export type PreplyLangCode = keyof typeof PREPLY_BY_LANG;

/** Fallback when lang unknown (e.g. Italian — no dedicated link yet). */
export const PREPLY_AFFILIATE_URL =
  process.env.PREPLY_AFFILIATE_URL?.trim() || PREPLY_BY_LANG.en;

export const ITALKI_AFFILIATE_URL =
  process.env.ITALKI_AFFILIATE_URL?.trim() ||
  "https://www.italki.com/en/affshare?ref=af33117569";

export type AffiliatePartner = "preply" | "italki";

/** Resolve Preply URL for a language / locale tag. */
export function preplyUrlForLang(lang?: string | null): string {
  const original = String(lang || "").trim().toLowerCase();
  if (!original) return PREPLY_AFFILIATE_URL;

  // Pin ids like 01_eye-colors__es (before underscore normalize)
  const fromId = original.match(/__([a-z]{2})(?:\.[a-z0-9]+)?$/);
  if (fromId?.[1] && fromId[1] in PREPLY_BY_LANG) {
    return PREPLY_BY_LANG[fromId[1] as PreplyLangCode];
  }

  const raw = original.replace(/_/g, "-");
  const primary = raw.split("-")[0] || "";
  // en-ja / en-us → English tutors
  if (primary === "en" || raw.startsWith("en-")) return PREPLY_BY_LANG.en;
  if (primary === "ko" || primary === "kr" || raw.includes("korean"))
    return PREPLY_BY_LANG.ko;
  if (primary === "ja" || raw.includes("japan")) return PREPLY_BY_LANG.ja;
  if (primary === "ar" || raw.includes("arab")) return PREPLY_BY_LANG.ar;
  if (primary === "de" || raw.includes("german")) return PREPLY_BY_LANG.de;
  if (primary === "fr" || raw.includes("french")) return PREPLY_BY_LANG.fr;
  if (primary === "es" || raw.includes("spanish")) return PREPLY_BY_LANG.es;

  return PREPLY_AFFILIATE_URL;
}

export function buildAffiliateDestination(opts: {
  partner: AffiliatePartner;
  lang?: string;
  pinId?: string;
  campaign?: string;
  source?: string;
}): string {
  const base =
    opts.partner === "italki"
      ? ITALKI_AFFILIATE_URL
      : preplyUrlForLang(opts.lang);
  try {
    const u = new URL(base);
    u.searchParams.set("utm_source", opts.source || "global_kajakorean");
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
