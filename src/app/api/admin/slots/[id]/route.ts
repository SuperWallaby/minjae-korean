import { NextRequest } from "next/server";
import { deleteSlotById, patchSlot } from "@/lib/slotsRepo";

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop() || "";
    const body = await req.json().catch(() => null);
    if (!id || !body) return new Response(JSON.stringify({ ok: false, error: "Missing" }), { status: 400 });
    const updated = await patchSlot(id, body);
    if (!updated) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, slot: updated }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop() || "";
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });
    await deleteSlotById(id);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

