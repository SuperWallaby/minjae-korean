import type { VocabBundle } from "./bundle-catalog";
import type { VocabInfographicFormatId } from "./formats";

export type BundleQueueTier = "expression" | "noun" | "list" | "antonym" | "quiz";

/** Classify bundles for mixed generation order (avoid noun-only runs). */
export function bundleQueueTier(bundle: VocabBundle): BundleQueueTier {
  if (bundle.format === "quiz_comment") return "quiz";
  if (bundle.format === "antonym_split") return "antonym";
  if (bundle.format === "similar_split") return "antonym";
  if (bundle.format === "concept_rows") return "expression";
  if (bundle.format === "phrase_stack") return "expression";
  if (bundle.format === "topik_upgrade") return "expression";
  if (bundle.format === "cute_cast") return "expression";
  if (bundle.format === "hanja_hub") return "expression";
  if (bundle.format === "pronunciation_grid") return "noun";
  if (bundle.format === "grammar_spotlight") return "expression";
  if (bundle.format === "compound_word") return "noun";
  if (bundle.format === "super_list") {
    const expressionList =
      bundle.tags.includes("grammar") ||
      bundle.tags.includes("phrase") ||
      /phrases|expressions|adverbs/i.test(bundle.id);
    return expressionList ? "expression" : "list";
  }
  if (
    bundle.tags.some((t) => ["verb", "adjective", "emotion", "phrase"].includes(t))
  ) {
    return "expression";
  }
  return "noun";
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Format-first rotation so Pinterest mix is not grid-heavy.
 * Prefer non-grid formats; insert one grid only every other cycle step.
 */
export function formatRotatedQueue(
  bundles: VocabBundle[],
  seed = 20260726,
): VocabBundle[] {
  const byFormat = new Map<VocabInfographicFormatId, VocabBundle[]>();
  for (const b of bundles) {
    const list = byFormat.get(b.format) ?? [];
    list.push(b);
    byFormat.set(b.format, list);
  }
  for (const [fmt, list] of byFormat) {
    byFormat.set(fmt, seededShuffle(list, seed + fmt.length * 31));
  }

  // Non-grid formats first in rotation; grid appears once per full pass.
  const preferred: VocabInfographicFormatId[] = [
    "cute_cast",
    "hanja_hub",
    "pronunciation_grid",
    "grammar_spotlight",
    "compound_word",
    "topik_upgrade",
    "similar_split",
    "phrase_stack",
    "phrase_square",
    "concept_rows",
    "quiz_comment",
    "super_list",
    "antonym_split",
    "grid_cluster",
  ];

  const out: VocabBundle[] = [];
  let start = 0;
  while (true) {
    let pushed = false;
    for (let offset = 0; offset < preferred.length; offset++) {
      const fmt = preferred[(start + offset) % preferred.length]!;
      const bucket = byFormat.get(fmt);
      const next = bucket?.shift();
      if (next) {
        out.push(next);
        start = (start + offset + 1) % preferred.length;
        pushed = true;
        break;
      }
    }
    if (!pushed) break;
  }
  return out;
}

/**
 * Interleave expression + noun (+ antonym/list/quiz) so X feed is varied.
 * Weight: 2 expression : 1 noun per mini-cycle, then antonym → list → quiz.
 * @deprecated Prefer formatRotatedQueue for balanced format mix.
 */
export function mixedBundleQueue(bundles: VocabBundle[], seed = 20260710): VocabBundle[] {
  // Default to format rotation — keeps overnight / batch evenly mixed.
  return formatRotatedQueue(bundles, seed);
}

export function summarizeBundleTiers(bundles: VocabBundle[]) {
  const counts: Record<BundleQueueTier, number> = {
    expression: 0,
    noun: 0,
    list: 0,
    antonym: 0,
    quiz: 0,
  };
  for (const b of bundles) counts[bundleQueueTier(b)] += 1;
  return counts;
}

export function summarizeByFormat(bundles: VocabBundle[]) {
  const counts: Partial<Record<VocabInfographicFormatId, number>> = {};
  for (const b of bundles) {
    counts[b.format] = (counts[b.format] ?? 0) + 1;
  }
  return counts;
}
