import type { VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";
import {
  buildQuizAnswerReply,
  buildVocabXTweetText,
  fallbackVocabCaption,
  type VocabCaptionLines,
} from "@/lib/vocabXTweet";

async function azureCaption(bundle: VocabBundle): Promise<VocabCaptionLines | null> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const deployment =
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.split(",")[0]?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT?.trim() ||
    "trx-gpt-4-1-mini";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  if (!endpoint || !apiKey) return null;

  const preview = bundle.preview?.slice(0, 6).join(", ") || "";
  const quizHint =
    bundle.format === "quiz_comment" && bundle.quiz
      ? `Quiz question: ${bundle.quiz.question}\nOptions: ${bundle.quiz.options.map((o) => o.hangul).join(", ")}`
      : "";
  const system =
    bundle.format === "quiz_comment"
      ? `You write X (Twitter) captions for Korean vocabulary QUIZ posts aimed at English-speaking beginners.
Return JSON only: {"line1":"...","line2":"..."}
Rules:
- Exactly 2 lines encouraging the reader to answer in comments BEFORE checking.
- Line 1: hook about the quiz / what skill it tests.
- Line 2: tell them to reply with 1, 2, 3, or 4 — answer is in comments.
- Each line max 90 characters. No hashtags, no emoji, no URLs.`
      : `You write X (Twitter) captions for Korean vocabulary infographics aimed at English-speaking beginners.
Return JSON only: {"line1":"...","line2":"..."}
Rules:
- Exactly 2 lines of teaching explanation (what the learner gets from this image).
- Plain English, friendly, specific to the topic — not generic hype.
- Each line max 90 characters. No hashtags, no emoji, no URLs.
- Do not mention "save this post" on both lines.`;

  const user = `Topic: ${bundle.title}
Format: ${bundle.format}
Editor note: ${bundle.fit}
${preview ? `Sample words: ${preview}` : ""}
${quizHint}`;

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.55,
      max_completion_tokens: 200,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return null;

  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { line1?: string; line2?: string };
    if (!parsed.line1?.trim() || !parsed.line2?.trim()) return null;
    return { line1: parsed.line1.trim(), line2: parsed.line2.trim() };
  } catch {
    return null;
  }
}

export async function buildVocabXPostText(bundle: VocabBundle): Promise<{
  tweetText: string;
  caption: VocabCaptionLines;
  replyText?: string;
}> {
  const caption = (await azureCaption(bundle)) ?? fallbackVocabCaption(bundle);
  const tweetText = buildVocabXTweetText({
    title: bundle.title,
    line1: caption.line1,
    line2: caption.line2,
    quizQuestion: bundle.quiz?.question,
  });
  const replyText =
    bundle.format === "quiz_comment" && bundle.quiz
      ? buildQuizAnswerReply(bundle.quiz)
      : undefined;
  return { tweetText, caption, replyText };
}
