import { NextRequest } from "next/server";
import {
  getLikeCountAndLiked,
  getBookmarked,
} from "@/lib/articleActions";
import { listArticleComments } from "@/lib/articleComments";
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
    if (!slug?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing slug" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const s = scope;
    const sl = slug.trim();
    const user = await getSessionUser();
    const userId = user?.id ?? null;

    const [likeData, bookmarked, comments] = await Promise.all([
      getLikeCountAndLiked(s, sl, userId),
      userId ? getBookmarked(s, sl, userId) : Promise.resolve(false),
      listArticleComments(s, sl),
    ]);

    return new Response(
      JSON.stringify({
        ok: true,
        likeCount: likeData.count,
        liked: likeData.liked,
        bookmarked,
        commentCount: Array.isArray(comments) ? comments.length : 0,
      }),
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
