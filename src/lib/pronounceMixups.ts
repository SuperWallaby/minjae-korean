/** GetPronounce Korean mix-ups list — weekly audio email (not the Kaja PDF). */

export const MIXUPS_LIST = "mixups" as const;
export const MIXUPS_LANG = "ko" as const;

export const MIXUPS_PATH = "/ko/mix-ups";

export const MIXUPS_COPY = {
  kicker: "Weekly Korean audio",
  bannerTitle: "Mix-ups you keep hearing wrong",
  bannerBody:
    "One pair like ㅔ vs ㅐ, plus a few new words — audio in the email. Not a long newsletter.",
  cta: "Send me this week's set",
  howItWorks: "How it works",
  pageTitle: "Korean sounds English speakers mix up",
  pageLede:
    "Charts teach words. This list is the pairs you keep mixing — 어 vs 오, ㅔ vs ㅐ — with audio, once a week, plus a few new words from the atlas.",
  confirm:
    "You're on the list. The first audio email goes out on the next weekly send.",
} as const;

/** Hand-picked contrasts for the landing page (not LLM-invented). */
export const MIXUPS_EXAMPLES = [
  {
    left: { ko: "개", rom: "gae", en: "dog" },
    right: { ko: "게", rom: "ge", en: "crab" },
    contrast: "ㅐ vs ㅔ",
  },
  {
    left: { ko: "서울", rom: "seoul", en: "Seoul" },
    right: { ko: "솔", rom: "sol", en: "pine" },
    contrast: "어 vs 오",
  },
  {
    left: { ko: "불", rom: "bul", en: "fire" },
    right: { ko: "뿔", rom: "ppul", en: "horn" },
    contrast: "plain vs tense ㅂ",
  },
] as const;
