import { NextRequest } from "next/server";
import { listSlots, updateSlot, addBooking, listBookings } from "@/lib/db";
import {
  patchStudent,
  upsertStudentByEmail,
  consumeOneCreditByEmail,
  consumeOneCreditByStudentId,
  getStudentById,
} from "@/lib/students";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.slotId || !body.name) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const slots = listSlots();
    const slot = slots.find((s) => s.id === body.slotId);
    if (!slot) return new Response(JSON.stringify({ ok: false, error: "Slot not found" }), { status: 404 });
    if ((slot.capacity - slot.bookedCount) <= 0) {
      return new Response(JSON.stringify({ ok: false, error: "Slot full" }), { status: 409 });
    }
    const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone : undefined;
    if (!studentId && !email) {
      return new Response(JSON.stringify({ ok: false, error: "studentId or email required" }), { status: 400 });
    }

    // Enforce credits (server source of truth).
    const consumed = studentId ? consumeOneCreditByStudentId(studentId) : consumeOneCreditByEmail(email);
    if (!consumed.ok) {
      return new Response(JSON.stringify({ ok: false, error: consumed.error }), { status: 402 });
    }

    const student =
      studentId
        ? getStudentById(studentId)
        : (email ? upsertStudentByEmail({ name: body.name, email }) : null);

    if (student) {
      const nextName =
        typeof body.name === "string" ? String(body.name) : student.name;
      const shouldPatchEmail =
        Boolean(email) && !(student.email ?? "").trim(); // only fill if missing
      const shouldPatchName = nextName !== student.name;
      const shouldPatchPhone = phone !== undefined;

      if (shouldPatchEmail || shouldPatchName || shouldPatchPhone) {
        patchStudent(student.id, {
          phone,
          name: nextName,
          ...(shouldPatchEmail ? { email } : null),
        });
      }
    }
    // create booking
    const bookingEmail = (email || student?.email || "").trim().toLowerCase();
    const booking = {
      id: uid(),
      slotId: slot.id,
      studentId: student?.id,
      name: body.name,
      email: bookingEmail,
      status: "confirmed" as const,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    updateSlot(slot.id, { bookedCount: slot.bookedCount + 1 });
    return new Response(JSON.stringify({ ok: true, booking }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const studentId = (req.nextUrl.searchParams.get("studentId") ?? "").trim();
    const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
    if (!studentId && !email) {
      return new Response(JSON.stringify({ ok: false, error: "Missing studentId or email" }), { status: 400 });
    }
    const bookings = studentId
      ? listBookings().filter((b) => (b.studentId ?? "") === studentId)
      : listBookings().filter((b) => (b.email ?? "").trim().toLowerCase() === email);
    const slots = listSlots();
    const slotById = new Map(slots.map((s) => [s.id, s]));
    const items = bookings
      .map((b) => {
        const s = slotById.get(b.slotId) ?? null;
        return {
          id: b.id,
          code: b.code ?? "",
          status: b.status,
          createdAt: b.createdAt,
          slotId: b.slotId,
          dateKey: s?.dateKey ?? "",
          startMin: s?.startMin ?? 0,
          endMin: s?.endMin ?? 0,
          cancelled: Boolean(s?.cancelled),
        };
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return new Response(JSON.stringify({ ok: true, data: { items } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

