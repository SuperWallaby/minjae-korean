import { NextRequest } from "next/server";
import { listSlots, addSlot } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams;
    const dateKey = qs.get("dateKey");
    const all = listSlots();
    const filtered = dateKey ? all.filter((s) => s.dateKey === dateKey) : all;
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
      endMin: body.endMin,
      capacity: body.capacity ?? 1,
      bookedCount: 0,
      cancelled: false,
      notes: body.notes ?? "",
    };
    addSlot(slot);
    return new Response(JSON.stringify({ ok: true, slot }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

