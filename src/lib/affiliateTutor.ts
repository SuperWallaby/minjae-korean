export type AffiliateTutorPartner = "italki" | "preply";

export const ITALKI_AFFILIATE_URL =
  "https://www.italki.com/en/affshare?ref=af33117569";

export const PREPLY_AFFILIATE_URL =
  "https://preply.sjv.io/c/7574725/1987575/24422";

export const AFFILIATE_TUTOR_SESSION_KEY = "kaja-affiliate-tutor-partner";

const PARTNERS = {
  italki: {
    id: "italki" as const,
    href: ITALKI_AFFILIATE_URL,
    square: {
      src: "/brand/italki-tutor-square.webp",
      width: 1024,
      height: 1024,
    },
    wide: {
      src: "/brand/italki-tutor-wide.webp",
      width: 1536,
      height: 1024,
    },
    alt: "Find my Korean tutor — $10 OFF on 1:1 Korean lessons",
  },
  preply: {
    id: "preply" as const,
    href: PREPLY_AFFILIATE_URL,
    // Preply creative is square-only for now.
    square: {
      src: "/brand/preply-tutor-square.webp",
      width: 1024,
      height: 1024,
    },
    wide: {
      src: "/brand/preply-tutor-square.webp",
      width: 1024,
      height: 1024,
    },
    alt: "Find my Korean tutor — 50% off link on 1:1 Korean lessons",
  },
} as const;

export function getAffiliateTutorCreative(partner: AffiliateTutorPartner) {
  return PARTNERS[partner];
}

/** Stable 50/50 pick for the browser session. */
export function pickAffiliateTutorPartner(): AffiliateTutorPartner {
  try {
    const existing = sessionStorage.getItem(AFFILIATE_TUTOR_SESSION_KEY);
    if (existing === "italki" || existing === "preply") return existing;
    const next: AffiliateTutorPartner = Math.random() < 0.5 ? "italki" : "preply";
    sessionStorage.setItem(AFFILIATE_TUTOR_SESSION_KEY, next);
    return next;
  } catch {
    return Math.random() < 0.5 ? "italki" : "preply";
  }
}
