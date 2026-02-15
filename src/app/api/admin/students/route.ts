import { NextRequest } from "next/server";
import { createStudent, listStudents, upsertStudentByEmail } from "@/lib/studentsRepo";
import { listAllBookings } from "@/lib/bookingsRepo";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
    const list = await listStudents({ q, limit: 2000 });
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
    const s = await createStudent({ name: body.name, email: body.email, phone: body.phone });
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
    const bookings = await listAllBookings(5000);
    const uniq = new Map<string, { name: string; email: string }>();
    for (const b of bookings) {
      const email = (b.email ?? "").trim().toLowerCase();
      if (!email) continue;
      if (!uniq.has(email)) uniq.set(email, { email, name: (b.name ?? "").trim() || "Student" });
    }
    let createdOrLinked = 0;
    for (const v of uniq.values()) {
      const s = await upsertStudentByEmail({ name: v.name, email: v.email });
      if (s) createdOrLinked++;
    }
    return new Response(JSON.stringify({ ok: true, data: { scanned: uniq.size, upserted: createdOrLinked } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

