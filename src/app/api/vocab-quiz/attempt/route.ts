import { NextResponse } from "next/server";

import { submitKoreanQuizAttempt } from "@/lib/koreanQuiz/queue";
import { authErrorResponse, getKoreanQuizDeviceRawId } from "@/lib/koreanQuiz/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const deviceId = getKoreanQuizDeviceRawId(request);
    const body = (await request.json()) as {
      quizId?: string;
      choiceId?: string;
      elapsedMs?: number;
    };

    if (!body.quizId?.trim() || !body.choiceId?.trim()) {
      return NextResponse.json(
        { error: "quizId and choiceId are required." },
        { status: 400 },
      );
    }

    const result = await submitKoreanQuizAttempt({
      deviceId,
      quizId: body.quizId.trim(),
      choiceId: body.choiceId.trim(),
      elapsedMs: Number(body.elapsedMs ?? 0),
    });

    return NextResponse.json(result);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to submit answer.";
    const status = message.includes("일치하지") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
