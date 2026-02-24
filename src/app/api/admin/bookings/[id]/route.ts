import { NextRequest } from "next/server";
import { getBookingById } from "@/lib/bookingsRepo";
import { getSlotById } from "@/lib/slotsRepo";
import { DateTime } from "luxon";

const ZONE = "Asia/Seoul";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const booking = await getBookingById(id?.trim() ?? "");
    if (!booking) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    let dateKey = "";
    let startTimeLabel: string | null = null;
    let endTimeLabel: string | null = null;
    if (booking.slotId) {
      const slot = await getSlotById(booking.slotId);
      if (slot) {
        dateKey = slot.dateKey ?? "";
        const startDt = DateTime.fromISO(slot.dateKey, { zone: ZONE })
          .startOf("day")
          .plus({ minutes: slot.startMin });
        const endDt = startDt.plus({ minutes: booking.durationMin });
        startTimeLabel = startDt.toFormat("yyyy-MM-dd HH:mm");
        endTimeLabel = endDt.toFormat("HH:mm");
      }
    }
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          booking: {
            id: booking.id,
            code: booking.code,
            studentId: booking.studentId ?? "",
            name: booking.name,
            email: booking.email ?? "",
            status: booking.status,
            dateKey,
            startTimeLabel,
            endTimeLabel,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
