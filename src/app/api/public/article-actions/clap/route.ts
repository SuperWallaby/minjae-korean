import { NextRequest } from "next/server";
import { addClap } from "@/lib/articleActions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
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
    await addClap(scope, slug);
    return new Response(
      JSON.stringify({ ok: true }),
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
