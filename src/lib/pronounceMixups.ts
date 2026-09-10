/** GetPronounce mix-ups list — weekly audio email (not the Kaja PDF). */

import {
  normalizeAtlasLangCode,
  PRONOUNCE_PREFIX_LANGS,
} from "@/lib/atlasRoutes";
import { GLOBAL_LANG_NAMES } from "@/lib/globalSite/langMeta";

export const MIXUPS_LIST = "mixups" as const;

const PREFIX_SET = new Set<string>(PRONOUNCE_PREFIX_LANGS);

export type MixupExample = {
  contrast: string;
  left: { word: string; rom: string; en: string };
  right: { word: string; rom: string; en: string };
};

export type MixupsCopy = {
  lang: string;
  langName: string;
  kicker: string;
  bannerTitle: string;
  bannerBody: string;
  cta: string;
  howItWorks: string;
  pageTitle: string;
  pageLede: string;
  confirm: string;
  promiseWords: string;
};

export function resolveMixupsLang(lang: string | undefined | null): string {
  const code = normalizeAtlasLangCode(lang || "");
  if (code === "zh" || PREFIX_SET.has(code)) return code;
  return "zh";
}

export function mixupsPath(lang: string): string {
  const code = resolveMixupsLang(lang);
  return code === "zh" ? "/mix-ups" : `/${code}/mix-ups`;
}

export function mixupsCopyForLang(lang: string | undefined | null): MixupsCopy {
  const code = resolveMixupsLang(lang);
  const langName = GLOBAL_LANG_NAMES[code] || "this language";
  return {
    lang: code,
    langName,
    kicker: `Weekly ${langName} audio`,
    bannerTitle: "Mix-ups you keep hearing wrong",
    bannerBody: `One pair English speakers mix up, plus a few new ${langName} words — audio in the email. Not a long newsletter.`,
    cta: "Send me this week's set",
    howItWorks: "How it works",
    pageTitle: `${langName} sounds English speakers mix up`,
    pageLede: `Charts teach words. This list is the pairs you keep mixing — with audio, once a week, plus a few new ${langName} words from the atlas.`,
    confirm:
      "You're on the list. The first audio email goes out on the next weekly send.",
    promiseWords: `A few new ${langName} words from the atlas, with listen links.`,
  };
}

const EXAMPLES: Record<string, readonly MixupExample[]> = {
  ko: [
    {
      left: { word: "개", rom: "gae", en: "dog" },
      right: { word: "게", rom: "ge", en: "crab" },
      contrast: "ㅐ vs ㅔ",
    },
    {
      left: { word: "서울", rom: "seoul", en: "Seoul" },
      right: { word: "솔", rom: "sol", en: "pine" },
      contrast: "어 vs 오",
    },
    {
      left: { word: "불", rom: "bul", en: "fire" },
      right: { word: "뿔", rom: "ppul", en: "horn" },
      contrast: "plain vs tense ㅂ",
    },
  ],
  zh: [
    {
      left: { word: "四", rom: "sì", en: "four" },
      right: { word: "十", rom: "shí", en: "ten" },
      contrast: "s vs sh",
    },
    {
      left: { word: "买", rom: "mǎi", en: "buy" },
      right: { word: "卖", rom: "mài", en: "sell" },
      contrast: "tone 3 vs 4",
    },
    {
      left: { word: "问", rom: "wèn", en: "ask" },
      right: { word: "闻", rom: "wén", en: "smell / hear of" },
      contrast: "tone 4 vs 2",
    },
  ],
  ja: [
    {
      left: { word: "箸", rom: "hashi", en: "chopsticks" },
      right: { word: "橋", rom: "hashi", en: "bridge" },
      contrast: "pitch accent",
    },
    {
      left: { word: "おばさん", rom: "obasan", en: "aunt" },
      right: { word: "おばあさん", rom: "obaasan", en: "grandmother" },
      contrast: "short vs long vowel",
    },
    {
      left: { word: "病院", rom: "byouin", en: "hospital" },
      right: { word: "美容院", rom: "biyouin", en: "hair salon" },
      contrast: "びょう vs びよう",
    },
  ],
  es: [
    {
      left: { word: "pero", rom: "PEH-ro", en: "but" },
      right: { word: "perro", rom: "PEH-rro", en: "dog" },
      contrast: "r vs rr",
    },
    {
      left: { word: "casa", rom: "CAH-sa", en: "house" },
      right: { word: "caza", rom: "CAH-tha", en: "hunt (Spain)" },
      contrast: "s vs z",
    },
    {
      left: { word: "hola", rom: "OH-la", en: "hello" },
      right: { word: "ola", rom: "OH-la", en: "wave" },
      contrast: "silent h",
    },
  ],
  fr: [
    {
      left: { word: "tu", rom: "ty", en: "you" },
      right: { word: "tout", rom: "too", en: "all" },
      contrast: "u vs ou",
    },
    {
      left: { word: "dessus", rom: "duh-SY", en: "on top" },
      right: { word: "dessous", rom: "duh-SOO", en: "underneath" },
      contrast: "u vs ou",
    },
    {
      left: { word: "été", rom: "ay-TAY", en: "summer" },
      right: { word: "était", rom: "ay-TEH", en: "was" },
      contrast: "é vs ai",
    },
  ],
  de: [
    {
      left: { word: "schon", rom: "shohn", en: "already" },
      right: { word: "schön", rom: "shurn", en: "beautiful" },
      contrast: "o vs ö",
    },
    {
      left: { word: "Stadt", rom: "shtat", en: "city" },
      right: { word: "Staat", rom: "shtaht", en: "state" },
      contrast: "short vs long a",
    },
    {
      left: { word: "ich", rom: "ikh", en: "I" },
      right: { word: "ach", rom: "akh", en: "oh" },
      contrast: "ich-Laut vs ach-Laut",
    },
  ],
  it: [
    {
      left: { word: "e", rom: "eh", en: "and" },
      right: { word: "è", rom: "eh", en: "is" },
      contrast: "e vs è",
    },
    {
      left: { word: "anno", rom: "AHN-no", en: "year" },
      right: { word: "hanno", rom: "AHN-no", en: "they have" },
      contrast: "silent h",
    },
    {
      left: { word: "casa", rom: "CAH-sa", en: "house" },
      right: { word: "cassa", rom: "CAHS-sa", en: "crate / till" },
      contrast: "single vs double s",
    },
  ],
  ar: [
    {
      left: { word: "قَلْب", rom: "qalb", en: "heart" },
      right: { word: "كَلْب", rom: "kalb", en: "dog" },
      contrast: "ق vs ك",
    },
    {
      left: { word: "سَيْف", rom: "sayf", en: "sword" },
      right: { word: "صَيْف", rom: "ṣayf", en: "summer" },
      contrast: "س vs ص",
    },
    {
      left: { word: "عَمَل", rom: "ʿamal", en: "work" },
      right: { word: "أَمَل", rom: "amal", en: "hope" },
      contrast: "ع vs hamza",
    },
  ],
};

export function mixupsExamplesForLang(
  lang: string | undefined | null,
): readonly MixupExample[] {
  const code = resolveMixupsLang(lang);
  return EXAMPLES[code] || [];
}
