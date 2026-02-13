import { NextRequest } from "next/server";
import { createStudent, listStudents } from "@/lib/students";
import { listBookings } from "@/lib/db";
import { importStudentsFromBookings } from "@/lib/students";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
    let list = listStudents();
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone ?? "").toLowerCase().includes(q)
      );
    }
    return new Response(JSON.stringify({ ok: true, data: { items: list } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.name !== "string" || typeof body.email !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const s = createStudent({ name: body.name, email: body.email, phone: body.phone });
    return new Response(JSON.stringify({ ok: true, data: { student: s } }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

// Optional: import from existing bookings (email-based).
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (body?.action !== "import_from_bookings") {
      return new Response(JSON.stringify({ ok: false, error: "Unknown action" }), { status: 400 });
    }
    const bookings = listBookings();
    const res = importStudentsFromBookings(bookings);
    return new Response(JSON.stringify({ ok: true, data: res }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

