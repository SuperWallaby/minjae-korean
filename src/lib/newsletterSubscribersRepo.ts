import { getMongoDb } from "@/lib/mongo";

export type NewsletterSubscriber = {
  email: string;
  subscribedAt: string;
  source?: string;
  unsubscribedAt?: string;
};

type NewsletterSubscriberDoc = NewsletterSubscriber & {
  _id?: unknown;
};

let indexEnsured = false;

async function subscribersCollection() {
  const db = await getMongoDb();
  const col = db.collection<NewsletterSubscriberDoc>("newsletter_subscribers");
  if (!indexEnsured) {
    await col.createIndex({ email: 1 }, { unique: true });
    await col.createIndex({ unsubscribedAt: 1 });
    indexEnsured = true;
  }
  return col;
}

export async function upsertNewsletterSubscriber(args: {
  email: string;
  source?: string;
}): Promise<{ created: boolean; subscriber: NewsletterSubscriber }> {
  const email = args.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const col = await subscribersCollection();
  const existing = await col.findOne({ email });
  if (existing) {
    await col.updateOne(
      { email },
      {
        $set: {
          source: args.source?.trim() || existing.source,
          subscribedAt: existing.subscribedAt || now,
        },
        $unset: { unsubscribedAt: "" },
      },
    );
    return {
      created: false,
      subscriber: {
        email,
        subscribedAt: existing.subscribedAt || now,
        source: args.source?.trim() || existing.source,
      },
    };
  }
  const subscriber: NewsletterSubscriber = {
    email,
    subscribedAt: now,
    source: args.source?.trim() || undefined,
  };
  await col.insertOne(subscriber);
  return { created: true, subscriber };
}

export async function listActiveNewsletterSubscribers(): Promise<
  NewsletterSubscriber[]
> {
  const col = await subscribersCollection();
  const rows = await col
    .find({ unsubscribedAt: { $exists: false } })
    .sort({ subscribedAt: -1 })
    .toArray();
  return rows.map((row) => ({
    email: row.email,
    subscribedAt: row.subscribedAt,
    source: row.source,
  }));
}

export async function unsubscribeNewsletterSubscriber(
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const col = await subscribersCollection();
  const res = await col.updateOne(
    { email: normalized },
    { $set: { unsubscribedAt: new Date().toISOString() } },
  );
  return res.matchedCount > 0;
}
