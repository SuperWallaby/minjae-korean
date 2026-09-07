/**
 * Related-note clusters for `/blog/article/*`.
 * One family per post (see docs/research/keysearch/kaja-blog-keyword-picks.md).
 * Order within a cluster = preferred related order.
 */

export const BLOG_RELATED_CLUSTERS = [
  {
    id: "study-method",
    label: "How to study Korean",
    slugs: [
      "how-long-does-it-take-to-learn-korean",
      "is-korean-hard-to-learn",
      "korean-study-plans-realistic-flexible-goals",
      "korean-conversation-practice",
      "2026-korean-study-method-blended-learning-flow",
      "good-korean-teacher-2026",
      "balanced-practice-trumps-method-for-korean",
    ],
  },
  {
    id: "reading-books",
    label: "Reading & books",
    slugs: [
      "easy-korean-reading",
      "best-korean-textbook-for-self-study",
      "why-korean-translation-loses-meaning",
    ],
  },
  {
    id: "apps",
    label: "Apps & tools",
    slugs: [
      "is-duolingo-good-for-korean",
      "anki-korean",
      "what-is-this-called-in-korean-vs-duolingo",
      "what-is-this-called-in-korean-vs-anki",
      "korean-vocab-quiz-vs-flashcards",
    ],
  },
  {
    id: "grammar-culture",
    label: "Grammar & culture",
    slugs: [
      "korean-verb-endings",
      "why-eun-neun-and-i-ga-feel-so-different",
      "why-koreans-cant-speak-english-after-12-years",
      "bts-7-letters-far-future-korean-phrases",
      "study-korean-what-is-arirang",
      "how-to-understand-korean-dialects-bts-suga",
      "jimin-busan-dialect-korean",
      "mastering-korean-emotions-not-just-words",
    ],
  },
] as const;

export type BlogRelatedClusterId =
  (typeof BLOG_RELATED_CLUSTERS)[number]["id"];

const SLUG_TO_CLUSTER = new Map<string, (typeof BLOG_RELATED_CLUSTERS)[number]>();
for (const cluster of BLOG_RELATED_CLUSTERS) {
  for (const slug of cluster.slugs) {
    SLUG_TO_CLUSTER.set(slug, cluster);
  }
}

export function blogRelatedClusterFor(slug: string) {
  return SLUG_TO_CLUSTER.get(slug) ?? null;
}

/** Prefer same-cluster peers; fall back to study-method hub notes. */
export function relatedBlogSlugsFor(
  slug: string,
  limit = 4,
  opts?: { allowUnlisted?: boolean; listedOnly?: Set<string> | readonly string[] },
): string[] {
  const listed =
    opts?.listedOnly == null
      ? null
      : opts.listedOnly instanceof Set
        ? opts.listedOnly
        : new Set(opts.listedOnly);

  const allowUnlisted = opts?.allowUnlisted ?? false;
  const ok = (s: string) => {
    if (s === slug) return false;
    if (!listed) return true;
    if (listed.has(s)) return true;
    return allowUnlisted;
  };

  const cluster = blogRelatedClusterFor(slug);
  const primary = (cluster?.slugs ?? []).filter(ok);

  if (primary.length >= limit) return primary.slice(0, limit);

  const hub = BLOG_RELATED_CLUSTERS.find((c) => c.id === "study-method");
  const fill = (hub?.slugs ?? []).filter(
    (s) => ok(s) && !primary.includes(s),
  );
  return [...primary, ...fill].slice(0, limit);
}
