import { deleteSupportThread, getSupportThread, listSupportMessages } from "@/lib/supportChats";
import { getTyping } from "@/lib/supportTyping";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const [thread, messages] = await Promise.all([getSupportThread(id), listSupportMessages(id)]);
    if (!thread) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    const typing = getTyping(id);
    return new Response(JSON.stringify({ ok: true, thread, messages, typing }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });
    const deleted = await deleteSupportThread(id);
    if (!deleted) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

