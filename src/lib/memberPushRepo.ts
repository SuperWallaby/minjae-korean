import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type MemberPushSubscriptionDoc = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  authUserId: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
};

type MemberPushDoc = MemberPushSubscriptionDoc & { _id: string };

let col: Collection<MemberPushDoc> | null = null;

async function getCol(): Promise<Collection<MemberPushDoc>> {
  if (col) return col;
  const db = await getMongoDb();
  col = db.collection<MemberPushDoc>("member_push_subscriptions");
  try {
    await col.createIndex({ endpoint: 1 }, { unique: true });
    await col.createIndex({ authUserId: 1 });
    await col.createIndex({ studentId: 1 });
  } catch {
    // ignore
  }
  return col;
}

export async function upsertMemberPushSubscription(args: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  authUserId: string;
  studentId?: string;
}): Promise<void> {
  const c = await getCol();
  const now = new Date().toISOString();
  await c.updateOne(
    { endpoint: args.endpoint },
    {
      $set: {
        endpoint: args.endpoint,
        keys: args.keys,
        authUserId: args.authUserId,
        studentId: args.studentId?.trim() || undefined,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: `mps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

export async function listMemberPushSubscriptionsForAuthUserIds(
  authUserIds: string[],
): Promise<MemberPushSubscriptionDoc[]> {
  if (authUserIds.length === 0) return [];
  const c = await getCol();
  const uniq = [...new Set(authUserIds.map((x) => x.trim()).filter(Boolean))];
  const BATCH = 300;
  const byEndpoint = new Map<string, MemberPushSubscriptionDoc>();
  for (let i = 0; i < uniq.length; i += BATCH) {
    const slice = uniq.slice(i, i + BATCH);
    const docs = await c.find({ authUserId: { $in: slice } }).toArray();
    for (const d of docs) {
      const { _id: _idIgnored, ...rest } = d;
      void _idIgnored;
      if (!byEndpoint.has(rest.endpoint)) byEndpoint.set(rest.endpoint, rest);
    }
  }
  return [...byEndpoint.values()];
}

export async function sendMemberPushPayload(
  subs: MemberPushSubscriptionDoc[],
  payload: { title: string; body: string; url: string },
): Promise<number> {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey || subs.length === 0) return 0;

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:support@korean-teacher-mj", publicKey, privateKey);

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
  });

  const seen = new Set<string>();
  let ok = 0;
  for (const sub of subs) {
    if (seen.has(sub.endpoint)) continue;
    seen.add(sub.endpoint);
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
          expirationTime: null,
        },
        body,
        { TTL: 3600 },
      );
      ok += 1;
    } catch {
      // invalid subscription
    }
  }
  return ok;
}
