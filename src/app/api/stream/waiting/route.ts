import fs from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { findBookingByKey } from "@/lib/db";

export const runtime = "nodejs";

type WaitingRecord = Record<string, { lastSeenISO: string }>;

const DATA_DIR = path.join(process.cwd(), "data");
const WAITING_PATH = path.join(DATA_DIR, "waiting.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WAITING_PATH)) fs.writeFileSync(WAITING_PATH, "{}", "utf-8");
}

function readStore(): WaitingRecord {
  ensureStore();
  try {
    const raw = fs.readFileSync(WAITING_PATH, "utf-8");
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return {};
    return j as WaitingRecord;
  } catch {
    return {};
  }
}

function writeStore(next: WaitingRecord) {
  ensureStore();
  fs.writeFileSync(WAITING_PATH, JSON.stringify(next, null, 2), "utf-8");
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

// Note: no environment-required secret for teacher waiting; kept intentionally permissive.

export async function GET(req: NextRequest) {
  try {
    const bookingKey = (req.nextUrl.searchParams.get("bookingId") ?? "").trim();
    if (!bookingKey) return json(400, { ok: false, error: "bookingId required" });
    const booking = findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
    const bookingId = booking.id;

    const ttlMs = Number.parseInt(process.env.STREAM_WAITING_TTL_MS ?? "", 10);
    const ttl = Number.isFinite(ttlMs) ? ttlMs : 60000; // 60s

    const store = readStore();
    const lastSeenISO = store[bookingId]?.lastSeenISO ?? null;
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
    const booking = findBookingByKey(bookingKey);
    if (!booking) return json(404, { ok: false, error: "booking not found" });
    const bookingId = booking.id;

    const store = readStore();
    store[bookingId] = { lastSeenISO: new Date().toISOString() };
    writeStore(store);

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

