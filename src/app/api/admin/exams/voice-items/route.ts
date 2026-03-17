import type { AssessmentItem } from "@/types/exam";
import { getExamItems } from "@/data/examsList";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function getTextToSpeak(item: AssessmentItem): string {
  if (item.type === "dictation") {
    const accepted = item.scoring.key.acceptedTranscripts;
    return (accepted?.[0] ?? item.stem?.instruction?.default ?? "").trim();
  }
  if (item.type === "audio_mcq") {
    return (item.stem?.instruction?.default ?? "").trim();
  }
  return "";
}

export async function GET(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const u = new URL(req.url);
    const kind = (u.searchParams.get("kind") ?? "placement") as "placement" | "level_test" | "mock_topik";
    const slug = u.searchParams.get("slug") ?? "placement";
    const items = await getExamItems(kind, slug);
    const voiceItems = items
      .filter((i): i is AssessmentItem => i.type === "dictation" || i.type === "audio_mcq")
      .map((item) => ({
        id: item.id,
        type: item.type,
        textToSpeak: getTextToSpeak(item),
        instruction: item.stem?.instruction?.default ?? "",
        audioUrl: item.type === "dictation" ? item.interaction.audio?.url : item.type === "audio_mcq" ? item.interaction.audio?.url : undefined,
      }));
    return new Response(JSON.stringify({ ok: true, items: voiceItems }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
