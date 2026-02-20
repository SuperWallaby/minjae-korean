export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-1.5-flash";

async function searchUnsplash(
  query: string,
  accessKey: string,
): Promise<string | null> {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: Array<{
      urls?: { small?: string; thumb?: string; regular?: string };
    }>;
  };
  const first = data.results?.[0];
  if (!first) return null;
  return first.urls?.small || first.urls?.thumb || first.urls?.regular || null;
}

async function geminiTranslate(word: string, apiKey: string): Promise<string | null> {
  const prompt = `Translate this Korean word or phrase to English. Output ONLY the English translation, nothing else (no explanation, no quotes, no punctuation at the end).

Word: ${word}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 32, temperature: 0.2 },
        }),
      },
    );
    if (!res.ok) return null;
    type GeminiResponse = {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const data: GeminiResponse = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return text || null;
  } catch {
    return null;
  }
}

async function geminiSimilarWords(word: string, apiKey: string): Promise<string[]> {
  const prompt = `Give me 2-3 simple, common English words or short phrases that are visually similar or related to "${word}" for searching stock photos. Output ONLY the words separated by commas, nothing else (no explanation, no numbering).

Example output: apple, red fruit, fresh apple`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 64, temperature: 0.5 },
        }),
      },
    );
    if (!res.ok) return [];
    type GeminiResponse = {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const data: GeminiResponse = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) return [];
    return text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    const geminiKey = process.env.GMINI_API_KEY?.trim();

    if (!unsplashKey) {
      return Response.json(
        { ok: false, error: "UNSPLASH_ACCESS_KEY not set" },
        { status: 500 },
      );
    }

    const u = new URL(req.url);
    const q = u.searchParams.get("q")?.trim() || "";
    if (!q) {
      return Response.json({ ok: false, error: "Missing q" }, { status: 400 });
    }

    const attempts: string[] = [];

    const url1 = await searchUnsplash(q, unsplashKey);
    attempts.push(q);
    if (url1) {
      return Response.json({ ok: true, url: url1, attempts });
    }

    if (geminiKey) {
      const translated = await geminiTranslate(q, geminiKey);
      if (translated && translated.toLowerCase() !== q.toLowerCase()) {
        const url2 = await searchUnsplash(translated, unsplashKey);
        attempts.push(translated);
        if (url2) {
          return Response.json({ ok: true, url: url2, attempts });
        }

        const similarWords = await geminiSimilarWords(translated, geminiKey);
        for (const similar of similarWords) {
          const url3 = await searchUnsplash(similar, unsplashKey);
          attempts.push(similar);
          if (url3) {
            return Response.json({ ok: true, url: url3, attempts });
          }
        }
      } else {
        const similarWords = await geminiSimilarWords(q, geminiKey);
        for (const similar of similarWords) {
          const url3 = await searchUnsplash(similar, unsplashKey);
          attempts.push(similar);
          if (url3) {
            return Response.json({ ok: true, url: url3, attempts });
          }
        }
      }
    }

    return Response.json({ ok: true, url: null, attempts });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
