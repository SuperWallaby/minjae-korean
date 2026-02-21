import { NextRequest } from "next/server";

import { listReminderLogs } from "@/lib/reminderLogsRepo";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "200", 10)),
      500
    );
    const logs = await listReminderLogs(limit);
    return json(200, { ok: true, logs });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
