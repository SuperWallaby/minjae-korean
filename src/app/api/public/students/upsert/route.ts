import { NextRequest } from "next/server";
import {
  upsertStudentByEmail,
  upsertStudentByAuthUserId,
  patchStudent,
  findStudentByEmail,
  findStudentByAuthUserId,
  getStudentById,
} from "@/lib/studentsRepo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name : "Student";
    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const phoneCountry = typeof body.phoneCountry === "string" ? body.phoneCountry : undefined;
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber : undefined;
    const sessionWish = typeof body.sessionWish === "string" ? body.sessionWish : undefined;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const authUserId = typeof body.authUserId === "string" ? body.authUserId.trim() : "";

    if (id) {
      const updated = await patchStudent(id, {
        name,
        email: body.email,
        phone,
        phoneCountry,
        phoneNumber,
        sessionWish,
        ...(authUserId ? { authUserId } : null),
      });
      if (!updated) {
        return new Response(JSON.stringify({ ok: false, error: "Student not found" }), { status: 404 });
      }
      return new Response(JSON.stringify({ ok: true, data: { student: updated } }), { status: 200 });
    }

    const s0 = authUserId
      ? await upsertStudentByAuthUserId({ authUserId, name, email: body.email, phone })
      : await upsertStudentByEmail({ name, email: body.email });
    if (!s0) return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), { status: 400 });

    const next =
      phone !== undefined ||
      phoneCountry !== undefined ||
      phoneNumber !== undefined ||
      sessionWish !== undefined ||
      typeof body.name === "string"
        ? (await patchStudent(s0.id, {
            phone,
            phoneCountry,
            phoneNumber,
            sessionWish,
            name,
            email: s0.email,
            ...(authUserId ? { authUserId } : null),
          })) ?? s0
        : s0;
    return new Response(JSON.stringify({ ok: true, data: { student: next } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
    if (id) {
      const s = await getStudentById(id);
      return new Response(JSON.stringify({ ok: true, data: { student: s } }), { status: 200 });
    }
    const authUserId = (req.nextUrl.searchParams.get("authUserId") ?? "").trim();
    if (authUserId) {
      const s = await findStudentByAuthUserId(authUserId);
      if (!s) return new Response(JSON.stringify({ ok: true, data: { student: null } }), { status: 200 });
      return new Response(JSON.stringify({ ok: true, data: { student: s } }), { status: 200 });
    }
    const email = (req.nextUrl.searchParams.get("email") ?? "").trim();
    if (!email) return new Response(JSON.stringify({ ok: false, error: "Missing email" }), { status: 400 });
    const s = await findStudentByEmail(email);
    if (!s) return new Response(JSON.stringify({ ok: true, data: { student: null } }), { status: 200 });
    return new Response(JSON.stringify({ ok: true, data: { student: s } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

