import { NextRequest } from "next/server";
import {
  updateArticleComment,
  deleteArticleComment,
} from "@/lib/articleComments";
import { getSessionUser } from "@/lib/authSession";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sign in to edit" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text : "";
    const comment = await updateArticleComment(id, user.id, text);
    if (!comment) {
      return new Response(
        JSON.stringify({ ok: false, error: "Comment not found or not yours" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, comment }),
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sign in to delete" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const { id } = await params;
    const deleted = await deleteArticleComment(id, user.id);
    if (!deleted) {
      return new Response(
        JSON.stringify({ ok: false, error: "Comment not found or not yours" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
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
