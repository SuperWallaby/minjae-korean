/** Hangul choseong (initial consonants), Unicode order. */
const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

function choseongFromSyllable(char: string): string | null {
  const code = char.codePointAt(0);
  if (code == null || code < 0xac00 || code > 0xd7a3) return null;
  const index = Math.floor((code - 0xac00) / 588);
  return CHOSEONG[index] ?? null;
}

/**
 * Initial-consonant hint for a Korean answer label.
 * Example: "사과" → "ㅅ ㄱ", "버스 정류장" → "ㅂ ㅅ  ㅈ ㄹ ㅈ"
 */
export function chosungHintFromLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "";

  const parts: string[] = [];
  let syllableBuf: string[] = [];

  const flushSyllables = () => {
    if (syllableBuf.length === 0) return;
    parts.push(syllableBuf.join(" "));
    syllableBuf = [];
  };

  for (const char of trimmed) {
    const cho = choseongFromSyllable(char);
    if (cho) {
      syllableBuf.push(cho);
      continue;
    }
    flushSyllables();
    if (/\s/.test(char)) {
      if (parts.length > 0 && parts[parts.length - 1] !== "") {
        parts.push("");
      }
    }
  }
  flushSyllables();

  return parts
    .join("  ")
    .replace(/\s{3,}/g, "  ")
    .trim();
}
