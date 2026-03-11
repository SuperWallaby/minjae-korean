export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function appBase(req: Request): string {
  try {
    const u = new URL(req.url);
    return u.origin;
  } catch {
    const v = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (v) return v.startsWith("http") ? v : `https://${v}`;
    return "http://localhost:3000";
  }
}

const NEW_TTS_BASE = "http://192.168.45.225:8000";
const DEFAULT_SPEAKER_ID = "testst";
const DEFAULT_TEXT_LANGUAGE = "ko";

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const speakerId =
      typeof body?.speakerId === "string" && body.speakerId.trim()
        ? body.speakerId.trim()
        : DEFAULT_SPEAKER_ID;
    const textLanguage =
      typeof body?.textLanguage === "string" && body.textLanguage.trim()
        ? body.textLanguage.trim()
        : DEFAULT_TEXT_LANGUAGE;

    if (!text) {
      return new Response(
        JSON.stringify({ ok: false, error: "text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const params = new URLSearchParams({
      speaker_id: speakerId,
      text,
      text_language: textLanguage,
    });

    const ttsUrl = `${NEW_TTS_BASE.replace(/\/+$/, "")}/?${params.toString()}`;

    const ttsRes = await fetch(ttsUrl, { method: "GET" });
    if (!ttsRes.ok) {
      let errorMessage = `TTS failed: ${ttsRes.status}`;
      const contentType = ttsRes.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const errJson = await ttsRes.json().catch(() => null);
        if (errJson && typeof errJson.error === "string") {
          errorMessage = errJson.error;
        } else if (errJson && typeof errJson.message === "string") {
          errorMessage = errJson.message;
        }
      } else {
        const errText = await ttsRes.text().catch(() => "");
        if (errText) {
          errorMessage = `${errorMessage} ${errText.slice(0, 200)}`;
        }
      }

      return new Response(
        JSON.stringify({ ok: false, error: errorMessage }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const contentType = ttsRes.headers.get("Content-Type") || "audio/wav";
    const audioBytes = await ttsRes.arrayBuffer();
    const fileName = `tts-${Date.now()}.wav`;

    const presignRes = await fetch(`${appBase(req)}/api/admin/r2/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType }),
    });
    const presignJson = await presignRes.json().catch(() => null);
    if (
      !presignRes.ok ||
      !presignJson?.ok ||
      !presignJson?.data?.uploadUrl ||
      !presignJson?.data?.publicUrl
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: presignJson?.error ?? "Failed to get upload URL",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const putRes = await fetch(presignJson.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: audioBytes,
    });
    if (!putRes.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "R2 upload failed" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, url: presignJson.data.publicUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

