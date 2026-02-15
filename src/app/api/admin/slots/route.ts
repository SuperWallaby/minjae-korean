import { NextRequest } from "next/server";
import { listAllSlots, listSlotsByDateKey, upsertSlot } from "@/lib/slotsRepo";

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams;
    const dateKey = qs.get("dateKey");
    const filtered = dateKey ? await listSlotsByDateKey(dateKey) : await listAllSlots();
    return new Response(JSON.stringify({ ok: true, slots: filtered }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.dateKey || typeof body.startMin !== "number" || typeof body.endMin !== "number") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const slot = {
      id: `s-${body.dateKey}-${body.startMin}`,
      dateKey: body.dateKey,
      startMin: body.startMin,
      endMin: body.startMin + 25,
      capacity: body.capacity ?? 1,
      bookedCount: 0,
      cancelled: false,
      notes: body.notes ?? "",
    };
    await upsertSlot(slot);
    return new Response(JSON.stringify({ ok: true, slot }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

