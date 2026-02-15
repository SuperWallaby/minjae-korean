import { NextRequest } from "next/server";
import { listSlotsByDateKey, type Slot } from "@/lib/slotsRepo";
import { listBookingsBySlotIds, type Booking } from "@/lib/bookingsRepo";

function isDateKey(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: NextRequest) {
  try {
    const dateKey = (req.nextUrl.searchParams.get("dateKey") ?? "").trim();
    if (!isDateKey(dateKey)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid dateKey" }), { status: 400 });
    }

    const slots = await listSlotsByDateKey(dateKey);
    const slotIds = slots.map((s) => s.id);
    const bookings = await listBookingsBySlotIds(slotIds);
    const bookingsBySlot = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list1 = bookingsBySlot.get(b.slotId) ?? [];
      list1.push(b);
      bookingsBySlot.set(b.slotId, list1);
      if (b.slotId2) {
        const list2 = bookingsBySlot.get(b.slotId2) ?? [];
        list2.push(b);
        bookingsBySlot.set(b.slotId2, list2);
      }
    }

    const out = slots.map((s): (Slot & { bookedCount: number; bookings: Booking[] }) => {
      const bs = bookingsBySlot.get(s.id) ?? [];
      const bookedCount = bs.filter((b) => b.status === "confirmed").length;
      return { ...s, bookedCount, bookings: bs };
    });

    return new Response(JSON.stringify({ ok: true, data: { dateKey, slots: out } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

