import { NextRequest } from "next/server";
import { getStudentById, patchStudent } from "@/lib/studentsRepo";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").filter(Boolean).pop() ?? "";
    const s = await getStudentById(id);
    if (!s) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { student: s } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").filter(Boolean).pop() ?? "";
    const body = await req.json().catch(() => null);
    if (!id || !body) return new Response(JSON.stringify({ ok: false, error: "Invalid" }), { status: 400 });
    const updated = await patchStudent(id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      adminNote: body.adminNote,
    });
    if (!updated) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { student: updated } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

