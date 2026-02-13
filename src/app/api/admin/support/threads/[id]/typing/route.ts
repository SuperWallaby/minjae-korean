import { NextRequest } from "next/server";
import { getSupportThread } from "@/lib/supportChats";
import { setTyping } from "@/lib/supportTyping";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const thread = await getSupportThread(id);
    if (!thread) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    const body = await req.json().catch(() => null);
    const isTyping = Boolean(body?.isTyping);

    setTyping(id, "support", isTyping);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

