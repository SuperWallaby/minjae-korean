/** Korean TTS STT round-trip helpers (Hangul CER). */

const HANGUL_RE = /[\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FF]/;
const STRIP_RE = /[\s.,!?;:'"()[\]{}·…—–\-~`‘’“”]+/g;

export function normalizeKoreanForCompare(text: string): string {
  const cleaned = (text || "").trim().replace(STRIP_RE, "");
  return [...cleaned].filter((ch) => HANGUL_RE.test(ch)).join("");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const ins = curr[j - 1]! + 1;
      const del = prev[j]! + 1;
      const sub = prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      curr.push(Math.min(ins, del, sub));
    }
    for (let j = 0; j < prev.length; j += 1) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

/** Similarity in [0, 1] from normalized character error rate. */
export function scoreTtsMatch(expected: string, transcribed: string): number {
  const exp = normalizeKoreanForCompare(expected);
  const trans = normalizeKoreanForCompare(transcribed);
  if (!exp) return trans ? 0 : 1;
  if (exp === trans) return 1;
  const cer = levenshtein(exp, trans) / exp.length;
  return Math.max(0, 1 - cer);
}

/** Short isolated words need a slightly looser bar than long sentences. */
export function minScoreForText(text: string): number {
  const n = normalizeKoreanForCompare(text).length;
  if (n <= 2) return 0.7;
  if (n <= 4) return 0.8;
  return 0.88;
}
