import { NextRequest } from "next/server";
import { addSupportMessage, getSupportThread, patchSupportThread } from "@/lib/supportChats";
import { sendSupportPushToAll } from "@/lib/supportPush";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    const thread = await getSupportThread(id);
    if (!thread) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    // Allow attaching identity to an existing guest thread.
    if ((!thread.email || !isEmail(thread.email)) && email && isEmail(email)) {
      await patchSupportThread(id, { email, name: name || thread.name });
    } else if (!thread.name && name) {
      await patchSupportThread(id, { name });
    }

    const msg = await addSupportMessage(id, "member", text);
    if (!msg) return new Response(JSON.stringify({ ok: false, error: "Invalid message" }), { status: 400 });

    const fromLabel = (name || thread.name)?.trim() || (email || thread.email)?.trim() || "Guest";
    void sendSupportPushToAll(id, fromLabel, text);

    return new Response(JSON.stringify({ ok: true, message: msg }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

