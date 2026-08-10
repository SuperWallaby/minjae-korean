import type { DescriptionResult } from "@/lib/descriptionsRepo";
import { azureChatCompletion, readAzureDescribeChatMaxTokens } from "@/lib/azureOpenAI";

const AZURE_SYSTEM = `You are a Korean language teacher helping English-speaking students understand Korean text.

Analyze the following Korean text and respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "translation": "...",
  "explanation": "First point about grammar or meaning.\\n\\nSecond point.\\n\\nThird point if needed.",
  "vocabulary": [
    {"word": "한글단어", "meaning": "English meaning"}
  ]
}

Rules:
- translation: natural English translation of the Korean text
- explanation: 2–4 short paragraphs separated by \\n\\n
- vocabulary: 3–5 key Korean words with English meanings`;

export async function generateDescriptionAzure(
  koreanText: string,
): Promise<DescriptionResult | null> {
  const user = `Korean text: "${koreanText.replace(/"/g, '\\"')}"`;
  const raw = await azureChatCompletion(
    [
      { role: "system", content: AZURE_SYSTEM },
      { role: "user", content: user },
    ],
    { maxTokens: readAzureDescribeChatMaxTokens(), temperature: 0.3 },
  );
  if (!raw) return null;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
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
