/** Deterministic variant pick — same id always gets the same template. */

export function seoSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickSeoVariant<T>(seed: string, variants: readonly T[]): T {
  if (variants.length === 0) throw new Error("pickSeoVariant: empty variants");
  return variants[seoSeed(seed) % variants.length]!;
}

export function truncateMeta(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function joinSampleWords(
  words: string[],
  sep: string,
  limit = 6,
): string {
  return words.filter(Boolean).slice(0, limit).join(sep);
}

// —— JA (eigopin / EigoChart) ——

export function jaPinSeoTitle(pin: {
  id: string;
  titleJa: string;
  titleEn: string;
}): string {
  return pickSeoVariant(pin.id, [
    `${pin.titleJa} — ${pin.titleEn}`,
    `${pin.titleJa}（英語）`,
    `${pin.titleJa}の読み方`,
    `${pin.titleEn} · ${pin.titleJa}`,
    `${pin.titleJa}｜英単語`,
    `${pin.titleJa} — 英語チャート`,
  ] as const);
}

export function jaPinSeoDescription(pin: {
  id: string;
  titleJa: string;
  words: { english: string; ja?: string }[];
}): string {
  const en = joinSampleWords(
    pin.words.map((w) => w.english),
    "、",
    6,
  );
  const ja = joinSampleWords(
    pin.words.map((w) => w.ja || "").filter(Boolean),
    "、",
    4,
  );
  const first = pin.words[0]?.english || pin.titleJa;
  const n = pin.words.length;

  const variants = [
    `${pin.titleJa} — ${en}。音声付き。`,
    `${en}（${pin.titleJa}）。例文と発音。`,
    ja
      ? `${pin.titleJa}：${ja}。${en}。`
      : `${pin.titleJa}。${en}。`,
    `「${first}」ほか${n}語 — ${pin.titleJa}。`,
    `${pin.titleJa}の英語表現：${en}。`,
    `${en} — ${pin.titleJa}セット。`,
    `${pin.titleJa}。${en} — US/UK音声。`,
    n > 4
      ? `${pin.titleJa}（${n}語）。${en.slice(0, 48)}…`
      : `${pin.titleJa}。${en} — 米英豪比較。`,
  ] as const;

  return truncateMeta(pickSeoVariant(pin.id, variants));
}

export function jaPinJsonLdDescription(pin: {
  id: string;
  titleJa: string;
  words: { english: string }[];
}): string {
  const en = joinSampleWords(
    pin.words.map((w) => w.english),
    "、",
    5,
  );
  return pickSeoVariant(`${pin.id}:jsonld`, [
    `${pin.titleJa} — ${en}`,
    `${en}（${pin.titleJa}）`,
    `${pin.titleJa}：${en}`,
  ] as const);
}

export function jaLangHubDescription(langCode: string, langName: string): string {
  return pickSeoVariant(`hub:ja:${langCode}`, [
    `${langName}向けの英語チャート一覧 — 単語・例文・音声。`,
    `英語（${langName}学習者向け）— 保存用チャート集。`,
    `${langName}：英語語彙チャート — 聞いて覚える。`,
  ] as const);
}

// —— Global / GetPronounce atlas pins ——

export function globalPinSeoDescriptionFallback(pin: {
  id: string;
  langName: string;
  titleEn: string;
  words: { english: string }[];
}): string {
  const words = joinSampleWords(
    pin.words.map((w) => w.english),
    ", ",
    6,
  );
  const topic = pin.titleEn.trim() || pin.langName;

  return truncateMeta(
    pickSeoVariant(pin.id, [
      `${topic} — ${words}. Listen and repeat.`,
      `${words} in ${pin.langName}. Chart with audio.`,
      `Quick ${pin.langName}: ${words}.`,
      `${pin.langName} words: ${words}.`,
      `Study ${words} — ${topic.toLowerCase()}.`,
      `${topic}: ${words} (${pin.langName}).`,
    ] as const),
  );
}

export function atlasLangHubDescription(
  siteKey: string,
  langCode: string,
  langName: string,
): string {
  return truncateMeta(
    pickSeoVariant(`${siteKey}:lang:${langCode}`, [
      `${langName} vocabulary charts — word lists with audio and examples.`,
      `Learn ${langName} in context: themed charts with listen-along clips.`,
      `${langName} word sets for everyday topics — charts you can save.`,
      `Browse ${langName} charts: vocabulary, audio, and practice links.`,
    ] as const),
  );
}

/** Visible H1 — matches / aligns with lang-hub <title> (not bare language name). */
export function atlasLangHubH1(langName: string): string {
  return `${langName} pronunciation charts`;
}

// —— GetPronounce (Chinese pronunciation) ——

export function pronouncePinSeoDescriptionFallback(pin: {
  id: string;
  focus: string;
  pinyin?: string;
}): string {
  const { focus, pinyin } = pin;
  const py = pinyin?.trim();

  return truncateMeta(
    pickSeoVariant(pin.id, [
      `Hear ${focus}${py ? ` (${py})` : ""} — Mainland & Taiwan Mandarin, HK Cantonese.`,
      `${focus}${py ? ` · ${py}` : ""}: tap female or male voice, slow or normal.`,
      `How ${focus} sounds in Mandarin${py ? ` (${py})` : ""}.`,
      `Listen to ${focus}${py ? ` — ${py}` : ""} across CN, TW, and HK voices.`,
      `${focus}${py ? ` (${py})` : ""} — pronunciation chart with audio.`,
    ] as const),
  );
}

// —— EigoSound ——

export function soundPinSeoDescriptionFallback(pin: {
  id: string;
  titleEn: string;
}): string {
  const t = pin.titleEn.trim();
  return truncateMeta(
    pickSeoVariant(pin.id, [
      `${t}. American vs British pronunciation.`,
      `${t} — slang words in English and everyday phrases.`,
      `${t}. Australian accent audio.`,
      `Other ways to say it: ${t}. How to pronounce each line.`,
    ] as const),
  );
}

// —— Kaja vocab SEO ——

export function vocabSeoDescriptionVaried(
  seed: string,
  titleEn: string,
  words: { hangul: string; english: string }[],
): string {
  const sample = joinSampleWords(
    words.slice(0, 4).map((w) => `${w.hangul} (${w.english})`),
    ", ",
    4,
  );
  if (!sample) {
    return truncateMeta(
      pickSeoVariant(seed, [
        `${titleEn} — Korean vocabulary group.`,
        `${titleEn}. Picture-backed word chart.`,
      ] as const),
    );
  }
  return truncateMeta(
    pickSeoVariant(seed, [
      `${titleEn} — ${sample}.`,
      `${sample} — ${titleEn}.`,
      `${titleEn}: ${sample}. Hangul + audio.`,
      `Learn ${sample} (${titleEn}).`,
      `${titleEn} chart — ${sample}.`,
    ] as const),
  );
}
