import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type ReminderKind = "1h" | "30m";
export type ReminderRole = "member" | "admin";

export type ReminderLog = {
  id: string;
  bookingId: string;
  kind: ReminderKind;
  role: ReminderRole;
  to: string;
  memberName?: string;
  timeLabel?: string;
  sentAt: string;
};

type Doc = Omit<ReminderLog, "id"> & { _id: string };

let colPromise: Promise<Collection<Doc>> | null = null;

async function collection() {
  if (!colPromise) {
    colPromise = (async () => {
      const db = await getMongoDb();
      const col = db.collection<Doc>("reminder_logs");
      try {
        await col.createIndex({ sentAt: -1 });
        await col.createIndex({ bookingId: 1, kind: 1, role: 1 });
      } catch {
        // ignore
      }
      return col;
    })();
  }
  return colPromise;
}

export async function insertReminderLog(log: Omit<ReminderLog, "id" | "sentAt">): Promise<ReminderLog> {
  const col = await collection();
  const sentAt = new Date().toISOString();
  const doc: Doc = {
    _id: `rl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    ...log,
    sentAt,
  };
  await col.insertOne(doc);
  return { id: doc._id, ...log, sentAt };
}

export async function listReminderLogs(limit = 200): Promise<ReminderLog[]> {
  const col = await collection();
  const docs = await col.find({}).sort({ sentAt: -1 }).limit(limit).toArray();
  return docs.map((d) => {
    const { _id, ...rest } = d;
    return { id: String(_id), ...rest };
  });
}
