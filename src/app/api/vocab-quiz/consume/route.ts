import { NextResponse } from "next/server";

import { consumeCurrentQuiz } from "@/lib/koreanQuiz/queue";
import { authErrorResponse, getKoreanQuizDeviceRawId } from "@/lib/koreanQuiz/request";

export const runtime = "nodejs";

/** Auto mode — advance without recording an attempt. */
export async function POST(request: Request) {
  try {
    const deviceId = getKoreanQuizDeviceRawId(request);
    const body = (await request.json()) as { quizId?: string };

    if (!body.quizId?.trim()) {
      return NextResponse.json({ error: "quizId is required." }, { status: 400 });
    }

    await consumeCurrentQuiz(deviceId, body.quizId.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to advance quiz.";
    const status = message.includes("일치하지") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
