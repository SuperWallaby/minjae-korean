import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { findBookingByKey } from "@/lib/bookingsRepo";
import { getSlotById } from "@/lib/slotsRepo";

const ZONE = "Asia/Seoul";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId: raw } = await ctx.params;
    const bookingId = raw?.trim() ?? "";
    if (!bookingId) {
      return new Response(JSON.stringify({ ok: false, error: "bookingId required" }), { status: 400 });
    }

    const booking = await findBookingByKey(bookingId);
    if (!booking) {
      return new Response(JSON.stringify({ ok: false, error: "booking not found" }), { status: 404 });
    }

    const slot = booking.slotId ? await getSlotById(booking.slotId) : null;
    if (!slot) {
      return new Response(
        JSON.stringify({ ok: true, startTimeLabel: null, endTimeLabel: null, dateKey: null }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const startDt = DateTime.fromISO(slot.dateKey, { zone: ZONE }).startOf("day").plus({ minutes: slot.startMin });
    const endDt = startDt.plus({ minutes: booking.durationMin });
    const startTimeLabel = startDt.toFormat("yyyy-MM-dd HH:mm");
    const endTimeLabel = endDt.toFormat("HH:mm");

    return new Response(
      JSON.stringify({
        ok: true,
        startTimeLabel,
        endTimeLabel,
        dateKey: slot.dateKey,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
