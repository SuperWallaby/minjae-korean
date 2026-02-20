import { NextRequest } from "next/server";

import { deleteRecap, getRecapById, patchRecap } from "@/lib/recapRepo";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const recap = await getRecapById(id);
    if (!recap) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
    return Response.json({ ok: true, data: recap });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await patchRecap(id, {
      ...(body.bookingId !== undefined && { bookingId: body.bookingId }),
      ...(body.studentName !== undefined && { studentName: body.studentName }),
      ...(body.studentId !== undefined && { studentId: body.studentId }),
      ...(body.level !== undefined && { level: body.level }),
      ...(body.expression !== undefined && { expression: body.expression }),
      ...(body.grammarPoint !== undefined && { grammarPoint: body.grammarPoint }),
      ...(body.vocabulary !== undefined && { vocabulary: body.vocabulary }),
      ...(body.mistake !== undefined && { mistake: body.mistake }),
      ...(body.pronounce !== undefined && { pronounce: body.pronounce }),
    });
    if (!updated) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
    return Response.json({ ok: true, data: updated });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteRecap(id);
    if (!deleted) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
