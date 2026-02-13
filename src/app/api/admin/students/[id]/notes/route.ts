import { NextRequest } from "next/server";
import { addStudentNote, deleteStudentNote, getStudentById } from "@/lib/students";

export async function GET(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const s = getStudentById(id);
    if (!s) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { notes: s.notes ?? [] } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const body = await req.json().catch(() => null);
    if (!body || typeof body.body !== "string" || !body.body.trim()) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const note = addStudentNote(id, body.body);
    if (!note) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { note } }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const noteId = (req.nextUrl.searchParams.get("noteId") ?? "").trim();
    if (!noteId) return new Response(JSON.stringify({ ok: false, error: "Missing noteId" }), { status: 400 });
    const ok = deleteStudentNote(id, noteId);
    return new Response(JSON.stringify({ ok: true, data: { deleted: ok } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

