import { DateTime } from "luxon";

import photoQuizTrialsFile from "@/data/newsletter/photo-quiz-trials.json";
import { getKoreanQuizAppStoreLinks } from "@/lib/koreanQuizAppLinks";
import { NEWSLETTER_SUBJECT } from "@/lib/newsletterSubjects";
import {
  newsletterTutorCtaHtml,
  newsletterTutorCtaText,
  newsletterUnsubscribeHtml,
  newsletterUnsubscribeText,
} from "@/lib/newsletterEmailFooter";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

export type GrammarQuizTrial = {
  id: string;
  difficulty?: string;
  focus?: string;
  korean?: string;
  sentence?: string;
  choices?: string[];
  correct?: number;
  sceneMeaning?: string;
  imageUrl: string;
  tweetText?: string;
  replyText?: string;
  level?: number;
};

export type GrammarQuizDigest = {
  weekKey: string;
  trial: GrammarQuizTrial;
};

type TrialsFile = {
  generatedAt?: string;
  items?: GrammarQuizTrial[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function grammarQuizWeekKey(
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

function loadTrials(): GrammarQuizTrial[] {
  const file = photoQuizTrialsFile as TrialsFile;
  return (file.items ?? []).filter(
    (item) =>
      item.id?.trim() &&
      item.imageUrl?.trim() &&
      Array.isArray(item.choices) &&
      item.choices.length >= 2 &&
      typeof item.correct === "number",
  );
}

export function buildGrammarQuizDigest(
  weekKey = grammarQuizWeekKey(),
): GrammarQuizDigest {
  const all = loadTrials();
  if (all.length === 0) {
    throw new Error(
      "No photo-trial grammar quizzes for newsletter. Run: node scripts/sync-newsletter-photo-quiz-trials.mjs",
    );
  }
  const shuffled = seededShuffle(all, hashString(`grammar-quiz:${weekKey}`));
  return { weekKey, trial: shuffled[0]! };
}

export function buildGrammarQuizEmail(args: {
  digest: GrammarQuizDigest;
  siteUrl: string;
  recipientEmail: string;
}): { subject: string; html: string; text: string } {
  const { digest, siteUrl, recipientEmail } = args;
  const { trial } = digest;
  const base = siteUrl.replace(/\/+$/, "");
  const { appStoreUrl, playStoreUrl } = getKoreanQuizAppStoreLinks();
  const practiceUrl = `${base}/vocab-quiz?utm_source=newsletter&utm_campaign=grammar-quiz`;
  const tutorHtml = newsletterTutorCtaHtml("grammar-quiz");
  const tutorText = newsletterTutorCtaText("grammar-quiz");
  const unsubHtml = newsletterUnsubscribeHtml({
    recipientEmail,
    siteUrl: base,
  });
  const unsubText = newsletterUnsubscribeText({
    recipientEmail,
    siteUrl: base,
  });

  const choices = trial.choices ?? [];
  const correctIndex =
    typeof trial.correct === "number" &&
    trial.correct >= 0 &&
    trial.correct < choices.length
      ? trial.correct
      : 0;
  const answerLabel = `${correctIndex + 1}) ${choices[correctIndex] ?? ""}`.trim();
  const subject = NEWSLETTER_SUBJECT.grammarQuiz;

  const choiceLines = choices
    .map((c, i) => `${i + 1}) ${c}`)
    .join("\n");

  const text = [
    "Grammar quiz from Kaja Korean",
    "",
    "Look at the picture, then pick the best answer.",
    "",
    "Choices:",
    choiceLines,
    "",
    `Answer: ${answerLabel}`,
    trial.korean ? `Focus: ${trial.korean}` : "",
    trial.replyText || "",
    "",
    `Image: ${trial.imageUrl}`,
    `Practice more: ${practiceUrl}`,
    tutorText,
    "",
    `App Store: ${appStoreUrl}`,
    playStoreUrl ? `Google Play: ${playStoreUrl}` : "",
    "",
    unsubText,
  ]
    .filter(Boolean)
    .join("\n");

  const choicesHtml = choices
    .map(
      (c, i) => `
        <tr>
          <td style="padding:8px 0;font-size:15px;color:#1d1d1f;">
            <span style="display:inline-block;min-width:28px;font-weight:700;color:#0071e3;">${i + 1})</span>
            ${escapeHtml(c)}
          </td>
        </tr>`,
    )
    .join("");

  const playStoreHtml = playStoreUrl
    ? `<a href="${escapeHtml(playStoreUrl)}" style="display:inline-block;margin-left:10px;">
        <img src="${base}/brand/store-badges/google-play.png" alt="Get it on Google Play" width="134" height="40" style="display:block;border:0;height:40px;width:auto;" />
      </a>`
    : "";

  const focusBit = trial.focus?.trim()
    ? escapeHtml(trial.focus.trim())
    : "grammar";
  const levelBit =
    typeof trial.level === "number" ? ` · Level ${trial.level}` : "";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.55;color:#1d1d1f;max-width:560px;margin:0 auto;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0071e3;letter-spacing:0.02em;text-transform:uppercase;">Grammar quiz</p>
      <h2 style="margin:0 0 14px;font-size:24px;line-height:1.25;">What goes in the blank?</h2>
      <p style="margin:0 0 18px;font-size:15px;color:#424245;">
        Look at the picture, then pick the best answer (${escapeHtml(focusBit)}${levelBit}).
      </p>

      <div style="margin:0 0 18px;text-align:center;">
        <img src="${escapeHtml(trial.imageUrl)}" alt="Grammar quiz scene" width="520" height="693" style="display:block;margin:0 auto;max-width:100%;width:100%;height:auto;border-radius:16px;border:1px solid #e5e5ea;" />
      </div>

      <p style="margin:0 0 8px;font-size:15px;font-weight:600;">Choices</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
        ${choicesHtml}
      </table>

      <div style="margin:0;padding:16px 18px;border-radius:16px;background:#f5f5f7;">
        <div style="font-size:13px;color:#6e6e73;margin-bottom:6px;">Answer</div>
        <div style="font-size:18px;font-weight:700;">${escapeHtml(answerLabel)}</div>
        ${
          trial.korean
            ? `<div style="margin-top:10px;font-size:14px;color:#424245;">Focus: <strong>${escapeHtml(trial.korean)}</strong></div>`
            : ""
        }
        ${
          trial.sceneMeaning
            ? `<div style="margin-top:10px;font-size:14px;color:#6e6e73;">${escapeHtml(trial.sceneMeaning)}</div>`
            : ""
        }
      </div>

      <div style="margin:26px 0 0;text-align:center;">
        <a href="${escapeHtml(practiceUrl)}" style="display:inline-block;background:#0071e3;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;">
          Practice more
        </a>
      </div>

      ${tutorHtml}

      <div style="margin:24px 0 0;text-align:center;">
        <div style="font-size:13px;color:#6e6e73;margin-bottom:12px;">Get the vocab quiz app</div>
        <a href="${escapeHtml(appStoreUrl)}" style="display:inline-block;">
          <img src="${base}/brand/store-badges/app-store.svg" alt="Download on the App Store" width="120" height="40" style="display:block;border:0;height:40px;width:auto;" />
        </a>
        ${playStoreHtml}
      </div>

      ${unsubHtml}
    </div>
  `.trim();

  return { subject, html, text };
}
