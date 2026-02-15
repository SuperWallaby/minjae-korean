import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { createHash } from "node:crypto";

import { findBookingByKey, getSlotById } from "@/lib/db";

export const runtime = "nodejs";

type Role = "student" | "teacher";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeEmail(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function normalizeId(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getStunIceServers(): RTCIceServer[] {
  const raw = process.env.STUN_SERVERS_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallthrough
    }
    throw new Error("STUN_SERVERS_JSON must be a JSON array");
  }

  // Default STUN-only (no TURN)
  return [{ urls: ["stun:stun.l.google.com:19302"] }];
}

function generateChannelName(roomId: string, roomToken: string): string {
  // Create a non-guessable channel name: call_{roomId}_{hash(roomToken).slice(0,16)}
  // roomToken is deterministic per room + secret, so both peers join the same channel.
  const hash = createHash("sha256")
    .update(roomToken)
    .digest("hex")
    .slice(0, 16);
  return `call_${roomId}_${hash}`;
}

function computeJoinWindow(slot: { dateKey: string; startMin: number; endMin: number }) {
  const zone = "Asia/Seoul";
  const start = DateTime.fromISO(slot.dateKey, { zone }).startOf("day").plus({ minutes: slot.startMin });
  const end = DateTime.fromISO(slot.dateKey, { zone }).startOf("day").plus({ minutes: slot.endMin });
  return {
    startISO: start.toUTC().toISO(),
    endISO: end.toUTC().toISO(),
    // Allow entering the lobby up to 10 minutes before start
    openAt: start.minus({ minutes: 10 }),
    closeAt: end.plus({ minutes: 10 }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const jwtSecret = mustEnv("SIGNALING_JWT_SECRET");

    const body = await req.json().catch(() => null);
    const bookingKey = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    const role = (typeof body?.role === "string" ? body.role : "") as Role;
    const email = normalizeEmail(body?.email);
    const studentId = normalizeId(body?.studentId);

    if (!bookingKey) return json(400, { ok: false, error: "bookingId required" });
    if (role !== "student" && role !== "teacher") return json(400, { ok: false, error: "role invalid" });

    const booking = findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
    const bookingId = booking.id; // canonical internal id
    const isOpen = Boolean(booking.open);

    if (!isOpen) {
      if (role === "student") {
        const bookingStudentId = normalizeId(booking.studentId);
        if (bookingStudentId) {
          if (!studentId) return json(400, { ok: false, error: "studentId required" });
          if (bookingStudentId !== studentId) return json(403, { ok: false, error: "not allowed" });
        } else {
          const bookingEmail = normalizeEmail(booking.email);
          if (!email) return json(400, { ok: false, error: "email required" });
          if (!bookingEmail || bookingEmail !== email) return json(403, { ok: false, error: "not allowed" });
        }
      }
    }

    const slot = getSlotById(booking.slotId);
    // Students are time-gated; teachers can always enter (if authorized).
    if (!isOpen && role === "student" && slot) {
      const isDev = process.env.NODE_ENV !== "production";
      const w = computeJoinWindow(slot);
      const now = DateTime.utc();
      if (!isDev && (now < w.openAt.toUTC() || now > w.closeAt.toUTC())) {
        return json(403, {
          ok: false,
          error: "outside join window",
          data: { openAtISO: w.openAt.toUTC().toISO(), closeAtISO: w.closeAt.toUTC().toISO(), startISO: w.startISO, endISO: w.endISO },
        });
      }
    }

    const roomId = `booking-${bookingId}`;

    // Deterministic room token shared by both peers (for filtering messages).
    // Do NOT log this value.
    const signalingToken = createHash("sha256")
      .update(`${jwtSecret}:${roomId}`)
      .digest("hex")
      .slice(0, 32);

    // Generate non-guessable channel name
    const channelName = generateChannelName(roomId, signalingToken);

    // STUN-only iceServers (TURN will be added via /api/stream/turn if needed)
    const iceServers = getStunIceServers();

    return json(200, { ok: true, roomId, channelName, signalingToken, iceServers });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

