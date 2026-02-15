import { NextRequest } from "next/server";
import { findBookingByKey } from "@/lib/bookingsRepo";
import { getWaiting, upsertWaiting } from "@/lib/waitingRepo";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

// Note: no environment-required secret for teacher waiting; kept intentionally permissive.

export async function GET(req: NextRequest) {
  try {
    const bookingKey = (req.nextUrl.searchParams.get("bookingId") ?? "").trim();
    if (!bookingKey) return json(400, { ok: false, error: "bookingId required" });
    const booking = await findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
    const bookingId = booking.id;

    const ttlMs = Number.parseInt(process.env.STREAM_WAITING_TTL_MS ?? "", 10);
    const ttl = Number.isFinite(ttlMs) ? ttlMs : 60000; // 60s

    const entry = await getWaiting(bookingId);
    const lastSeenISO = entry?.lastSeenISO ?? null;
    const waiting =
      typeof lastSeenISO === "string" && Date.now() - Date.parse(lastSeenISO) <= ttl ? true : false;

    return json(200, { ok: true, data: { waiting, lastSeenISO } });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Allow teachers to announce presence without a secret key.
    // NOTE: This relaxes security for convenience; consider restoring auth in production.
    const body = await req.json().catch(() => null);
    const bookingKey = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    if (!bookingKey) return json(400, { ok: false, error: "bookingId required" });
    const booking = await findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
    const bookingId = booking.id;

    await upsertWaiting(bookingId, new Date().toISOString());

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

