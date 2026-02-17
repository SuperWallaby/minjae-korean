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
    if (!text) {
      return new Response(
        JSON.stringify({ ok: false, error: "text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const ttsBase = process.env.TTS_SERVICE_URL ?? "http://127.0.0.1:8765";
    const ttsUrl = `${ttsBase.replace(/\/+$/, "")}/synthesize`;

    const ttsRes = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return new Response(
        JSON.stringify({
          ok: false,
          error: `TTS failed: ${ttsRes.status} ${errText.slice(0, 200)}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const wavBytes = await ttsRes.arrayBuffer();
    const fileName = `tts-${Date.now()}.wav`;

    const presignRes = await fetch(`${appBase(req)}/api/admin/r2/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType: "audio/wav" }),
    });
    const presignJson = await presignRes.json().catch(() => null);
    if (!presignRes.ok || !presignJson?.ok || !presignJson?.data?.uploadUrl || !presignJson?.data?.publicUrl) {
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
      headers: { "Content-Type": "audio/wav" },
      body: wavBytes,
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
