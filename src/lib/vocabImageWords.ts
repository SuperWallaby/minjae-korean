import fs from "node:fs";
import path from "node:path";

import {
  azureChatCompletionDetail,
  readAzureOpenAIConfig,
} from "@/lib/azureOpenAI";
import type { VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";

export type VocabImageWord = {
  hangul: string;
  romanization?: string;
  english?: string;
};

export type VocabImageWordsPayload = {
  bundleId: string;
  extractedAt: string;
  source: "quiz" | "vision" | "cache" | "preview";
  words: VocabImageWord[];
};

const JOSA_SUFFIX =
  /(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|부터|까지|한테|께|보다|처럼|같이|이다|이에요|예요|야|다)$/;

/** Hangul runs that appear as vocab in tweets (includes 1-syllable words like 전/후). */
export function hangulRunsInText(text: string): string[] {
  return [...new Set(String(text || "").match(/[가-힣]+/g) ?? [])];
}

export function normalizeHangulStem(token: string): string {
  const t = String(token || "").trim();
  if (!t) return "";
  const stripped = t.replace(JOSA_SUFFIX, "");
  return stripped.length >= 1 ? stripped : t;
}

export function allowedHangulSet(words: VocabImageWord[]): Set<string> {
  const set = new Set<string>();
  for (const w of words) {
    const h = String(w.hangul || "").trim();
    if (!h) continue;
    set.add(h);
    set.add(normalizeHangulStem(h));
    const noPrefix = h.replace(/^[-–—]+/, "");
    if (noPrefix && noPrefix !== h) {
      set.add(noPrefix);
      set.add(normalizeHangulStem(noPrefix));
    }
    // Allow bare stem if entry is a short phrase with spaces removed
    const compact = h.replace(/\s+/g, "");
    if (compact) set.add(compact);
    for (const part of h.split(/\s+/).filter(Boolean)) {
      set.add(part);
      set.add(normalizeHangulStem(part));
    }
  }
  return set;
}

/**
 * True when every Hangul run in `text` is covered by an allowed image word
 * (exact match, stem match, or allowed word contained in the run).
 */
export function tweetHangulMatchesImageWords(
  text: string,
  words: VocabImageWord[],
): { ok: boolean; foreign: string[] } {
  if (!words.length) {
    const runs = hangulRunsInText(text);
    return { ok: runs.length === 0, foreign: runs };
  }
  const allowed = allowedHangulSet(words);
  const foreign: string[] = [];
  for (const run of hangulRunsInText(text)) {
    if (isHangulRunAllowed(run, allowed)) continue;
    foreign.push(run);
  }
  return { ok: foreign.length === 0, foreign };
}

function isHangulRunAllowed(run: string, allowed: Set<string>): boolean {
  if (allowed.has(run)) return true;
  const stem = normalizeHangulStem(run);
  if (allowed.has(stem)) return true;
  for (const a of allowed) {
    if (!a) continue;
    if (run === a || stem === a) return true;
    // Compound / particle-glued forms may contain a full multi-syllable allowed word.
    // Never treat a 1-syllable allowlist hit as a substring of a longer foreign word
    // (e.g. 후 inside 허전하다).
    if (a.length >= 2 && (run.includes(a) || stem.includes(a))) return true;
    // Multi-word image labels ("화가 나다") — each spaced token is allowed.
    if (a.includes(" ")) {
      const parts = a.split(/\s+/).filter(Boolean);
      if (parts.includes(run) || parts.includes(stem)) return true;
    }
  }
  return false;
}

export function formatAllowedWordsForPrompt(words: VocabImageWord[]): string {
  if (!words.length) return "(none — do NOT invent any Hangul)";
  return words
    .map((w, i) => {
      const bits = [`${i + 1}. ${w.hangul}`];
      if (w.romanization) bits.push(`[${w.romanization}]`);
      if (w.english) bits.push(`= ${w.english}`);
      return bits.join(" ");
    })
    .join("\n");
}

export function wordsFromQuizBundle(bundle: VocabBundle): VocabImageWord[] {
  if (bundle.format !== "quiz_comment" || !bundle.quiz) return [];
  return bundle.quiz.options.map((o) => ({
    hangul: o.hangul.trim(),
    romanization: o.romanization.trim(),
  }));
}

export function wordsCachePath(dir: string, bundleId: string): string {
  return path.join(dir, `${bundleId}.words.json`);
}

export function loadCachedVocabImageWords(
  dir: string,
  bundleId: string,
): VocabImageWordsPayload | null {
  const p = wordsCachePath(dir, bundleId);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8")) as VocabImageWordsPayload;
    if (!raw?.words?.length) return null;
    return {
      ...raw,
      source: "cache",
      words: raw.words
        .map((w) => ({
          hangul: String(w.hangul || "").trim(),
          romanization: w.romanization ? String(w.romanization).trim() : undefined,
          english: w.english ? String(w.english).trim() : undefined,
        }))
        .filter((w) => w.hangul.length > 0),
    };
  } catch {
    return null;
  }
}

export function saveVocabImageWords(
  dir: string,
  payload: VocabImageWordsPayload,
): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    wordsCachePath(dir, payload.bundleId),
    JSON.stringify(payload, null, 2),
  );
}

function parseWordsJson(raw: string): VocabImageWord[] {
  try {
    const parsed = JSON.parse(raw) as {
      words?: Array<{ hangul?: string; romanization?: string; english?: string }>;
    };
    if (!Array.isArray(parsed.words)) return [];
    return parsed.words
      .map((w) => ({
        hangul: String(w.hangul || "").trim(),
        romanization: w.romanization ? String(w.romanization).trim() : undefined,
        english: w.english ? String(w.english).trim() : undefined,
      }))
      .filter((w) => /[가-힣]/.test(w.hangul));
  } catch {
    return [];
  }
}

async function extractWordsViaVision(input: {
  imagePath?: string;
  imageUrl?: string;
  bundleTitle: string;
  antonymPair?: boolean;
}): Promise<VocabImageWord[]> {
  if (!readAzureOpenAIConfig()) return [];

  let dataUrl: string | null = null;
  if (input.imagePath && fs.existsSync(input.imagePath)) {
    const b64 = fs.readFileSync(input.imagePath).toString("base64");
    dataUrl = `data:image/png;base64,${b64}`;
  } else if (input.imageUrl?.startsWith("http")) {
    try {
      const res = await fetch(input.imageUrl, { signal: AbortSignal.timeout(60_000) });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const ctype = res.headers.get("content-type") || "image/png";
        dataUrl = `data:${ctype};base64,${buf.toString("base64")}`;
      }
    } catch {
      dataUrl = null;
    }
  }
  if (!dataUrl) return [];

  const system = input.antonymPair
    ? `You read Korean antonym (X vs Y) vocabulary cards.
Return JSON only: {"words":[{"hangul":"...","romanization":"...","english":"..."}]}

Rules:
- Return EXACTLY the two main topic words — one per panel (left then right).
- Use the large Hangul labels that are the pair being taught (e.g. 전 / 후), NOT example sentences or related emotion words.
- Do NOT invent words that are not visible.
- Skip UI chrome, hashtags, and tiny decorative text.
- romanization/english: copy from the image when present; else best short guess.`
    : `You read Korean vocabulary infographic images.
Return JSON only: {"words":[{"hangul":"...","romanization":"...","english":"..."}]}

Rules:
- List EVERY distinct Korean vocab item printed on the card (Hangul labels in cells / split panels / list rows / quiz options).
- Do NOT invent words that are not visible.
- Skip UI chrome: "KOREAN", "What is this in Korean?", badges, CTA bars.
- Prefer the main dictionary form shown (large Hangul), not tiny decorative text.
- romanization/english: copy from the image when present; else best short guess.
- Max 24 words. Order top-to-bottom, left-to-right.`;

  const user = [
    {
      type: "text",
      text: input.antonymPair
        ? `Topic hint: ${input.bundleTitle}\nExtract ONLY the two main Hangul topic words on this antonym card (left panel, then right panel).`
        : `Topic hint: ${input.bundleTitle}\nExtract the Hangul vocabulary printed on this image.`,
    },
    { type: "image_url", image_url: { url: dataUrl } },
  ];

  const detail = await azureChatCompletionDetail(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { maxTokens: 1200, temperature: 0.1 },
  );
  if (!detail.text) return [];
  const cleaned = detail.text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return parseWordsJson(cleaned);
}

/**
 * For antonym (X vs Y) cards, keep only the two topic panel words.
 * Prefer english matches to the title's left/right; else first two vision hits.
 */
export function narrowToTopicWords(
  bundle: VocabBundle,
  words: VocabImageWord[],
): VocabImageWord[] {
  if (bundle.format !== "antonym_split") return words;
  const cleaned = words.filter((w) => w.hangul?.trim());
  if (cleaned.length <= 2) return cleaned;

  const parts = bundle.title.split(/\s+vs\s+/i);
  if (parts.length === 2) {
    const left = parts[0]!.trim().toLowerCase();
    const right = parts[1]!.trim().toLowerCase();
    const score = (w: VocabImageWord, side: string) => {
      const eng = String(w.english || "").toLowerCase();
      if (!eng) return 0;
      if (eng === side) return 3;
      if (eng.includes(side) || side.includes(eng)) return 2;
      return 0;
    };
    let bestA: VocabImageWord | null = null;
    let bestB: VocabImageWord | null = null;
    let bestScore = -1;
    for (const a of cleaned) {
      for (const b of cleaned) {
        if (a === b) continue;
        const s = score(a, left) + score(b, right);
        if (s > bestScore) {
          bestScore = s;
          bestA = a;
          bestB = b;
        }
      }
    }
    if (bestA && bestB && bestScore > 0) return [bestA, bestB];
  }

  // Prefer short dictionary labels (전/후) over long example sentences.
  return [...cleaned]
    .sort((a, b) => a.hangul.length - b.hangul.length)
    .slice(0, 2);
}

/** True when an antonym tweet that uses Hangul mentions both topic words. */
export function antonymTweetUsesTopicPair(
  text: string,
  topicWords: VocabImageWord[],
): boolean {
  if (topicWords.length < 2) return true;
  const runs = hangulRunsInText(text);
  if (runs.length === 0) return true; // English-only is safe
  const allowed = allowedHangulSet(topicWords);
  for (const run of runs) {
    if (!isHangulRunAllowed(run, allowed)) return false;
  }
  const mentions = (w: VocabImageWord) => {
    const h = String(w.hangul || "").trim();
    if (!h) return false;
    const parts = h.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      return parts.every((p) =>
        runs.some((r) => r === p || normalizeHangulStem(r) === p || r.includes(p)),
      );
    }
    return runs.some((r) => isHangulRunAllowed(r, allowedHangulSet([w])));
  };
  return mentions(topicWords[0]!) && mentions(topicWords[1]!);
}

/**
 * Resolve the Hangul that appears (or should appear) on the card.
 * Prefers quiz options → disk cache → vision OCR → empty.
 * Antonym cards are narrowed to the two topic words.
 */
export async function resolveVocabImageWords(input: {
  bundle: VocabBundle;
  cacheDir?: string;
  imagePath?: string;
  imageUrl?: string;
  forceRefresh?: boolean;
}): Promise<VocabImageWordsPayload> {
  const { bundle } = input;
  const quizWords = wordsFromQuizBundle(bundle);
  if (quizWords.length) {
    const payload: VocabImageWordsPayload = {
      bundleId: bundle.id,
      extractedAt: new Date().toISOString(),
      source: "quiz",
      words: quizWords,
    };
    if (input.cacheDir) saveVocabImageWords(input.cacheDir, payload);
    return payload;
  }

  if (input.cacheDir && !input.forceRefresh) {
    const cached = loadCachedVocabImageWords(input.cacheDir, bundle.id);
    if (cached?.words.length) {
      return {
        ...cached,
        words: narrowToTopicWords(bundle, cached.words),
      };
    }
  }

  const visionWords = await extractWordsViaVision({
    imagePath: input.imagePath,
    imageUrl: input.imageUrl,
    bundleTitle: bundle.title,
    antonymPair: bundle.format === "antonym_split",
  });
  if (visionWords.length) {
    const words = narrowToTopicWords(bundle, visionWords);
    const payload: VocabImageWordsPayload = {
      bundleId: bundle.id,
      extractedAt: new Date().toISOString(),
      source: "vision",
      words,
    };
    if (input.cacheDir) saveVocabImageWords(input.cacheDir, payload);
    return payload;
  }

  // No Hangul known — caption builder must not invent any.
  return {
    bundleId: bundle.id,
    extractedAt: new Date().toISOString(),
    source: "preview",
    words: [],
  };
}
