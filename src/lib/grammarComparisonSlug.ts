/** Words from a comparison slug (`word-a-vs-word-b` or legacy `word-a-b-c`). */
export function comparisonWordsFromSlug(slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) return [];

  if (trimmed.includes("-vs-")) {
    return trimmed
      .split("-vs-")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  const legacy = trimmed
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);
  if (legacy.length >= 2) return legacy;

  return [trimmed];
}

export function comparisonWordCountFromSlug(slug: string): number {
  return comparisonWordsFromSlug(slug).length;
}

export function formatComparisonWords(slug: string): string {
  return comparisonWordsFromSlug(slug).join(" · ");
}

/** Mongo filter: slug has at least two `-vs-` separators (3+ words). */
export const COMPARISON_THREE_WAY_SLUG_REGEX = /-vs-[^-]+-vs-/;
