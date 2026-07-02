import { DateTime } from "luxon";

import { getKoreanQuizAppStoreLinks } from "@/lib/koreanQuizAppLinks";
import { resolveRomanizationDisplay } from "@/lib/koreanQuiz/romanization";
import {
  correctLabelFromItem,
  isNounQuizItem,
  listApprovedKoreanQuizzes,
} from "@/lib/koreanQuiz/store";
import type { KoreanQuizItem } from "@/lib/koreanQuiz/types";
import { newsletterUnsubscribeUrl } from "@/lib/newsletterUnsubscribe";

export type WeeklyPictureQuizOption = {
  letter: string;
  imageUrl: string;
  correct: boolean;
};

export type WeeklyPictureQuiz = {
  weekKey: string;
  targetQuizId: string;
  word: string;
  english?: string;
  romanization?: string;
  examples: WeeklyQuizExample[];
  options: WeeklyPictureQuizOption[];
};

export type WeeklyQuizExample = {
  korean: string;
  english: string;
};

const BUSINESS_TIME_ZONE = "Asia/Seoul";

export function newsletterWeekKey(
  d: DateTime = DateTime.now().setZone(BUSINESS_TIME_ZONE),
): string {
  return `${d.weekYear}-W${String(d.weekNumber).padStart(2, "0")}`;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function englishForItem(item: KoreanQuizItem): string | undefined {
  const choice = item.choices.find((c) => c.id === item.correctChoiceId);
  return choice?.english?.trim() || item.illustrationEnglish?.trim() || undefined;
}

function hasBatchim(word: string): boolean {
  const ch = word.trim().slice(-1);
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function objectParticle(word: string): "을" | "를" {
  return hasBatchim(word) ? "을" : "를";
}

function copula(word: string): "이에요" | "예요" {
  return hasBatchim(word) ? "이에요" : "예요";
}

function englishWithArticle(english: string): string {
  const gloss = english.trim();
  if (!gloss) return "it";
  if (/^(a|an|the)\s/i.test(gloss)) return gloss;
  return /^[aeiou]/i.test(gloss) ? `an ${gloss}` : `a ${gloss}`;
}

export function weeklyQuizExampleSentences(
  word: string,
  english?: string,
): WeeklyQuizExample[] {
  const gloss = english?.trim();
  const obj = objectParticle(word);
  const cop = copula(word);
  return [
    {
      korean: `이것은 ${word}${cop}.`,
      english: gloss ? `This is ${englishWithArticle(gloss)}.` : `This is ${word}.`,
    },
    {
      korean: `저는 ${word}${obj} 좋아해요.`,
      english: gloss ? `I like ${englishWithArticle(gloss)}.` : `I like ${word}.`,
    },
  ];
}

export async function buildWeeklyPictureQuiz(
  weekKey = newsletterWeekKey(),
): Promise<WeeklyPictureQuiz> {
  const all = await listApprovedKoreanQuizzes();
  const pool = all.filter(
    (item) => isNounQuizItem(item) && item.imageUrl?.trim(),
  );
  if (pool.length < 4) {
    throw new Error("Not enough approved noun quizzes with images (need 4+)");
  }

  const seed = hashString(weekKey);
  const shuffled = seededShuffle(pool, seed);
  const target = shuffled[0]!;
  const distractors = shuffled.slice(1, 4);
  const word = correctLabelFromItem(target);
  if (!word.trim()) {
    throw new Error("Weekly quiz target has no Korean label");
  }

  const optionItems = seededShuffle(
    [
      { item: target, correct: true },
      ...distractors.map((item) => ({ item, correct: false })),
    ],
    hashString(`${weekKey}:options`),
  );

  return {
    weekKey,
    targetQuizId: target.id,
    word,
    english: englishForItem(target),
    romanization: resolveRomanizationDisplay(word, target.romanization),
    examples: weeklyQuizExampleSentences(word, englishForItem(target)),
    options: optionItems.map((entry, index) => ({
      letter: String.fromCharCode(65 + index),
      imageUrl: entry.item.imageUrl.trim(),
      correct: entry.correct,
    })),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function optionCell(option: WeeklyPictureQuizOption): string {
  const src = escapeHtml(option.imageUrl);
  return `
    <td align="center" valign="top" style="padding:8px;width:50%;">
      <div style="font-size:13px;font-weight:700;color:#0071e3;margin-bottom:8px;">${option.letter}</div>
      <img
        src="${src}"
        alt="Option ${option.letter}"
        width="148"
        height="148"
        style="display:block;width:148px;height:148px;object-fit:cover;border-radius:16px;border:1px solid #e5e5ea;background:#f5f5f7;margin:0 auto;"
      />
    </td>
  `.trim();
}

export function buildWeeklyQuizEmail(args: {
  quiz: WeeklyPictureQuiz;
  siteUrl: string;
  recipientEmail: string;
}): { subject: string; html: string; text: string } {
  const { quiz, siteUrl, recipientEmail } = args;
  const base = siteUrl.replace(/\/+$/, "");
  const { appStoreUrl, playStoreUrl } = getKoreanQuizAppStoreLinks();
  const vocabQuizUrl = `${base}/vocab-quiz?utm_source=newsletter&utm_campaign=weekly-quiz`;
  const unsubscribeUrl = newsletterUnsubscribeUrl(recipientEmail, base);
  const answer = quiz.options.find((o) => o.correct)?.letter ?? "?";

  const romanizationLine = quiz.romanization
    ? `<div style="margin-top:6px;font-size:15px;color:#6e6e73;">${escapeHtml(quiz.romanization)}</div>`
    : "";

  const examplesHtml = quiz.examples
    .map(
      (ex, index) => `
        <div style="margin-top:${index === 0 ? "0" : "12px"};">
          <div style="font-size:15px;font-weight:600;color:#1d1d1f;">${escapeHtml(ex.korean)}</div>
          <div style="margin-top:4px;font-size:14px;color:#6e6e73;">${escapeHtml(ex.english)}</div>
        </div>
      `,
    )
    .join("");

  const examplesText = quiz.examples
    .map((ex, index) => `${index + 1}. ${ex.korean}\n   ${ex.english}`)
    .join("\n");

  const subject = `This week's Korean quiz — which picture matches “${quiz.word}”?`;

  const text = [
    "This week's Korean quiz from Kaja Korean",
    "",
    "Which picture matches this word?",
    quiz.word,
    quiz.romanization ? quiz.romanization : "",
    "",
    ...quiz.options.map((o) => `${o.letter}. ${o.imageUrl}`),
    "",
    `Answer: ${answer}`,
    quiz.english ? `Meaning: ${quiz.english}` : "",
    quiz.examples.length > 0 ? "Examples:" : "",
    examplesText,
    "",
    `Practice more: ${vocabQuizUrl}`,
    `App Store: ${appStoreUrl}`,
    playStoreUrl ? `Google Play: ${playStoreUrl}` : "",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const optionRows = [
    quiz.options.slice(0, 2),
    quiz.options.slice(2, 4),
  ]
    .map(
      (pair) => `
        <tr>
          ${pair.map((option) => optionCell(option)).join("")}
        </tr>
      `,
    )
    .join("");

  const playStoreHtml = playStoreUrl
    ? `<a href="${escapeHtml(playStoreUrl)}" style="display:inline-block;margin-left:10px;">
        <img src="${base}/brand/store-badges/google-play.png" alt="Get it on Google Play" width="134" height="40" style="display:block;border:0;height:40px;width:auto;" />
      </a>`
    : "";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.55;color:#1d1d1f;max-width:560px;margin:0 auto;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0071e3;letter-spacing:0.02em;text-transform:uppercase;">Weekly Korean quiz</p>
      <h2 style="margin:0 0 14px;font-size:24px;line-height:1.25;">This week's Korean quiz</h2>
      <p style="margin:0 0 18px;font-size:15px;color:#424245;">
        We give you a Korean word. Which picture matches it?
      </p>

      <div style="margin:0 0 20px;padding:18px 20px;border:1px solid #e5e5ea;border-radius:18px;background:#fafafa;text-align:center;">
        <div style="font-size:13px;color:#6e6e73;margin-bottom:8px;">Today's word</div>
        <div style="font-size:34px;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(quiz.word)}</div>
        ${romanizationLine}
      </div>

      <p style="margin:0 0 12px;font-size:15px;font-weight:600;">Pick the matching picture</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        ${optionRows}
      </table>

      <div style="margin:22px 0 0;padding:16px 18px;border-radius:16px;background:#f5f5f7;">
        <div style="font-size:13px;color:#6e6e73;margin-bottom:6px;">Answer</div>
        <div style="font-size:18px;font-weight:700;">${escapeHtml(answer)}</div>
        ${
          quiz.english
            ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e5ea;">
                <div style="font-size:13px;color:#6e6e73;margin-bottom:4px;">Meaning</div>
                <div style="font-size:16px;font-weight:600;color:#1d1d1f;">${escapeHtml(quiz.english)}</div>
              </div>`
            : ""
        }
        ${
          quiz.examples.length > 0
            ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e5e5ea;">
                <div style="font-size:13px;color:#6e6e73;margin-bottom:8px;">Examples</div>
                ${examplesHtml}
              </div>`
            : ""
        }
        <p style="margin:14px 0 0;font-size:14px;color:#424245;">
          Images blocked in your inbox? Open the quiz in the app or browser for the full experience.
        </p>
      </div>

      <div style="margin:26px 0 0;text-align:center;">
        <a href="${escapeHtml(vocabQuizUrl)}" style="display:inline-block;background:#0071e3;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;">
          Play in browser
        </a>
      </div>

      <div style="margin:24px 0 0;text-align:center;">
        <div style="font-size:13px;color:#6e6e73;margin-bottom:12px;">Get the vocab quiz app</div>
        <a href="${escapeHtml(appStoreUrl)}" style="display:inline-block;">
          <img src="${base}/brand/store-badges/app-store.svg" alt="Download on the App Store" width="120" height="40" style="display:block;border:0;height:40px;width:auto;" />
        </a>
        ${playStoreHtml}
      </div>

      <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#86868b;text-align:center;">
        You are receiving this because you subscribed at Kaja Korean.<br />
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#0071e3;">Unsubscribe</a>
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}
