import { NextRequest } from "next/server";
import { readAdminSettings, writeAdminSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = readAdminSettings();
    return new Response(JSON.stringify({ ok: true, data: settings }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), { status: 400 });
    }

    const tz = typeof body.businessTimeZone === "string" ? body.businessTimeZone : "Asia/Seoul";
    const incoming = (body.weeklyPattern ?? {}) as Record<string, Array<{ startMin: number; endMin: number }>>;
    const weeklyPattern: Record<string, Array<{ startMin: number; endMin: number }>> = {};

    // light validation
    for (const [k, rows] of Object.entries(incoming)) {
      if (!/^[0-6]$/.test(String(k))) continue;
      if (!Array.isArray(rows)) return new Response(JSON.stringify({ ok: false, error: "Invalid weeklyPattern" }), { status: 400 });
      for (const r of rows) {
        if (typeof r?.startMin !== "number" || typeof r?.endMin !== "number") {
          return new Response(JSON.stringify({ ok: false, error: "Invalid weeklyPattern row" }), { status: 400 });
        }
        if (!Number.isFinite(r.startMin) || !Number.isFinite(r.endMin)) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid weeklyPattern row" }), { status: 400 });
        }
        if (r.startMin < 0 || r.endMin > 24 * 60 || r.endMin <= r.startMin) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid weeklyPattern row" }), { status: 400 });
        }
      }
      weeklyPattern[String(k)] = rows.map((r) => ({ startMin: r.startMin, endMin: r.endMin }));
    }

    writeAdminSettings({ businessTimeZone: tz, weeklyPattern });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

