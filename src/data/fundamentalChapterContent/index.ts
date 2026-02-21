/**
 * 챕터별 본문 — slug로 해당 챕터만 동적 로드.
 * Grammar와 동일한 블록 형식 (GrammarChapterContent) 사용.
 */

import type { GrammarChapterContent } from "../grammarTypes";

const SLUG_LIST = [
  "hangul-01",
  "hangul-02",
  "hangul-03",
  "pronunciation-01",
  "pronunciation-02",
  "numbers-01",
  "numbers-02",
  "numbers-03",
  "counters-01",
  "time-01",
  "date-01",
  "date-02",
  "essential-01",
  "essential-02",
  "essential-03",
  "essential-04",
  "essential-05",
  "essential-06",
  "essential-07",
] as const;
if(process.env.NODE_ENV === "development") {
  console.log(SLUG_LIST);
}
type Slug = (typeof SLUG_LIST)[number];

const loaders: Record<Slug, () => Promise<{ content: GrammarChapterContent }>> = {
  "hangul-01": () => import("./content/hangul-01"),
  "hangul-02": () => import("./content/hangul-02"),
  "hangul-03": () => import("./content/hangul-03"),
  "pronunciation-01": () => import("./content/pronunciation-01"),
  "pronunciation-02": () => import("./content/pronunciation-02"),
  "numbers-01": () => import("./content/numbers-01"),
  "numbers-02": () => import("./content/numbers-02"),
  "numbers-03": () => import("./content/numbers-03"),
  "counters-01": () => import("./content/counters-01"),
  "time-01": () => import("./content/time-01"),
  "date-01": () => import("./content/date-01"),
  "date-02": () => import("./content/date-02"),
  "essential-01": () => import("./content/essential-01"),
  "essential-02": () => import("./content/essential-02"),
  "essential-03": () => import("./content/essential-03"),
  "essential-04": () => import("./content/essential-04"),
  "essential-05": () => import("./content/essential-05"),
  "essential-06": () => import("./content/essential-06"),
  "essential-07": () => import("./content/essential-07"),
};

export async function getChapterContent(
  slug: string,
): Promise<GrammarChapterContent | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  return m.content ?? null;
}
