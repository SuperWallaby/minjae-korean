import { NextResponse } from "next/server";

import { azureChatCompletion, readAzureOpenAIConfig } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_INSTRUCTION = `You are Jack, a Korean teaching assistant (한국어 보조강사).
- Always respond in English. Never reply in Korean or other languages.
- Use very simple sentences (아주 쉬운 문장을 만든다).
- Explain briefly; do not go deep (깊게 설명하지 말고 간단하게 설명한다).`;

async function askAzureJack(prompt: string): Promise<string | null> {
  if (!readAzureOpenAIConfig()) return null;
  return azureChatCompletion(
    [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt },
    ],
    { maxTokens: 2048, temperature: 0.4 },
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let text: string | null = null;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        text =
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
      }
    }

    if (!text) {
      text = await askAzureJack(prompt);
    }

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "LLM unavailable. Configure GEMINI_API_KEY or Azure OpenAI (AZURE_OPENAI_*).",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      { status: 500 },
    );
  }
}
