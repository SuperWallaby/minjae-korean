import { NextRequest } from "next/server";
import { adjustStudentCreditsById } from "@/lib/studentsRepo";

export async function POST(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";

    const body = await req.json().catch(() => null);
    const delta = body?.delta;
    const memo = typeof body?.memo === "string" ? body.memo : "";
    const expiresInDays = body?.expiresInDays;

    const res = await adjustStudentCreditsById({
      studentId: id,
      delta,
      memo,
      expiresInDays,
    });

    if (!res.ok) return new Response(JSON.stringify({ ok: false, error: res.error }), { status: 400 });
    return new Response(JSON.stringify({ ok: true, data: { student: res.student, credit: res.credit ?? null } }), {
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

