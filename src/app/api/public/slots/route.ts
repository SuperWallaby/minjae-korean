import { NextRequest } from "next/server";
import { listSlots } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const dateKey = req.nextUrl.searchParams.get("dateKey");
    const all = listSlots();
    const filtered = dateKey ? all.filter((s) => s.dateKey === dateKey && !s.cancelled) : all.filter((s) => !s.cancelled);
    const mapped = filtered.map((s) => ({
      id: s.id,
      dateKey: s.dateKey,
      startMin: s.startMin,
      endMin: s.endMin,
      capacity: s.capacity,
      bookedCount: s.bookedCount,
      available: Math.max(0, s.capacity - s.bookedCount),
    }));
    return new Response(JSON.stringify({ ok: true, slots: mapped }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

