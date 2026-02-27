import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  return NextResponse.json({ publicKey: publicKey ?? null });
}



