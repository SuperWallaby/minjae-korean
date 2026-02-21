import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const MAX_TOTAL_CHARS = 400;

export async function POST(req: Request) {
  // #region agent log
  const apiKeyAtEntry = process.env.GEMINI_API_KEY;
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "460cf6" },
    body: JSON.stringify({
      sessionId: "460cf6",
      location: "expression-challenge/route.ts:POST",
      message: "env check",
      data: {
        hasGeminiKey: !!apiKeyAtEntry,
        keyLength: apiKeyAtEntry?.length ?? 0,
        hypothesisId: "H1",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  try {
    const body = await req.json();
    const raw = body.sentences;
    const sentences = Array.isArray(raw)
      ? raw.map((s: unknown) => String(s ?? "").trim()).filter(Boolean)
      : [];

    if (sentences.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "No sentences provided",
      });
    }

    const totalChars = sentences.join("").length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json({
        ok: false,
        error: "TOO_LONG",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "460cf6" },
        body: JSON.stringify({
          sessionId: "460cf6",
          location: "expression-challenge/route.ts:before Server not configured",
          message: "returning Server not configured",
          data: { hypothesisId: "H2" },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return NextResponse.json({ ok: false, error: "GEMINI_API_KEY not configured" });
    }

    const text = sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const prompt = `You are a friendly Korean teacher. A student wrote these self-introduction sentences in Korean. Give brief feedback in 2-3 sentences in English: Is it natural? Any small correction or encouragement? Keep it short.

Student's sentences:
${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 256, temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "LLM request failed" });
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const feedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "No feedback generated.";

    return NextResponse.json({ ok: true, feedback });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" });
  }
}
