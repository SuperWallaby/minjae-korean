export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  dateISO: string;
  readingTimeMin: number;
  body: string;
};

export const posts: Post[] = [
  {
    slug: "how-to-practice-speaking-without-freezing",
    title: "How to practice speaking without freezing",
    excerpt:
      "A simple way to reduce hesitation: smaller sentences, clearer intent, and repetition that still feels natural.",
    dateISO: "2026-02-01",
    readingTimeMin: 4,
    body:
      "In conversation, the goal is not perfection—it’s continuity. We start with short, complete sentences, then expand. The same idea gets said three ways, so your brain learns options.\n\nIn lessons, we keep the flow: quick corrections, then you use the corrected phrase immediately.",
  },
  {
    slug: "natural-phrasing-what-to-listen-for",
    title: "Natural phrasing: what to listen for",
    excerpt:
      "The difference is usually not grammar—it’s rhythm, connectors, and a few go-to patterns you can reuse.",
    dateISO: "2026-01-18",
    readingTimeMin: 5,
    body:
      "If a sentence is technically correct but sounds “bookish”, we usually adjust one of these: connector choice, word order for emphasis, or the ending style.\n\nA small set of patterns, practiced in real scenarios, goes a long way.",
  },
  {
    slug: "pronunciation-quick-wins",
    title: "Pronunciation quick wins",
    excerpt:
      "Most improvement comes from a few high-impact sounds. Fix those first, then refine intonation.",
    dateISO: "2025-12-29",
    readingTimeMin: 3,
    body:
      "We prioritize clarity over accent. First we identify the sounds that change meaning the most. Then we practice them inside short phrases, not isolated drills.\n\nOnce clarity is stable, we add rhythm and intonation so it sounds natural.",
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}

