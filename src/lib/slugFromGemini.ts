/**
 * Gemini로 제목(및 선택적 본문)에서 사람이 읽기 좋은 URL slug 후보를 생성.
 * API 실패·키 없음 시 null 반환 → 호출측에서 fallback 사용.
 */

const MODEL = "gemini-1.5-flash";
const SLUG_MAX_LENGTH = 60;

function sanitizeSlug(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
  return s;
}

/**
 * 제목(과 선택적 본문 일부)으로 Gemini에 slug 후보 요청.
 * 반환값은 이미 sanitized. 실패 시 null.
 */
export async function suggestSlugFromGemini(
  title: string,
  contentSnippet?: string,
): Promise<string | null> {
  const apiKey = process.env.GMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const prompt = `Generate a short, URL-friendly slug for this article. Rules:
- Use 3 to 6 English words that describe the topic.
- Lowercase only, words separated by a single hyphen.
- No spaces, no special characters, no numbers except when part of the topic.
- If the title is in Korean or another language, translate the meaning to English for the slug.
- Output ONLY the slug, nothing else (no explanation, no quotes).

Title: ${title}
${contentSnippet ? `First part of content: ${contentSnippet.slice(0, 200)}` : ""}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 64,
            temperature: 0.3,
          },
        }),
      },
    );

    if (!res.ok) return null;
    type GeminiPart = { text?: string };
    type GeminiContent = { parts?: GeminiPart[] };
    type GeminiCandidate = { content?: GeminiContent };
    type GeminiResponse = { candidates?: GeminiCandidate[] };
    const data: GeminiResponse = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) return null;

    const slug = sanitizeSlug(text);
    return slug.length >= 3 ? slug : null;
  } catch {
    return null;
  }
}
