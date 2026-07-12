import type { VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";
import {
  buildQuizAnswerReply,
  captionLinesFromTweetBody,
  fallbackVocabTweetBody,
  finalizeVocabXTweet,
  pickVocabXTweetStyle,
  type VocabCaptionLines,
  type VocabXTweetStyle,
} from "@/lib/vocabXTweet";

function stylePromptBlock(style: VocabXTweetStyle): string {
  if (style === "quiz") {
    return `STYLE = quiz (engagement / replies)
Write like this tone:
Let's practice Korean today! 🇰🇷✨
Look at the picture and answer the question at the bottom!
…
Drop your answers in the replies! 👇
Invite replies/quote RTs. Do NOT reveal the answer.`;
  }
  if (style === "kcontent") {
    return `STYLE = kcontent (K-pop / drama / fandom vibes — RT bait)
Write like this tone:
🗣️ When ticketing opens for your favorite idol's concert:
➡️ The website is 붐비다 (Crowded) 📈🔥
🗣️ After checking your bank account post-ticketing:
➡️ My wallet is 텅 비다 (Empty) 💸🥲
Use fandom / drama / daily K-life situations. Light meme energy, not a textbook.`;
  }
  return `STYLE = practical (real-life usefulness)
Write like this tone:
Use "붐비다" when you're stuck in a crowded subway, and "텅 비다" when your wallet is completely empty. 💸😂

🔴 붐비다 [bumbida] - Crowded
🔵 텅 비다 [teong bida] - Empty

What's the subway like in your country right now? 🚇
Easy English. Concrete situations. End with a light question.`;
}

async function azureTweetBody(
  bundle: VocabBundle,
  style: VocabXTweetStyle,
): Promise<string | null> {
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
      ? `Quiz question: ${bundle.quiz.question}\nOptions: ${bundle.quiz.options
          .map((o, i) => `${i + 1}) ${o.hangul} [${o.romanization}]`)
          .join(" · ")}`
      : "";

  const system = `You write X (Twitter) posts for a Korean learning account aimed at English-speaking learners and global K-culture fans.
Return JSON only: {"tweetBody":"..."}

${stylePromptBlock(style)}

HARD RULES:
- tweetBody only — NO hashtags (we add them later), NO URLs, NO "link in bio".
- English body (easy English). Include Hangul + romanization when you know the words.
- Use emojis for scanability (not spam).
- Max ~200 characters for tweetBody (strict — leave room for hashtags). Prefer short.
- For list/grid topics: show at most 2–3 example words, then point to the image for the rest.
- For quiz: do NOT paste all 4 options in the tweet if it gets long — one question + "look at the picture / reply below" is enough.
- Snackable: one hook, clear contrast or quiz prompt, invite engagement.
- Tone: light & useful — mix study account + soft meme, not stiff textbook.`;

  const user = `Topic: ${bundle.title}
Format: ${bundle.format}
Style: ${style}
Editor note: ${bundle.fit}
${preview ? `Sample words: ${preview}` : ""}
${quizHint}
The post includes an infographic image — refer to it lightly ("look at the picture") when helpful.`;

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.75,
      max_completion_tokens: 280,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return null;

  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { tweetBody?: string; line1?: string; line2?: string };
    if (parsed.tweetBody?.trim()) return parsed.tweetBody.trim();
    // Back-compat if model returns old shape
    if (parsed.line1?.trim() && parsed.line2?.trim()) {
      return `${parsed.line1.trim()}\n${parsed.line2.trim()}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function buildVocabXPostText(bundle: VocabBundle): Promise<{
  tweetText: string;
  caption: VocabCaptionLines;
  replyText?: string;
  style: VocabXTweetStyle;
}> {
  const style = pickVocabXTweetStyle(bundle);
  const body =
    (await azureTweetBody(bundle, style)) ?? fallbackVocabTweetBody(bundle, style);
  const tweetText = finalizeVocabXTweet(body, style);
  const caption = captionLinesFromTweetBody(body);
  const replyText =
    bundle.format === "quiz_comment" && bundle.quiz
      ? buildQuizAnswerReply(bundle.quiz)
      : undefined;
  return { tweetText, caption, replyText, style };
}
