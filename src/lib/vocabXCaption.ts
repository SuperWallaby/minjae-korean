import type { VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";
import {
  buildQuizAnswerReply,
  captionLinesFromTweetBody,
  fallbackVocabTweetBody,
  finalizeVocabXTweet,
  needsLineBreakRepair,
  pickVocabXTweetStyle,
  supportingCaptionFromTweet,
  unescapeLiteralNewlines,
  type VocabCaptionLines,
  type VocabXTweetStyle,
} from "@/lib/vocabXTweet";

function azureChatConfig(): {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
  url: string;
} | null {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const deployment =
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.split(",")[0]?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
    process.env.AZURE_OPENAI_DEPLOYMENT?.trim() ||
    "trx-gpt-4-1-mini";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  if (!endpoint || !apiKey) return null;
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  return { endpoint, apiKey, deployment, apiVersion, url };
}

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
Write like this tone (newlines matter — blank line before bullets and before the closing question):
Use these when you're stuck on the subway 👇

🔴 붐비다 [bumbida] - Crowded
🔵 텅 비다 [teong bida] - Empty

What's the subway like in your country right now? 🚇
Easy English. Concrete situations. End with a light question.`;
}

function parseTweetBodyJson(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { tweetBody?: string; line1?: string; line2?: string };
    if (parsed.tweetBody?.trim()) {
      return unescapeLiteralNewlines(parsed.tweetBody.trim());
    }
    if (parsed.line1?.trim() && parsed.line2?.trim()) {
      return `${parsed.line1.trim()}\n${parsed.line2.trim()}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function azureTweetBody(
  bundle: VocabBundle,
  style: VocabXTweetStyle,
): Promise<string | null> {
  const cfg = azureChatConfig();
  if (!cfg) return null;

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
- Tone: light & useful — mix study account + soft meme, not stiff textbook.
- LINE BREAKS (important for mobile X):
  Use real newline characters in tweetBody (JSON string with \\n is fine).
  Structure exactly:
    1) hook line(s)
    2) blank line
    3) 2–3 bullet lines (one word per line, emoji prefix)
    4) blank line
    5) one short CTA / question
  Do NOT dump hook + bullets + CTA into one paragraph.
  Do NOT put a blank line between every single bullet — bullets stay consecutive.`;

  const user = `Topic: ${bundle.title}
Format: ${bundle.format}
Style: ${style}
Editor note: ${bundle.fit}
${preview ? `Sample words: ${preview}` : ""}
${quizHint}
The post includes an infographic image — refer to it lightly ("look at the picture") when helpful.`;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": cfg.apiKey },
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
  return parseTweetBodyJson(raw);
}

/**
 * Second pass: when the first draft is one paragraph, ask the model to
 * re-layout the SAME content with hook / bullets / CTA newlines.
 */
async function azureRepairTweetLineBreaks(blob: string): Promise<string | null> {
  const cfg = azureChatConfig();
  if (!cfg) return null;

  const system = `You fix X (Twitter) Korean-learning captions that were written as one dense paragraph.
Return JSON only: {"tweetBody":"..."}

Keep the SAME meaning, Hangul words, glosses, and question — do not invent new vocab.
Reorder lightly only if needed for the layout. NO hashtags, NO URLs.
Max ~200 characters. Prefer short.

Use real newline characters in tweetBody. Structure exactly:
1) hook line(s)
2) blank line
3) 2–3 bullet lines (one word/phrase per line, emoji prefix like 🔴 🔵 🟢)
4) blank line
5) one short CTA / question

If the blob lists words inline with commas ("A (…), B (…), C (…)"), split each onto its own bullet line.
Do NOT return another single-paragraph blob.`;

  const user = `Reformat this caption with proper line breaks:\n\n${blob}`;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": cfg.apiKey },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_completion_tokens: 280,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return null;
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;
  return parseTweetBodyJson(raw);
}

export async function buildVocabXPostText(bundle: VocabBundle): Promise<{
  tweetText: string;
  caption: VocabCaptionLines;
  replyText?: string;
  style: VocabXTweetStyle;
}> {
  const style = pickVocabXTweetStyle(bundle);
  let body =
    (await azureTweetBody(bundle, style)) ?? fallbackVocabTweetBody(bundle, style);

  if (needsLineBreakRepair(body)) {
    const repaired = await azureRepairTweetLineBreaks(body);
    if (repaired && !needsLineBreakRepair(repaired)) {
      body = repaired;
    } else if (repaired && repaired.includes("\n")) {
      // Partial improvement still better than a single blob.
      body = repaired;
    }
    // If repair fails, keep original / fallback — finalize still clamps safely.
  }

  const tweetText = finalizeVocabXTweet(body, style);
  // Store supporting lines only — do not repeat the tweet hook (pin title).
  const caption = supportingCaptionFromTweet(
    tweetText,
    captionLinesFromTweetBody(body),
  );
  const replyText =
    bundle.format === "quiz_comment" && bundle.quiz
      ? buildQuizAnswerReply(bundle.quiz)
      : undefined;
  return { tweetText, caption, replyText, style };
}
