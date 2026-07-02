import { getMongoDb } from "@/lib/mongo";

export type NewsletterSubscriber = {
  email: string;
  subscribedAt: string;
  source?: string;
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
      { $set: { source: args.source?.trim() || existing.source } },
    );
    return {
      created: false,
      subscriber: {
        email,
        subscribedAt: existing.subscribedAt,
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
