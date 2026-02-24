import { getRandomQuote } from "@/lib/quotesRepo";

/** 랜덤 명언 1건. DB에 없으면 404 */
export async function GET() {
  try {
    const quote = await getRandomQuote();
    if (!quote)
      return Response.json({ ok: false, error: "No quotes" }, { status: 404 });
    return Response.json({ ok: true, quote });
  } catch (e) {
    console.error("quoto/random", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
