import { NextResponse } from "next/server";

import { azureChatCompletion, readAzureOpenAIConfig } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const MAX_TOTAL_CHARS = 400;

export async function POST(req: Request) {
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

    const text = sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");
    const prompt = `You are a friendly Korean teacher. A student wrote these self-introduction sentences in Korean. Give brief feedback in 2-3 sentences in English: Is it natural? Any small correction or encouragement? Keep it short.

Student's sentences:
${text}`;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let feedback: string | null = null;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0.4 },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        feedback =
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
      }
    }

    if (!feedback && readAzureOpenAIConfig()) {
      feedback = await azureChatCompletion(
        [{ role: "user", content: prompt }],
        { maxTokens: 256, temperature: 0.4 },
      );
    }

    if (!feedback) {
      return NextResponse.json({
        ok: false,
        error:
          "LLM unavailable. Set GEMINI_API_KEY or Azure OpenAI env vars.",
      });
    }

    return NextResponse.json({ ok: true, feedback });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" });
  }
}
