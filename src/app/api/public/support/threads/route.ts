import { NextRequest } from "next/server";
import { createSupportThread, findOrCreateThreadByEmail } from "@/lib/supportChats";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    const thread = email && isEmail(email)
      ? await findOrCreateThreadByEmail(email, name || undefined)
      : await createSupportThread({ name: name || undefined });

    return new Response(JSON.stringify({ ok: true, thread }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

