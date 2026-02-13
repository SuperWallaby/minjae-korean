import { NextRequest } from "next/server";
import { addSupportMessage, getSupportThread } from "@/lib/supportChats";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const thread = await getSupportThread(id);
    if (!thread) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text : "";

    const msg = await addSupportMessage(id, "support", text);
    if (!msg) return new Response(JSON.stringify({ ok: false, error: "Invalid message" }), { status: 400 });

    return new Response(JSON.stringify({ ok: true, message: msg }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

