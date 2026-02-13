import { addBooking, listBookings } from "@/lib/db";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  try {
    const all = listBookings();
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

    const booking = addBooking({
      id: uid(),
      slotId: "",
      studentId: undefined,
      name: title || "Open meeting",
      email: undefined,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      open: true,
      title,
    });

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

