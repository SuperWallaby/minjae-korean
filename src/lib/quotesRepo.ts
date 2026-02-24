import type { Collection, ObjectId } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type Quote = {
  id: string;
  text: string;
  author?: string;
  createdAt?: string;
};

type QuoteDoc = {
  _id: ObjectId;
  text: string;
  author?: string;
  createdAt?: string;
};

let colPromise: Promise<Collection<QuoteDoc>> | null = null;

async function col(): Promise<Collection<QuoteDoc>> {
  if (!colPromise) {
    colPromise = getMongoDb().then((db) => {
      const c = db.collection<QuoteDoc>("quotes");
      c.createIndex({ createdAt: -1 }).catch(() => {});
      return c;
    });
  }
  return colPromise;
}

function toQuote(doc: QuoteDoc): Quote {
  return {
    id: String(doc._id),
    text: doc.text,
    author: doc.author,
    createdAt: doc.createdAt,
  };
}

/** 목록 (관리/시드용). createdAt 내림차순 */
export async function listQuotes(limit = 500): Promise<Quote[]> {
  const c = await col();
  const docs = await c
    .find({})
    .sort({ createdAt: -1 })
    .limit(Math.min(1000, Math.max(1, Math.floor(limit))))
    .toArray();
  return docs.map(toQuote);
}

/** 랜덤 명언 1건. DB에 없으면 null */
export async function getRandomQuote(): Promise<Quote | null> {
  const c = await col();
  const docs = await c.aggregate<QuoteDoc>([{ $sample: { size: 1 } }]).toArray();
  const doc = docs[0];
  return doc ? toQuote(doc) : null;
}

/** 명언 추가 (관리/시드용) */
export async function createQuote(draft: { text: string; author?: string }): Promise<Quote> {
  const c = await col();
  const text = String(draft.text ?? "").trim();
  if (!text) throw new Error("Missing text");
  const doc: Omit<QuoteDoc, "_id"> = {
    text,
    author: typeof draft.author === "string" ? draft.author.trim() || undefined : undefined,
    createdAt: new Date().toISOString(),
  };
  const { insertedId } = await c.insertOne(doc as QuoteDoc);
  return toQuote({ _id: insertedId, ...doc } as QuoteDoc);
}

/** 명언 일괄 추가. texts: 문자열 배열(한 줄 = 한 건). 빈 문자열은 제외 */
export async function createQuotes(texts: string[]): Promise<Quote[]> {
  const c = await col();
  const now = new Date().toISOString();
  const toInsert = texts
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      createdAt: now,
    }));
  if (toInsert.length === 0) return [];
  const result = await c.insertMany(
    toInsert.map((d) => ({ text: d.text, createdAt: d.createdAt } as any)),
  );
  const ids = Object.values(result.insertedIds);
  const docs = await c.find({ _id: { $in: ids } }).toArray();
  const byId = new Map(docs.map((d) => [String((d as QuoteDoc)._id), d as QuoteDoc]));
  return ids.map((id) => toQuote(byId.get(String(id))!));
}
