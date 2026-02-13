import { NextRequest } from "next/server";
import { listSlots, listBookings, type Booking } from "@/lib/db";

type SlotDTO = {
  id: string;
  dateKey: string;
  startMin: number;
  endMin: number;
  capacity: number;
  cancelled: boolean;
  notes: string;
  bookedCount: number;
  bookings: Booking[];
};

function isDateKey(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams;
    const fromDateKey = (qs.get("fromDateKey") ?? "").trim();
    const toDateKey = (qs.get("toDateKey") ?? "").trim();
    if (!isDateKey(fromDateKey) || !isDateKey(toDateKey)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid from/to dateKey" }), {
        status: 400,
      });
    }

    const slots = listSlots().filter((s) => s.dateKey >= fromDateKey && s.dateKey <= toDateKey);
    const bookings = listBookings();

    const bookingsBySlot = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = bookingsBySlot.get(b.slotId) ?? [];
      list.push(b);
      bookingsBySlot.set(b.slotId, list);
    }

    const byDay = new Map<string, SlotDTO[]>();
    for (const s of slots) {
      const bs = bookingsBySlot.get(s.id) ?? [];
      const bookedCount = bs.filter((b) => b.status === "confirmed").length;
      const dto: SlotDTO = {
        id: s.id,
        dateKey: s.dateKey,
        startMin: s.startMin,
        endMin: s.endMin,
        capacity: s.capacity,
        cancelled: Boolean(s.cancelled),
        notes: s.notes ?? "",
        bookedCount,
        bookings: bs,
      };
      const list = byDay.get(s.dateKey) ?? [];
      list.push(dto);
      byDay.set(s.dateKey, list);
    }

    const days = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, daySlots]) => ({
        dateKey,
        slots: daySlots.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin),
      }));

    return new Response(JSON.stringify({ ok: true, data: { days } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

