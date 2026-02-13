import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongo";

export type SupportThreadStatus = "open" | "closed";
export type SupportMessageFrom = "member" | "support";

export type SupportThread = {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: SupportThreadStatus;
  email?: string;
  name?: string;
  lastReadBySupportAt?: string; // ISO
  lastReadByMemberAt?: string; // ISO
  lastMessage?: {
    from: SupportMessageFrom;
    text: string;
    createdAt: string; // ISO
  };
  lastMemberMessageAt?: string; // ISO
};

export type SupportMessage = {
  id: string;
  threadId: string;
  from: SupportMessageFrom;
  text: string;
  createdAt: string; // ISO
};

type SupportThreadDoc = Omit<SupportThread, "id"> & { _id: ObjectId };
type SupportMessageDoc = Omit<SupportMessage, "id" | "threadId"> & { _id: ObjectId; threadId: ObjectId };

type Collections = {
  threads: Collection<SupportThreadDoc>;
  messages: Collection<SupportMessageDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const threads = db.collection<SupportThreadDoc>("support_threads");
  const messages = db.collection<SupportMessageDoc>("support_messages");

  // Create indexes best-effort (safe if already exists).
  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await threads.createIndex({ updatedAt: -1 });
        await threads.createIndex({ email: 1, status: 1 });
        await messages.createIndex({ threadId: 1, createdAt: 1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { threads, messages };
}

function nowIso() {
  return new Date().toISOString();
}

function toThread(doc: SupportThreadDoc): SupportThread {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function toMessage(doc: SupportMessageDoc): SupportMessage {
  const { _id, threadId, ...rest } = doc;
  return { id: String(_id), threadId: String(threadId), ...rest };
}

function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function listSupportThreads(): Promise<SupportThread[]> {
  const { threads } = await cols();
  const list = await threads.find({}).sort({ updatedAt: -1 }).limit(500).toArray();
  return list.map(toThread);
}

export async function getSupportThread(threadId: string): Promise<SupportThread | null> {
  const { threads } = await cols();
  const oid = toObjectId(threadId);
  if (!oid) return null;
  const doc = await threads.findOne({ _id: oid });
  return doc ? toThread(doc) : null;
}

export async function listSupportMessages(threadId: string): Promise<SupportMessage[]> {
  const { messages } = await cols();
  const oid = toObjectId(threadId);
  if (!oid) return [];
  const list = await messages.find({ threadId: oid }).sort({ createdAt: 1 }).limit(500).toArray();
  return list.map(toMessage);
}

export async function findOrCreateThreadByEmail(email: string, name?: string): Promise<SupportThread> {
  const { threads } = await cols();
  const normalized = email.trim().toLowerCase();
  const existing = await threads.findOne({ email: normalized, status: { $ne: "closed" } });
  if (existing) return toThread(existing);

  const createdAt = nowIso();
  const doc: Omit<SupportThreadDoc, "_id"> = {
    createdAt,
    updatedAt: createdAt,
    status: "open",
    email: normalized,
    name: name?.trim() || undefined,
    lastReadBySupportAt: undefined,
    lastReadByMemberAt: undefined,
    lastMessage: undefined,
    lastMemberMessageAt: undefined,
  };
  const res = await threads.insertOne(doc as SupportThreadDoc);
  return { id: String(res.insertedId), ...doc };
}

export async function createSupportThread(opts?: { email?: string; name?: string }): Promise<SupportThread> {
  const { threads } = await cols();
  const createdAt = nowIso();
  const email = opts?.email?.trim().toLowerCase() || undefined;
  const name = opts?.name?.trim() || undefined;
  const doc: Omit<SupportThreadDoc, "_id"> = {
    createdAt,
    updatedAt: createdAt,
    status: "open",
    email,
    name,
    lastReadBySupportAt: undefined,
    lastReadByMemberAt: undefined,
    lastMessage: undefined,
    lastMemberMessageAt: undefined,
  };
  const res = await threads.insertOne(doc as SupportThreadDoc);
  return { id: String(res.insertedId), ...doc };
}

export async function patchSupportThread(threadId: string, patch: Partial<SupportThread>): Promise<SupportThread | null> {
  const { threads } = await cols();
  const oid = toObjectId(threadId);
  if (!oid) return null;

  const { id: _ignored, ...rest } = patch as any;
  await threads.updateOne({ _id: oid }, { $set: rest });
  const next = await threads.findOne({ _id: oid });
  return next ? toThread(next) : null;
}

export async function addSupportMessage(threadId: string, from: SupportMessageFrom, text: string): Promise<SupportMessage | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const { threads, messages } = await cols();
  const oid = toObjectId(threadId);
  if (!oid) return null;
  const thread = await threads.findOne({ _id: oid });
  if (!thread) return null;

  const createdAt = nowIso();
  const msgDoc: Omit<SupportMessageDoc, "_id"> = {
    threadId: oid,
    from,
    text: trimmed,
    createdAt,
  };
  const ins = await messages.insertOne(msgDoc as SupportMessageDoc);

  const lastMessage = { from, text: trimmed, createdAt };
  const update: Partial<SupportThreadDoc> = {
    updatedAt: createdAt,
    lastMessage,
    ...(from === "member"
      ? { lastReadByMemberAt: createdAt, lastMemberMessageAt: createdAt }
      : { lastReadBySupportAt: createdAt }),
  };
  await threads.updateOne({ _id: oid }, { $set: update });

  return { id: String(ins.insertedId), threadId, from, text: trimmed, createdAt };
}

export async function markSupportThreadRead(threadId: string, who: "member" | "support"): Promise<SupportThread | null> {
  const { threads } = await cols();
  const oid = toObjectId(threadId);
  if (!oid) return null;
  const ts = nowIso();
  const patch: Partial<SupportThreadDoc> = who === "member" ? { lastReadByMemberAt: ts } : { lastReadBySupportAt: ts };
  await threads.updateOne({ _id: oid }, { $set: patch });
  const next = await threads.findOne({ _id: oid });
  return next ? toThread(next) : null;
}

export async function getSupportThreadSummary(threadId: string) {
  const t = await getSupportThread(threadId);
  if (!t) return null;
  const msgs = await listSupportMessages(threadId);
  const last = msgs[msgs.length - 1] ?? null;
  return { thread: t, lastMessage: last, messageCount: msgs.length };
}

