import { Format, Romanize } from "hangul-romanize";

const HANGUL = /[\uac00-\ud7a3]/;

function romanizeKoreanText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const parts: string[] = [];
  const segments = trimmed.match(/[\uac00-\ud7a3]+|[^\uac00-\ud7a3]+/g) ?? [];

  for (const segment of segments) {
    if (/^[\uac00-\ud7a3]+$/.test(segment)) {
      const syllables = [...segment].map((ch) =>
        Romanize.from(ch, { format: Format.LOWERCASE, separator: "-" }),
      );
      parts.push(syllables.filter(Boolean).join("-"));
    } else {
      parts.push(segment);
    }
  }

  return parts.join("").replace(/\s+/g, " ").trim();
}

/** Split alternate spellings (은/는) or listed forms. */
function koreanSegments(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const slashParts = trimmed
    .split(/[/／]/)
    .map((s) => s.trim())
    .filter((s) => HANGUL.test(s));
  if (slashParts.length > 1) return slashParts;

  return HANGUL.test(trimmed) ? [trimmed] : [];
}

/**
 * SEO-friendly romanization variants (e.g. geun-de, geunde) for organic search.
 */
export function grammarRomanizationVariants(wordName: string): string[] {
  const segments = koreanSegments(wordName);
  const targets = segments.length > 0 ? segments : [wordName];
  const out = new Set<string>();

  for (const seg of targets) {
    if (!HANGUL.test(seg)) continue;
    const hyphenated = romanizeKoreanText(seg).toLowerCase().replace(/\s+/g, "");
    if (!hyphenated) continue;
    out.add(hyphenated);
    const compact = hyphenated.replace(/-/g, "");
    if (compact && compact !== hyphenated) out.add(compact);
  }

  return [...out];
}

export function formatGrammarRomanizationParenthetical(wordName: string): string {
  return grammarRomanizationVariants(wordName).join(", ");
}

/** `근데 (geunde, geun-de)` — visible in page HTML for search. */
export function formatKoreanWithRomanization(wordName: string): string {
  const rom = formatGrammarRomanizationParenthetical(wordName);
  return rom ? `${wordName} (${rom})` : wordName;
}

/** Full Korean sentence romanization (examples section). */
export function romanizeGrammarSentence(sentence: string): string {
  const raw = romanizeKoreanText(sentence).toLowerCase();
  if (!raw) return "";
  const compact = raw.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const hyphenated = raw.replace(/\s+/g, " ").trim();
  if (compact === hyphenated) return hyphenated;
  return `${hyphenated}, ${compact}`;
}
