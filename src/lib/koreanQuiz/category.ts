import { KOREAN_QUIZ_EXCLUDED_TOPICS } from "./excludedTopics";
import type { KoreanQuizItem, KoreanQuizQueueEntry } from "./types";

export const KOREAN_QUIZ_CATEGORY_BLOCK_SIZE = 6;

export type KoreanQuizCategoryBlock = {
  activeTopic: string | null;
  topicBlockRemaining: number;
  consecutiveInQueue?: number;
  skipSameTopicRefill?: boolean;
};

export const EMPTY_CATEGORY_BLOCK: KoreanQuizCategoryBlock = {
  activeTopic: null,
  topicBlockRemaining: 0,
};

export function quizTopic(item: Pick<KoreanQuizItem, "topic">): string {
  return item.topic?.trim() || "general";
}

export function isExcludedQuizTopic(item: Pick<KoreanQuizItem, "topic">): boolean {
  return KOREAN_QUIZ_EXCLUDED_TOPICS.has(quizTopic(item).toLowerCase());
}

export function queueEntryFromItem(
  item: Pick<KoreanQuizItem, "id" | "topic">,
): KoreanQuizQueueEntry {
  return {
    quizId: item.id,
    weight: 1,
    topic: quizTopic(item),
  };
}

export function inferCategoryBlockFromQueue(
  items: KoreanQuizQueueEntry[],
): KoreanQuizCategoryBlock {
  if (items.length === 0) return { ...EMPTY_CATEGORY_BLOCK };

  const headTopic = items[0].topic?.trim() || "general";
  let consecutive = 0;
  for (const entry of items) {
    const topic = entry.topic?.trim() || "general";
    if (topic !== headTopic) break;
    consecutive += 1;
  }

  return {
    activeTopic: headTopic,
    topicBlockRemaining: consecutive,
  };
}

export function pickNextCategoryTopic(
  pool: KoreanQuizItem[],
  previousTopic: string | null,
): string | null {
  if (pool.length === 0) return null;

  const counts = new Map<string, number>();
  for (const item of pool) {
    const topic = quizTopic(item);
    counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }

  const topics = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  if (topics.length === 0) return null;

  const startIdx =
    previousTopic && topics.includes(previousTopic)
      ? (topics.indexOf(previousTopic) + 1) % topics.length
      : 0;

  for (let offset = 0; offset < topics.length; offset += 1) {
    const topic = topics[(startIdx + offset) % topics.length];
    if ((counts.get(topic) ?? 0) > 0) return topic;
  }

  return topics[0];
}
