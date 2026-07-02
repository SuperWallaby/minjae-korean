import {
  azureChatCompletionDetail,
  getChatDeploymentNames,
} from "@/lib/azureOpenAI";

import type { WeeklyQuizExample } from "./newsletterWeeklyQuiz";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const EXAMPLE_SYSTEM = `You are Minjae, a professional Korean teacher writing example sentences for English-speaking learners.

Return ONLY valid JSON (no markdown fences):
{
  "examples": [
    { "korean": "...", "english": "..." },
    { "korean": "...", "english": "..." }
  ]
}

Rules:
- Exactly 2 examples
- Use the Korean word naturally in real-life situations (conversation, travel, hobbies, work, feelings)
- Korean: polite 해요체, natural spoken Korean (not textbook drill lines)
- English: natural translation with correct articles (a/an/the) and grammar
- The Korean word must appear exactly as given
- Vary the two situations — do not repeat the same pattern

NEVER write these robotic patterns:
- "오늘 ○○를 배웠어요"
- "한국어 공부할 때 ○○가 자주 나와요"
- "이것은 ○○예요" for both lines
- "I learned about painter today" (wrong article / unnatural)

Good example for 화가 (painter):
- "저는 어릴 때 화가가 되고 싶었어요." / "When I was little, I wanted to be a painter."
- "그 화가가 풍경화를 정말 잘 그려요." / "That painter paints landscapes really well."`;

const ROBOTIC_PATTERNS = [
  /오늘 .+를 배웠어요/,
  /한국어 공부할 때 .+가 자주 나와요/,
  /이것은 .+예요\.?$/,
  /I learned about [a-z]+ today/i,
  /comes up a lot/i,
];

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

function validateExamples(
  word: string,
  examples: WeeklyQuizExample[],
): boolean {
  if (examples.length < 2) return false;
  for (const ex of examples) {
    if (!ex.korean.includes(word)) return false;
    if (ex.korean.length < 4 || ex.korean.length > 60) return false;
    if (ex.english.length < 4) return false;
    if (
      ROBOTIC_PATTERNS.some(
        (pattern) => pattern.test(ex.korean) || pattern.test(ex.english),
      )
    ) {
      return false;
    }
  }
  return true;
}

function exampleChatDeployments(): string[] | undefined {
  const explicit = process.env.NEWSLETTER_QUIZ_EXAMPLE_CHAT_DEPLOYMENT?.trim();
  if (explicit) return [explicit];
  const all = getChatDeploymentNames();
  return all.length > 0 ? all : undefined;
}

function buildUserPrompt(args: {
  word: string;
  english?: string;
  topic?: string;
  repair?: boolean;
}): string {
  const gloss = args.english?.trim();
  const topic = args.topic?.trim();
  const lines = [
    `Korean word: ${args.word}`,
    gloss ? `English meaning: ${gloss}` : null,
    topic ? `Topic tag: ${topic}` : null,
    "Write 2 natural example sentences a Korean teacher would actually teach.",
  ].filter(Boolean);

  if (args.repair) {
    lines.push(
      "Your previous attempt was too textbook-like. Use everyday situations and natural English articles.",
    );
  }

  return lines.join("\n");
}

async function requestExamplesFromAzure(
  user: string,
): Promise<WeeklyQuizExample[] | null> {
  const detail = await azureChatCompletionDetail(
    [
      { role: "system", content: EXAMPLE_SYSTEM },
      { role: "user", content: user },
    ],
    {
      maxTokens: 1200,
      temperature: 0.55,
      deployments: exampleChatDeployments(),
    },
  );

  if (!detail.text) {
    console.warn("[newsletter-quiz-examples] Azure failed", {
      status: detail.lastHttpStatus,
      deployment: detail.lastDeployment,
      message: detail.lastMessage,
    });
    return null;
  }

  const parsed = parseExamplesJson(detail.text);
  return parsed;
}

async function requestExamplesFromGemini(
  user: string,
): Promise<WeeklyQuizExample[] | null> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() || process.env.GMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${EXAMPLE_SYSTEM}\n\n${user}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.55,
          },
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );
    if (!res.ok) {
      console.warn("[newsletter-quiz-examples] Gemini failed", res.status);
      return null;
    }

    type GeminiPart = { text?: string };
    type GeminiContent = { parts?: GeminiPart[] };
    type GeminiCandidate = { content?: GeminiContent };
    const data = (await res.json()) as { candidates?: GeminiCandidate[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;
    return parseExamplesJson(text);
  } catch (e) {
    console.warn(
      "[newsletter-quiz-examples] Gemini error",
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

export async function generateWeeklyQuizExamples(args: {
  word: string;
  english?: string;
  topic?: string;
}): Promise<WeeklyQuizExample[]> {
  const word = args.word.trim();
  if (!word) return [];

  const attempts = [
    buildUserPrompt({ word, english: args.english, topic: args.topic }),
    buildUserPrompt({
      word,
      english: args.english,
      topic: args.topic,
      repair: true,
    }),
  ];

  for (const user of attempts) {
    const fromAzure = await requestExamplesFromAzure(user);
    if (fromAzure && validateExamples(word, fromAzure)) return fromAzure;

    const fromGemini = await requestExamplesFromGemini(user);
    if (fromGemini && validateExamples(word, fromGemini)) return fromGemini;
  }

  console.warn(
    "[newsletter-quiz-examples] No valid examples generated for",
    word,
  );
  return [];
}
