import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type Slot = {
  id: string; // stable string id
  dateKey: string; // YYYY-MM-DD
  startMin: number;
  endMin: number;
  capacity: number;
  bookedCount: number;
  cancelled?: boolean;
  notes?: string;
};

type SlotDoc = Omit<Slot, "id"> & { _id: string };

type Collections = {
  slots: Collection<SlotDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const slots = db.collection<SlotDoc>("slots");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await slots.createIndex({ dateKey: 1, startMin: 1 }, { unique: true });
        await slots.createIndex({ dateKey: 1, startMin: 1, endMin: 1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { slots };
}

function toSlot(doc: SlotDoc): Slot {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function toDoc(slot: Slot): SlotDoc {
  const { id, ...rest } = slot;
  return { _id: id, ...rest };
}

export async function getSlotById(id: string): Promise<Slot | null> {
  const { slots } = await cols();
  const doc = await slots.findOne({ _id: id });
  return doc ? toSlot(doc) : null;
}

export async function listSlotsByDateKey(dateKey: string): Promise<Slot[]> {
  const { slots } = await cols();
  const list = await slots.find({ dateKey }).sort({ startMin: 1, endMin: 1 }).toArray();
  return list.map(toSlot);
}

export async function listSlotsInRange(fromDateKey: string, toDateKey: string): Promise<Slot[]> {
  const { slots } = await cols();
  const list = await slots
    .find({ dateKey: { $gte: fromDateKey, $lte: toDateKey } })
    .sort({ dateKey: 1, startMin: 1, endMin: 1 })
    .toArray();
  return list.map(toSlot);
}

export async function listAllSlots(limit = 5000): Promise<Slot[]> {
  const { slots } = await cols();
  const list = await slots.find({}).sort({ dateKey: 1, startMin: 1, endMin: 1 }).limit(limit).toArray();
  return list.map(toSlot);
}

export async function getSlotsByIds(ids: string[]): Promise<Slot[]> {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  if (!uniq.length) return [];
  const { slots } = await cols();
  const list = await slots.find({ _id: { $in: uniq } }).toArray();
  return list.map(toSlot);
}

export async function upsertSlot(slot: Slot): Promise<void> {
  const { slots } = await cols();
  await slots.updateOne(
    { _id: slot.id },
    { $set: { ...toDoc(slot) } },
    { upsert: true },
  );
}

export async function insertManyIgnoreDuplicates(slotsToInsert: Slot[]): Promise<{ inserted: number }> {
  const { slots } = await cols();
  if (!slotsToInsert.length) return { inserted: 0 };
  try {
    const docs = slotsToInsert.map(toDoc);
    const res = await slots.insertMany(docs, { ordered: false });
    return { inserted: res.insertedCount ?? Object.keys(res.insertedIds ?? {}).length };
  } catch (e) {
    // Duplicate key errors are expected when regenerating.
    // Best-effort: surface inserted count if driver provides it.
    if (e && typeof e === "object" && "result" in e) {
      const r = (e as { result?: unknown }).result as { insertedCount?: unknown } | undefined;
      const insertedCount = typeof r?.insertedCount === "number" ? r.insertedCount : 0;
      return { inserted: insertedCount };
    }
    return { inserted: 0 };
  }
}

export async function patchSlot(id: string, patch: Partial<Omit<Slot, "id">>): Promise<Slot | null> {
  const { slots } = await cols();
  await slots.updateOne({ _id: id }, { $set: patch });
  const next = await slots.findOne({ _id: id });
  return next ? toSlot(next) : null;
}

export async function deleteAllSlots(): Promise<void> {
  const { slots } = await cols();
  await slots.deleteMany({});
}

export async function deleteSlotById(id: string): Promise<boolean> {
  const { slots } = await cols();
  const res = await slots.deleteOne({ _id: id });
  return res.deletedCount === 1;
}

export async function tryReserveSlot(id: string, delta: number): Promise<boolean> {
  const { slots } = await cols();
  // Atomically ensure capacity is not exceeded.
  const res = await slots.updateOne(
    {
      _id: id,
      cancelled: { $ne: true },
      $expr: { $lt: ["$bookedCount", "$capacity"] },
    },
    { $inc: { bookedCount: delta } },
  );
  return res.modifiedCount === 1;
}

export async function releaseSlot(id: string, delta: number): Promise<void> {
  const { slots } = await cols();
  const n = Math.max(0, Math.floor(Math.abs(delta)));
  if (!n) return;
  // Clamp to 0 to avoid negative counts.
  await slots.updateOne(
    { _id: id },
    [
      {
        $set: {
          bookedCount: {
            $max: [0, { $subtract: ["$bookedCount", n] }],
          },
        },
      },
    ],
  );
}

