import { comparisonWordsFromSlug } from "@/lib/grammarComparisonSlug";

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Extract searchable keys from grammar content for related matching. */
export function grammarRelatedKeys(...sources: string[]): string[] {
  const keys = new Set<string>();
  for (const source of sources) {
    const trimmed = source.trim();
    if (!trimmed || trimmed.length < 2) continue;
    keys.add(trimmed.toLowerCase());

    const noParen = trimmed.replace(/\([^)]*\)/g, "").trim();
    if (noParen.length >= 2) keys.add(noParen.toLowerCase());

    for (const m of trimmed.matchAll(/[\uac00-\ud7a3]+/g)) {
      keys.add(m[0]);
    }

    if (trimmed.startsWith("-")) {
      const stem = trimmed.replace(/^[-–]+/, "");
      if (stem.length >= 2) keys.add(stem.toLowerCase());
    }

    for (const part of trimmed.split(/[\s·/]+/)) {
      const token = part.trim().toLowerCase();
      if (token.length >= 3 && /^[a-z0-9-]+$/.test(token)) keys.add(token);
    }
  }
  return [...keys].slice(0, 20);
}

export function comparisonRelatedKeys(
  slug: string,
  items?: { wordName: string }[],
  titleEn?: string,
): string[] {
  return grammarRelatedKeys(
    ...comparisonWordsFromSlug(slug),
    ...(items?.map((item) => item.wordName) ?? []),
    titleEn ?? "",
  );
}

export function guideRelatedKeys(
  wordName: string,
  slug: string,
  titleEn?: string,
  englishPhrase?: string,
): string[] {
  return grammarRelatedKeys(
    wordName,
    slug,
    titleEn ?? "",
    englishPhrase ?? "",
  );
}

export function scoreSlugMatch(slug: string, keys: string[]): number {
  const slugLower = slug.toLowerCase();
  let score = 0;
  for (const key of keys) {
    if (key.length < 2) continue;
    if (slugLower.includes(key)) score += key.length >= 4 ? 3 : 2;
    const parts = comparisonWordsFromSlug(slug).map((part) => part.toLowerCase());
    if (parts.includes(key)) score += 5;
  }
  return score;
}

export function scoreWordNameMatch(wordName: string, keys: string[]): number {
  const normalized = wordName.trim().toLowerCase();
  let score = 0;
  for (const key of keys) {
    if (key === normalized) score += 10;
    else if (normalized.includes(key) || key.includes(normalized)) score += 4;
  }
  return score;
}

export function rankByRelatedScore<T extends { score: number; id: number }>(
  items: T[],
  cap: number,
): T[] {
  return items
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, cap);
}
