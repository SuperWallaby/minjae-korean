import { NextResponse } from "next/server";

import { choiceEnglishGloss } from "@/lib/koreanQuiz/englishGloss";
import { resolveQuizCdnOrigin } from "@/lib/koreanQuiz/quizMedia";
import { correctLabelFromItem, findKoreanQuizById } from "@/lib/koreanQuiz/store";
import {
  bundleFromItem,
  ensureKoreanQuizWordExplanation,
  hasCachedWordExplanation,
  wordExplanationExamplesForResponse,
} from "@/lib/koreanQuiz/wordExplanation";

export const runtime = "nodejs";

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

    const korean = correctLabelFromItem(item);
    if (!korean) {
      return NextResponse.json(
        { error: "Correct answer not found." },
        { status: 404 },
      );
    }

    const cached = hasCachedWordExplanation(item);
    const bundle = cached
      ? bundleFromItem(item)
      : await ensureKoreanQuizWordExplanation(item);
    const choice = item.choices.find((row) => row.id === item.correctChoiceId);
    const origin = resolveQuizCdnOrigin(item);

    return NextResponse.json({
      quizId: item.id,
      korean,
      english: choiceEnglishGloss(choice ?? {}),
      explanation: bundle.explanation,
      examples: wordExplanationExamplesForResponse(bundle.examples, origin),
      cached,
    });
  } catch (error) {
    console.error("[vocab-quiz] word-explanation failed", error);
    return NextResponse.json(
      { error: "Could not load explanation." },
      { status: 500 },
    );
  }
}
