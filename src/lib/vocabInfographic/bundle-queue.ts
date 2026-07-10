import type { VocabBundle } from "./bundle-catalog";

export type BundleQueueTier = "expression" | "noun" | "list" | "antonym" | "quiz";

/** Classify bundles for mixed generation order (avoid noun-only runs). */
export function bundleQueueTier(bundle: VocabBundle): BundleQueueTier {
  if (bundle.format === "quiz_comment") return "quiz";
  if (bundle.format === "antonym_split") return "antonym";
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
 * Interleave expression + noun (+ antonym/list/quiz) so X feed is varied.
 * Weight: 2 expression : 1 noun per mini-cycle, then antonym → list → quiz.
 */
export function mixedBundleQueue(bundles: VocabBundle[], seed = 20260710): VocabBundle[] {
  const buckets: Record<BundleQueueTier, VocabBundle[]> = {
    expression: [],
    noun: [],
    list: [],
    antonym: [],
    quiz: [],
  };
  for (const b of bundles) {
    buckets[bundleQueueTier(b)].push(b);
  }
  for (const tier of Object.keys(buckets) as BundleQueueTier[]) {
    buckets[tier] = seededShuffle(buckets[tier], seed + tier.charCodeAt(0) * 97);
  }

  const rotation: BundleQueueTier[] = [
    "expression",
    "expression",
    "noun",
    "antonym",
    "list",
    "quiz",
  ];

  const out: VocabBundle[] = [];
  let start = 0;
  while (true) {
    let pushed = false;
    for (let offset = 0; offset < rotation.length; offset++) {
      const tier = rotation[(start + offset) % rotation.length]!;
      const next = buckets[tier].shift();
      if (next) {
        out.push(next);
        start = (start + offset + 1) % rotation.length;
        pushed = true;
        break;
      }
    }
    if (!pushed) break;
  }
  return out;
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
