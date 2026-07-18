import { NextResponse } from "next/server";

import { findKoreanQuizById } from "@/lib/koreanQuiz/store";
import { resolveWordExplanationComparisons } from "@/lib/koreanQuiz/wordExplanation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId")?.trim();
  if (!quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  try {
    const item = await findKoreanQuizById(quizId);
    if (!item || item.status !== "approved") {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    const result = await resolveWordExplanationComparisons(item);
    return NextResponse.json({
      quizId: item.id,
      comparisons: result.comparisons.map((row) => ({
        korean: row.korean,
        english: row.english,
        contrast: row.contrast,
      })),
      cached: result.cached,
    });
  } catch (error) {
    console.error("[vocab-quiz] word-explanation comparisons failed", error);
    return NextResponse.json(
      { error: "Could not load similar words." },
      { status: 500 },
    );
  }
}
