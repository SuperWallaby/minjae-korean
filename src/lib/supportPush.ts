import type { Collection } from "mongodb";
import { getMongoDb } from "@/lib/mongo";

export type PushSubscriptionDoc = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string; // ISO
};

let col: Collection<PushSubscriptionDoc> | null = null;

async function getCol(): Promise<Collection<PushSubscriptionDoc>> {
  if (col) return col;
  const db = await getMongoDb();
  col = db.collection<PushSubscriptionDoc>("support_push_subscriptions");
  return col;
}

export async function addSupportPushSubscription(
  subscription: PushSubscriptionDoc,
): Promise<void> {
  const c = await getCol();
  await c.updateOne(
    { endpoint: subscription.endpoint },
    { $set: { ...subscription, createdAt: new Date().toISOString() } },
    { upsert: true },
  );
}

export async function listSupportPushSubscriptions(): Promise<PushSubscriptionDoc[]> {
  const c = await getCol();
  const list = await c.find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return list.map(({ _id, ...doc }) => doc as PushSubscriptionDoc);
}

export async function sendSupportPushToAll(
  threadId: string,
  fromLabel: string,
  textPreview: string,
): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return;

  const subs = await listSupportPushSubscriptions();
  if (subs.length === 0) return;

  const webpush = await import("web-push");
  webpush.setVapidDetails(
    "mailto:support@korean-teacher-mj",
    publicKey,
    privateKey,
  );

  const payload = JSON.stringify({
    title: "새 지원 채팅",
    body: `${fromLabel}: ${textPreview.slice(0, 60)}${textPreview.length > 60 ? "…" : ""}`,
    url: "/admin/support",
    threadId,
  });

  const sendOne = async (sub: PushSubscriptionDoc) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
          expirationTime: null,
        },
        payload,
        { TTL: 60 },
      );
    } catch {
      // Subscription may be invalid; ignore
    }
  };

  await Promise.allSettled(subs.map(sendOne));
}
