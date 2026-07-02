import { azureChatCompletion, getChatDeploymentNames } from "@/lib/azureOpenAI";

import type { WeeklyQuizExample } from "./newsletterWeeklyQuiz";

const EXAMPLE_SYSTEM = `You are Minjae, a professional Korean teacher writing example sentences for English-speaking learners.

Return ONLY valid JSON (no markdown):
{
  "examples": [
    { "korean": "...", "english": "..." },
    { "korean": "...", "english": "..." }
  ]
}

Rules:
- Exactly 2 examples
- Use the given Korean word naturally with correct particles (을/를, 이/가, etc.)
- Korean: polite 해요체, short and natural (max ~40 characters each)
- English: natural translation (not robotic)
- Situations: everyday life, travel, study, or conversation — vary the two
- Do NOT use "이것은 ○○예요" as both sentences — be creative
- The word must appear in Korean exactly as given (same spelling)`;

function parseExamplesJson(raw: string): WeeklyQuizExample[] | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      examples?: Array<{ korean?: string; english?: string }>;
    };
    const rows = (parsed.examples ?? [])
      .map((row) => ({
        korean: row.korean?.trim() ?? "",
        english: row.english?.trim() ?? "",
      }))
      .filter((row) => row.korean && row.english)
      .slice(0, 2);
    return rows.length >= 2 ? rows : null;
  } catch {
    return null;
  }
}

function templateExamples(
  word: string,
  english?: string,
): WeeklyQuizExample[] {
  const gloss = english?.trim();
  return [
    {
      korean: `오늘 ${word}를 배웠어요.`,
      english: gloss
        ? `I learned about ${gloss} today.`
        : `I learned "${word}" today.`,
    },
    {
      korean: `한국어 공부할 때 ${word}가 자주 나와요.`,
      english: gloss
        ? `When I study Korean, ${gloss} comes up a lot.`
        : `When I study Korean, "${word}" comes up a lot.`,
    },
  ];
}

function exampleChatDeployments(): string[] | undefined {
  const explicit = process.env.NEWSLETTER_QUIZ_EXAMPLE_CHAT_DEPLOYMENT?.trim();
  if (explicit) return [explicit];
  const primary = getChatDeploymentNames()[0]?.trim();
  return primary ? [primary] : undefined;
}

export async function generateWeeklyQuizExamples(args: {
  word: string;
  english?: string;
  topic?: string;
}): Promise<WeeklyQuizExample[]> {
  const word = args.word.trim();
  if (!word) return [];

  const gloss = args.english?.trim();
  const topic = args.topic?.trim();
  const user = [
    `Korean word: ${word}`,
    gloss ? `English meaning: ${gloss}` : null,
    topic ? `Topic tag: ${topic}` : null,
    "Write 2 example sentences.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = await azureChatCompletion(
      [
        { role: "system", content: EXAMPLE_SYSTEM },
        { role: "user", content: user },
      ],
      {
        maxTokens: 1200,
        temperature: 0.45,
        deployments: exampleChatDeployments(),
      },
    );
    const parsed = raw ? parseExamplesJson(raw) : null;
    if (parsed) return parsed;
  } catch {
    // fall through to templates
  }

  return templateExamples(word, gloss);
}
