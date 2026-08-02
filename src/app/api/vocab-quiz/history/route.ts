import { NextResponse } from "next/server";

import { listDeviceKoreanQuizHistory } from "@/lib/koreanQuiz/store";
import { authErrorResponse, getKoreanQuizDeviceRawId } from "@/lib/koreanQuiz/request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const deviceId = getKoreanQuizDeviceRawId(request);
    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") ?? 40);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(80, Math.floor(rawLimit)))
      : 40;
    const items = await listDeviceKoreanQuizHistory(deviceId, limit);
    return NextResponse.json({ items });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to load quiz history.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
