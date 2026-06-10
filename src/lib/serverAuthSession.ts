import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  findStudentByAuthUserId,
  upsertStudentByAuthUserId,
  type Student,
} from "@/lib/studentsRepo";

type SessionClaims = {
  sub?: string;
  email?: string;
  name?: string;
  studentId?: string;
};

function authSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "";
}

/** Resolves the signed-in student from `kaja_session` (same rules as `/api/auth/session`). */
export async function resolveStudentFromKajaCookie(): Promise<Student | null> {
  const r = await resolveSessionFromKajaCookie();
  return r?.student ?? null;
}

export async function resolveSessionFromKajaCookie(): Promise<{
  authUserId: string;
  student: Student;
} | null> {
  const secret = authSecret();
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get("kaja_session")?.value ?? "";
  if (!token) return null;

  let verified;
  try {
    verified = await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    return null;
  }

  const payload = verified.payload as unknown as SessionClaims;
  const authUserId = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!authUserId) return null;

  const payloadName = (typeof payload.name === "string" ? payload.name : "").trim();
  const payloadEmail = (typeof payload.email === "string" ? payload.email : "").trim();

  const existing = await findStudentByAuthUserId(authUserId);
  const student =
    existing ??
    (payloadEmail
      ? await upsertStudentByAuthUserId({
          authUserId,
          name: payloadName || "Member",
          email: payloadEmail,
        })
      : null);
  if (!student) return null;
  return { authUserId, student };
}
