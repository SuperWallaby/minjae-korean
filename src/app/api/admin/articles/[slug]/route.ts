import { deleteArticle, getArticle, updateArticle } from "@/lib/articlesRepo";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { slug } = await ctx.params;
    const article = await getArticle(slug);
    if (!article) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, data: { article } }), {
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

export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { slug } = await ctx.params;
    const body = await req.json().catch(() => null);
    const patch = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api/admin/articles/[slug]/route.ts:PUT",
        message: "PUT received",
        data: { slug, patchKeys: Object.keys(patch) },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion
    const updated = await updateArticle(slug, patch);
    if (!updated) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, data: { article: updated } }), {
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

export async function DELETE(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { slug } = await ctx.params;
    const ok = await deleteArticle(slug);
    return new Response(JSON.stringify({ ok: true, deleted: ok }), {
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

