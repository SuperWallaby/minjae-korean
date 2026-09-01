/**
 * Chinese / getpronounce SEO patterns (KeySearch Global 2026-08-31).
 * Mirror of scripts/lib/zh-keyword-patterns.mjs — keep families in sync.
 *
 * PASS: how to say in chinese, how to say in cantonese, common chinese phrases
 * Never stamp one keyword on every URL — pick by pin id.
 */
import { pickSeoVariant, seoSeed, truncateMeta } from "@/lib/seo/variedCopy";

const CLOSED_SETS = [
  "months",
  "colors",
  "basic colors",
  "eye colors",
  "nail colors",
  "family",
  "emotions",
  "greetings",
  "days of the week",
  "numbers 1-10",
  "numbers 1–10",
  "body parts",
  "foods",
  "weather",
] as const;

const WEIGHTS: [string, number][] = [
  ["how_to_say_chinese", 38],
  ["closed_set", 22],
  ["common_phrases", 14],
  ["how_to_say_cantonese", 10],
  ["pronounce", 10],
  ["how_to_say_mandarin", 6],
];

const PHRASE_TOPIC =
  /\b(greeting|greetings|hello|bye|thank|love|sorry|compliment|apology|cafe|restaurant|taxi|hotel|phone|weather|emotion|feelings?)\b/i;

function cleanSpaces(s: string): string {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function titleCaseTopic(topic: string): string {
  const t = cleanSpaces(topic);
  if (!t) return t;
  return t
    .split(" ")
    .map((w, i) => {
      if (/^vs\.?$/i.test(w)) return "vs";
      if (i > 0 && /^(and|of|at|the|a|an)$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function pickWeighted(id: string): string {
  const total = WEIGHTS.reduce((n, [, w]) => n + w, 0);
  let n = seoSeed(id) % total;
  for (const [key, w] of WEIGHTS) {
    if (n < w) return key;
    n -= w;
  }
  return WEIGHTS[0]![0];
}

function topicSlot(
  rawTitle: string,
  words: { english?: string; target?: string }[],
): string {
  const t = cleanSpaces(rawTitle)
    .replace(/\s+in\s+(chinese|mandarin|cantonese)\s*$/i, "")
    .replace(/^how\s+to\s+pronounce\s+/i, "")
    .replace(/^how\s+to\s+say\s+/i, "")
    .replace(/\b(words|phrases|vocab|vocabulary|basics)\b/gi, "")
    .trim();
  if (t && t.length <= 48) return titleCaseTopic(t);
  const first = cleanSpaces(words[0]?.english || words[0]?.target || "");
  return first ? titleCaseTopic(first) : "it";
}

function matchClosedSet(topic: string): string {
  const lower = cleanSpaces(topic).toLowerCase();
  for (const set of CLOSED_SETS) {
    if (lower === set || lower.includes(set)) return titleCaseTopic(set);
  }
  return "";
}

export function patternizeZhSeoTitle(pin: {
  id: string;
  titleEn?: string;
  words?: { english?: string; target?: string }[];
}): string {
  const raw = cleanSpaces(pin.titleEn || "");
  const words = pin.words || [];
  const slot = topicSlot(raw, words);
  const closed = matchClosedSet(slot) || matchClosedSet(raw);
  let family = pickWeighted(pin.id || raw || slot);

  if (closed) {
    const bias = seoSeed(`${pin.id}|closed`) % 100;
    if (bias < 55) family = "closed_set";
    else if (bias < 75) family = "how_to_say_chinese";
    else if (bias < 88) family = "common_phrases";
    else family = "pronounce";
  } else if (PHRASE_TOPIC.test(slot)) {
    const bias = seoSeed(`${pin.id}|phrase`) % 100;
    if (bias < 45) family = "how_to_say_chinese";
    else if (bias < 65) family = "how_to_say_cantonese";
    else if (bias < 80) family = "common_phrases";
    else if (bias < 90) family = "how_to_say_mandarin";
    else family = "pronounce";
  }

  switch (family) {
    case "how_to_say_cantonese":
      return `How to say ${slot.toLowerCase()} in Cantonese`;
    case "how_to_say_mandarin":
      return `How to say ${slot.toLowerCase()} in Mandarin`;
    case "pronounce":
      return pickSeoVariant(pin.id, [
        `How to pronounce ${slot} in Chinese`,
        `${slot} pronunciation in Chinese`,
        `How to pronounce ${slot.toLowerCase()}`,
      ] as const);
    case "common_phrases":
      return pickSeoVariant(pin.id, [
        `${titleCaseTopic(slot)} Chinese phrases`,
        `Common Chinese phrases: ${slot.toLowerCase()}`,
        `Chinese phrases for ${slot.toLowerCase()}`,
      ] as const);
    case "closed_set":
      return `${closed || slot} in Chinese`;
    case "how_to_say_chinese":
    default:
      return `How to say ${slot.toLowerCase()} in Chinese`;
  }
}

export function zhChartSeoDescription(pin: {
  id: string;
  titleEn: string;
  words: {
    english?: string;
    target?: string;
    romanization?: string;
    pinyin?: string;
  }[];
}): string {
  const slot = topicSlot(pin.titleEn, pin.words);
  const sample = pin.words
    .slice(0, 4)
    .map((w) => {
      const en = cleanSpaces(w.english || "");
      const py = cleanSpaces(w.romanization || w.pinyin || "");
      const tgt = cleanSpaces(w.target || "");
      if (en && py) return `${en} (${py})`;
      if (en && tgt) return `${en} · ${tgt}`;
      return en || tgt;
    })
    .filter(Boolean)
    .join(", ");

  return truncateMeta(
    pickSeoVariant(pin.id, [
      `How to say ${slot.toLowerCase()} in Chinese — ${sample}. Mandarin + Cantonese audio.`,
      `${sample} — ${titleCaseTopic(slot)} in Chinese. Listen CN / TW / HK.`,
      `Common Chinese phrases for ${slot.toLowerCase()}: ${sample}.`,
      `How to pronounce ${slot.toLowerCase()} in Chinese. ${sample}.`,
      `${titleCaseTopic(slot)} Chinese words with pinyin and audio — ${sample}.`,
      `Say ${slot.toLowerCase()} in Cantonese or Mandarin — ${sample}.`,
      `Chinese listening practice: ${sample} (${slot.toLowerCase()}).`,
    ] as const),
  );
}

export function zhPinSeoKeywords(pin: {
  id: string;
  titleEn: string;
  words: { english?: string; target?: string; romanization?: string }[];
}): string[] {
  const slot = topicSlot(pin.titleEn, pin.words).toLowerCase();
  const wordKeys = pin.words
    .slice(0, 5)
    .flatMap((w) => [w.english, w.target, w.romanization])
    .filter(Boolean)
    .map((s) => String(s).trim()) as string[];

  const familyKeys = pickSeoVariant(pin.id, [
    [`how to say ${slot} in chinese`, "how to say in chinese", "chinese phrases"],
    [`how to say ${slot} in cantonese`, "cantonese pronunciation", "jyutping"],
    [`${slot} in chinese`, "basic chinese words", "learn mandarin"],
    [`how to pronounce ${slot}`, "chinese pronunciation", "chinese tones"],
    [`common chinese phrases`, `${slot} chinese phrases`, "mandarin pronunciation"],
  ] as const);

  return [...familyKeys, ...wordKeys].filter(Boolean).slice(0, 12);
}
