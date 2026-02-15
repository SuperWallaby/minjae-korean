import { NextRequest } from "next/server";
import { DateTime } from "luxon";

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

function envInt(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const v = Number.parseInt(raw, 10);
  return Number.isFinite(v) ? v : fallback;
}

function isTurnUrl(u: unknown): boolean {
  return typeof u === "string" && (u.startsWith("turn:") || u.startsWith("turns:"));
}

function getTwilioIceServersArray(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const v = (data as Record<string, unknown>).ice_servers;
  return Array.isArray(v) ? v : [];
}

async function getTwilioTurnIceServers(): Promise<RTCIceServer[]> {
  const accountSid = mustEnv("TWILIO_ACCOUNT_SID");
  const authToken = mustEnv("TWILIO_AUTH_TOKEN");
  const ttl = envInt("TWILIO_TURN_TTL_SECONDS", 600);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Tokens.json`;

  const body = new URLSearchParams();
  body.set("Ttl", String(ttl));

  const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const rawText = await res.text();
  if (!res.ok) {
    throw new Error(`Twilio token API failed (HTTP ${res.status})`);
  }

  // Twilio returns: { ice_servers: [{ url, username, credential }, ...], ... }
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Twilio token API returned non-JSON");
  }

  const iceServers = getTwilioIceServersArray(data);
  const turnOnly: RTCIceServer[] = [];

  for (const s of iceServers) {
    const obj = (s && typeof s === "object" ? (s as Record<string, unknown>) : null) ?? {};
    const username = typeof obj.username === "string" ? obj.username : undefined;
    const credential = typeof obj.credential === "string" ? obj.credential : undefined;
    const urlsRaw = obj.urls ?? obj.url;

    const urls =
      Array.isArray(urlsRaw) ? urlsRaw.filter(isTurnUrl) : isTurnUrl(urlsRaw) ? [urlsRaw] : [];

    if (urls.length === 0) continue;
    turnOnly.push({ urls, ...(username ? { username } : {}), ...(credential ? { credential } : {}) });
  }

  if (turnOnly.length === 0) {
    throw new Error("Twilio did not return any TURN servers");
  }

  return turnOnly;
}

function computeJoinWindow(slot: { dateKey: string; startMin: number; endMin: number }) {
  const zone = "Asia/Seoul";
  const start = DateTime.fromISO(slot.dateKey, { zone }).startOf("day").plus({ minutes: slot.startMin });
  const end = DateTime.fromISO(slot.dateKey, { zone }).startOf("day").plus({ minutes: slot.endMin });
  return {
    startISO: start.toUTC().toISO(),
    endISO: end.toUTC().toISO(),
    // Keep in sync with /api/stream/session: lobby opens 10 minutes before start
    openAt: start.minus({ minutes: 10 }),
    closeAt: end.plus({ minutes: 10 }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const bookingKey = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    const role = (typeof body?.role === "string" ? body.role : "") as Role;
    const email = normalizeEmail(body?.email);
    const studentId = normalizeId(body?.studentId);

    if (!bookingKey) return json(400, { ok: false, error: "bookingId required" });
    if (role !== "student" && role !== "teacher") return json(400, { ok: false, error: "role invalid" });

    const booking = findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
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

    const turnIceServers = await getTwilioTurnIceServers();

    return json(200, { ok: true, iceServers: turnIceServers });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
