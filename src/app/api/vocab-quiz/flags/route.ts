import { NextResponse } from "next/server";

import {
  listFlaggedKoreanQuizSummaries,
  setKoreanQuizReviewFlag,
} from "@/lib/koreanQuiz/store";
import { authErrorResponse, getKoreanQuizDeviceRawId } from "@/lib/koreanQuiz/request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    getKoreanQuizDeviceRawId(request);
    const items = await listFlaggedKoreanQuizSummaries();
    return NextResponse.json({ items });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to load flagged quizzes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    getKoreanQuizDeviceRawId(request);
    const body = (await request.json()) as { quizId?: string; flagged?: boolean };

    if (!body.quizId?.trim()) {
      return NextResponse.json({ error: "quizId is required." }, { status: 400 });
    }

    const flagged = body.flagged !== false;
    await setKoreanQuizReviewFlag(body.quizId.trim(), flagged);
    return NextResponse.json({ ok: true, flagged });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to update flag.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    getKoreanQuizDeviceRawId(request);
    const body = (await request.json()) as { quizId?: string };

    if (!body.quizId?.trim()) {
      return NextResponse.json({ error: "quizId is required." }, { status: 400 });
    }

    await setKoreanQuizReviewFlag(body.quizId.trim(), false);
    return NextResponse.json({ ok: true, flagged: false });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    const message =
      error instanceof Error ? error.message : "Failed to clear flag.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
