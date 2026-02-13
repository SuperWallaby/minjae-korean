import { NextRequest } from "next/server";
import { DateTime } from "luxon";

import { listBookings, updateBooking, listSlots, updateSlot } from "@/lib/db";
import { restoreOneCreditByEmail, restoreOneCreditByStudentId } from "@/lib/students";

export const runtime = "nodejs";

const BUSINESS_TIME_ZONE = "Asia/Seoul";
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

    const body = await req.json().catch(() => null);
    const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!studentId && !email) {
      return new Response(JSON.stringify({ ok: false, error: "studentId or email required" }), { status: 400 });
    }

    const booking = listBookings().find((b) => b.id === id) ?? null;
    if (!booking) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    const ownerOk = studentId
      ? (booking.studentId ?? "") === studentId
      : (booking.email ?? "").trim().toLowerCase() === email;
    if (!ownerOk) return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    if (booking.status !== "confirmed") {
      return new Response(JSON.stringify({ ok: false, error: "Not cancellable" }), { status: 409 });
    }

    const slot = listSlots().find((s) => s.id === booking.slotId) ?? null;
    if (!slot) return new Response(JSON.stringify({ ok: false, error: "Slot not found" }), { status: 404 });

    const start = DateTime.fromISO(slot.dateKey, { zone: BUSINESS_TIME_ZONE })
      .startOf("day")
      .plus({ minutes: slot.startMin });
    const msUntil = start.toMillis() - Date.now();
    if (msUntil < ONE_HOUR_MS) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Cancellations are allowed up to 1 hour before the session. Within 1 hour, please contact Minjae directly.",
        }),
        { status: 409 },
      );
    }

    const updated = updateBooking(booking.id, { status: "cancelled" });
    if (!updated) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });

    updateSlot(slot.id, { bookedCount: Math.max(0, (slot.bookedCount ?? 0) - 1) });
    if (studentId) restoreOneCreditByStudentId(studentId);
    else restoreOneCreditByEmail(email);

    return new Response(JSON.stringify({ ok: true, booking: updated }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

