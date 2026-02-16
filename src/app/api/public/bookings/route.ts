import { NextRequest } from "next/server";
import { DateTime } from "luxon";

import { createBooking, deleteBooking, listBookingsByEmail, listBookingsByStudentId, patchBooking, type Booking } from "@/lib/bookingsRepo";
import { getSlotById, getSlotsByIds, releaseSlot, tryReserveSlot } from "@/lib/slotsRepo";
import { consumeCreditsByStudentId, getStudentById, patchStudent, restoreCreditsByStudentId, upsertStudentByEmail } from "@/lib/studentsRepo";
import { createMeetEvent } from "@/lib/googleCalendarMeet";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomAlnum(len: number) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function newBookingCode() {
  return `kaja${randomAlnum(5)}`;
}

function meetingProviderFromEnv(): "kaja_meet" | "google_meet" {
  const v = (process.env.MEETING_PROVIDER ?? "").trim().toLowerCase();
  return v === "google_meet" ? "google_meet" : "kaja_meet";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.slotId || !body.name) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const provider = meetingProviderFromEnv();
    const slot = await getSlotById(String(body.slotId));
    if (!slot) return new Response(JSON.stringify({ ok: false, error: "Slot not found" }), { status: 404 });
    const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const phoneCountry = typeof body.phoneCountry === "string" ? body.phoneCountry : undefined;
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber : undefined;
    if (!studentId && !email) {
      return new Response(JSON.stringify({ ok: false, error: "studentId or email required" }), { status: 400 });
    }

    const durationRaw = typeof body.durationMin === "number" ? body.durationMin : null;
    const durationMin: 25 | 50 = durationRaw === 50 ? 50 : 25;
    const creditsNeeded = durationMin === 50 ? 2 : 1;

    const slot2 =
      durationMin === 50
        ? await getSlotById(`s-${slot.dateKey}-${slot.startMin + 30}`)
        : null;
    if (durationMin === 50 && !slot2) {
      return new Response(JSON.stringify({ ok: false, error: "Adjacent slot not available" }), { status: 409 });
    }

    // Reserve slots (atomic per slot).
    const ok1 = await tryReserveSlot(slot.id, 1);
    if (!ok1) return new Response(JSON.stringify({ ok: false, error: "Slot full" }), { status: 409 });
    let ok2 = true;
    if (durationMin === 50 && slot2) {
      ok2 = await tryReserveSlot(slot2.id, 1);
      if (!ok2) {
        await releaseSlot(slot.id, 1);
        return new Response(JSON.stringify({ ok: false, error: "Adjacent slot full" }), { status: 409 });
      }
    }

    const student = studentId ? await getStudentById(studentId) : (email ? await upsertStudentByEmail({ name: body.name, email }) : null);
    if (!student) {
      await releaseSlot(slot.id, 1);
      if (durationMin === 50 && slot2) await releaseSlot(slot2.id, 1);
      return new Response(JSON.stringify({ ok: false, error: "Student not found" }), { status: 404 });
    }

    // Enforce credits (server source of truth).
    const consumed = await consumeCreditsByStudentId(student.id, creditsNeeded);
    if (!consumed.ok) {
      await releaseSlot(slot.id, 1);
      if (durationMin === 50 && slot2) await releaseSlot(slot2.id, 1);
      return new Response(JSON.stringify({ ok: false, error: consumed.error }), { status: 402 });
    }

    const nextName = typeof body.name === "string" ? String(body.name) : student.name;
    const shouldPatchEmail = Boolean(email) && !(student.email ?? "").trim(); // only fill if missing
    const shouldPatchName = nextName !== student.name;
    const shouldPatchPhone = phone !== undefined || phoneCountry !== undefined || phoneNumber !== undefined;
    if (shouldPatchEmail || shouldPatchName || shouldPatchPhone) {
      await patchStudent(student.id, {
        phone,
        phoneCountry,
        phoneNumber,
        name: nextName,
        ...(shouldPatchEmail ? { email } : null),
      });
    }

    const bookingEmail = (email || student?.email || "").trim().toLowerCase();
    const baseBooking: Booking = {
      id: uid(),
      code: newBookingCode(),
      slotId: slot.id,
      ...(durationMin === 50 && slot2 ? { slotId2: slot2.id } : null),
      durationMin,
      studentId: student.id,
      name: String(body.name ?? ""),
      email: bookingEmail,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      ...(provider === "google_meet" ? { meetingProvider: "google_meet" as const } : { meetingProvider: "kaja" as const }),
    };

    // Insert booking; retry code collisions a few times.
    let booking = baseBooking;
    let inserted = false;
    for (let i = 0; i < 5; i++) {
      try {
        await createBooking(booking);
        inserted = true;
        break;
      } catch {
        booking = { ...booking, code: newBookingCode() };
      }
    }
    if (!inserted) {
      await releaseSlot(slot.id, 1);
      if (durationMin === 50 && slot2) await releaseSlot(slot2.id, 1);
      await restoreCreditsByStudentId(student.id, creditsNeeded);
      return new Response(JSON.stringify({ ok: false, error: "Failed to create booking" }), { status: 500 });
    }

    if (provider === "google_meet") {
      const ZONE = "Asia/Seoul";
      const start = DateTime.fromISO(slot.dateKey, { zone: ZONE })
        .startOf("day")
        .plus({ minutes: slot.startMin });
      const end = start.plus({ minutes: durationMin });
      const startISO = start.toISO() ?? start.toUTC().toISO() ?? "";
      const endISO = end.toISO() ?? end.toUTC().toISO() ?? "";

      try {
        const calendarId = (process.env.GOOGLE_CALENDAR_ID ?? "primary").trim() || "primary";
        const studentName = String(body.name).trim() || "Student";

        const summary = `🇰🇷 ${studentName} × Minjae · Korean Lesson`;

        const description = `KajaKorean 1:1 Korean Lesson

Teacher: Minjae
Student: ${studentName}
Booking Code: ${booking.code ?? booking.id}

Join via Google Meet:
(Link attached to this event)

Booking ID: ${booking.id}
`;

        const requestId = `kaja-booking-${booking.id}`;

        const meet = await createMeetEvent({
          calendarId,
          requestId,
          summary,
          description,
          startISO,
          endISO,
          timeZone: ZONE,
          attendees: bookingEmail ? [bookingEmail] : [],
        });

        const updated = await patchBooking(booking.id, {
          meetingProvider: "google_meet",
          meetUrl: meet.meetUrl,
          calendarEventId: meet.eventId,
          calendarHtmlLink: meet.htmlLink,
          meetCreatedAt: new Date().toISOString(),
          meetError: "",
        });

        return new Response(
          JSON.stringify({ ok: true, booking: updated ?? { ...booking, meetUrl: meet.meetUrl } }),
          { status: 201 },
        );
      } catch {
        // Google Meet mode: do NOT fall back to Kaja Meet.
        // Roll back booking + slots + credits, then return an error.
        try {
          await deleteBooking(booking.id);
        } catch {}
        try {
          await restoreCreditsByStudentId(student.id, creditsNeeded);
        } catch {}
        try {
          await releaseSlot(slot.id, 1);
          if (durationMin === 50 && slot2) await releaseSlot(slot2.id, 1);
        } catch {}
        return new Response(
          JSON.stringify({
            ok: false,
            error:
              "Sorry, something went wrong. Please try again in a moment.",
          }),
          { status: 502 },
        );
      }
    }

    // Kaja Meet mode (default): keep existing behavior.
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
    const bookings = studentId ? await listBookingsByStudentId(studentId) : await listBookingsByEmail(email);
    const slotIds = Array.from(new Set(bookings.map((b) => b.slotId)));
    const slots = await getSlotsByIds(slotIds);
    const slotById = new Map(slots.map((s) => [s.id, s] as const));
    const items = bookings
      .map((b) => {
        const s = slotById.get(b.slotId) ?? null;
        return {
          id: b.id,
          code: b.code ?? "",
          status: b.status,
          createdAt: b.createdAt,
          meetingProvider: b.meetingProvider ?? "kaja",
          meetUrl: b.meetUrl ?? "",
          calendarHtmlLink: b.calendarHtmlLink ?? "",
          slotId: b.slotId,
          dateKey: s?.dateKey ?? "",
          startMin: s?.startMin ?? 0,
          endMin: s ? (s.startMin ?? 0) + b.durationMin : 0,
          cancelled: Boolean(s?.cancelled),
        };
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return new Response(JSON.stringify({ ok: true, data: { items } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

