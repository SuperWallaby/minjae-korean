import { NextRequest } from "next/server";
import { listBookings, listSlots } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const qs = req.nextUrl.searchParams;
    const q = (qs.get("q") ?? "").trim().toLowerCase();
    const dateKey = (qs.get("dateKey") ?? "").trim();
    const studentId = (qs.get("studentId") ?? "").trim();

    const bookings = listBookings();
    const slots = listSlots();
    const slotById = new Map(slots.map((s) => [s.id, s]));

    let list = bookings.map((b) => {
      const s = slotById.get(b.slotId) ?? null;
      return {
        id: b.id,
        code: b.code ?? "",
        slotId: b.slotId,
        studentId: b.studentId ?? "",
        name: b.name,
        email: b.email ?? "",
        status: b.status,
        createdAt: b.createdAt,
        meetingProvider: b.meetingProvider ?? "kaja",
        meetUrl: b.meetUrl ?? "",
        calendarHtmlLink: b.calendarHtmlLink ?? "",
        dateKey: s?.dateKey ?? "",
        startMin: s?.startMin ?? 0,
        endMin: s?.endMin ?? 0,
        cancelled: Boolean(s?.cancelled),
      };
    });

    if (dateKey) list = list.filter((x) => x.dateKey === dateKey);
    if (studentId) list = list.filter((x) => x.studentId === studentId);
    if (q) list = list.filter((x) => x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q));

    // latest first
    list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return new Response(JSON.stringify({ ok: true, data: { items: list } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

