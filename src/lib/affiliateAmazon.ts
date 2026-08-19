/** Amazon Associates — textbook picks for kajakorean.com + global.kajakorean.com */

export const AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG?.trim() || "promoted02d-20";

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate, Kaja Korean earns from qualifying purchases.";

export type AmazonTextbook = {
  asin: string;
  title: string;
  subtitle: string;
};

/** Curated Korean learner textbooks (main site). */
export const KOREAN_TEXTBOOKS: AmazonTextbook[] = [
  {
    asin: "B005DQZ4BC",
    title: "Talk To Me In Korean Level 1",
    subtitle: "Lessons + workbook for beginners",
  },
  {
    asin: "B00X1XUR32",
    title: "Korean From Zero! 1",
    subtitle: "Hangul, grammar, and dialogues",
  },
  {
    asin: "B00B8XIX8K",
    title: "Elementary Korean",
    subtitle: "Second edition · integrated skills",
  },
];

/** One beginner textbook per global atlas language. */
export const GLOBAL_TEXTBOOKS_BY_LANG: Record<string, AmazonTextbook> = {
  es: {
    asin: "B002PXFYIS",
    title: "Easy Spanish Step-by-Step",
    subtitle: "Grammar-led path for beginners",
  },
  fr: {
    asin: "B07C8XQZ9L",
    title: "Easy French Step-by-Step",
    subtitle: "Third edition · clear grammar drills",
  },
  de: {
    asin: "B0037Z8JLK",
    title: "German Made Simple",
    subtitle: "Learn to read, write, and speak",
  },
  it: {
    asin: "0767918610",
    title: "Italian Made Simple",
    subtitle: "Revised · conversation + grammar",
  },
  ja: {
    asin: "B00E6LJGXY",
    title: "GENKI I",
    subtitle: "Integrated elementary Japanese",
  },
  ar: {
    asin: "B00HQ0QAJ8",
    title: "Al-Kitaab Part One",
    subtitle: "Arabic for beginners · book + media",
  },
};

export function amazonAffiliateUrl(asin: string): string {
  const url = new URL(`https://www.amazon.com/dp/${encodeURIComponent(asin)}`);
  url.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
  return url.toString();
}

export function amazonCoverImageUrl(asin: string, size = 160): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${encodeURIComponent(asin)}.01._SX${size}_.jpg`;
}

export function pickGlobalTextbook(lang: string): AmazonTextbook | null {
  return GLOBAL_TEXTBOOKS_BY_LANG[lang] ?? null;
}
