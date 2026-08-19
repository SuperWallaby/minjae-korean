/** Amazon Associates — textbook picks for kajakorean.com + global.kajakorean.com */

export const AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG?.trim() || "promoted02d-20";

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate, Kaja Korean earns from qualifying purchases.";

export type AmazonTextbook = {
  asin: string;
  title: string;
  subtitle: string;
  /** Local cover in /public (verified — Amazon CDN URLs often 404 or return placeholders). */
  coverSrc: string;
};

/** Curated Korean learner textbooks (main site). */
export const KOREAN_TEXTBOOKS: AmazonTextbook[] = [
  {
    asin: "B01LP9MBS8",
    title: "Talk To Me In Korean Level 1",
    subtitle: "Lessons + workbook for beginners",
    coverSrc: "/brand/textbooks/ttmik-1.jpg",
  },
  {
    asin: "B01FKU7Z9S",
    title: "Korean From Zero! 1",
    subtitle: "Hangul, grammar, and dialogues",
    coverSrc: "/brand/textbooks/kfz-amazon.jpg",
  },
  {
    asin: "0804844984",
    title: "Elementary Korean",
    subtitle: "Second edition · integrated skills",
    coverSrc: "/brand/textbooks/elementary-korean.jpg",
  },
];

/** Up to three beginner textbooks per global atlas language (fixed list — no rotation). */
export const GLOBAL_TEXTBOOKS_BY_LANG: Record<string, AmazonTextbook[]> = {
  es: [
    {
      asin: "0071463380",
      title: "Easy Spanish Step-by-Step",
      subtitle: "Grammar-led path for beginners",
      coverSrc: "/brand/textbooks/easy-spanish.jpg",
    },
    {
      asin: "0385410956",
      title: "Madrigal's Magic Key to Spanish",
      subtitle: "Creative approach · vocabulary + grammar",
      coverSrc: "/brand/textbooks/madrigal-spanish.jpg",
    },
    {
      asin: "0071763430",
      title: "Complete Spanish Grammar",
      subtitle: "Practice Makes Perfect · drills + review",
      coverSrc: "/brand/textbooks/pmp-spanish-grammar.jpg",
    },
  ],
  fr: [
    {
      asin: "0071453873",
      title: "Easy French Step-by-Step",
      subtitle: "High-frequency grammar for beginners",
      coverSrc: "/brand/textbooks/easy-french.jpg",
    },
    {
      asin: "007178781X",
      title: "Complete French Grammar",
      subtitle: "Practice Makes Perfect · workbook style",
      coverSrc: "/brand/textbooks/pmp-french-grammar.jpg",
    },
    {
      asin: "1400009626",
      title: "Ultimate French Beginner–Intermediate",
      subtitle: "Coursebook + audio · Living Language",
      coverSrc: "/brand/textbooks/ultimate-french-set.jpg",
    },
  ],
  de: [
    {
      asin: "0767918606",
      title: "German Made Simple",
      subtitle: "Learn to read, write, and speak",
      coverSrc: "/brand/textbooks/german-made-simple.jpg",
    },
    {
      asin: "0071824707",
      title: "Schaum's German Grammar",
      subtitle: "Outline + exercises for review",
      coverSrc: "/brand/textbooks/complete-german-grammar.jpg",
    },
    {
      asin: "159869989X",
      title: "The Everything Learning German Book",
      subtitle: "Beginner-friendly · conversation focus",
      coverSrc: "/brand/textbooks/everything-german.jpg",
    },
  ],
  it: [
    {
      asin: "0767915399",
      title: "Italian Made Simple",
      subtitle: "Revised · conversation + grammar",
      coverSrc: "/brand/textbooks/italian-made-simple.jpg",
    },
    {
      asin: "007145389X",
      title: "Easy Italian Step-by-Step",
      subtitle: "Building-block grammar for beginners",
      coverSrc: "/brand/textbooks/easy-italian.jpg",
    },
    {
      asin: "0071603670",
      title: "Complete Italian Grammar",
      subtitle: "Practice Makes Perfect · all levels",
      coverSrc: "/brand/textbooks/pmp-complete-italian-grammar.jpg",
    },
  ],
  ja: [
    {
      asin: "4789014401",
      title: "GENKI I",
      subtitle: "Integrated elementary Japanese",
      coverSrc: "/brand/textbooks/genki-1.jpg",
    },
    {
      asin: "0976998122",
      title: "Japanese from Zero! 1",
      subtitle: "Proven techniques · romaji + kana",
      coverSrc: "/brand/textbooks/japanese-from-zero-1.jpg",
    },
    {
      asin: "4883196038",
      title: "Minna no Nihongo I",
      subtitle: "Classic classroom beginner course",
      coverSrc: "/brand/textbooks/minna-nihongo-1.jpg",
    },
  ],
  ar: [
    {
      asin: "1589016327",
      title: "Alif Baa",
      subtitle: "Arabic letters and sounds · first step",
      coverSrc: "/brand/textbooks/alif-baa.jpg",
    },
    {
      asin: "1589017366",
      title: "Al-Kitaab Part One",
      subtitle: "Beginning Arabic · book + media",
      coverSrc: "/brand/textbooks/al-kitaab-1.jpg",
    },
    {
      asin: "0781813384",
      title: "Mastering Arabic 1",
      subtitle: "Modern Standard Arabic · third edition",
      coverSrc: "/brand/textbooks/book-placeholder.svg",
    },
  ],
};

export function amazonAffiliateUrl(asin: string): string {
  const url = new URL(`https://www.amazon.com/dp/${encodeURIComponent(asin)}`);
  url.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
  return url.toString();
}

export function textbookCoverSrc(book: AmazonTextbook): string {
  return book.coverSrc;
}

/** Fixed catalog for a language (not rotated). */
export function pickGlobalTextbooks(lang: string): AmazonTextbook[] {
  return GLOBAL_TEXTBOOKS_BY_LANG[lang] ?? [];
}

/** @deprecated Use pickGlobalTextbooks — returns the first pick only. */
export function pickGlobalTextbook(lang: string): AmazonTextbook | null {
  return pickGlobalTextbooks(lang)[0] ?? null;
}
