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

const LIST_PREFIX =
  /^(?:[🔴🔵🟢🟡🟠🟣⚫⚪🔸🔹▪️◾◼•●○]+|[0-9]+[.)])\s+/u;

function isBulletLine(line: string): boolean {
  const t = line.trim();
  if (!LIST_PREFIX.test(t)) return false;
  // Hooks sometimes start with a phone/tool emoji + English sentence — not a word row.
  const rest = t.replace(LIST_PREFIX, "").trim();
  if (/^[A-Za-z]/.test(rest) && rest.split(/\s+/).length >= 6) return false;
  return true;
}

function isCtaLine(line: string): boolean {
  const t = line.trim().toLowerCase();
  return (
    /look at the (picture|image|card)/.test(t) ||
    /check the image/.test(t) ||
    /drop your answers?/.test(t) ||
    /what(?:'s| is) your/.test(t) ||
    /which (one|mood|fruit|word)/.test(t) ||
    /reply|replies|save (it|the card)|swipe/.test(t)
  );
}

/** Turn literal `\n` sequences (from some JSON models) into real newlines. */
export function unescapeLiteralNewlines(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

/**
 * True when the body is basically one paragraph blob — worth re-asking the model
 * to insert hook / bullets / CTA line breaks.
 */
export function needsLineBreakRepair(body: string): boolean {
  const normalized = unescapeLiteralNewlines(body).trim();
  if (!normalized) return false;

  const nonEmpty = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (nonEmpty.length <= 1) return true;

  // 2+ lines but still no structure (no blank line, no list bullets)
  const hasBlank = /\n\s*\n/.test(normalized);
  const hasBullet = nonEmpty.some((l) => isBulletLine(l));
  if (!hasBlank && !hasBullet && normalized.length >= 90) return true;

  return false;
}

/**
 * Normalize X caption line breaks:
 *   hook
 *   <blank>
 *   bullet lines (single-spaced)
 *   <blank>
 *   CTA / question
 */
export function formatVocabXTweetBody(body: string): string {
  const rawLines = unescapeLiteralNewlines(body)
    .replace(/[ \t]+\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, "").trimEnd());

  // Drop empty + hashtag-only lines from AI body (hashtags appended later).
  const lines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/^#[\p{L}\p{N}_]+(\s+#[\p{L}\p{N}_]+)*$/u.test(l));

  if (lines.length === 0) return "";

  const sections: string[][] = [];
  let current: string[] = [];
  let mode: "prose" | "bullets" | "cta" | null = null;

  const pushSection = () => {
    if (current.length === 0) return;
    sections.push(current);
    current = [];
  };

  for (const line of lines) {
    const bullet = isBulletLine(line);
    const cta = !bullet && isCtaLine(line);
    const nextMode: "prose" | "bullets" | "cta" = bullet
      ? "bullets"
      : cta
        ? "cta"
        : "prose";

    if (mode === null) {
      mode = nextMode;
      current.push(line);
      continue;
    }

    // Start a new section when switching between prose ↔ bullets ↔ cta
    if (nextMode !== mode) {
      pushSection();
      mode = nextMode;
      current.push(line);
      continue;
    }

    // Same mode: bullets stay single-spaced in one section;
    // consecutive prose lines become one paragraph unless short emoji hooks.
    if (mode === "bullets") {
      current.push(line);
    } else if (mode === "cta") {
      current.push(line);
    } else {
      // Merge adjacent short prose into the same section with newlines
      // so "Let's practice" / follow-up stay together; break if previous
      // ended a sentence AND this looks like a new beat.
      const prev = current[current.length - 1] ?? "";
      if (/[.!?…]$/u.test(prev) && /^[A-Z🔴🔵🟢🗣️📱❓]/u.test(line)) {
        pushSection();
        mode = "prose";
        current.push(line);
      } else {
        current.push(line);
      }
    }
  }
  pushSection();

  return sections.map((sec) => sec.join("\n")).join("\n\n").trim();
}

/** Prefer cutting on paragraph / sentence / word boundaries before the tag block. */
export function softClipTweetBody(text: string, maxLen: number): string {
  const cleaned = text.trim();
  if (cleaned.length <= maxLen) return cleaned;
  if (maxLen <= 0) return "";

  const parts = cleaned
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  // Prefer to keep hook + CTA; trim bullet rows from the bottom when over budget.
  if (parts.length >= 3) {
    const first = parts[0]!;
    const last = parts[parts.length - 1]!;
    const lastFirstLine = last.split("\n")[0] ?? last;
    if (isCtaLine(lastFirstLine) || /[?？]$/u.test(last.trim())) {
      const bulletLines = parts.slice(1, -1).join("\n\n").split("\n").filter(Boolean);
      while (bulletLines.length > 0) {
        const mid = bulletLines.join("\n");
        const candidate = `${first}\n\n${mid}\n\n${last}`.trim();
        if (candidate.length <= maxLen) return candidate;
        bulletLines.pop();
      }
      const hookCta = `${first}\n\n${last}`.trim();
      if (hookCta.length <= maxLen) return hookCta;
    }
  }

  const window = cleaned.slice(0, maxLen);
  const paragraph = window.lastIndexOf("\n\n");
  if (paragraph >= Math.floor(maxLen * 0.45)) {
    return window.slice(0, paragraph).trimEnd();
  }
  const newline = window.lastIndexOf("\n");
  if (newline >= Math.floor(maxLen * 0.5)) {
    return window.slice(0, newline).trimEnd();
  }
  const sentence = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
    window.lastIndexOf("。"),
  );
  if (sentence >= Math.floor(maxLen * 0.5)) {
    return window.slice(0, sentence + 1).trimEnd();
  }
  const space = window.lastIndexOf(" ");
  if (space >= Math.floor(maxLen * 0.4)) {
    return window.slice(0, space).trimEnd();
  }
  return window.trimEnd();
}

/** Strip AI-added hashtags, format line breaks, attach 3 tags, clamp to 280. */
export function finalizeVocabXTweet(body: string, style: VocabXTweetStyle): string {
  const tags = vocabXHashtags(style);
  const withoutHashTags = body.replace(/#[\p{L}\p{N}_]+/gu, "");
  const formatted = formatVocabXTweetBody(withoutHashTags);
  const sep = "\n\n";
  const budget = 280 - tags.length - sep.length;
  const clipped = softClipTweetBody(formatted, Math.max(0, budget));
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
  const line1 = (lines[0] ?? "Korean vocab").slice(0, 100);
  // Never copy line1 into line2 — that made Pinterest title+description look duplicated.
  const line2Raw = (lines[1] ?? "").trim().slice(0, 100);
  const line2 =
    line2Raw &&
    line2Raw.replace(/\s+/g, " ").toLowerCase() !==
      line1.replace(/\s+/g, " ").toLowerCase()
      ? line2Raw
      : "";
  return { line1, line2 };
}

/** Caption lines that do not repeat the tweet hook (for pin description / storage). */
export function supportingCaptionFromTweet(
  tweetText: string,
  caption?: VocabCaptionLines | null,
): VocabCaptionLines {
  const tweetLines = String(tweetText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));
  const hook = (tweetLines[0] ?? "").replace(/^🇰🇷\s*/, "").trim();
  const hookNorm = hook.replace(/\s+/g, " ").toLowerCase();

  const candidates = [
    caption?.line1,
    caption?.line2,
    ...tweetLines.slice(1),
  ]
    .map((l) => String(l || "").trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const line of candidates) {
    const norm = line.replace(/\s+/g, " ").toLowerCase();
    if (!norm) continue;
    if (
      hookNorm &&
      (norm === hookNorm || hookNorm.startsWith(norm) || norm.startsWith(hookNorm))
    ) {
      continue;
    }
    if (unique.some((u) => u.replace(/\s+/g, " ").toLowerCase() === norm)) continue;
    unique.push(line.slice(0, 100));
    if (unique.length >= 2) break;
  }

  return {
    line1: unique[0] ?? "",
    line2: unique[1] ?? "",
  };
}
