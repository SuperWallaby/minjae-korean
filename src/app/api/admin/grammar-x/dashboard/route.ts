import type { NextRequest } from "next/server";

import { requireAdminKey } from "@/lib/adminAuth";
import { getGrammarXDashboard } from "@/lib/grammarXDashboard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 500 });
  }

  try {
    const data = await getGrammarXDashboard();
    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
