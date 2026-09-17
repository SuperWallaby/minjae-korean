import { getMongoDb } from "@/lib/mongo";

export type TrialRequest = {
  name?: string;
  email: string;
  level: string;
  date: string;
  slot: string;
  slotLabel: string;
  createdAt: string;
  source?: string;
};

type TrialRequestDoc = TrialRequest & { _id?: unknown };

let indexEnsured = false;

async function requestsCollection() {
  const db = await getMongoDb();
  const col = db.collection<TrialRequestDoc>("free_korean_class_requests");
  if (!indexEnsured) {
    await col.createIndex({ createdAt: -1 });
    await col.createIndex({ email: 1, createdAt: -1 });
    indexEnsured = true;
  }
  return col;
}

export async function insertTrialRequest(
  row: Omit<TrialRequest, "createdAt"> & { createdAt?: string },
): Promise<TrialRequest> {
  const createdAt = row.createdAt || new Date().toISOString();
  const doc: TrialRequest = {
    name: row.name?.trim() || undefined,
    email: row.email.trim().toLowerCase(),
    level: row.level,
    date: row.date,
    slot: row.slot,
    slotLabel: row.slotLabel,
    createdAt,
    source: row.source,
  };
  const col = await requestsCollection();
  await col.insertOne(doc);
  return doc;
}

export async function listTrialRequests(limit = 50): Promise<TrialRequest[]> {
  const col = await requestsCollection();
  const rows = await col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((row) => ({
    name: row.name,
    email: row.email,
    level: row.level,
    date: row.date,
    slot: row.slot,
    slotLabel: row.slotLabel,
    createdAt: row.createdAt,
    source: row.source,
  }));
}
