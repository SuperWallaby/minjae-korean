import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  findStudentByAuthUserId,
  upsertStudentByAuthUserId,
  type CreditGrant,
  type PaymentRecord,
  type Student,
  type StudentNote,
} from "@/lib/students";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

type SessionClaims = {
  sub: string;
  email?: string;
  studentId?: string;
  name?: string;
};

type SessionStudent = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  sessionWish?: string;
  notes: Array<Pick<StudentNote, "id" | "body" | "createdAt">>;
  payments: Array<Pick<PaymentRecord, "id" | "type" | "amount" | "createdAt" | "memo">>;
  credits: Array<
    Pick<
      CreditGrant,
      "id" | "source" | "product" | "kind" | "total" | "remaining" | "purchasedAt" | "expiresAt"
    >
  >;
};

function toSessionStudent(s: Student): SessionStudent {
  return {
    id: s.id,
    name: (s.name ?? "").trim() || "Student",
    email: (s.email ?? "").trim(),
    phone: (s.phone ?? "").trim() || undefined,
    sessionWish: (s.sessionWish ?? "").trim() || undefined,
    notes: Array.isArray(s.notes)
      ? s.notes.map((n) => ({
          id: String(n.id ?? ""),
          body: String(n.body ?? ""),
          createdAt: String(n.createdAt ?? ""),
        }))
      : [],
    payments: Array.isArray(s.payments)
      ? s.payments.map((p) => ({
          id: String(p.id ?? ""),
          type: p.type,
          amount: Number(p.amount ?? 0),
          createdAt: String(p.createdAt ?? ""),
          memo: typeof p.memo === "string" ? p.memo : undefined,
        }))
      : [],
    credits: Array.isArray(s.credits)
      ? s.credits.map((c) => ({
          id: String(c.id ?? ""),
          source: c.source,
          product: c.product,
          kind: c.kind,
          total: Number(c.total ?? 0),
          remaining: Number(c.remaining ?? 0),
          purchasedAt: String(c.purchasedAt ?? ""),
          expiresAt: String(c.expiresAt ?? ""),
        }))
      : [],
  };
}

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("kaja_session")?.value ?? "";

    if (!token) {
      return new Response(JSON.stringify({ ok: true, user: null, student: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = mustAuthSecret();
    let verified;
    try {
      verified = await jwtVerify(token, new TextEncoder().encode(secret));
    } catch {
      return new Response(JSON.stringify({ ok: true, user: null, student: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const payload = verified.payload as unknown as Partial<SessionClaims>;
    const authUserId = typeof payload.sub === "string" ? payload.sub : "";
    if (!authUserId) {
      return new Response(JSON.stringify({ ok: true, user: null, student: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payloadName = (typeof payload.name === "string" ? payload.name : "").trim();
    const payloadEmail = (typeof payload.email === "string" ? payload.email : "").trim();

    // Ensure we have a student record for this auth user (preferred key).
    const s =
      findStudentByAuthUserId(authUserId) ??
      (payloadEmail
        ? upsertStudentByAuthUserId({
            authUserId,
            name: payloadName || "Member",
            email: payloadEmail,
          })
        : null);
    const name =
      (s?.name ?? payloadName).trim();
    const email =
      (s?.email ?? payloadEmail).trim();
    const studentId =
      (s?.id ??
        (typeof payload.studentId === "string" ? payload.studentId : "")).trim();

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: authUserId,
          name: name || "Member",
          email,
          studentId,
        },
        student: s ? toSessionStudent(s) : null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    // If token expired/invalid, treat as signed out.
    return new Response(JSON.stringify({ ok: true, user: null, student: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

