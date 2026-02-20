import { NextRequest } from "next/server";

import { createRecap, listRecaps } from "@/lib/recapRepo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId") ?? undefined;
    const linkedParam = searchParams.get("linked");
    const linked =
      linkedParam === "true" ? true : linkedParam === "false" ? false : undefined;
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "200", 10) || 200));

    const items = await listRecaps({
      ...(bookingId !== undefined && bookingId !== "" ? { bookingId } : {}),
      linked,
      limit,
    });
    return Response.json({ ok: true, data: { items } });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recap = await createRecap({
      bookingId: body.bookingId,
      studentName: body.studentName ?? "",
      studentId: body.studentId,
      level: body.level,
      expression: body.expression ?? "",
      grammarPoint: body.grammarPoint ?? "",
      vocabulary: body.vocabulary ?? "",
      mistake: body.mistake ?? "",
      pronounce: body.pronounce ?? "",
    });
    return Response.json({ ok: true, data: recap });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
