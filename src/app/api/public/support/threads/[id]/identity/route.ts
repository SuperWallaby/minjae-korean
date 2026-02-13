import { NextRequest } from "next/server";
import { getSupportThread, patchSupportThread } from "@/lib/supportChats";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const thread = await getSupportThread(id);
    if (!thread) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (email && !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), { status: 400 });
    }

    const updated = await patchSupportThread(id, {
      email: email || thread.email,
      name: name || thread.name,
    });
    if (!updated) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    return new Response(JSON.stringify({ ok: true, thread: updated }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

