/**
 * EigoSound SEO patterns (KeySearch Global 2026-09-01).
 * Mirror of scripts/lib/sound-keyword-patterns.mjs — keep families in sync.
 *
 * No PASS (vol ≥ 100 & score < 30) in this niche. MAYBE families only.
 * Never stamp one keyword on every URL — pick by pin id + format.
 */
import { pickSeoVariant, truncateMeta } from "@/lib/seo/variedCopy";

const WHAT_DOES_MEAN_OK = new Set(["sus", "bet", "no cap"]);
const ANOTHER_WORD_SKIP = new Set(["tired", "angry", "scared"]);

function cleanSpaces(s: string): string {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function normPhrase(p: string): string {
  return cleanSpaces(p)
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[.!?]+$/g, "");
}

export type SoundSeoPin = {
  id: string;
  titleEn?: string;
  format?: string;
  words?: { english?: string }[];
};

export function soundOtherWaysPhrase(pin: SoundSeoPin): string {
  const title = cleanSpaces(pin.titleEn || "");
  const m = title.match(/other ways to say\s+(.+)/i);
  if (m?.[1]) return cleanSpaces(m[1]);
  return cleanSpaces(pin.words?.[0]?.english || title || "it");
}

export function soundSlangWord(pin: SoundSeoPin): string {
  return cleanSpaces(pin.words?.[0]?.english || "") || "slang";
}

export function soundUpgradeSimple(pin: SoundSeoPin): string {
  const title = cleanSpaces(pin.titleEn || "");
  const m = title.match(/^very\s+(.+?)\s*→/i);
  if (m?.[1]) return cleanSpaces(m[1]).toLowerCase();
  return cleanSpaces(pin.words?.[0]?.english || "it").toLowerCase();
}

function otherWaysTitle(id: string, phrase: string, titleEn: string): string {
  const n = normPhrase(phrase);
  if (n === "good luck") {
    return pickSeoVariant(id, [
      "What to say instead of good luck",
      "Other phrases for good luck",
      "Other ways to say Good luck",
    ] as const);
  }
  if (n === "thank you" || n === "thanks") {
    return pickSeoVariant(id, [
      "Other ways to say Thank you",
      "Formal way to say thank you",
    ] as const);
  }
  if (/^other ways to say /i.test(titleEn)) return cleanSpaces(titleEn);
  return `Other ways to say ${phrase}`;
}

function slangTitle(id: string, word: string): string {
  const key = normPhrase(word);
  if (WHAT_DOES_MEAN_OK.has(key)) {
    return pickSeoVariant(id, [
      `What does ${word} mean`,
      `Slang words in English: ${word}`,
      `${word} — English slang`,
    ] as const);
  }
  return pickSeoVariant(id, [
    `Slang words in English: ${word}`,
    `${word} — English slang`,
  ] as const);
}

function upgradeTitle(id: string, simple: string): string {
  const s = normPhrase(simple);
  if (s === "happy") {
    return pickSeoVariant(id, [
      "Another word for happy",
      "Another word for very happy",
      "Synonyms for happy",
    ] as const);
  }
  if (s === "hungry") {
    return pickSeoVariant(id, [
      "Another word for hungry",
      "Another word for very hungry",
    ] as const);
  }
  if (ANOTHER_WORD_SKIP.has(s)) {
    return `Another word for very ${s}`;
  }
  return pickSeoVariant(id, [
    `Another word for ${s}`,
    `Another word for very ${s}`,
  ] as const);
}

export function patternizeSoundSeoTitle(pin: SoundSeoPin): string {
  const id = pin.id || pin.titleEn || "sound";
  const format = String(pin.format || "").trim();
  if (format === "slang_card") return slangTitle(id, soundSlangWord(pin));
  if (format === "simple_upgrade") {
    return upgradeTitle(id, soundUpgradeSimple(pin));
  }
  return otherWaysTitle(id, soundOtherWaysPhrase(pin), pin.titleEn || "");
}

export function soundPinKicker(pin: SoundSeoPin): string {
  const format = String(pin.format || "").trim();
  if (format === "slang_card") return "Slang words in English";
  if (format === "simple_upgrade") return "Another word for";
  return "Other ways to say";
}

export function soundRelatedHeading(pin: SoundSeoPin): string {
  const format = String(pin.format || "").trim();
  if (format === "slang_card") return "More slang words in English";
  if (format === "simple_upgrade") return "More other words for it";
  return "More other ways to say it";
}

function sampleWords(pin: SoundSeoPin, n = 6): string[] {
  return (pin.words || [])
    .map((w) => cleanSpaces(w.english || ""))
    .filter(Boolean)
    .slice(0, n);
}

export function soundChartSeoDescription(pin: SoundSeoPin): string {
  const title = patternizeSoundSeoTitle(pin);
  const format = String(pin.format || "").trim();
  const words = sampleWords(pin, 6);
  const list = words.join(", ");
  const extras = words.length > 1 ? words.slice(1).join(", ") : "";
  const focus =
    format === "slang_card"
      ? soundSlangWord(pin)
      : format === "simple_upgrade"
        ? soundUpgradeSimple(pin)
        : soundOtherWaysPhrase(pin);

  let variants: readonly string[];
  if (format === "slang_card") {
    variants = [
      `Slang words in English: ${focus}. Listen, then say it back.`,
      `What ${focus} means in English slang — listen and repeat.`,
      `${focus} — English slang. Hear it in context.`,
      `English slang: ${focus}.`,
    ];
  } else if (format === "simple_upgrade") {
    const upgraded = cleanSpaces(pin.words?.[0]?.english || "");
    const named = upgraded || list || focus;
    variants = [
      `Another word for ${focus}: ${named}.`,
      `Another word for very ${focus} — ${named}.`,
      `${named} is another word for ${focus}.`,
    ];
  } else {
    variants = [
      `${title}: ${list}.`,
      extras
        ? `Other ways to say ${focus} — ${extras}.`
        : `Other ways to say ${focus}.`,
      `What to say instead of ${focus}: ${list}.`,
      `${list} — other ways to say ${focus}.`,
    ];
  }

  const listen = pickSeoVariant(pin.id, [
    "American vs British pronunciation.",
    "Australian accent audio.",
    "How to pronounce each line.",
    "British accent vs American.",
  ] as const);
  return truncateMeta(`${pickSeoVariant(pin.id, variants)} ${listen}`);
}

export function soundPinSeoKeywords(pin: SoundSeoPin): string[] {
  const format = String(pin.format || "").trim();
  const title = patternizeSoundSeoTitle(pin).toLowerCase();
  const wordKeys = sampleWords(pin, 5);
  let family: readonly string[] = [];
  if (format === "slang_card") {
    const w = soundSlangWord(pin).toLowerCase();
    family = pickSeoVariant(pin.id, [
      ["slang words in english", `what does ${w} mean`, "english slang"],
      ["english slang", "slang words in english", w],
    ] as const);
  } else if (format === "simple_upgrade") {
    const s = soundUpgradeSimple(pin);
    family = pickSeoVariant(pin.id, [
      [`another word for ${s}`, "another word for very happy", s],
      [`another word for very ${s}`, `synonyms for ${s}`, s],
    ] as const);
  } else {
    const p = soundOtherWaysPhrase(pin).toLowerCase();
    family = pickSeoVariant(pin.id, [
      [`other ways to say ${p}`, "other ways to say", p],
      ["other ways to say thank you", "other ways to say sorry", p],
      ["what to say instead of good luck", "other phrases for good luck", p],
    ] as const);
  }
  return [...family, title, ...wordKeys].filter(Boolean).slice(0, 12);
}
