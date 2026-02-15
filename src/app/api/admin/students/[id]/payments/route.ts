import { NextRequest } from "next/server";
import { addPayment, deletePayment, getStudentById } from "@/lib/studentsRepo";

export async function GET(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const s = await getStudentById(id);
    if (!s) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { payments: s.payments ?? [] } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const body = await req.json().catch(() => null);
    if (!body || typeof body.type !== "string" || typeof body.amount !== "number") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }
    const rec = await addPayment(id, {
      type: body.type,
      amount: body.amount,
      memo: body.memo ?? "",
    });
    if (!rec) return new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify({ ok: true, data: { payment: rec } }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const id = parts[parts.indexOf("students") + 1] ?? "";
    const paymentId = (req.nextUrl.searchParams.get("paymentId") ?? "").trim();
    if (!paymentId) return new Response(JSON.stringify({ ok: false, error: "Missing paymentId" }), { status: 400 });
    const ok = deletePayment(id, paymentId);
    return new Response(JSON.stringify({ ok: true, data: { deleted: ok } }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

