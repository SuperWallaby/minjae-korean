import sharp from "sharp";

import {
  renderCapybaraDialogueImage,
  type GroupedAnswer,
} from "@/lib/capybaraDialogueImage";

export type GrammarComparisonImageItem = {
  /** Korean word — the only Korean allowed on the image. */
  wordName: string;
  situationsEn: string[];
};

export type RenderGrammarComparisonImageInput = {
  questionEn: string;
  items: GrammarComparisonImageItem[];
  /** Final width in pixels (default 960). */
  outputWidth?: number;
  /** WebP quality 1–100 (default 85). */
  webpQuality?: number;
};

/** Max English description after `{word}:` — whole phrases only, never truncated. */
const IMAGE_MAX_DESC_CHARS = 48;
const IMAGE_MAX_QUESTION_CHARS = 48;

/** Pick comma-separated English cues that fit fully within the capybara answer column. */
function pickDescriptionForImage(item: GrammarComparisonImageItem): string {
  const en = item.situationsEn.map((s) => s.trim()).filter(Boolean);
  if (en.length === 0) return "";

  const sorted = [...en].sort((a, b) => a.length - b.length);
  const parts: string[] = [];

  for (const label of sorted) {
    if (!label || parts.includes(label)) continue;
    const candidate = parts.length ? `${parts.join(", ")}, ${label}` : label;
    if (candidate.length > IMAGE_MAX_DESC_CHARS) break;
    parts.push(label);
  }

  return parts.join(", ");
}

/** English question; Korean appears only as compared word names. */
export function compactQuestionForImage(
  questionEn: string,
  wordNames: string[],
): string {
  const words = wordNames.filter(Boolean);
  const fallback =
    words.length >= 2
      ? `When to use ${words.join(" vs ")}?`
      : words.length === 1
        ? `When to use ${words[0]}?`
        : "Which one?";

  const q = questionEn.trim();
  if (!q) return fallback;

  // Accept AI question if it's English-framed and uses the word names (no stray Korean prose).
  const hasHangulOutsideWords = q.replace(
    new RegExp(words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g"),
    "",
  ).match(/[\u3131-\uD79D]/);

  if (
    !hasHangulOutsideWords &&
    q.length <= IMAGE_MAX_QUESTION_CHARS &&
    q.split(/\s+/).length <= 10
  ) {
    return q.endsWith("?") ? q : `${q}?`;
  }

  return fallback;
}

export function compactItemsForImage(
  items: GrammarComparisonImageItem[],
): GroupedAnswer[] {
  return items.map((item) => ({
    word: item.wordName.trim(),
    situations: [pickDescriptionForImage(item)].filter(Boolean),
  }));
}

/**
 * Render a capybara Q&A comparison image as optimized WebP (~960px wide).
 * All copy is English except the compared Korean word names.
 */
export async function renderGrammarComparisonImage(
  input: RenderGrammarComparisonImageInput,
): Promise<Buffer> {
  const wordNames = input.items.map((i) => i.wordName.trim()).filter(Boolean);
  const groupedAnswers = compactItemsForImage(input.items);
  const question = compactQuestionForImage(input.questionEn, wordNames);

  const png = await renderCapybaraDialogueImage({
    question,
    groupedAnswers,
    answerFormat: "groupedList",
    groupedListCompact: true,
    groupedListCompactGap: 14,
    outputWidth: 1600,
  });

  const width = input.outputWidth ?? 960;
  const quality = input.webpQuality ?? 85;

  return sharp(png)
    .resize(width, undefined, { kernel: sharp.kernel.lanczos3 })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

export function defaultGrammarComparisonImageAlt(
  titleEn: string,
  words: string[],
): string {
  const list = words.filter(Boolean).join(", ");
  if (titleEn.trim()) {
    return `Korean comparison: ${titleEn.trim()} — when to use ${list}`;
  }
  return `Korean grammar comparison — when to use ${list}`;
}
