import { NextRequest } from "next/server";
import { generateSlotsFromPattern } from "@/lib/slotPatterns";
import { insertManyIgnoreDuplicates } from "@/lib/slotsRepo";
import { readAdminSettings } from "@/lib/settingsRepo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.fromDateKey || !body.toDateKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/to date" }), { status: 400 });
    }
    const settings = await readAdminSettings();
    const pattern = body.pattern ?? settings.weeklyPattern ?? {};
    const tz = body.tz ?? settings.businessTimeZone ?? "Asia/Seoul";
    const generated0 = generateSlotsFromPattern({ pattern, fromDateKey: body.fromDateKey, toDateKey: body.toDateKey, tz });

    // Enforce 30-minute grid starts + 25-minute duration.
    const generated = generated0
      .filter((s) => Number.isFinite(s.startMin) && s.startMin % 30 === 0)
      .map((s) => ({
        ...s,
        endMin: s.startMin + 25,
      }))
      .filter((s) => s.endMin <= 24 * 60);

    const ins = await insertManyIgnoreDuplicates(generated);
    return new Response(JSON.stringify({ ok: true, generated: generated.length, added: ins.inserted }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

