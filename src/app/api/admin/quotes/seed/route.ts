import { NextResponse } from "next/server";

import { QUOTES_SEED } from "@/data/quotesSeed";
import { createQuote, listQuotes } from "@/lib/quotesRepo";

export const runtime = "nodejs";

/** DB에 명언이 하나도 없을 때만 한글 시드 명언 삽입 */
export async function POST() {
  try {
    const existing = await listQuotes(1);
    if (existing.length > 0) {
      return NextResponse.json({
        ok: true,
        message: "Already seeded (quotes exist)",
        count: 0,
      });
    }
    let count = 0;
    for (const q of QUOTES_SEED) {
      await createQuote(q);
      count++;
    }
    return NextResponse.json({ ok: true, message: "Seeded", count });
  } catch (e) {
    console.error("quotes/seed", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
