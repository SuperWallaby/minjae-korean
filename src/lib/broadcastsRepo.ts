import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";
import type { BroadcastAccountFilter } from "@/lib/studentsRepo";

export type BroadcastChannels = { site: boolean; push: boolean };

export type BroadcastMeta = {
  id: string;
  title: string;
  body: string;
  accountFilter: BroadcastAccountFilter;
  channels: BroadcastChannels;
  recipientCount: number;
  pushDelivered: number;
  createdAt: string;
};

type BroadcastDoc = BroadcastMeta & { _id: string };

export type NotificationReceipt = {
  id: string;
  broadcastId: string;
  studentId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type ReceiptDoc = Omit<NotificationReceipt, "id"> & { _id: string };

type Collections = {
  broadcasts: Collection<BroadcastDoc>;
  receipts: Collection<ReceiptDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const broadcasts = db.collection<BroadcastDoc>("broadcasts");
  const receipts = db.collection<ReceiptDoc>("notification_receipts");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await receipts.createIndex({ studentId: 1, readAt: 1 });
        await receipts.createIndex({ studentId: 1, createdAt: -1 });
        await receipts.createIndex({ broadcastId: 1, studentId: 1 }, { unique: true });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { broadcasts, receipts };
}

function rid() {
  return `brd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function receiptId() {
  return `nrc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createBroadcastWithReceipts(args: {
  title: string;
  body: string;
  accountFilter: BroadcastAccountFilter;
  channels: BroadcastChannels;
  studentIds: string[];
  pushDelivered: number;
}): Promise<{ broadcastId: string; receiptCount: number }> {
  const { broadcasts, receipts } = await cols();
  const broadcastId = rid();
  const createdAt = new Date().toISOString();
  const title = String(args.title ?? "").trim();
  const body = String(args.body ?? "").trim();
  const ids = args.studentIds;

  const meta: BroadcastDoc = {
    _id: broadcastId,
    id: broadcastId,
    title,
    body,
    accountFilter: args.accountFilter,
    channels: args.channels,
    recipientCount: ids.length,
    pushDelivered: args.pushDelivered,
    createdAt,
  };
  await broadcasts.insertOne(meta);

  if (args.channels.site && ids.length > 0) {
    const CHUNK = 400;
    for (let i = 0; i < ids.length; i += CHUNK) {
      const slice = ids.slice(i, i + CHUNK);
      const batch: ReceiptDoc[] = slice.map((studentId) => ({
        _id: receiptId(),
        broadcastId,
        studentId,
        title,
        body,
        readAt: null,
        createdAt,
      }));
      await receipts.insertMany(batch, { ordered: false });
    }
  }

  return { broadcastId, receiptCount: args.channels.site ? ids.length : 0 };
}

export async function listUnreadReceiptsForStudent(
  studentId: string,
  limit: number,
): Promise<NotificationReceipt[]> {
  const { receipts } = await cols();
  const cap = Math.min(100, Math.max(1, limit));
  const docs = await receipts
    .find({ studentId, $or: [{ readAt: null }, { readAt: { $exists: false } }] })
    .sort({ createdAt: -1 })
    .limit(cap)
    .toArray();
  return docs.map((d) => ({
    id: String(d._id),
    broadcastId: d.broadcastId,
    studentId: d.studentId,
    title: d.title,
    body: d.body,
    readAt: d.readAt ?? null,
    createdAt: d.createdAt,
  }));
}

export async function listRecentReceiptsForStudent(
  studentId: string,
  limit: number,
): Promise<NotificationReceipt[]> {
  const { receipts } = await cols();
  const cap = Math.min(100, Math.max(1, limit));
  const docs = await receipts.find({ studentId }).sort({ createdAt: -1 }).limit(cap).toArray();
  return docs.map((d) => ({
    id: String(d._id),
    broadcastId: d.broadcastId,
    studentId: d.studentId,
    title: d.title,
    body: d.body,
    readAt: d.readAt ?? null,
    createdAt: d.createdAt,
  }));
}

export async function markReceiptsReadForStudent(
  studentId: string,
  broadcastIds: string[] | "all",
): Promise<number> {
  const { receipts } = await cols();
  const now = new Date().toISOString();
  const filter: Record<string, unknown> =
    broadcastIds === "all"
      ? { studentId, $or: [{ readAt: null }, { readAt: { $exists: false } }] }
      : { studentId, broadcastId: { $in: broadcastIds } };
  const res = await receipts.updateMany(filter as never, { $set: { readAt: now } });
  return res.modifiedCount ?? 0;
}
