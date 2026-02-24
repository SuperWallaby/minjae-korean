import { NextResponse } from "next/server";

import { createQuote, listQuotes } from "@/lib/quotesRepo";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** 명언 목록 (관리용) */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10) || 100));
    const quotes = await listQuotes(limit);
    return json({ ok: true, quotes });
  } catch (e) {
    console.error("GET /api/admin/quotes", e);
    return json({ ok: false, error: "Failed" }, 500);
  }
}

/** 명언 1건 추가. body: { text: string, author?: string } */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body.text ?? "").trim();
    if (!text) return json({ ok: false, error: "Missing text" }, 400);
    const quote = await createQuote({
      text,
      author: typeof body.author === "string" ? body.author.trim() || undefined : undefined,
    });
    return json({ ok: true, quote });
  } catch (e) {
    console.error("POST /api/admin/quotes", e);
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}
