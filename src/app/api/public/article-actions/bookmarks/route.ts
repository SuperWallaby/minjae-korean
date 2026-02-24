import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/authSession";
import { listBookmarks } from "@/lib/articleActions";
import { getBlogPost } from "@/data/blogPosts";
import { getArticle } from "@/lib/articlesRepo";
import { getChapterBySlug, grammarChapterList } from "@/data/grammarChapterList";
import { getExpressionChapterBySlug } from "@/data/expressionChapterList";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: true, bookmarks: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    const list = await listBookmarks(user.id);
    const expand = new URL(req.url).searchParams.get("expand") === "1";

    if (!expand) {
      return new Response(
        JSON.stringify({ ok: true, bookmarks: list }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const bookmarks = await Promise.all(
      list.map(async (b) => {
        let title: string | undefined;
        let imageThumb: string | undefined;
        if (b.scope === "blog") {
          const post = await getBlogPost(b.slug);
          if (post) {
            title = post.title;
            imageThumb = post.imageThumb?.trim() || post.imageLarge?.trim();
          }
        } else if (b.scope === "news") {
          const article = await getArticle(b.slug);
          if (article) {
            title = article.title;
            imageThumb = article.imageThumb?.trim() || article.imageLarge?.trim();
          }
        } else if (b.scope === "grammar") {
          const chapter = getChapterBySlug(grammarChapterList, b.slug);
          if (chapter) title = chapter.title;
        } else if (b.scope === "expressions") {
          const chapter = getExpressionChapterBySlug(b.slug);
          if (chapter) title = chapter.title;
        }
        return { ...b, title, imageThumb };
      }),
    );

    return new Response(
      JSON.stringify({ ok: true, bookmarks }),
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
