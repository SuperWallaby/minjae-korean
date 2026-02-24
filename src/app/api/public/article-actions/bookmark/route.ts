import { NextRequest } from "next/server";
import { toggleBookmark } from "@/lib/articleActions";
import { getSessionUser } from "@/lib/authSession";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sign in to bookmark" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const body = await req.json().catch(() => null);
    const scopeMap: Record<string, string> = {
      blog: "blog",
      news: "news",
      grammar: "grammar",
      expressions: "expressions",
    };
    const scope = body?.scope && scopeMap[body.scope] ? scopeMap[body.scope] : null;
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    if (!scope || !slug) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing scope or slug" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const bookmarked = await toggleBookmark(scope, slug, user.id);
    return new Response(
      JSON.stringify({ ok: true, bookmarked }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
