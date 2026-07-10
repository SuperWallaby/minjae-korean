import { randomUUID } from "crypto";

import { buildWeightedQueueEntries } from "./categoryQueue";
import { listApprovedKoreanQuizzesForQueue } from "./approvedCache";
import {
  getKoreanQuizDeviceAdaptiveScore,
  getKoreanQuizDeviceDifficultyPreference,
  updateKoreanQuizDeviceAdaptiveScore,
} from "./devicePrefs";
import { QUIZ_REAPPEAR_COOLDOWN } from "./pickWeights";
import {
  findKoreanQuizzesByIds,
  getCorrectCountByQuizId,
  getKoreanQuizDeviceQueue,
  getRecentWrongQuizIds,
  incrementKoreanQuizStats,
  insertKoreanQuizAttempt,
  saveKoreanQuizDeviceQueue,
  upsertKoreanQuizDelivery,
  findKoreanQuizById,
} from "./store";
import { toKoreanQuizPrepared } from "./public";
import type {
  KoreanQuizAttemptResponse,
  KoreanQuizItem,
  KoreanQuizPrepared,
  KoreanQuizQueueEntry,
  KoreanQuizQueueResponse,
} from "./types";

export const KOREAN_QUIZ_QUEUE_SIZE = 10;
export const KOREAN_QUIZ_QUEUE_REFILL_THRESHOLD = 5;
export const KOREAN_QUIZ_QUEUE_MAX_AGE_MS = 60 * 60 * 1000;

async function preparedQuizzesFromEntries(
  entries: KoreanQuizQueueEntry[],
): Promise<KoreanQuizPrepared[]> {
  if (entries.length === 0) return [];

  const ids = entries.map((entry) => entry.quizId);
  const items = await findKoreanQuizzesByIds(ids);
  const byId = new Map(items.map((item) => [item.id, item]));

  const approved = entries
    .map((entry) => byId.get(entry.quizId))
    .filter((item): item is KoreanQuizItem => item?.status === "approved");

  return Promise.all(approved.map(toKoreanQuizPrepared));
}

async function buildQueueEntries(
  deviceId: string,
  count: number,
  excludeIds: Set<string>,
  cooldownIds: string[],
  studio?: boolean,
): Promise<KoreanQuizQueueEntry[]> {
  const [wrongIdList, difficultyPreference, adaptiveScore, correctCounts] =
    await Promise.all([
      getRecentWrongQuizIds(deviceId, 10),
      getKoreanQuizDeviceDifficultyPreference(deviceId),
      getKoreanQuizDeviceAdaptiveScore(deviceId),
      getCorrectCountByQuizId(deviceId),
    ]);
  const wrongIds = new Set(wrongIdList);

  return buildWeightedQueueEntries({
    count,
    excludeIds,
    cooldownIds,
    wrongIds,
    correctCounts,
    difficultyPreference,
    adaptiveScore,
    listApproved: listApprovedKoreanQuizzesForQueue,
    studio,
  });
}

export async function refreshDeviceQueue(
  deviceId: string,
  opts?: { studio?: boolean },
): Promise<KoreanQuizQueueEntry[]> {
  const existing = await getKoreanQuizDeviceQueue(deviceId);
  const items = existing?.items ?? [];
  if (items.length >= KOREAN_QUIZ_QUEUE_SIZE) {
    return items;
  }

  const exclude = new Set(items.map((row) => row.quizId));
  const needed = KOREAN_QUIZ_QUEUE_SIZE - items.length;
  const cooldownIds = existing?.recentServedQuizIds ?? [];
  const refill = await buildQueueEntries(
    deviceId,
    needed,
    exclude,
    cooldownIds,
    opts?.studio,
  );
  const merged = [...items, ...refill];

  await saveKoreanQuizDeviceQueue({
    deviceId,
    items: merged,
    updatedAt: new Date().toISOString(),
    recentServedQuizIds: existing?.recentServedQuizIds,
  });

  return merged;
}

async function advanceQueueHead(
  deviceId: string,
  quizId: string,
): Promise<KoreanQuizQueueEntry[]> {
  const queue = await getKoreanQuizDeviceQueue(deviceId);
  const entries = queue?.items ?? [];
  if (entries.length === 0 || entries[0].quizId !== quizId) {
    throw new Error("현재 퀴즈와 일치하지 않습니다.");
  }

  const remaining = entries.slice(1);
  const recentServed = [...(queue?.recentServedQuizIds ?? []), quizId].slice(
    -QUIZ_REAPPEAR_COOLDOWN,
  );
  const now = new Date().toISOString();

  await saveKoreanQuizDeviceQueue({
    deviceId,
    items: remaining,
    updatedAt: now,
    recentServedQuizIds: recentServed,
  });

  void refreshDeviceQueue(deviceId);
  return remaining;
}

export async function getKoreanQuizQueueResponse(
  deviceId: string,
  opts?: { studio?: boolean },
): Promise<KoreanQuizQueueResponse> {
  const entries = await refreshDeviceQueue(deviceId, opts);
  const quizzes = await preparedQuizzesFromEntries(entries);
  return { quizzes, refreshPending: false };
}

/**
 * Drop the current device deck and build a fresh random queue.
 * Current + recently served IDs stay in cooldown so the same cards don't come back immediately.
 */
export async function reshuffleDeviceQueue(
  deviceId: string,
  opts?: { studio?: boolean },
): Promise<KoreanQuizQueueResponse> {
  const existing = await getKoreanQuizDeviceQueue(deviceId);
  const currentIds = (existing?.items ?? []).map((row) => row.quizId);
  const recentServed = [
    ...(existing?.recentServedQuizIds ?? []),
    ...currentIds,
  ].slice(-QUIZ_REAPPEAR_COOLDOWN);

  const items = await buildQueueEntries(
    deviceId,
    KOREAN_QUIZ_QUEUE_SIZE,
    new Set(),
    recentServed,
    opts?.studio,
  );

  await saveKoreanQuizDeviceQueue({
    deviceId,
    items,
    updatedAt: new Date().toISOString(),
    recentServedQuizIds: recentServed,
  });

  const quizzes = await preparedQuizzesFromEntries(items);
  return { quizzes, refreshPending: false };
}

export async function consumeCurrentQuiz(deviceId: string, quizId: string): Promise<void> {
  await advanceQueueHead(deviceId, quizId);
}

export async function submitKoreanQuizAttempt(params: {
  deviceId: string;
  quizId: string;
  choiceId: string;
  elapsedMs: number;
}): Promise<KoreanQuizAttemptResponse> {
  const item = await findKoreanQuizById(params.quizId);
  if (!item || item.status !== "approved") {
    throw new Error("퀴즈를 찾을 수 없습니다.");
  }

  const correct = params.choiceId.trim() === item.correctChoiceId.trim();
  const attemptId = randomUUID();
  const now = new Date().toISOString();

  await Promise.all([
    insertKoreanQuizAttempt({
      id: attemptId,
      deviceId: params.deviceId,
      quizId: params.quizId,
      choiceId: params.choiceId,
      correct,
      elapsedMs: Math.max(0, params.elapsedMs),
      createdAt: now,
    }),
    incrementKoreanQuizStats(params.quizId, correct),
    upsertKoreanQuizDelivery({
      deviceId: params.deviceId,
      quizId: params.quizId,
      outcome: correct ? "correct" : "incorrect",
      attemptId,
    }),
    updateKoreanQuizDeviceAdaptiveScore(params.deviceId, correct),
  ]);

  await advanceQueueHead(params.deviceId, params.quizId);

  return { ok: true, correct };
}
