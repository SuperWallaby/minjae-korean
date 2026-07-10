import { NextResponse } from "next/server";

import { findKoreanQuizById } from "@/lib/koreanQuiz/store";
import {
  hasCachedWordExplanation,
  resolveWordExplanationExampleTtsUrl,
} from "@/lib/koreanQuiz/wordExplanation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId")?.trim();
  const indexRaw = searchParams.get("index");
  const exampleIndex = indexRaw == null ? NaN : Number.parseInt(indexRaw, 10);

  if (!quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }
  if (!Number.isFinite(exampleIndex) || exampleIndex < 0) {
    return NextResponse.json({ error: "index is required." }, { status: 400 });
  }

  try {
    const item = await findKoreanQuizById(quizId);
    if (!item || item.status !== "approved") {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }
    if (!hasCachedWordExplanation(item)) {
      return NextResponse.json(
        { error: "Explanation is not ready yet." },
        { status: 404 },
      );
    }

    const result = await resolveWordExplanationExampleTtsUrl(item, exampleIndex);
    return NextResponse.json({
      url: result.url,
      cached: result.cached,
      index: exampleIndex,
    });
  } catch (error) {
    console.error("[vocab-quiz] word-explanation tts failed", error);
    return NextResponse.json(
      { error: "Could not load example audio." },
      { status: 500 },
    );
  }
}
