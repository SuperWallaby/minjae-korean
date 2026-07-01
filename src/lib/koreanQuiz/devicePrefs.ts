import { getKoreanQuizDb } from "./db";
import {
  clampAdaptiveScore,
  DEFAULT_ADAPTIVE_SCORE,
  nextAdaptiveScore,
} from "./difficulty";
import { ensureKoreanQuizIndexes } from "./store";
import type { DifficultyPreference } from "./types";

type DevicePrefsDoc = {
  deviceId: string;
  difficultyPreference: DifficultyPreference;
  adaptiveScore?: number;
  updatedAt: string;
};

const COLLECTION = "korean_quiz_device_prefs";

export function normalizeDifficultyPreference(raw: unknown): DifficultyPreference {
  if (raw === "auto") return "auto";
  if (raw === "A" || raw === "B" || raw === "C") return raw;
  return "auto";
}

export async function getKoreanQuizDeviceDifficultyPreference(
  deviceId: string,
): Promise<DifficultyPreference> {
  const prefs = await getKoreanQuizDevicePrefs(deviceId);
  return prefs.difficultyPreference;
}

export async function getKoreanQuizDeviceAdaptiveScore(
  deviceId: string,
): Promise<number> {
  const prefs = await getKoreanQuizDevicePrefs(deviceId);
  return prefs.adaptiveScore;
}

export async function getKoreanQuizDevicePrefs(deviceId: string): Promise<{
  difficultyPreference: DifficultyPreference;
  adaptiveScore: number;
}> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();

  const doc = await db
    .collection<DevicePrefsDoc>(COLLECTION)
    .findOne(
      { deviceId },
      { projection: { _id: 0, difficultyPreference: 1, adaptiveScore: 1 } },
    );

  return {
    difficultyPreference: normalizeDifficultyPreference(doc?.difficultyPreference),
    adaptiveScore: clampAdaptiveScore(doc?.adaptiveScore ?? DEFAULT_ADAPTIVE_SCORE),
  };
}

export async function updateKoreanQuizDeviceAdaptiveScore(
  deviceId: string,
  correct: boolean,
): Promise<number> {
  const current = await getKoreanQuizDeviceAdaptiveScore(deviceId);
  const adaptiveScore = nextAdaptiveScore(current, correct);
  await ensureKoreanQuizIndexes();
  const now = new Date().toISOString();
  const db = await getKoreanQuizDb();

  await db.collection<DevicePrefsDoc>(COLLECTION).updateOne(
    { deviceId },
    {
      $set: { adaptiveScore, updatedAt: now },
      $setOnInsert: {
        deviceId,
        difficultyPreference: "auto" as DifficultyPreference,
      },
    },
    { upsert: true },
  );

  return adaptiveScore;
}
