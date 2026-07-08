import { NextResponse } from "next/server";

import {
  ensureGrammarGuidePronunciation,
  getCachedGrammarGuidePronunciationUrl,
  grammarGuidePronunciationApiUrl,
} from "@/lib/grammarGuideTts";
import {
  getGrammarGuideById,
  updateGrammarGuidePronunciation,
} from "@/lib/grammarGuidesRepo";

export const runtime = "nodejs";

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idRaw } = await context.params;
  const id = parseId(idRaw);
  if (!id) {
    return NextResponse.json({ error: "Invalid guide id." }, { status: 400 });
  }

  const guide = await getGrammarGuideById(id);
  if (!guide || guide.type !== "meaning") {
    return NextResponse.json({ error: "Guide not found." }, { status: 404 });
  }

  let playbackUrl = getCachedGrammarGuidePronunciationUrl(guide);
  if (!playbackUrl) {
    playbackUrl =
      (await ensureGrammarGuidePronunciation(guide)) ?? undefined;
    if (playbackUrl) {
      await updateGrammarGuidePronunciation(id, playbackUrl);
    }
  }

  if (!playbackUrl) {
    return NextResponse.json(
      { error: "Pronunciation is not available." },
      { status: 404 },
    );
  }

  return NextResponse.redirect(playbackUrl, 302);
}
