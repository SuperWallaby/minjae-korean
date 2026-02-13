import { NextRequest } from "next/server";
import { generateSlotsFromPattern } from "@/lib/slotPatterns";
import { listSlots, addSlot } from "@/lib/db";
import { readAdminSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.fromDateKey || !body.toDateKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/to date" }), { status: 400 });
    }
    const settings = readAdminSettings();
    const pattern = body.pattern ?? settings.weeklyPattern ?? {};
    const tz = body.tz ?? settings.businessTimeZone ?? "Asia/Seoul";
    const generated = generateSlotsFromPattern({ pattern, fromDateKey: body.fromDateKey, toDateKey: body.toDateKey, tz });
    const existing = listSlots();
    const existingKeys = new Set(existing.map((s) => `${s.dateKey}|${s.startMin}|${s.endMin}`));
    let added = 0;
    for (const s of generated) {
      const key = `${s.dateKey}|${s.startMin}|${s.endMin}`;
      if (!existingKeys.has(key)) {
        addSlot(s);
        existingKeys.add(key);
        added++;
      }
    }
    return new Response(JSON.stringify({ ok: true, generated: generated.length, added }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

