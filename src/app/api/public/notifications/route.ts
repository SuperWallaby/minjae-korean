import { NextRequest } from "next/server";

import {
  listRecentReceiptsForStudent,
  listUnreadReceiptsForStudent,
  markReceiptsReadForStudent,
} from "@/lib/broadcastsRepo";
import { resolveStudentFromKajaCookie } from "@/lib/serverAuthSession";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const student = await resolveStudentFromKajaCookie();
    if (!student) return json(401, { ok: false, error: "Sign in required" });

    const unreadOnly = (req.nextUrl.searchParams.get("unreadOnly") ?? "1") !== "0";
    const items = unreadOnly
      ? await listUnreadReceiptsForStudent(student.id, 80)
      : await listRecentReceiptsForStudent(student.id, 80);

    return json(200, { ok: true, data: { items } });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = await resolveStudentFromKajaCookie();
    if (!student) return json(401, { ok: false, error: "Sign in required" });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json(400, { ok: false, error: "Invalid body" });

    if (body.all === true) {
      const n = await markReceiptsReadForStudent(student.id, "all");
      return json(200, { ok: true, data: { marked: n } });
    }

    const ids = Array.isArray(body.broadcastIds)
      ? body.broadcastIds.filter((x: unknown) => typeof x === "string").map((x: string) => x.trim())
      : [];
    if (ids.length === 0) return json(400, { ok: false, error: "broadcastIds or all required" });

    const n = await markReceiptsReadForStudent(student.id, ids);
    return json(200, { ok: true, data: { marked: n } });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
