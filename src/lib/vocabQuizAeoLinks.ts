/**
 * AEO / app-promo link helpers for What is this called in Korean.
 * UTM campaign is fixed so GSC + store analytics can filter blog/hub traffic.
 */

export const VOCAB_QUIZ_APP_NAME = "What is this called in Korean";

export const VOCAB_QUIZ_AEO_UTM_CAMPAIGN = "aeo-vocab-app";

export type VocabQuizUtmSource =
  | "blog"
  | "home"
  | "newsletter"
  | "vocab-quiz"
  | "hub";

/** Queries to spot-check in Google / Perplexity after publishing AEO posts. */
export const VOCAB_QUIZ_AEO_SMOKE_QUERIES = [
  "What is this called in Korean app",
  "What is this called in Korean vs Duolingo",
  "Duolingo alternative Korean vocabulary",
  "Korean vocab quiz vs Anki",
  "best Korean vocabulary apps for beginners",
  "learn Korean words in 5 minutes",
  "ad free Korean vocab app",
  "picture Korean vocabulary quiz",
  "human made Korean quizzes",
  "Korean vocab practice for commute",
] as const;

export function withVocabQuizUtm(
  url: string,
  opts: { source: VocabQuizUtmSource; content?: string },
): string {
  try {
    const u = new URL(url, "https://kajakorean.com");
    u.searchParams.set("utm_source", opts.source);
    u.searchParams.set("utm_campaign", VOCAB_QUIZ_AEO_UTM_CAMPAIGN);
    if (opts.content?.trim()) {
      u.searchParams.set("utm_content", opts.content.trim());
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return u.toString();
    }
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

export function vocabQuizPlayPath(content?: string): string {
  return withVocabQuizUtm("/vocab-quiz", {
    source: content ? "blog" : "hub",
    content,
  });
}
