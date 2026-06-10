import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/authSession";
import { generateDescriptionAzure } from "@/lib/azureDescribe";
import { readAzureOpenAIConfig } from "@/lib/azureOpenAI";
import {
  getCachedDescription,
  saveDescription,
  type DescriptionResult,
} from "@/lib/descriptionsRepo";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

/** Successful explain responses per anonymous browser (httpOnly cookie). Logged-in users are unlimited. */
const GUEST_FREE_LIMIT = 10;
const GUEST_USES_COOKIE = "mj_describe_guest_uses";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 400;

function parseGuestUses(raw: string | undefined): number {
  const n = parseInt(raw ?? "0", 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, GUEST_FREE_LIMIT);
}

function successResponse(
  body: { ok: true; data: DescriptionResult; cached: boolean },
  incrementGuest: { nextCount: number } | null,
) {
  if (!incrementGuest) {
    return NextResponse.json(body);
  }
  const res = NextResponse.json(body);
  res.cookies.set(GUEST_USES_COOKIE, String(incrementGuest.nextCount), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

async function generateDescription(
  text: string,
  apiKey: string,
): Promise<DescriptionResult | null> {
  const prompt = `You are a Korean language teacher helping English-speaking students understand Korean text.

Analyze the following Korean text and provide:
1. Translation: A natural English translation
2. Explanation: Break down the grammar and meaning step by step. Use "\\n\\n" between paragraphs for readability. Keep it concise but structured.
3. Vocabulary: List of 3-5 key Korean words with their English meanings

Korean text: "${text}"

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "translation": "...",
  "explanation": "First point about grammar or meaning.\\n\\nSecond point.\\n\\nThird point if needed.",
  "vocabulary": [
    {"word": "한글단어", "meaning": "English meaning"}
  ]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 },
      }),
    });

    if (!res.ok) return null;

    type GeminiResponse = {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const data: GeminiResponse = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) return null;

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as DescriptionResult;

    if (!parsed.translation || !parsed.explanation) return null;

    return {
      translation: String(parsed.translation),
      explanation: String(parsed.explanation),
      vocabulary: Array.isArray(parsed.vocabulary)
        ? parsed.vocabulary
            .filter((v) => v && typeof v === "object" && v.word && v.meaning)
            .map((v) => ({ word: String(v.word), meaning: String(v.meaning) }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const geminiKey =
      process.env.GEMINI_API_KEY?.trim() || process.env.GMINI_API_KEY?.trim();
    const azureReady = Boolean(readAzureOpenAIConfig());

    if (!geminiKey && !azureReady) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No LLM configured. Set GEMINI_API_KEY (or GMINI_API_KEY) and/or Azure OpenAI env vars.",
        },
        { status: 500 },
      );
    }
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "Missing text" },
        { status: 400 },
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "Text too long (max 2000 characters)" },
        { status: 400 },
      );
    }

    const user = await getSessionUser();
    const jar = await cookies();
    let guestUses = 0;

    if (!user) {
      guestUses = parseGuestUses(jar.get(GUEST_USES_COOKIE)?.value);
      if (guestUses >= GUEST_FREE_LIMIT) {
        return NextResponse.json(
          {
            ok: false,
            code: "DESCRIBE_LOGIN_REQUIRED",
            error:
              "You have used all free previews. Sign in to keep using explanations at no extra cost.",
          },
          { status: 403 },
        );
      }
    }

    const cached = await getCachedDescription(text);
    if (cached) {
      const incrementGuest = user ? null : { nextCount: guestUses + 1 };
      return successResponse(
        { ok: true, data: cached, cached: true },
        incrementGuest,
      );
    }

    let result: DescriptionResult | null = null;
    if (geminiKey) {
      result = await generateDescription(text, geminiKey);
    }
    if (!result && azureReady) {
      result = await generateDescriptionAzure(text);
    }

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Failed to generate description" },
        { status: 500 },
      );
    }

    await saveDescription(text, result);

    const incrementGuest = user ? null : { nextCount: guestUses + 1 };
    return successResponse(
      { ok: true, data: result, cached: false },
      incrementGuest,
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
