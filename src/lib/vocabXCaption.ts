import type { VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";
import {
  antonymTweetUsesTopicPair,
  formatAllowedWordsForPrompt,
  tweetHangulMatchesImageWords,
  type VocabImageWord,
} from "@/lib/vocabImageWords";
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

export type BuildVocabXPostTextOptions = {
  /** Hangul printed on the card — tweets may ONLY use these. */
  imageWords?: VocabImageWord[];
};

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
Invite replies/quote RTs. Do NOT reveal the answer.
Do NOT paste Hangul answers unless they are in ALLOWED_WORDS (and even then prefer not spoiling).`;
  }
  if (style === "kcontent") {
    return `STYLE = kcontent (K-pop / drama / fandom vibes — RT bait)
Write situation lines that embed ONLY the ALLOWED_WORDS Hangul (with given romanization/english).
The Hangul in the examples below is a PLACEHOLDER shape — replace with ALLOWED_WORDS only:
🗣️ When … :
➡️ … {ALLOWED_WORD_A} [{rom}] ({eng}) …
🗣️ When … :
➡️ … {ALLOWED_WORD_B} [{rom}] ({eng}) …
Use fandom / drama / daily K-life situations. Light meme energy, not a textbook.
NEVER invent emotional synonyms (e.g. do not swap 전/후 for 설레다/허전하다).`;
  }
  return `STYLE = practical (real-life usefulness)
Write like this tone (newlines matter — blank line before bullets and before the closing question):
Use these when you're stuck on the subway 👇

🔴 {WORD_A} [rom] - English
🔵 {WORD_B} [rom] - English

What's the subway like in your country right now? 🚇
Easy English. Concrete situations. End with a light question.
Bullet Hangul MUST come from ALLOWED_WORDS only.`;
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

function allowedWordsBlock(imageWords: VocabImageWord[]): string {
  return `ALLOWED_WORDS (the ONLY Hangul you may write — copied from the image):\n${formatAllowedWordsForPrompt(imageWords)}`;
}

async function azureTweetBody(
  bundle: VocabBundle,
  style: VocabXTweetStyle,
  imageWords: VocabImageWord[],
): Promise<string | null> {
  const cfg = azureChatConfig();
  if (!cfg) return null;

  const quizHint =
    bundle.format === "quiz_comment" && bundle.quiz
      ? `Quiz question: ${bundle.quiz.question}\nOptions (on image — do not spoil the answer in the tweet):\n${bundle.quiz.options
          .map((o, i) => `${i + 1}) ${o.hangul} [${o.romanization}]`)
          .join(" · ")}`
      : "";

  const hasAllowed = imageWords.some((w) => w.hangul?.trim());

  const system = `You write X (Twitter) posts for a Korean learning account aimed at English-speaking learners and global K-culture fans.
Return JSON only: {"tweetBody":"..."}

${stylePromptBlock(style)}

HARD RULES:
- tweetBody only — NO hashtags (we add them later), NO URLs, NO "link in bio".
- English body (easy English).
- Use emojis for scanability (not spam).
- Max ~200 characters for tweetBody (strict — leave room for hashtags). Prefer short.
- For list/grid topics: show at most 2–3 example words from ALLOWED_WORDS, then point to the image for the rest.
- For quiz: do NOT paste all 4 options in the tweet if it gets long — one question + "look at the picture / reply below" is enough.
- Snackable: one hook, clear contrast or quiz prompt, invite engagement.
- Tone: light & useful — mix study account + soft meme, not stiff textbook.
- IMAGE WORD LOCK (critical):
  ${
    hasAllowed
      ? `Every Hangul syllable sequence you write MUST be one of ALLOWED_WORDS (or that word + a short particle). NEVER invent synonyms, related vocab, or "better" example words. If you need a sentence, embed an ALLOWED word — do not swap it for another Korean word.`
      : `ALLOWED_WORDS is empty. Write English ONLY. Do NOT invent any Hangul. Tell readers to look at the picture for Korean.`
  }
${
  bundle.format === "antonym_split" && hasAllowed
    ? `- ANTONYM / X vs Y LOCK (critical):
  ALLOWED_WORDS has the TWO topic words on the card. You MUST feature BOTH of them (with given romanization/english).
  Do NOT replace them with mood/synonym words. Example of FORBIDDEN: image shows 전/후 but you write 설레다/허전하다.`
    : ""
}
- LINE BREAKS (important for mobile X):
  Use real newline characters in tweetBody (JSON string with \\n is fine).
  Structure exactly:
    1) hook line(s)
    2) blank line
    3) 2–3 bullet lines (one word per line, emoji prefix) OR situation lines using ALLOWED words
    4) blank line
    5) one short CTA / question
  Do NOT dump hook + bullets + CTA into one paragraph.
  Do NOT put a blank line between every single bullet — bullets stay consecutive.`;

  const user = `Topic: ${bundle.title}
Format: ${bundle.format}
Style: ${style}
Editor note: ${bundle.fit}
${allowedWordsBlock(imageWords)}
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
      temperature: 0.55,
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
async function azureRepairTweetLineBreaks(
  blob: string,
  imageWords: VocabImageWord[],
): Promise<string | null> {
  const cfg = azureChatConfig();
  if (!cfg) return null;

  const system = `You fix X (Twitter) Korean-learning captions that were written as one dense paragraph.
Return JSON only: {"tweetBody":"..."}

Keep the SAME meaning and the SAME Hangul words — do not invent new vocab.
You may ONLY keep Hangul that appears in ALLOWED_WORDS. If the blob has foreign Hangul, drop or replace with an ALLOWED word.
Reorder lightly only if needed for the layout. NO hashtags, NO URLs.
Max ~200 characters. Prefer short.

${allowedWordsBlock(imageWords)}

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

function bodyMatchesImageWords(
  body: string,
  imageWords: VocabImageWord[],
  bundle?: VocabBundle,
): boolean {
  const { ok, foreign } = tweetHangulMatchesImageWords(body, imageWords);
  if (!ok && foreign.length) return false;
  if (bundle?.format === "antonym_split") {
    return antonymTweetUsesTopicPair(body, imageWords);
  }
  return true;
}

export async function buildVocabXPostText(
  bundle: VocabBundle,
  options?: BuildVocabXPostTextOptions,
): Promise<{
  tweetText: string;
  caption: VocabCaptionLines;
  replyText?: string;
  style: VocabXTweetStyle;
  imageWords: VocabImageWord[];
}> {
  const style = pickVocabXTweetStyle(bundle);
  const imageWords = options?.imageWords ?? [];
  const safeFallback = () => fallbackVocabTweetBody(bundle, style, imageWords);

  let body = (await azureTweetBody(bundle, style, imageWords)) ?? safeFallback();

  if (!bodyMatchesImageWords(body, imageWords, bundle)) {
    body = safeFallback();
  }

  if (needsLineBreakRepair(body)) {
    const repaired = await azureRepairTweetLineBreaks(body, imageWords);
    if (repaired && bodyMatchesImageWords(repaired, imageWords, bundle)) {
      if (!needsLineBreakRepair(repaired) || repaired.includes("\n")) {
        body = repaired;
      }
    }
  }

  // Final lock: never ship foreign Hangul.
  if (!bodyMatchesImageWords(body, imageWords, bundle)) {
    body = safeFallback();
  }

  const tweetText = finalizeVocabXTweet(body, style);
  if (!bodyMatchesImageWords(tweetText, imageWords, bundle)) {
    const locked = finalizeVocabXTweet(safeFallback(), style);
    const caption = supportingCaptionFromTweet(
      locked,
      captionLinesFromTweetBody(safeFallback()),
    );
    const replyText =
      bundle.format === "quiz_comment" && bundle.quiz
        ? buildQuizAnswerReply(bundle.quiz)
        : undefined;
    return { tweetText: locked, caption, replyText, style, imageWords };
  }

  const caption = supportingCaptionFromTweet(
    tweetText,
    captionLinesFromTweetBody(body),
  );
  const replyText =
    bundle.format === "quiz_comment" && bundle.quiz
      ? buildQuizAnswerReply(bundle.quiz)
      : undefined;
  return { tweetText, caption, replyText, style, imageWords };
}
