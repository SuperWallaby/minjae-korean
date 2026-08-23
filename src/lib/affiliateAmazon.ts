/** Amazon Associates — textbook picks for kajakorean.com + global.kajakorean.com */

export const AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG?.trim() || "promoted02d-20";

export const AMAZON_JP_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_JP_AFFILIATE_TAG?.trim() || "eigopin-22";

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate, Kaja Korean earns from qualifying purchases.";

export const AMAZON_ASSOCIATE_DISCLOSURE_JA =
  "Amazonアソシエイトとして、EigoChartは適格な購入から収益を得ています。";

export type AmazonTextbook = {
  asin: string;
  title: string;
  subtitle: string;
  /** Local cover in /public (verified — Amazon CDN URLs often 404 or return placeholders). */
  coverSrc: string;
  /** JP books for EigoChart use amazon.co.jp + JP associate tag. */
  marketplace?: "com" | "jp";
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

/** Beginner textbooks per global atlas language (fixed list — no rotation). */
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
    {
      asin: "0071841857",
      title: "Spanish Verb Tenses",
      subtitle: "Practice Makes Perfect · conjugation drills",
      coverSrc: "/brand/textbooks/pmp-spanish-verbs.jpg",
    },
    {
      asin: "111802382X",
      title: "Spanish For Dummies",
      subtitle: "Conversation + grammar for beginners",
      coverSrc: "/brand/textbooks/spanish-for-dummies.jpg",
    },
    {
      asin: "1259584194",
      title: "Easy Spanish Reader",
      subtitle: "Graded stories · build reading fluency",
      coverSrc: "/brand/textbooks/easy-spanish-reader.jpg",
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
    {
      asin: "0071841881",
      title: "French Verb Tenses",
      subtitle: "Practice Makes Perfect · conjugation drills",
      coverSrc: "/brand/textbooks/pmp-french-verbs.jpg",
    },
    {
      asin: "1118004647",
      title: "French For Dummies",
      subtitle: "Conversation + grammar for beginners",
      coverSrc: "/brand/textbooks/french-for-dummies.jpg",
    },
    {
      asin: "1259862593",
      title: "Easy French Reader",
      subtitle: "Graded stories · build reading fluency",
      coverSrc: "/brand/textbooks/easy-french-reader.jpg",
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
    {
      asin: "007148499X",
      title: "Easy German Step-by-Step",
      subtitle: "Grammar-led path for beginners",
      coverSrc: "/brand/textbooks/easy-german.jpg",
    },
    {
      asin: "1118281047",
      title: "German For Dummies",
      subtitle: "Conversation + grammar for beginners",
      coverSrc: "/brand/textbooks/german-for-dummies.jpg",
    },
    {
      asin: "0071787828",
      title: "Complete German Grammar",
      subtitle: "Practice Makes Perfect · drills + review",
      coverSrc: "/brand/textbooks/pmp-german-grammar.jpg",
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
    {
      asin: "1118004671",
      title: "Italian For Dummies",
      subtitle: "Conversation + grammar for beginners",
      coverSrc: "/brand/textbooks/italian-for-dummies.jpg",
    },
    {
      asin: "1438006055",
      title: "Barron's Italian Grammar",
      subtitle: "Quick study + review charts",
      coverSrc: "/brand/textbooks/barron-italian-grammar.jpg",
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
    {
      asin: "478901441X",
      title: "GENKI II",
      subtitle: "Integrated elementary Japanese",
      coverSrc: "/brand/textbooks/genki-2.jpg",
    },
    {
      asin: "0976998130",
      title: "Japanese from Zero! 2",
      subtitle: "Grammar + kana practice",
      coverSrc: "/brand/textbooks/japanese-from-zero-2.jpg",
    },
    {
      asin: "4883196046",
      title: "Minna no Nihongo II",
      subtitle: "Classic classroom · next level",
      coverSrc: "/brand/textbooks/minna-nihongo-2.jpg",
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
      asin: "1589017374",
      title: "Al-Kitaab Part Two",
      subtitle: "Beginning Arabic · next level",
      coverSrc: "/brand/textbooks/al-kitaab-2.jpg",
    },
    {
      asin: "1589019782",
      title: "Ahlan wa Sahlan",
      subtitle: "Functional Modern Standard Arabic",
      coverSrc: "/brand/textbooks/ahlan-wa-sahlan.jpg",
    },
    {
      asin: "1612430007",
      title: "Arabic For Dummies",
      subtitle: "Script, phrases, and grammar basics",
      coverSrc: "/brand/textbooks/arabic-for-dummies.jpg",
    },
  ],
};

/** English textbooks for Japanese speakers (EigoChart) — Amazon.co.jp. */
export const JA_ENGLISH_TEXTBOOKS: AmazonTextbook[] = [
  {
    asin: "4889969454",
    title: "マーフィーのケンブリッジ英文法（初級）",
    subtitle: "日本人向け Grammar in Use · 音声つき",
    coverSrc: "/brand/textbooks/ja-murphy-basic.jpg",
    marketplace: "jp",
  },
  {
    asin: "4046019263",
    title: "関正生の英文法ポラリス 1",
    subtitle: "大学入試 · 標準レベルの文法",
    coverSrc: "/brand/textbooks/ja-polarisu-1.jpg",
    marketplace: "jp",
  },
  {
    asin: "4010348569",
    title: "関正生の The Rules 英語長文 2",
    subtitle: "入試標準の長文問題集",
    coverSrc: "/brand/textbooks/ja-rules-2.jpg",
    marketplace: "jp",
  },
  {
    asin: "4010346469",
    title: "英単語ターゲット 1900",
    subtitle: "大学入試の定番単語帳 · 6訂版",
    coverSrc: "/brand/textbooks/ja-target-1900.jpg",
    marketplace: "jp",
  },
  {
    asin: "4023324647",
    title: "出る単特急 金のフレーズ",
    subtitle: "TOEIC L&R · 頻出フレーズ特急",
    coverSrc: "/brand/textbooks/ja-toeic-kin.jpg",
    marketplace: "jp",
  },
  {
    asin: "4471113402",
    title: "80パターンで英語が止まらない!",
    subtitle: "ネイティブが12歳までに覚える型",
    coverSrc: "/brand/textbooks/ja-80-patterns.jpg",
    marketplace: "jp",
  },
  {
    asin: "B016QRD1TM",
    title: "瞬間英作文トレーニング",
    subtitle: "どんどん話すための · CDなし版",
    coverSrc: "/brand/textbooks/ja-shunkan-sakubun.jpg",
    marketplace: "jp",
  },
  {
    asin: "4053054826",
    title: "中学英語をもう一度",
    subtitle: "ひとつひとつわかりやすく · 改訂版",
    coverSrc: "/brand/textbooks/ja-chugaku-eigo.jpg",
    marketplace: "jp",
  },
  {
    asin: "4046060298",
    title: "こあら式英語のフレーズ図鑑",
    subtitle: "カンタンなのになぜか伝わる",
    coverSrc: "/brand/textbooks/ja-koala-phrases.jpg",
    marketplace: "jp",
  },
  {
    asin: "4010222646",
    title: "中学英単語1800",
    subtitle: "高校入試でる順ターゲット · 五訂版",
    coverSrc: "/brand/textbooks/ja-chu-eitango1800.jpg",
    marketplace: "jp",
  },
];

export function amazonAffiliateUrl(
  asin: string,
  marketplace: "com" | "jp" = "com",
): string {
  if (marketplace === "jp") {
    const url = new URL(
      `https://www.amazon.co.jp/dp/${encodeURIComponent(asin)}`,
    );
    url.searchParams.set("tag", AMAZON_JP_AFFILIATE_TAG);
    return url.toString();
  }
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

export function pickJaEnglishTextbooks(): AmazonTextbook[] {
  return JA_ENGLISH_TEXTBOOKS;
}
