import { NextRequest } from "next/server";
import { listBookings } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const all = listBookings();
    return new Response(JSON.stringify({ ok: true, bookings: all }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

