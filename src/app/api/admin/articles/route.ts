import { createArticle } from "@/lib/articlesRepo";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title : "";
    const level = body?.level;
    const levels = body?.levels;
    const articleCode = typeof body?.articleCode === "string" ? body.articleCode : undefined;
    const audio = typeof body?.audio === "string" ? body.audio : undefined;
    const imageThumb = typeof body?.imageThumb === "string" ? body.imageThumb : undefined;
    const imageLarge = typeof body?.imageLarge === "string" ? body.imageLarge : undefined;
    const paragraphs = body?.paragraphs;
    const vocabulary = body?.vocabulary;
    const questions = body?.questions;
    const discussion = body?.discussion;

    const created = await createArticle({
      title,
      level,
      levels,
      articleCode,
      audio,
      imageThumb,
      imageLarge,
      paragraphs,
      vocabulary,
      questions,
      discussion,
    });

    return new Response(JSON.stringify({ ok: true, data: { article: created } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

