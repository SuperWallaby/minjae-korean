import type { QuizBundleData, VocabBundle } from "@/lib/vocabInfographic/bundle-catalog";

export type VocabCaptionLines = {
  line1: string;
  line2: string;
};

/** Snackable X styles for English-speaking learners / K-culture fans. */
export type VocabXTweetStyle = "practical" | "kcontent" | "quiz";

export function buildQuizAnswerReply(quiz: QuizBundleData): string {
  const idx = quiz.correctIndex;
  const opt = quiz.options[idx - 1];
  if (!opt) throw new Error(`Invalid correctIndex: ${idx}`);
  return `Answer: ${idx}) ${opt.hangul} [${opt.romanization}]`.slice(0, 280);
}

export function pickVocabXTweetStyle(bundle: VocabBundle): VocabXTweetStyle {
  if (bundle.format === "quiz_comment") return "quiz";

  const hay = `${bundle.tags.join(" ")} ${bundle.title} ${bundle.fit}`.toLowerCase();
  if (/k-?pop|idol|concert|drama|fandom|ticketing|netflix|variety|예능|덕질/.test(hay)) {
    return "kcontent";
  }

  // Antonym cards: mix practical vs K-content for variety (deterministic).
  if (bundle.format === "antonym_split") {
    let hash = 0;
    for (const ch of bundle.id) hash = (hash + ch.charCodeAt(0) * 17) % 997;
    return hash % 3 === 0 ? "kcontent" : "practical";
  }

  return "practical";
}

export function vocabXHashtags(style: VocabXTweetStyle): string {
  if (style === "quiz") return "#KoreanQuiz #Hangul #StudyKorean";
  if (style === "kcontent") return "#Kpop #KoreanVocabulary #LearnKorean";
  return "#LearnKorean #Korean #Hangul";
}

/** Strip AI-added hashtags, attach 3 optimized tags, clamp to 280. */
export function finalizeVocabXTweet(body: string, style: VocabXTweetStyle): string {
  const tags = vocabXHashtags(style);
  const cleaned = body
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const sep = "\n\n";
  const budget = 280 - tags.length - sep.length;
  const clipped = cleaned.length > budget ? cleaned.slice(0, Math.max(0, budget)).trim() : cleaned;
  return `${clipped}${sep}${tags}`.slice(0, 280);
}

function topicLabel(bundle: Pick<VocabBundle, "title">): string {
  return bundle.title.replace(/ in Korean$/i, "").replace(/ quiz$/i, "").trim();
}

function antonymParts(bundle: VocabBundle): { left: string; right: string } | null {
  if (bundle.format !== "antonym_split") return null;
  const parts = bundle.title.split(/\s+vs\s+/i);
  if (parts.length !== 2) return null;
  return { left: parts[0]!.trim(), right: parts[1]!.trim() };
}

function previewWords(bundle: VocabBundle): string[] {
  return (bundle.preview ?? []).map((w) => w.trim()).filter(Boolean).slice(0, 4);
}

export function fallbackVocabTweetBody(
  bundle: VocabBundle,
  style: VocabXTweetStyle,
): string {
  const topic = topicLabel(bundle);
  const pair = antonymParts(bundle);
  const words = previewWords(bundle);

  if (style === "quiz" && bundle.quiz) {
    const q = bundle.quiz;
    return [
      `Let's practice Korean today! 🇰🇷✨`,
      `Look at the picture and answer the question at the bottom!`,
      ``,
      `❓ ${q.question}`,
      ``,
      `Drop your answers in the replies! 👇`,
    ].join("\n");
  }

  if (style === "kcontent" && pair) {
    return [
      `🗣️ Real-life Korean vibes:`,
      `➡️ Feeling ${pair.left.toLowerCase()} energy 📈🔥`,
      `➡️ Feeling ${pair.right.toLowerCase()} energy 💨🥲`,
      ``,
      `Swipe the image for Hangul + romanization.`,
      `Which mood are you today?`,
    ].join("\n");
  }

  if (style === "kcontent") {
    const sample = words.length ? words.slice(0, 2).join(" / ") : topic;
    return [
      `🗣️ When you're deep in K-content mode:`,
      `➡️ These words hit different: ${sample} 📈🔥`,
      ``,
      `Save the card & use them next time you watch. 🎬`,
    ].join("\n");
  }

  // practical
  if (pair) {
    return [
      `Use these opposites in real life 👇`,
      ``,
      `🔴 ${pair.left}`,
      `🔵 ${pair.right}`,
      ``,
      `Check the image for Hangul + romanization.`,
      `Which one fits your day right now?`,
    ].join("\n");
  }

  if (words.length >= 2) {
    return [
      `Handy Korean for ${topic.toLowerCase()} ✨`,
      ``,
      words
        .slice(0, 3)
        .map((w, i) => `${["🔴", "🔵", "🟢"][i] ?? "•"} ${w}`)
        .join("\n"),
      ``,
      `What's your go-to word from this list?`,
    ].join("\n");
  }

  return [
    `Snack-size Korean: ${topic} 🇰🇷`,
    ``,
    `Scan the card for Hangul, English, and romanization.`,
    `Save it and practice out loud today!`,
  ].join("\n");
}

/** Admin UI helper lines (not the full tweet). */
export function fallbackVocabCaption(
  bundle: Pick<VocabBundle, "title" | "format" | "fit" | "quiz" | "count">,
): VocabCaptionLines {
  if (bundle.format === "quiz_comment" && bundle.quiz) {
    return {
      line1: `Quick quiz — reply with your answer before checking.`,
      line2: `Drop 1–4 in the replies!`,
    };
  }
  const topic = bundle.title.replace(/ in Korean$/i, "").trim();
  if (bundle.format === "antonym_split") {
    return {
      line1: `Two opposite Korean words — snackable contrast card.`,
      line2: `Real-life situations + Hangul on the image.`,
    };
  }
  return {
    line1: `${topic} — useful Korean in one scannable card.`,
    line2: `Easy English hook for learners & K-culture fans.`,
  };
}

export function buildVocabXTweetText(input: {
  title: string;
  line1: string;
  line2: string;
  quizQuestion?: string;
  style?: VocabXTweetStyle;
}): string {
  // Legacy assembler kept for callers that still pass caption lines.
  const style = input.style ?? (input.quizQuestion ? "quiz" : "practical");
  const body = `${input.line1.trim()}\n${input.line2.trim()}`.trim();
  return finalizeVocabXTweet(body, style);
}

export function captionLinesFromTweetBody(body: string): VocabCaptionLines {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));
  return {
    line1: (lines[0] ?? "Korean vocab").slice(0, 100),
    line2: (lines[1] ?? lines[0] ?? "Learn Korean").slice(0, 100),
  };
}
