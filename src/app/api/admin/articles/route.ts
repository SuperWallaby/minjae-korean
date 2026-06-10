import { appendFile } from "node:fs/promises";
import { join } from "node:path";

import { createArticle } from "@/lib/articlesRepo";

export const runtime = "nodejs";

const AGENT_DEBUG_LOG = () => join(process.cwd(), ".cursor", "debug-dce0aa.log");

async function agentLog(payload: Record<string, unknown>) {
  try {
    await appendFile(
      AGENT_DEBUG_LOG(),
      `${JSON.stringify({ sessionId: "dce0aa", ...payload, timestamp: Date.now() })}\n`,
    );
  } catch {
    /* ignore */
  }
}

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request) {
  try {
    // #region agent log
    await agentLog({
      hypothesisId: "H2-H5",
      location: "api/admin/articles/route.ts:POST",
      message: "POST entered",
      data: {
        devOnly: devOnly(),
        nodeEnv: process.env.NODE_ENV ?? null,
      },
    });
    // #endregion
    if (!devOnly()) {
      // #region agent log
      await agentLog({
        hypothesisId: "H2",
        location: "api/admin/articles/route.ts:POST",
        message: "blocked production",
        data: { nodeEnv: process.env.NODE_ENV ?? null },
      });
      // #endregion
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title : "";
    const introductionEn =
      typeof body?.introductionEn === "string" ? body.introductionEn : undefined;
    const level = body?.level;
    const levels = body?.levels;
    const articleCode = typeof body?.articleCode === "string" ? body.articleCode : undefined;
    const audio = typeof body?.audio === "string" ? body.audio : undefined;
    const imageThumb = typeof body?.imageThumb === "string" ? body.imageThumb : undefined;
    const imageLarge = typeof body?.imageLarge === "string" ? body.imageLarge : undefined;
    const paragraphs = body?.paragraphs;
    const readingCues = body?.readingCues;
    const vocabulary = body?.vocabulary;
    const questions = body?.questions;
    const discussion = body?.discussion;
    const sourceYoutubeVideoId =
      typeof body?.sourceYoutubeVideoId === "string"
        ? body.sourceYoutubeVideoId.trim() || undefined
        : undefined;

    const created = await createArticle({
      title,
      introductionEn,
      level,
      levels,
      articleCode,
      audio,
      imageThumb,
      imageLarge,
      paragraphs,
      readingCues,
      vocabulary,
      questions,
      discussion,
      sourceYoutubeVideoId,
    });

    return new Response(JSON.stringify({ ok: true, data: { article: created } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const dup =
      msg.includes("DUPLICATE_YOUTUBE") ||
      msg.includes("이미 이 영상으로 만든 기사");
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: dup ? 409 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

