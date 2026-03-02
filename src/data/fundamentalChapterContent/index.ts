/**
 * 챕터별 본문 — slug로 해당 챕터만 동적 로드.
 * fundamentalChapterList의 slug와 1:1 매칭.
 * Grammar와 동일한 블록 형식 (GrammarChapterContent) 사용.
 */

import type { GrammarChapterContent } from "../grammarTypes";

const _SLUG_LIST = [
  "hangeul-consonants-vowels",
  "hangeul-syllable-building",
  "hangeul-batchim-basics",
  "test-hangeul-01",
  "test-numbers-01",
  "test-words-01",
  "pronunciation-minimal-pairs",
  "pronunciation-common-sound-changes",
  "verbs-01-why-verbs-change",
  "particles-01-what-they-are",
  "subject-dropping-01-context-first",
  "numbers-zero-to-ten",
  "numbers-eleven-to-ninety-nine",
  "numbers-big-numbers-core",
  "counters-top-ten",
  "time-telling-time",
  "date-weekdays-today-tomorrow-yesterday",
  "date-months-and-dates",
  "words-people-relationships",
  "words-places-core",
  "words-directions-movement",
  "words-food-ordering",
  "words-daily-life",
  "words-adjectives-mini-set",
  "words-with-numbers-reinforcement",
  "verbs-02-starter-pack",
  "sentences-01-basic-patterns",
  "test-core-grammar-01",
  "test-sentence-building-01",
] as const;

type Slug = (typeof _SLUG_LIST)[number];

const loaders: Record<Slug, () => Promise<{ content: GrammarChapterContent }>> = {
  "hangeul-consonants-vowels": () => import("./content/hangeul-consonants-vowels"),
  "hangeul-syllable-building": () => import("./content/hangeul-syllable-building"),
  "hangeul-batchim-basics": () => import("./content/hangeul-batchim-basics"),
  "test-hangeul-01": () => import("./content/test-hangeul-01"),
  "test-numbers-01": () => import("./content/test-numbers-01"),
  "test-words-01": () => import("./content/test-words-01"),
  "pronunciation-minimal-pairs": () => import("./content/pronunciation-minimal-pairs"),
  "pronunciation-common-sound-changes": () => import("./content/pronunciation-common-sound-changes"),
  "verbs-01-why-verbs-change": () => import("./content/verbs-01-why-verbs-change"),
  "particles-01-what-they-are": () => import("./content/particles-01-what-they-are"),
  "subject-dropping-01-context-first": () =>
    import("./content/subject-dropping-01-context-first"),
  "numbers-zero-to-ten": () => import("./content/numbers-zero-to-ten"),
  "numbers-eleven-to-ninety-nine": () => import("./content/numbers-eleven-to-ninety-nine"),
  "numbers-big-numbers-core": () => import("./content/numbers-big-numbers-core"),
  "counters-top-ten": () => import("./content/counters-top-ten"),
  "time-telling-time": () => import("./content/time-telling-time"),
  "date-weekdays-today-tomorrow-yesterday": () =>
    import("./content/date-weekdays-today-tomorrow-yesterday"),
  "date-months-and-dates": () => import("./content/date-months-and-dates"),
  "words-people-relationships": () => import("./content/words-people-relationships"),
  "words-places-core": () => import("./content/words-places-core"),
  "words-directions-movement": () => import("./content/words-directions-movement"),
  "words-food-ordering": () => import("./content/words-food-ordering"),
  "words-daily-life": () => import("./content/words-daily-life"),
  "words-adjectives-mini-set": () => import("./content/words-adjectives-mini-set"),
  "words-with-numbers-reinforcement": () =>
    import("./content/words-with-numbers-reinforcement"),
  "verbs-02-starter-pack": () => import("./content/verbs-02-starter-pack"),
  "sentences-01-basic-patterns": () =>
    import("./content/sentences-01-basic-patterns"),
  "test-core-grammar-01": () => import("./content/test-core-grammar-01"),
  "test-sentence-building-01": () => import("./content/test-sentence-building-01"),
};

export async function getChapterContent(
  slug: string,
): Promise<GrammarChapterContent | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  return m.content ?? null;
}
