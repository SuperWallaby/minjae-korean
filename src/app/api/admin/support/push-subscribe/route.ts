import { NextRequest } from "next/server";
import { addSupportPushSubscription } from "@/lib/supportPush";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
    const keys = body?.keys;
    const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys?.auth === "string" ? keys.auth : "";

    if (!endpoint || !p256dh || !auth) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing endpoint or keys" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await addSupportPushSubscription({
      endpoint,
      keys: { p256dh, auth },
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
