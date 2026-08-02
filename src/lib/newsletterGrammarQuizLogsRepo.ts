import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type NewsletterGrammarQuizWeekRun = {
  weekKey: string;
  sentAt: string;
  trialId: string;
  recipientCount: number;
  failedCount: number;
  status: "completed" | "started";
};

type WeekRunDoc = NewsletterGrammarQuizWeekRun & { _id: string };

let colPromise: Promise<Collection<WeekRunDoc>> | null = null;

async function collection() {
  if (!colPromise) {
    colPromise = (async () => {
      const db = await getMongoDb();
      const col = db.collection<WeekRunDoc>("newsletter_grammar_quiz_week_runs");
      try {
        await col.createIndex({ weekKey: 1 }, { unique: true });
        await col.createIndex({ sentAt: -1 });
      } catch {
        // ignore
      }
      return col;
    })();
  }
  return colPromise;
}

export async function getNewsletterGrammarQuizWeekRun(
  weekKey: string,
): Promise<NewsletterGrammarQuizWeekRun | null> {
  const col = await collection();
  const doc = await col.findOne({ weekKey, status: "completed" });
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

export async function markNewsletterGrammarQuizWeekStarted(args: {
  weekKey: string;
  trialId: string;
}): Promise<void> {
  const col = await collection();
  await col.updateOne(
    { weekKey: args.weekKey },
    {
      $setOnInsert: {
        _id: `ngq_${args.weekKey}`,
        weekKey: args.weekKey,
        sentAt: new Date().toISOString(),
        trialId: args.trialId,
        recipientCount: 0,
        failedCount: 0,
        status: "started",
      },
    },
    { upsert: true },
  );
}

export async function finishNewsletterGrammarQuizWeekRun(args: {
  weekKey: string;
  recipientCount: number;
  failedCount: number;
}): Promise<void> {
  const col = await collection();
  await col.updateOne(
    { weekKey: args.weekKey },
    {
      $set: {
        recipientCount: args.recipientCount,
        failedCount: args.failedCount,
        status: "completed",
        sentAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
}
