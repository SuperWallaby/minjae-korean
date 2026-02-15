import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type WaitingEntry = {
  bookingId: string;
  lastSeenISO: string;
};

type WaitingDoc = Omit<WaitingEntry, "bookingId"> & { _id: string };

type Collections = {
  waiting: Collection<WaitingDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const waiting = db.collection<WaitingDoc>("stream_waiting");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await waiting.createIndex({ _id: 1 }, { unique: true });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { waiting };
}

export async function getWaiting(bookingId: string): Promise<WaitingEntry | null> {
  const { waiting } = await cols();
  const doc = await waiting.findOne({ _id: bookingId });
  if (!doc) return null;
  return { bookingId: doc._id, lastSeenISO: doc.lastSeenISO };
}

export async function upsertWaiting(bookingId: string, lastSeenISO: string): Promise<void> {
  const { waiting } = await cols();
  await waiting.updateOne(
    { _id: bookingId },
    { $set: { lastSeenISO } },
    { upsert: true },
  );
}

export async function deleteAllWaiting(): Promise<void> {
  const { waiting } = await cols();
  await waiting.deleteMany({});
}

