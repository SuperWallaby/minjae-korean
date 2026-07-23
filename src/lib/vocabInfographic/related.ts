import type { VocabSeoPage } from "./seoTypes";

function normalizeToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\uac00-\ud7a3]+/g, "");
}

function titleTokens(page: VocabSeoPage): Set<string> {
  const raw = `${page.title} ${page.titleEn} ${page.slug}`.split(/[\s\-_/]+/);
  const out = new Set<string>();
  for (const t of raw) {
    const n = normalizeToken(t);
    if (n.length >= 2 && n !== "korean" && n !== "vs" && n !== "in") {
      out.add(n);
    }
  }
  return out;
}

function wordKeys(page: VocabSeoPage): Set<string> {
  const out = new Set<string>();
  for (const w of page.words) {
    const en = normalizeToken(w.english);
    const ko = normalizeToken(w.hangul);
    if (en) out.add(`en:${en}`);
    if (ko) out.add(`ko:${ko}`);
  }
  return out;
}

/** Higher = more related. Deterministic for stable SEO links. */
export function scoreVocabSeoRelated(
  current: VocabSeoPage,
  other: VocabSeoPage,
): number {
  if (current.bundleId === other.bundleId) return -1;
  let score = 0;
  if (current.format === other.format) score += 12;

  const tags = new Set(current.tags.map((t) => t.toLowerCase()));
  for (const t of other.tags) {
    if (tags.has(t.toLowerCase())) score += 8;
  }

  const mine = wordKeys(current);
  for (const k of wordKeys(other)) {
    if (mine.has(k)) score += 14;
  }

  const myTitle = titleTokens(current);
  for (const t of titleTokens(other)) {
    if (myTitle.has(t)) score += 4;
  }

  // Soft preference for pages that already have enrich copy (better click target).
  if (other.explanationEn) score += 1;

  return score;
}

/**
 * Related charts for internal linking.
 * Mixes tag/format/word similarity with a ring of neighbors so every page
 * always has somewhere to go next (endless crawl path).
 */
export function pickRelatedVocabSeoPages(
  current: VocabSeoPage,
  all: VocabSeoPage[],
  limit = 14,
): VocabSeoPage[] {
  const cap = Math.max(4, Math.min(24, limit));
  const others = all.filter((p) => p.bundleId !== current.bundleId);
  if (others.length === 0) return [];

  const scored = others
    .map((p) => ({
      page: p,
      score: scoreVocabSeoRelated(current, p),
    }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.page.bundleId.localeCompare(b.page.bundleId),
    );

  const picked = new Map<string, VocabSeoPage>();

  // Same-format ring: neighbors so the graph is always connected.
  const sameFormat = others
    .filter((p) => p.format === current.format)
    .sort((a, b) => a.bundleId.localeCompare(b.bundleId));
  if (sameFormat.length > 0) {
    let insertAt = sameFormat.findIndex((p) => p.bundleId > current.bundleId);
    if (insertAt < 0) insertAt = 0;
    for (let step = 0; step < 4 && picked.size < cap; step += 1) {
      const next = sameFormat[(insertAt + step) % sameFormat.length]!;
      const prev =
        sameFormat[
          (insertAt - 1 - step + sameFormat.length * 4) % sameFormat.length
        ]!;
      picked.set(next.bundleId, next);
      if (picked.size >= cap) break;
      picked.set(prev.bundleId, prev);
    }
  }

  for (const row of scored) {
    if (picked.size >= cap) break;
    picked.set(row.page.bundleId, row.page);
  }

  // Absolute fallback: alphabetical neighbors across all pages.
  if (picked.size < Math.min(cap, others.length)) {
    const sorted = [...others].sort((a, b) =>
      a.bundleId.localeCompare(b.bundleId),
    );
    let insertAt = sorted.findIndex((p) => p.bundleId > current.bundleId);
    if (insertAt < 0) insertAt = 0;
    for (let i = 0; picked.size < cap && i < sorted.length; i += 1) {
      const n = sorted[(insertAt + i) % sorted.length]!;
      picked.set(n.bundleId, n);
    }
  }

  // Stable output: scored first, then remaining by id.
  const scoreMap = new Map(scored.map((s) => [s.page.bundleId, s.score]));
  return [...picked.values()]
    .sort(
      (a, b) =>
        (scoreMap.get(b.bundleId) ?? 0) - (scoreMap.get(a.bundleId) ?? 0) ||
        a.bundleId.localeCompare(b.bundleId),
    )
    .slice(0, cap);
}
