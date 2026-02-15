import { listAllBookings } from "@/lib/bookingsRepo";

export async function GET() {
  try {
    const all = await listAllBookings(5000);
    return new Response(JSON.stringify({ ok: true, bookings: all }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

