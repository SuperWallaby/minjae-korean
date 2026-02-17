import { listArticles } from "@/lib/articlesRepo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitRaw = url.searchParams.get("limit") ?? "";
    const limit = limitRaw ? Number(limitRaw) : 50;
    const list = await listArticles(Number.isFinite(limit) ? limit : 50);

    // Trim payload for list view.
    const items = list.map((a) => ({
      slug: a.slug,
      articleCode: a.articleCode,
      title: a.title,
      level: a.level,
      levels: a.levels,
      imageThumb: a.imageThumb,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return new Response(JSON.stringify({ ok: true, data: { items } }), {
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

