import { createBooking, listAllBookings, type Booking } from "@/lib/bookingsRepo";

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

export async function GET() {
  try {
    const all = await listAllBookings(5000);
    const items = all
      .filter((b) => Boolean(b.open))
      .map((b) => ({
        id: b.id,
        code: b.code ?? "",
        title: b.title ?? "",
        createdAt: b.createdAt,
      }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return new Response(JSON.stringify({ ok: true, data: { items } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    const booking: Booking = {
      id: uid(),
      code: newBookingCode(),
      slotId: "",
      durationMin: 25,
      studentId: undefined,
      name: title || "Open meeting",
      email: undefined,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      open: true,
      title,
      meetingProvider: "kaja",
    };
    await createBooking(booking);

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          meeting: {
            id: booking.id,
            code: booking.code ?? "",
            title: booking.title ?? "",
            createdAt: booking.createdAt,
          },
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

