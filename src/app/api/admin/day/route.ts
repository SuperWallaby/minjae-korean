import { NextRequest } from "next/server";
import { listSlots, listBookings } from "@/lib/db";

function isDateKey(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: NextRequest) {
  try {
    const dateKey = (req.nextUrl.searchParams.get("dateKey") ?? "").trim();
    if (!isDateKey(dateKey)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid dateKey" }), { status: 400 });
    }

    const slots = listSlots()
      .filter((s) => s.dateKey === dateKey)
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    const bookings = listBookings();
    const bookingsBySlot = new Map<string, Array<any>>();
    for (const b of bookings) {
      const list = bookingsBySlot.get(b.slotId) ?? [];
      list.push(b);
      bookingsBySlot.set(b.slotId, list);
    }

    const out = slots.map((s) => {
      const bs = bookingsBySlot.get(s.id) ?? [];
      const bookedCount = bs.filter((b) => b.status === "confirmed").length;
      return { ...s, bookedCount, bookings: bs };
    });

    return new Response(JSON.stringify({ ok: true, data: { dateKey, slots: out } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

