import { NextResponse } from "next/server";

import { getKoreanQuizQueueResponse } from "@/lib/koreanQuiz/queue";
import { authErrorResponse, getKoreanQuizDeviceRawId } from "@/lib/koreanQuiz/request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const deviceId = getKoreanQuizDeviceRawId(request);
    const studio =
      request.headers.get("x-quiz-mode")?.trim().toLowerCase() === "studio";
    const payload = await getKoreanQuizQueueResponse(deviceId, { studio });
    return NextResponse.json(payload);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { error: "Failed to load quiz queue." },
      { status: 500 },
    );
  }
}
