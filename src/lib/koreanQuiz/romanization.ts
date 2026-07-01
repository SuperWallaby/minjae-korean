import { createRequire } from "node:module";

type HangulRomanizeModule = {
  Romanize: {
    from: (
      text: string,
      opts: { format: number; separator: string },
    ) => string;
  };
  Format: { ACADEMIC: number };
};

const nodeRequire = createRequire(import.meta.url);

function loadHangulRomanize(): HangulRomanizeModule {
  // CJS package — avoid webpack ESM interop (breaks /api/vocab-quiz/queue).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = nodeRequire("hangul-romanize") as
    | HangulRomanizeModule
    | { default: HangulRomanizeModule };
  if ("default" in mod && mod.default) return mod.default;
  return mod as HangulRomanizeModule;
}

const { Romanize, Format } = loadHangulRomanize();

/** Format 8 style: `[ sa-gwa ]` */
export function formatBracketedPronunciation(text: string): string {
  const inner = text
    .trim()
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .trim()
    .replace(/\.+$/, "")
    .replace(/\s+/g, " ");
  if (!inner) return "";
  return `[ ${inner} ]`;
}

/** Revised romanization with hyphenated syllables (e.g. gang-a-ji). */
export function romanizeKoreanText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const parts: string[] = [];
  const segments = trimmed.match(/[\uac00-\ud7a3]+|[^\uac00-\ud7a3]+/g) ?? [];

  for (const segment of segments) {
    if (/^[\uac00-\ud7a3]+$/.test(segment)) {
      const syllables = [...segment].map((ch) =>
        Romanize.from(ch, { format: Format.ACADEMIC, separator: "-" }),
      );
      parts.push(syllables.filter(Boolean).join("-"));
    } else {
      parts.push(segment);
    }
  }

  return parts.join("").replace(/\s+/g, " ").trim();
}

export function resolveRomanizationDisplay(
  koreanLabel: string,
  storedRomanization?: string,
): string | undefined {
  const raw =
    storedRomanization?.trim() || romanizeKoreanText(koreanLabel);
  if (!raw) return undefined;
  return formatBracketedPronunciation(raw);
}
