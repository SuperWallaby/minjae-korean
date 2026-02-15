import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";
import type { WeeklyPattern } from "@/lib/slotPatterns";

export type AdminSettings = {
  businessTimeZone: string; // IANA, e.g. Asia/Seoul
  weeklyPattern: WeeklyPattern;
};

type AdminSettingsDoc = AdminSettings & { _id: "default" };

type Collections = {
  settings: Collection<AdminSettingsDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const settings = db.collection<AdminSettingsDoc>("admin_settings");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await settings.createIndex({ _id: 1 }, { unique: true });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { settings };
}

const DEFAULT_SETTINGS: AdminSettings = {
  businessTimeZone: "Asia/Seoul",
  weeklyPattern: {},
};

export async function readAdminSettings(): Promise<AdminSettings> {
  const { settings } = await cols();
  const doc = await settings.findOne({ _id: "default" });
  if (!doc) return DEFAULT_SETTINGS;
  return {
    businessTimeZone: typeof doc.businessTimeZone === "string" ? doc.businessTimeZone : "Asia/Seoul",
    weeklyPattern: (doc.weeklyPattern ?? {}) as WeeklyPattern,
  };
}

export async function writeAdminSettings(next: AdminSettings): Promise<void> {
  const { settings } = await cols();
  await settings.updateOne(
    { _id: "default" },
    { $set: { ...DEFAULT_SETTINGS, ...next, _id: "default" } },
    { upsert: true },
  );
}

export async function deleteAdminSettings(): Promise<void> {
  const { settings } = await cols();
  await settings.deleteMany({});
}

