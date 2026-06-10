import { NextRequest } from "next/server";

import { upsertMemberPushSubscription } from "@/lib/memberPushRepo";
import { resolveSessionFromKajaCookie } from "@/lib/serverAuthSession";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await resolveSessionFromKajaCookie();
    if (!session) return json(401, { ok: false, error: "Sign in required" });

    const body = await req.json().catch(() => null);
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
    const keys = body?.keys;
    const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys?.auth === "string" ? keys.auth : "";

    if (!endpoint || !p256dh || !auth) {
      return json(400, { ok: false, error: "Missing endpoint or keys" });
    }

    await upsertMemberPushSubscription({
      endpoint,
      keys: { p256dh, auth },
      authUserId: session.authUserId,
      studentId: session.student.id,
    });

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
