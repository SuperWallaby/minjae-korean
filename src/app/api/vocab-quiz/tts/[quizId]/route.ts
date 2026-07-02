import { NextResponse } from "next/server";

import { findKoreanQuizById } from "@/lib/koreanQuiz/store";
import { resolveAnswerTtsPlaybackUrl, type AnswerTtsVariant } from "@/lib/koreanQuiz/tts";

export const runtime = "nodejs";

function parseVariant(value: string | null): AnswerTtsVariant {
  return value === "slow" ? "slow" : "normal";
}

/** Legacy same-origin URL — redirects to korean-quiz CDN mp3. */
export async function GET(
  request: Request,
  context: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await context.params;
  const url = new URL(request.url);
  const variant = parseVariant(url.searchParams.get("variant"));

  const item = await findKoreanQuizById(quizId);
  if (!item || item.status !== "approved") {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const playbackUrl = await resolveAnswerTtsPlaybackUrl(item, variant);
  if (!playbackUrl) {
    return NextResponse.json(
      { error: "Answer TTS is not available." },
      { status: 404 },
    );
  }

  return NextResponse.redirect(playbackUrl, 302);
}
