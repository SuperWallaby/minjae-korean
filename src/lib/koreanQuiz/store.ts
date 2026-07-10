import { randomUUID } from "crypto";

import { getKoreanQuizDb } from "./db";
import { illustrationEnglishBelowImage } from "./englishGloss";
import { isExcludedQuizTopic, quizTopic } from "./category";
import { KOREAN_QUIZ_EXCLUDED_TOPICS } from "./excludedTopics";
import { resolveRomanizationDisplay } from "./romanization";
import { resolveAnswerTtsPlaybackUrl } from "./tts";
import type {
  KoreanQuizAttempt,
  KoreanQuizDelivery,
  KoreanQuizDeviceQueue,
  KoreanQuizItem,
  KoreanQuizReviewFlag,
  WordExplanationExample,
} from "./types";

let indexesEnsured = false;

export async function ensureKoreanQuizIndexes() {
  if (indexesEnsured) return;
  const db = await getKoreanQuizDb();

  await Promise.all([
    db.collection<KoreanQuizItem>("korean_quiz_items").createIndex({ contentHash: 1 }, { unique: true }),
    db.collection<KoreanQuizDeviceQueue>("korean_quiz_device_queues").createIndex(
      { deviceId: 1 },
      { unique: true },
    ),
    db.collection<KoreanQuizAttempt>("korean_quiz_attempts").createIndex({
      deviceId: 1,
      createdAt: -1,
    }),
    db.collection<KoreanQuizDelivery>("korean_quiz_deliveries").createIndex(
      { deviceId: 1, quizId: 1 },
      { unique: true },
    ),
    db.collection<KoreanQuizReviewFlag>("korean_quiz_review_flags").createIndex(
      { quizId: 1 },
      { unique: true },
    ),
    db.collection<KoreanQuizReviewFlag>("korean_quiz_review_flags").createIndex({
      flaggedAt: -1,
    }),
  ]);

  indexesEnsured = true;
}

export async function findKoreanQuizById(id: string): Promise<KoreanQuizItem | null> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .findOne({ id }, { projection: { _id: 0 } });
}

export async function findKoreanQuizzesByIds(ids: string[]): Promise<KoreanQuizItem[]> {
  if (ids.length === 0) return [];
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find(
      { id: { $in: ids }, status: "approved" },
      { projection: { _id: 0 } },
    )
    .toArray();
}

/** Lightweight rows for queue selection (id, difficulty, topic only). */
export async function listApprovedKoreanQuizPoolItems(): Promise<
  Pick<KoreanQuizItem, "id" | "difficulty" | "topic" | "status">[]
> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find(
      { status: "approved" },
      { projection: { _id: 0, id: 1, difficulty: 1, topic: 1, status: 1 } },
    )
    .toArray();
}

export async function listApprovedKoreanQuizzes(): Promise<KoreanQuizItem[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find({ status: "approved" }, { projection: { _id: 0 } })
    .toArray();
}

export type KoreanQuizHomeCard = {
  id: string;
  imageUrl: string;
  label: string;
  /** Format-8 english below illustration — only when stored on the item. */
  illustrationEnglish?: string;
  /** Bracketed pronunciation below Korean on reveal. */
  romanization?: string;
  /** Same-origin answer TTS — `/api/vocab-quiz/tts/[id]` */
  answerTtsUrl?: string;
};

const NOUN_QUIZ_TOPIC_BLOCKLIST = new Set(["actions"]);

/** Studio flashcards — image MCQ with illustration; includes verbs/actions (not noun-only). */
export function isStudioQuizItem(
  item: Pick<KoreanQuizItem, "type" | "topic"> & {
    imageUrl?: string | null;
  },
): boolean {
  if (isExcludedQuizTopic(item)) return false;
  if (!item.imageUrl?.trim()) return false;
  if (item.type === "sentence_blank") return false;
  return true;
}

/** image_mcq nouns only — skip verb topic and dictionary-form verb answers. */
export function isNounQuizItem(item: KoreanQuizItem): boolean {
  if (item.type === "sentence_blank") return false;
  if (isExcludedQuizTopic(item)) return false;
  if (NOUN_QUIZ_TOPIC_BLOCKLIST.has(quizTopic(item).toLowerCase())) return false;
  const label = correctLabelFromItem(item).trim();
  if (!label) return false;
  if (/[\uac00-\ud7a3]+다$/.test(label)) return false;
  return true;
}

async function homeCardFromItem(item: KoreanQuizItem): Promise<KoreanQuizHomeCard | null> {
  const imageUrl = item.imageUrl?.trim();
  if (!imageUrl) return null;
  const label = correctLabelFromItem(item) || "Korean word";
  const illustrationEnglish = illustrationEnglishBelowImage(item);
  const answerTtsUrl = await resolveAnswerTtsPlaybackUrl(item, "normal");
  const card: KoreanQuizHomeCard = {
    id: item.id,
    imageUrl,
    label,
    illustrationEnglish,
    romanization: resolveRomanizationDisplay(label, item.romanization),
  };
  if (answerTtsUrl) card.answerTtsUrl = answerTtsUrl;
  return card;
}

/** Random approved noun quizzes with images — for marketing card stack on home. */
export async function sampleKoreanQuizHomeCards(
  limit = 12,
): Promise<KoreanQuizHomeCard[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const rows = await db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find(
      {
        status: "approved",
        imageUrl: { $exists: true, $ne: "" },
        topic: {
          $nin: ["actions", ...Array.from(KOREAN_QUIZ_EXCLUDED_TOPICS)],
        },
        type: { $ne: "sentence_blank" },
      },
      {
        projection: {
          _id: 0,
          id: 1,
          type: 1,
          topic: 1,
          imageUrl: 1,
          choices: 1,
          correctChoiceId: 1,
          illustrationEnglish: 1,
          showIllustrationEnglish: 1,
          answerTtsR2Key: 1,
          answerTtsUpdatedAt: 1,
          answerTtsSlowUpdatedAt: 1,
          romanization: 1,
        },
      },
    )
    .limit(120)
    .toArray();

  const pool = (
    await Promise.all(rows.filter(isNounQuizItem).map(homeCardFromItem))
  ).filter((row): row is KoreanQuizHomeCard => row !== null);

  if (pool.length < limit) {
    const extra = await db
      .collection<KoreanQuizItem>("korean_quiz_items")
      .find(
        {
          status: "approved",
          imageUrl: { $exists: true, $ne: "" },
        },
        {
          projection: {
            _id: 0,
            id: 1,
            type: 1,
            topic: 1,
            imageUrl: 1,
            choices: 1,
            correctChoiceId: 1,
            illustrationEnglish: 1,
            showIllustrationEnglish: 1,
            answerTtsR2Key: 1,
            answerTtsUpdatedAt: 1,
            answerTtsSlowUpdatedAt: 1,
            romanization: 1,
          },
        },
      )
      .limit(120)
      .toArray();
    const seen = new Set(pool.map((c) => c.id));
    for (const row of extra) {
      if (!isNounQuizItem(row)) continue;
      const card = await homeCardFromItem(row);
      if (!card || seen.has(card.id)) continue;
      pool.push(card);
      seen.add(card.id);
      if (pool.length >= limit * 4) break;
    }
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

export async function incrementKoreanQuizStats(quizId: string, correct: boolean): Promise<void> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  await db.collection<KoreanQuizItem>("korean_quiz_items").updateOne(
    { id: quizId },
    {
      $inc: {
        "stats.attempts": 1,
        ...(correct ? { "stats.correct": 1 } : {}),
      },
    },
  );
}

export async function getKoreanQuizDeviceQueue(
  deviceId: string,
): Promise<KoreanQuizDeviceQueue | null> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizDeviceQueue>("korean_quiz_device_queues")
    .findOne({ deviceId }, { projection: { _id: 0 } });
}

export async function saveKoreanQuizDeviceQueue(queue: KoreanQuizDeviceQueue): Promise<void> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  await db
    .collection<KoreanQuizDeviceQueue>("korean_quiz_device_queues")
    .replaceOne({ deviceId: queue.deviceId }, queue, { upsert: true });
}

export async function insertKoreanQuizAttempt(attempt: KoreanQuizAttempt): Promise<void> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  await db.collection<KoreanQuizAttempt>("korean_quiz_attempts").insertOne(attempt);
}

export async function listRecentKoreanQuizAttempts(
  deviceId: string,
  limit = 20,
): Promise<KoreanQuizAttempt[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  return db
    .collection<KoreanQuizAttempt>("korean_quiz_attempts")
    .find({ deviceId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1, id: -1 })
    .limit(limit)
    .toArray();
}

export async function getCorrectlyAnsweredQuizIds(deviceId: string): Promise<Set<string>> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const rows = await db
    .collection<KoreanQuizDelivery>("korean_quiz_deliveries")
    .find({ deviceId, outcome: "correct" }, { projection: { _id: 0, quizId: 1 } })
    .toArray();
  return new Set(rows.map((row) => row.quizId));
}

export async function getCorrectCountByQuizId(
  deviceId: string,
): Promise<Map<string, number>> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const rows = await db
    .collection<KoreanQuizAttempt>("korean_quiz_attempts")
    .aggregate<{ _id: string; count: number }>([
      { $match: { deviceId, correct: true } },
      { $group: { _id: "$quizId", count: { $sum: 1 } } },
    ])
    .toArray();
  return new Map(rows.map((row) => [row._id, row.count]));
}

export async function getRecentWrongQuizIds(deviceId: string, limit = 10): Promise<string[]> {
  const attempts = await listRecentKoreanQuizAttempts(deviceId, limit * 2);
  const wrong: string[] = [];
  for (const attempt of attempts) {
    if (!attempt.correct && !wrong.includes(attempt.quizId)) {
      wrong.push(attempt.quizId);
    }
    if (wrong.length >= limit) break;
  }
  return wrong;
}

export async function upsertKoreanQuizDelivery(params: {
  deviceId: string;
  quizId: string;
  outcome: KoreanQuizDelivery["outcome"];
  attemptId?: string;
}): Promise<void> {
  await ensureKoreanQuizIndexes();
  const now = new Date().toISOString();
  const db = await getKoreanQuizDb();

  if (params.outcome === "correct") {
    await db.collection<KoreanQuizDelivery>("korean_quiz_deliveries").updateOne(
      { deviceId: params.deviceId, quizId: params.quizId },
      {
        $set: {
          outcome: "correct",
          deliveredAt: now,
          attemptId: params.attemptId,
        },
        $setOnInsert: {
          id: randomUUID(),
          deviceId: params.deviceId,
          quizId: params.quizId,
        },
      },
      { upsert: true },
    );
    return;
  }

  await db.collection<KoreanQuizDelivery>("korean_quiz_deliveries").updateOne(
    { deviceId: params.deviceId, quizId: params.quizId },
    {
      $setOnInsert: {
        id: randomUUID(),
        deviceId: params.deviceId,
        quizId: params.quizId,
        outcome: "incorrect",
        deliveredAt: now,
        attemptId: params.attemptId,
      },
    },
    { upsert: true },
  );
}

export function correctLabelFromItem(
  item: Pick<KoreanQuizItem, "choices" | "correctChoiceId">,
): string {
  for (const choice of item.choices) {
    if (choice.id === item.correctChoiceId) return choice.label;
  }
  return "";
}

export function resolveAnswerTtsText(
  item: Pick<KoreanQuizItem, "choices" | "correctChoiceId" | "answerTtsText">,
): string | null {
  const override = item.answerTtsText?.trim();
  if (override) return override;
  const label = correctLabelFromItem(item);
  return label || null;
}

export async function patchKoreanQuizAnswerTtsMeta(
  id: string,
  patch: {
    answerTtsR2Key?: string;
    answerTtsUpdatedAt?: string;
    answerTtsSlowUpdatedAt?: string;
  },
): Promise<void> {
  await ensureKoreanQuizIndexes();
  const set: Partial<KoreanQuizItem> = {};
  if (patch.answerTtsR2Key !== undefined) {
    set.answerTtsR2Key = patch.answerTtsR2Key;
  }
  if (patch.answerTtsUpdatedAt !== undefined) {
    set.answerTtsUpdatedAt = patch.answerTtsUpdatedAt;
  }
  if (patch.answerTtsSlowUpdatedAt !== undefined) {
    set.answerTtsSlowUpdatedAt = patch.answerTtsSlowUpdatedAt;
  }
  if (Object.keys(set).length === 0) return;

  const db = await getKoreanQuizDb();
  await db.collection<KoreanQuizItem>("korean_quiz_items").updateOne({ id }, { $set: set });
}

/** Persist word explanation — same fields as korean-quiz app (shared DB). */
export async function patchKoreanQuizWordExplanation(
  id: string,
  patch: {
    wordExplanation: string;
    wordExplanationExamples?: WordExplanationExample[];
    wordExplanationGeneratedAt?: string;
  },
): Promise<void> {
  await ensureKoreanQuizIndexes();
  const set: Partial<KoreanQuizItem> = {
    wordExplanation: patch.wordExplanation.trim(),
    wordExplanationGeneratedAt:
      patch.wordExplanationGeneratedAt ?? new Date().toISOString(),
  };
  if (patch.wordExplanationExamples) {
    set.wordExplanationExamples = patch.wordExplanationExamples;
  }
  const db = await getKoreanQuizDb();
  await db.collection<KoreanQuizItem>("korean_quiz_items").updateOne({ id }, { $set: set });
}

export async function patchWordExplanationExampleTts(
  id: string,
  exampleIndex: number,
  ttsR2Key: string,
): Promise<void> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const row = await db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .findOne({ id }, { projection: { _id: 0, wordExplanationExamples: 1 } });
  if (!row?.wordExplanationExamples?.length) return;

  const examples = row.wordExplanationExamples.map((example, index) =>
    index === exampleIndex ? { ...example, ttsR2Key } : example,
  );
  await db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .updateOne({ id }, { $set: { wordExplanationExamples: examples } });
}

/** @deprecated Use patchKoreanQuizAnswerTtsMeta */
export async function patchKoreanQuizAnswerTtsR2Key(
  id: string,
  answerTtsR2Key: string,
): Promise<void> {
  await patchKoreanQuizAnswerTtsMeta(id, {
    answerTtsR2Key,
    answerTtsUpdatedAt: new Date().toISOString(),
  });
}

export async function listKoreanQuizReviewFlagIds(): Promise<string[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const rows = await db
    .collection<KoreanQuizReviewFlag>("korean_quiz_review_flags")
    .find({}, { projection: { _id: 0, quizId: 1 } })
    .sort({ flaggedAt: -1 })
    .toArray();
  return rows.map((row) => row.quizId);
}

export async function setKoreanQuizReviewFlag(
  quizId: string,
  flagged: boolean,
): Promise<void> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const col = db.collection<KoreanQuizReviewFlag>("korean_quiz_review_flags");

  if (!flagged) {
    await col.deleteOne({ quizId });
    return;
  }

  await col.updateOne(
    { quizId },
    {
      $set: {
        quizId,
        flaggedAt: new Date().toISOString(),
        source: "vocab-quiz",
      },
    },
    { upsert: true },
  );
}

export async function listFlaggedKoreanQuizSummaries(): Promise<
  Array<{
    id: string;
    imageUrl?: string;
    correctLabel: string;
    correctEnglish: string;
    topic?: string;
    flaggedAt: string;
  }>
> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const flags = await db
    .collection<KoreanQuizReviewFlag>("korean_quiz_review_flags")
    .find({}, { projection: { _id: 0 } })
    .sort({ flaggedAt: -1 })
    .toArray();

  if (flags.length === 0) return [];

  const flagByQuizId = new Map(flags.map((f) => [f.quizId, f.flaggedAt]));
  const items = await db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find({ id: { $in: flags.map((f) => f.quizId) } }, { projection: { _id: 0 } })
    .toArray();

  return items
    .map((item) => {
      const flaggedAt = flagByQuizId.get(item.id);
      if (!flaggedAt) return null;
      const correct = item.choices.find((c) => c.id === item.correctChoiceId);
      return {
        id: item.id,
        imageUrl: item.imageUrl?.trim() || undefined,
        correctLabel: correct?.label ?? "",
        correctEnglish: correct?.english?.trim() ?? "",
        topic: item.topic,
        flaggedAt,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort(
      (a, b) =>
        new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime(),
    );
}
