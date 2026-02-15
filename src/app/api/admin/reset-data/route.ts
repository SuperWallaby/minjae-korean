import { NextRequest } from "next/server";

import { deleteAllSlots } from "@/lib/slotsRepo";
import { deleteAllBookings } from "@/lib/bookingsRepo";
import { deleteAllStudents } from "@/lib/studentsRepo";
import { deleteAdminSettings } from "@/lib/settingsRepo";
import { deleteAllWaiting } from "@/lib/waitingRepo";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireAdminKey(req: NextRequest) {
  const expected = (process.env.ADMIN_API_KEY ?? "").trim();
  if (!expected) return { ok: false as const, error: "Missing ADMIN_API_KEY" };
  const got =
    (req.headers.get("x-admin-key") ?? "").trim() ||
    (req.nextUrl.searchParams.get("key") ?? "").trim();
  if (!got || got !== expected) return { ok: false as const, error: "Unauthorized" };
  return { ok: true as const };
}

export async function POST(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) return json(401, auth);

  const body = await req.json().catch(() => null);
  const confirm = typeof body?.confirm === "string" ? body.confirm.trim() : "";
  if (confirm !== "RESET_PROD") {
    return json(400, {
      ok: false,
      error: "Missing confirm. Pass { confirm: \"RESET_PROD\" } to proceed.",
    });
  }

  console.log("[admin][reset-data] requested", {
    ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
    host: req.headers.get("host") ?? "",
    ua: req.headers.get("user-agent") ?? "",
  });

  await Promise.all([
    deleteAllSlots(),
    deleteAllBookings(),
    deleteAllStudents(),
    deleteAdminSettings(),
    deleteAllWaiting(),
  ]);

  return json(200, { ok: true });
}

