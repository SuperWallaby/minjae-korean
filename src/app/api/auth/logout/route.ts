import { NextResponse } from "next/server";

export const runtime = "nodejs";

function clearSessionCookie(res: NextResponse) {
  res.cookies.set("kaja_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

export async function GET() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

