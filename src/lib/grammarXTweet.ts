import type { ComparisonExample } from "@/lib/grammarComparisonsRepo";
import { filterConfidentExamples } from "@/lib/grammarComparisonExamples";

const DEFAULT_HASHTAGS = "#koreanvocab #koreanword #koreanlesson";
const TWEET_CHAR_LIMIT = 280;
/** Reserve space for link line + hashtags + newlines. */
const RESERVED_WITHOUT_EXAMPLES = 80;
const DEFAULT_MAX_EXAMPLES = 4;
const MAX_ENGLISH_LINE_CHARS = 46;

function truncateForTweet(text: string, max = MAX_ENGLISH_LINE_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function englishLineForExample(ex: ComparisonExample): string {
  const translation = ex.translationEn?.trim();
  if (translation) return truncateForTweet(translation);
  return truncateForTweet(ex.reasonEn);
}

export function formatExampleLine(ex: ComparisonExample): string {
  const mark = ex.isCorrect ? "⭕" : "❌";
  const sentence = ex.sentence.trim();
  const english = englishLineForExample(ex);
  if (!english) return `${mark} ${sentence}`;
  return `${mark} ${sentence}\n→ ${english}`;
}

function exampleBlockLength(examples: ComparisonExample[]): number {
  if (examples.length === 0) return 0;
  return examples.map(formatExampleLine).join("\n").length;
}

/** Match an example to a comparison word (longest particle wins, e.g. 에서 over 에). */
export function exampleMatchesWord(
  sentence: string,
  word: string,
  allWords: string[],
): boolean {
  const text = sentence.trim();
  if (!text || !word) return false;
  if (!text.includes(word)) return false;
  for (const other of allWords) {
    if (other.length > word.length && other.includes(word) && text.includes(other)) {
      return false;
    }
  }
  return true;
}

function bucketExamplesByWord(
  words: string[],
  examples: ComparisonExample[],
): Map<string, ComparisonExample[]> {
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  const buckets = new Map<string, ComparisonExample[]>(
    words.map((word) => [word, [] as ComparisonExample[]]),
  );

  for (const ex of examples) {
    let matched: string | null = null;
    for (const word of sortedWords) {
      if (exampleMatchesWord(ex.sentence, word, words)) {
        matched = word;
        break;
      }
    }
    if (matched) buckets.get(matched)!.push(ex);
  }

  for (const word of words) {
    const pool = buckets.get(word) ?? [];
    pool.sort((a, b) => {
      if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
      const aLen = formatExampleLine(a).length;
      const bLen = formatExampleLine(b).length;
      return aLen - bLen;
    });
    buckets.set(word, pool);
  }

  return buckets;
}

function pickExamplesWithinBudget(
  candidates: ComparisonExample[],
  maxCount: number,
  charBudget: number,
): ComparisonExample[] {
  const picked: ComparisonExample[] = [];

  for (const ex of candidates) {
    if (picked.length >= maxCount) break;
    const next = [...picked, ex];
    if (exampleBlockLength(next) > charBudget) continue;
    picked.push(ex);
  }

  return picked;
}

/** Pick up to maxTotal examples, balanced across comparison sides. */
export function pickBalancedExamplesForTweet(
  words: string[],
  examples: ComparisonExample[],
  maxTotal: number,
  charBudget: number,
): ComparisonExample[] {
  const confident = filterConfidentExamples(examples);
  if (confident.length === 0 || maxTotal <= 0 || charBudget <= 0 || words.length === 0) {
    return [];
  }

  if (words.length === 1) {
    return pickExamplesWithinBudget(confident, maxTotal, charBudget);
  }

  const buckets = bucketExamplesByWord(words, confident);
  const picked: ComparisonExample[] = [];

  while (picked.length < maxTotal) {
    let added = false;
    for (const word of words) {
      if (picked.length >= maxTotal) break;
      const pool = buckets.get(word) ?? [];
      const next = pool.find((ex) => !picked.includes(ex));
      if (!next) continue;
      const candidate = [...picked, next];
      if (exampleBlockLength(candidate) > charBudget) continue;
      picked.push(next);
      added = true;
    }
    if (!added) break;
  }

  if (picked.length > 0) return picked;

  return pickExamplesWithinBudget(confident, maxTotal, charBudget);
}

function pickExamplesForTweet(
  words: string[],
  examples: ComparisonExample[],
  maxTotal: number,
  charBudget: number,
): ComparisonExample[] {
  return pickBalancedExamplesForTweet(words, examples, maxTotal, charBudget);
}

function composeTweetText(input: {
  words: string[];
  examples: ComparisonExample[];
  pageUrl: string;
  includeLink: boolean;
  maxExamples: number;
  exampleBudget: number;
}): string {
  const vs = input.words.join(" vs ");
  const header = `What is different? ${vs}`;
  const picked = pickExamplesForTweet(
    input.words,
    input.examples,
    input.maxExamples,
    Math.max(60, input.exampleBudget),
  );

  const exampleBlock =
    picked.length > 0 ? `\n${picked.map(formatExampleLine).join("\n")}\n` : "\n";

  return `${header}${exampleBlock}${input.includeLink ? `\n${input.pageUrl}\n` : "\n"}${DEFAULT_HASHTAGS}`;
}

export function buildGrammarXTweetText(input: {
  words: string[];
  examples?: ComparisonExample[];
  pageUrl: string;
  includeLink: boolean;
  maxExamples?: number;
}): string {
  const words = input.words.map((w) => w.trim()).filter(Boolean);
  const targetMax = Math.max(0, input.maxExamples ?? DEFAULT_MAX_EXAMPLES);

  const header = `What is different? ${words.join(" vs ")}`;
  const footer = `${input.includeLink ? `\n${input.pageUrl}\n` : "\n"}${DEFAULT_HASHTAGS}`;
  const exampleBudget =
    TWEET_CHAR_LIMIT -
    `${header}\n\n${footer}`.length -
    RESERVED_WITHOUT_EXAMPLES;

  const examples = input.examples ?? [];
  let maxExamples = targetMax;
  let text = composeTweetText({
    words,
    examples,
    pageUrl: input.pageUrl,
    includeLink: input.includeLink,
    maxExamples,
    exampleBudget,
  });

  while (text.length > TWEET_CHAR_LIMIT && maxExamples > 1) {
    maxExamples -= 1;
    text = composeTweetText({
      words,
      examples,
      pageUrl: input.pageUrl,
      includeLink: input.includeLink,
      maxExamples,
      exampleBudget,
    });
  }

  return text.slice(0, TWEET_CHAR_LIMIT);
}
