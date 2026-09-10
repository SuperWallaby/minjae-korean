/** Amazon Associates — textbook picks for kajakorean.com + global.kajakorean.com */

export const AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG?.trim() || "promoted02d-20";

export const AMAZON_JP_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_JP_AFFILIATE_TAG?.trim() || "eigopin-22";

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate, Kaja Korean earns from qualifying purchases.";

export const AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE =
  "As an Amazon Associate, GetPronounce earns from qualifying purchases.";

export const AMAZON_ASSOCIATE_DISCLOSURE_JA =
  "Amazonアソシエイトとして、EigoChartは適格な購入から収益を得ています。";

/** One emphasis label per book (shown as a cover badge). */
export type AmazonTextbookBadge =
  | "series"
  | "reading"
  | "grammar"
  | "vocab"
  | "conversation"
  | "course";

export const AMAZON_TEXTBOOK_BADGE_LABEL: Record<AmazonTextbookBadge, string> = {
  series: "Series",
  reading: "Reading",
  grammar: "Grammar",
  vocab: "Vocab",
  conversation: "Conversation",
  course: "Course",
};

export type AmazonTextbook = {
  asin: string;
  title: string;
  subtitle: string;
  /** Local cover in /public (verified — Amazon CDN URLs often 404 or return placeholders). */
  coverSrc: string;
  /** Single focus badge — series / reading / grammar / vocab / conversation / course. */
  badge: AmazonTextbookBadge;
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
    badge: "series",
  },
  {
    asin: "0824876199",
    title: "Integrated Korean: Beginning 1",
    subtitle: "Third edition · KLEAR university series",
    coverSrc: "/brand/textbooks/integrated-korean-1.jpg",
    badge: "series",
  },
  {
    asin: "1497445825",
    title: "Korean Made Simple",
    subtitle: "Billy Go · beginner Hangul + grammar",
    coverSrc: "/brand/textbooks/korean-made-simple.jpg",
    badge: "course",
  },
  {
    asin: "8959951986",
    title: "Korean Grammar in Use: Beginning",
    subtitle: "Darakwon · TOPIK 1–2 grammar workbook",
    coverSrc: "/brand/textbooks/korean-grammar-in-use.jpg",
    badge: "grammar",
  },
  {
    asin: "B074QVPDJ5",
    title: "My First 500 Korean Words",
    subtitle: "TTMIK · story-based beginner vocab",
    coverSrc: "/brand/textbooks/my-first-500-korean-words.jpg",
    badge: "vocab",
  },
  {
    asin: "B07J35QFLB",
    title: "Easy Korean Reading For Beginners",
    subtitle: "TTMIK · 30 short passages + audio",
    coverSrc: "/brand/textbooks/easy-korean-reading.jpg",
    badge: "reading",
  },
  {
    asin: "B076W4BKZK",
    title: "Real-Life Korean Conversations",
    subtitle: "TTMIK · 40 everyday dialogues + audio",
    coverSrc: "/brand/textbooks/ttmik-conversations.jpg",
    badge: "conversation",
  },
];

/** Beginner textbooks per global atlas language (fixed list — no rotation). */
export const GLOBAL_TEXTBOOKS_BY_LANG: Record<string, AmazonTextbook[]> = {
  zh: [
    {
      asin: "1622917456",
      title: "Integrated Chinese Volume 1",
      subtitle: "4th edition · simplified characters",
      coverSrc: "/brand/textbooks/integrated-chinese-1.jpg",
      badge: "series",
    },
    {
      asin: "7561937091",
      title: "HSK Standard Course 1",
      subtitle: "Hanban · beginner HSK path",
      coverSrc: "/brand/textbooks/hsk-standard-1.jpg",
      badge: "series",
    },
    {
      asin: "0415434157",
      title: "Colloquial Chinese",
      subtitle: "Routledge · complete beginner course",
      coverSrc: "/brand/textbooks/colloquial-chinese.jpg",
      badge: "course",
    },
    {
      asin: "1933330899",
      title: "Basic Patterns of Chinese Grammar",
      subtitle: "Herzberg · clear pattern reference",
      coverSrc: "/brand/textbooks/basic-patterns-chinese-grammar.jpg",
      badge: "grammar",
    },
    {
      asin: "0804842019",
      title: "Chinese Flash Cards Kit Volume 1",
      subtitle: "Tuttle · HSK characters 1–349 + audio",
      coverSrc: "/brand/textbooks/chinese-flash-cards-1.jpg",
      badge: "vocab",
    },
    {
      asin: "080484299X",
      title: "Reading and Writing Chinese",
      subtitle: "3rd edition · characters + HSK 1–6",
      coverSrc: "/brand/textbooks/reading-writing-chinese.jpg",
      badge: "reading",
    },
    {
      asin: "0804840156",
      title: "Basic Spoken Chinese",
      subtitle: "Kubler · speaking + listening for beginners",
      coverSrc: "/brand/textbooks/basic-spoken-chinese.jpg",
      badge: "conversation",
    },
  ],
  es: [
    {
      asin: "0385410956",
      title: "Madrigal's Magic Key to Spanish",
      subtitle: "Creative approach · vocabulary + grammar",
      coverSrc: "/brand/textbooks/madrigal-spanish.jpg",
      badge: "course",
    },
    {
      asin: "0071463380",
      title: "Easy Spanish Step-by-Step",
      subtitle: "Grammar-led path for beginners",
      coverSrc: "/brand/textbooks/easy-spanish.jpg",
      badge: "grammar",
    },
    {
      asin: "0071458069",
      title: "Spanish Vocabulary",
      subtitle: "Practice Makes Perfect · thematic drills",
      coverSrc: "/brand/textbooks/pmp-spanish-vocabulary.jpg",
      badge: "vocab",
    },
    {
      asin: "1259584194",
      title: "Easy Spanish Reader",
      subtitle: "Graded stories · build reading fluency",
      coverSrc: "/brand/textbooks/easy-spanish-reader.jpg",
      badge: "reading",
    },
    {
      asin: "1473683254",
      title: "Short Stories in Spanish for Beginners",
      subtitle: "Olly Richards · graded reader A2–B1",
      coverSrc: "/brand/textbooks/short-stories-spanish.jpg",
      badge: "reading",
    },
    {
      asin: "1260462196",
      title: "Spanish Conversation",
      subtitle: "Practice Makes Perfect · everyday dialogues",
      coverSrc: "/brand/textbooks/pmp-spanish-conversation.jpg",
      badge: "conversation",
    },
  ],
  fr: [
    {
      asin: "1400009626",
      title: "Ultimate French Beginner–Intermediate",
      subtitle: "Coursebook + audio · Living Language",
      coverSrc: "/brand/textbooks/ultimate-french-set.jpg",
      badge: "course",
    },
    {
      asin: "0071453873",
      title: "Easy French Step-by-Step",
      subtitle: "High-frequency grammar for beginners",
      coverSrc: "/brand/textbooks/easy-french.jpg",
      badge: "grammar",
    },
    {
      asin: "1259862593",
      title: "Easy French Reader",
      subtitle: "Graded stories · build reading fluency",
      coverSrc: "/brand/textbooks/easy-french-reader.jpg",
      badge: "reading",
    },
    {
      asin: "1473683432",
      title: "Short Stories in French for Beginners",
      subtitle: "Olly Richards · graded reader A2–B1",
      coverSrc: "/brand/textbooks/short-stories-french.jpg",
      badge: "reading",
    },
    {
      asin: "1264257295",
      title: "French Conversation",
      subtitle: "Practice Makes Perfect · everyday dialogues",
      coverSrc: "/brand/textbooks/pmp-french-conversation.jpg",
      badge: "conversation",
    },
  ],
  de: [
    {
      asin: "0767918606",
      title: "German Made Simple",
      subtitle: "Learn to read, write, and speak",
      coverSrc: "/brand/textbooks/german-made-simple.jpg",
      badge: "course",
    },
    {
      asin: "007148499X",
      title: "Easy German Step-by-Step",
      subtitle: "Grammar-led path for beginners",
      coverSrc: "/brand/textbooks/easy-german.jpg",
      badge: "grammar",
    },
    {
      asin: "0071482857",
      title: "German Vocabulary",
      subtitle: "Practice Makes Perfect · thematic drills",
      coverSrc: "/brand/textbooks/pmp-german-vocabulary.jpg",
      badge: "vocab",
    },
    {
      asin: "1473683378",
      title: "Short Stories in German",
      subtitle: "Olly Richards · graded reader A2–B1",
      coverSrc: "/brand/textbooks/short-stories-german.jpg",
      badge: "reading",
    },
    {
      asin: "159869989X",
      title: "The Everything Learning German Book",
      subtitle: "Beginner-friendly · conversation focus",
      coverSrc: "/brand/textbooks/everything-german.jpg",
      badge: "conversation",
    },
  ],
  it: [
    {
      asin: "0767915399",
      title: "Italian Made Simple",
      subtitle: "Revised · conversation + grammar",
      coverSrc: "/brand/textbooks/italian-made-simple.jpg",
      badge: "course",
    },
    {
      asin: "007145389X",
      title: "Easy Italian Step-by-Step",
      subtitle: "Building-block grammar for beginners",
      coverSrc: "/brand/textbooks/easy-italian.jpg",
      badge: "grammar",
    },
    {
      asin: "0071482865",
      title: "Italian Vocabulary",
      subtitle: "Practice Makes Perfect · thematic drills",
      coverSrc: "/brand/textbooks/pmp-italian-vocabulary.jpg",
      badge: "vocab",
    },
    {
      asin: "0071849831",
      title: "Easy Italian Reader",
      subtitle: "Graded stories · build reading fluency",
      coverSrc: "/brand/textbooks/easy-italian-reader.jpg",
      badge: "reading",
    },
    {
      asin: "1473683327",
      title: "Short Stories in Italian for Beginners",
      subtitle: "Olly Richards · graded reader A2–B1",
      coverSrc: "/brand/textbooks/short-stories-italian.jpg",
      badge: "reading",
    },
    {
      asin: "0071770895",
      title: "Italian Conversation",
      subtitle: "Practice Makes Perfect · everyday dialogues",
      coverSrc: "/brand/textbooks/pmp-italian-conversation.jpg",
      badge: "conversation",
    },
  ],
  ja: [
    {
      asin: "4789014401",
      title: "GENKI I",
      subtitle: "Integrated elementary Japanese",
      coverSrc: "/brand/textbooks/genki-1.jpg",
      badge: "series",
    },
    {
      asin: "1568363850",
      title: "Japanese for Busy People I",
      subtitle: "Revised 4th edition · practical course",
      coverSrc: "/brand/textbooks/japanese-for-busy-people-1.jpg",
      badge: "course",
    },
    {
      asin: "4789004546",
      title: "A Dictionary of Basic Japanese Grammar",
      subtitle: "Makino & Tsutsui · standard reference",
      coverSrc: "/brand/textbooks/dictionary-basic-japanese-grammar.jpg",
      badge: "grammar",
    },
    {
      asin: "4789013499",
      title: "Kanji Look and Learn",
      subtitle: "The Japan Times · 512 beginner kanji",
      coverSrc: "/brand/textbooks/kanji-look-and-learn.jpg",
      badge: "vocab",
    },
    {
      asin: "1529377161",
      title: "Short Stories in Japanese",
      subtitle: "Olly Richards · graded reader B1–B2",
      coverSrc: "/brand/textbooks/short-stories-japanese.jpg",
      badge: "reading",
    },
    {
      asin: "1568364202",
      title: "Japanese Sentence Patterns",
      subtitle: "Kamiya · speak in ready-made patterns",
      coverSrc: "/brand/textbooks/japanese-sentence-patterns.jpg",
      badge: "conversation",
    },
  ],
  ar: [
    {
      asin: "1589016327",
      title: "Alif Baa",
      subtitle: "Arabic letters and sounds · first step",
      coverSrc: "/brand/textbooks/alif-baa.jpg",
      badge: "series",
    },
    {
      asin: "1589017366",
      title: "Al-Kitaab Part One",
      subtitle: "Beginning Arabic · book + media",
      coverSrc: "/brand/textbooks/al-kitaab-1.jpg",
      badge: "series",
    },
    {
      asin: "1589019782",
      title: "Ahlan wa Sahlan",
      subtitle: "Functional Modern Standard Arabic",
      coverSrc: "/brand/textbooks/ahlan-wa-sahlan.jpg",
      badge: "course",
    },
    {
      asin: "0071498052",
      title: "Arabic Verbs & Essentials of Grammar",
      subtitle: "2nd edition · forms + core grammar",
      coverSrc: "/brand/textbooks/arabic-verbs-essentials.jpg",
      badge: "grammar",
    },
    {
      asin: "0415444349",
      title: "A Frequency Dictionary of Arabic",
      subtitle: "Routledge · 5,000 core MSA words",
      coverSrc: "/brand/textbooks/frequency-dictionary-arabic.jpg",
      badge: "vocab",
    },
    {
      asin: "0804843007",
      title: "Arabic Stories for Language Learners",
      subtitle: "Tuttle · bilingual tales + audio",
      coverSrc: "/brand/textbooks/arabic-stories-learners.jpg",
      badge: "reading",
    },
    {
      asin: "1533081867",
      title: "Conversational Arabic Quick and Easy",
      subtitle: "Levantine-focused spoken Arabic",
      coverSrc: "/brand/textbooks/conversational-arabic-quick.jpg",
      badge: "conversation",
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
    badge: "grammar",
    marketplace: "jp",
  },
  {
    asin: "4046019263",
    title: "関正生の英文法ポラリス 1",
    subtitle: "大学入試 · 標準レベルの文法",
    coverSrc: "/brand/textbooks/ja-polarisu-1.jpg",
    badge: "grammar",
    marketplace: "jp",
  },
  {
    asin: "4010348569",
    title: "関正生の The Rules 英語長文 2",
    subtitle: "入試標準の長文問題集",
    coverSrc: "/brand/textbooks/ja-rules-2.jpg",
    badge: "reading",
    marketplace: "jp",
  },
  {
    asin: "4010346469",
    title: "英単語ターゲット 1900",
    subtitle: "大学入試の定番単語帳 · 6訂版",
    coverSrc: "/brand/textbooks/ja-target-1900.jpg",
    badge: "vocab",
    marketplace: "jp",
  },
  {
    asin: "4023324647",
    title: "出る単特急 金のフレーズ",
    subtitle: "TOEIC L&R · 頻出フレーズ特急",
    coverSrc: "/brand/textbooks/ja-toeic-kin.jpg",
    badge: "vocab",
    marketplace: "jp",
  },
  {
    asin: "4471113402",
    title: "80パターンで英語が止まらない!",
    subtitle: "ネイティブが12歳までに覚える型",
    coverSrc: "/brand/textbooks/ja-80-patterns.jpg",
    badge: "conversation",
    marketplace: "jp",
  },
  {
    asin: "B016QRD1TM",
    title: "瞬間英作文トレーニング",
    subtitle: "どんどん話すための · CDなし版",
    coverSrc: "/brand/textbooks/ja-shunkan-sakubun.jpg",
    badge: "conversation",
    marketplace: "jp",
  },
  {
    asin: "4053054826",
    title: "中学英語をもう一度",
    subtitle: "ひとつひとつわかりやすく · 改訂版",
    coverSrc: "/brand/textbooks/ja-chugaku-eigo.jpg",
    badge: "course",
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
  if (lang === "ko") return KOREAN_TEXTBOOKS;
  return GLOBAL_TEXTBOOKS_BY_LANG[lang] ?? [];
}

/** @deprecated Use pickGlobalTextbooks — returns the first pick only. */
export function pickGlobalTextbook(lang: string): AmazonTextbook | null {
  return pickGlobalTextbooks(lang)[0] ?? null;
}

export function pickJaEnglishTextbooks(): AmazonTextbook[] {
  return JA_ENGLISH_TEXTBOOKS;
}
