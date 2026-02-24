import { NextRequest } from "next/server";
import { addArticleComment, listArticleComments } from "@/lib/articleComments";
import { getSessionUser } from "@/lib/authSession";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const scope = u.searchParams.get("scope");
    const slug = u.searchParams.get("slug");
    const allowedScopes = ["blog", "news", "grammar", "expressions"];
    if (!scope || !allowedScopes.includes(scope)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid scope" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (!slug || !slug.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing slug" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const comments = await listArticleComments(scope, slug.trim());
    return new Response(
      JSON.stringify({ ok: true, comments }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sign in to comment" }),
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
    const text = typeof body?.text === "string" ? body.text : "";
    if (!scope || !slug) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing scope or slug" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const comment = await addArticleComment(scope, slug, { name: user.name, id: user.id }, text);
    if (!comment) {
      return new Response(
        JSON.stringify({ ok: false, error: "Empty comment" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, comment }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
