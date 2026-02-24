import { NextResponse } from "next/server";

import { createQuotes } from "@/lib/quotesRepo";

export const runtime = "nodejs";

/** 명언 일괄 등록. body: { texts: string[] } — 한 줄당 한 건. 빈 문자열은 무시 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let texts: string[] = [];
    if (Array.isArray(body.texts)) {
      texts = body.texts.map((t: unknown) => String(t ?? "").trim()).filter(Boolean);
    } else if (typeof body.text === "string") {
      texts = body.text
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (texts.length === 0) {
      return NextResponse.json(
        { ok: false, error: "명언을 한 줄에 하나씩 입력하거나 texts 배열로 보내 주세요." },
        { status: 400 }
      );
    }
    const quotes = await createQuotes(texts);
    return NextResponse.json({ ok: true, created: quotes.length, quotes });
  } catch (e) {
    console.error("POST /api/public/quoto", e);
    return NextResponse.json(
      { ok: false, error: "등록에 실패했어요." },
      { status: 500 }
    );
  }
}
