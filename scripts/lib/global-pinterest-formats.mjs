/**
 * Global Pinterest format policy (affiliate-only destinations).
 *
 * EN / kajakorean SEO boards keep their own rules (site + mixed affiliate).
 * Global boards have NO multilingual landing pages → link = Preply/italki only.
 * Formats that are “click to read the article / app lesson / SEO page” are out.
 *
 * Footer: no kajakorean.com logo — tutor CTA + discount instead.
 *
 *   import {
 *     GLOBAL_AFFILIATE_OK,
 *     GLOBAL_AFFILIATE_NO,
 *     globalPinEligibility,
 *     affiliateFooterCopy,
 *   } from "./lib/global-pinterest-formats.mjs";
 */

/** Self-contained learning pins — OK with tutor affiliate CTA. */
export const GLOBAL_AFFILIATE_OK = Object.freeze([
  // AVK quiz / video lesson cards (value is on the pin itself)
  "object_quiz",
  "format8",
  "expression_quiz",
  "expression_quiz_en_first",
  "multiple_choice",
  "wrong_correct",
  "native_contrast",
  "formality_pair",
  "common_responses",
  "situational_blank",
  "word_quick",
  "verb_ending",
  "flashcard",
  "expression_read",
  "focused_sequence",
  // Vocab infographic catalog (localized gloss on image)
  "super_list",
  "grid_cluster",
  "antonym_split",
  "similar_split",
  "concept_rows",
  "phrase_stack",
  "topik_upgrade",
  "quiz_comment",
  "cute_cast",
  "hanja_hub",
  "pronunciation_grid",
  "grammar_spotlight",
  "compound_word",
  "phrase_square",
  // Single-word quiz card — OK if image has no site/app “read more” CTA
  // (EN quiz_word_pin currently stamps kajakorean.com; global needs a CTA-free variant)
  "quiz_word_pin",
]);

/**
 * Needs a real destination page (article, app lesson, SEO hub).
 * Do NOT upload these to global affiliate boards.
 */
export const GLOBAL_AFFILIATE_NO = Object.freeze([
  "blog_promo",
  "news_promo",
  "longform_vocab_lesson", // app-style longform quiz×3 + promo footer
  "top5_list",
  "phrase_chart",
  "sheet",
  "collage",
  "grid_highlight", // format4 catalog / SEO sheet energy
  "format4",
  "ig_list", // Instagram list SEO carousel → site
  "content_promo", // umbrella for blog/news promo
]);

const OK = new Set(GLOBAL_AFFILIATE_OK);
const NO = new Set(GLOBAL_AFFILIATE_NO);

/**
 * @param {string} formatOrKind
 * @returns {"ok" | "no" | "unknown"}
 */
export function globalPinEligibility(formatOrKind) {
  const key = String(formatOrKind || "")
    .trim()
    .toLowerCase();
  if (!key) return "unknown";
  if (NO.has(key)) return "no";
  if (OK.has(key)) return "ok";
  // loose aliases
  if (key === "f8" || key.startsWith("format8")) return "ok";
  if (key === "f4" || key.startsWith("format4")) return "no";
  if (key === "blog" || key === "news") return "no";
  if (key.includes("longform") || key.includes("blog_promo") || key.includes("news_promo")) {
    return "no";
  }
  return "unknown";
}

export function assertGlobalAffiliateFormat(formatOrKind) {
  const el = globalPinEligibility(formatOrKind);
  if (el === "no") {
    throw new Error(
      `format "${formatOrKind}" needs a site/app page — blocked for global affiliate pins`,
    );
  }
  if (el === "unknown") {
    throw new Error(
      `format "${formatOrKind}" not classified for global pins — add to GLOBAL_AFFILIATE_OK/NO`,
    );
  }
}

/**
 * On-image footer for global pins that teach TARGET lang via English UI.
 *
 * Offers (must match destination URL):
 *   Preply → 50% off first lesson
 *   italki → $10 off
 *
 * Single-line CTA (no em dash).
 *
 * @param {string} langCode es|fr|de|ar|it|ja|…
 * @param {string} [langName]
 * @param {{ partner?: "preply" | "italki" }} [opts]
 * @returns {{ line1: string, line2: string, partner: string }}
 */
export function affiliateFooterCopyTeachLang(
  langCode,
  langName = "",
  opts = {},
) {
  const code = String(langCode || "")
    .trim()
    .toLowerCase();
  const nameByCode = {
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    ar: "Arabic",
    pt: "Portuguese",
    en: "English",
  };
  const name = String(langName || nameByCode[code] || "language").trim();
  const partner =
    String(opts.partner || "preply")
      .trim()
      .toLowerCase() === "italki"
      ? "italki"
      : "preply";
  const offer =
    partner === "italki" ? "$10 off link below" : "50% off link below";
  return {
    partner,
    // Single line; "|||" splits so compositor can color only the offer.
    line1: `Book a ${name} tutor|||${offer}`,
    line2: "",
  };
}

/**
 * @deprecated Wrong product for global teach-lang pins (Korean tutor CTA).
 * Kept for vault recomposes of Korean-for-L2 pins only.
 */
export function affiliateFooterCopy(langCode) {
  const code = String(langCode || "")
    .trim()
    .toLowerCase();
  const table = {
    es: {
      line1: "Encuentra tu tutor de coreano",
      line2: "$10 de descuento en tu primera clase",
    },
    fr: {
      line1: "Trouve ton professeur de coréen",
      line2: "10 $ de réduction sur ta 1re leçon",
    },
    de: {
      line1: "Finde deinen Koreanisch-Tutor",
      line2: "10 $ Rabatt auf die erste Stunde",
    },
    it: {
      line1: "Trova il tuo tutor di coreano",
      line2: "10 $ di sconto sulla prima lezione",
    },
    ja: {
      line1: "韓国語の先生を見つけよう",
      line2: "初回レッスン $10 OFF",
    },
    ar: {
      line1: "اعثر على معلمك للكورية",
      line2: "خصم 10$ على أول درس",
      rtl: true,
    },
    en: {
      line1: "Find your Korean tutor",
      line2: "$10 off your first lesson",
    },
    pt: {
      line1: "Encontre seu tutor de coreano",
      line2: "$10 de desconto na 1ª aula",
    },
  };
  return table[code] || table.en;
}
