import { NextResponse } from "next/server";

import { findKoreanQuizById } from "@/lib/koreanQuiz/store";
import { resolveAnswerTtsMp3, type AnswerTtsVariant } from "@/lib/koreanQuiz/tts";

export const runtime = "nodejs";

function parseVariant(value: string | null): AnswerTtsVariant {
  return value === "slow" ? "slow" : "normal";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await context.params;
  const url = new URL(request.url);
  const variant = parseVariant(url.searchParams.get("variant"));
  const cacheToken = url.searchParams.get("v")?.trim();

  const item = await findKoreanQuizById(quizId);
  if (!item || item.status !== "approved") {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  try {
    const mp3 = await resolveAnswerTtsMp3(item, variant);
    if (!mp3) {
      return NextResponse.json(
        { error: "Answer TTS is not available." },
        { status: 503 },
      );
    }

    return new NextResponse(new Uint8Array(mp3), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": cacheToken
          ? "public, max-age=31536000, immutable"
          : "public, max-age=300, must-revalidate",
        ...(cacheToken ? { ETag: `"${cacheToken}"` } : {}),
      },
    });
  } catch (error) {
    console.error("[vocab-quiz/tts]", error);
    return NextResponse.json({ error: "Failed to generate TTS." }, { status: 500 });
  }
}
