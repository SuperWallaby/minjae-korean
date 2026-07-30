import { DateTime } from "luxon";

import expressionPinsFile from "@/data/newsletter/expression-pins.json";
import { getKoreanQuizAppStoreLinks } from "@/lib/koreanQuizAppLinks";
import { newsletterUnsubscribeUrl } from "@/lib/newsletterUnsubscribe";
import { vocabSeoPath } from "@/lib/vocabInfographic/seo";

const BUSINESS_TIME_ZONE = "Asia/Seoul";
const MIN_PIN_AGE_DAYS = 10;
const PINS_PER_EMAIL = 1;
/** Prefer spoken phrase stacks for “popular expressions”. */
const PREFERRED_FORMATS = ["phrase_stack"] as const;

export type ExpressionPinWord = {
  hangul: string;
  romanization?: string;
  english: string;
};

export type ExpressionPinCandidate = {
  bundleId: string;
  slug: string;
  format: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageThumbUrl?: string;
  words: ExpressionPinWord[];
  pinnedAt?: string | null;
  pinTitle?: string;
};

export type PopularExpressionsDigest = {
  weekKey: string;
  pins: ExpressionPinCandidate[];
};

type ExpressionPinsFile = {
  generatedAt?: string;
  items?: ExpressionPinCandidate[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function popularExpressionsWeekKey(
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

function pinAgeDays(pinnedAt: string | null | undefined, nowMs: number): number | null {
  if (!pinnedAt) return null;
  const t = Date.parse(pinnedAt);
  if (!Number.isFinite(t)) return null;
  return (nowMs - t) / 86_400_000;
}

function loadCandidates(): ExpressionPinCandidate[] {
  const file = expressionPinsFile as ExpressionPinsFile;
  return (file.items ?? []).filter(
    (item) =>
      item.bundleId?.trim() &&
      item.slug?.trim() &&
      item.imageUrl?.trim() &&
      item.title?.trim(),
  );
}

function pickPool(all: ExpressionPinCandidate[], nowMs: number): ExpressionPinCandidate[] {
  const mature = all.filter((item) => {
    const age = pinAgeDays(item.pinnedAt, nowMs);
    return age == null || age >= MIN_PIN_AGE_DAYS;
  });
  const preferredMature = mature.filter((item) =>
    (PREFERRED_FORMATS as readonly string[]).includes(item.format),
  );
  if (preferredMature.length >= PINS_PER_EMAIL) return preferredMature;
  if (mature.length >= PINS_PER_EMAIL) return mature;

  const preferredAny = all.filter((item) =>
    (PREFERRED_FORMATS as readonly string[]).includes(item.format),
  );
  if (preferredAny.length >= PINS_PER_EMAIL) return preferredAny;
  return all;
}

export function buildPopularExpressionsDigest(
  weekKey = popularExpressionsWeekKey(),
  nowMs = Date.now(),
): PopularExpressionsDigest {
  const all = loadCandidates();
  if (all.length < PINS_PER_EMAIL) {
    throw new Error(
      `Not enough expression pins for newsletter (need ${PINS_PER_EMAIL}+, have ${all.length}). Run: node scripts/sync-newsletter-expression-pins.mjs`,
    );
  }

  const pool = pickPool(all, nowMs);
  const shuffled = seededShuffle(pool, hashString(`popular-expr:${weekKey}`));
  const pins = shuffled.slice(0, PINS_PER_EMAIL).map((pin) => ({
    ...pin,
    words: (pin.words ?? []).slice(0, 5),
  }));

  return { weekKey, pins };
}

export function buildPopularExpressionsEmail(args: {
  digest: PopularExpressionsDigest;
  siteUrl: string;
  recipientEmail: string;
}): { subject: string; html: string; text: string } {
  const { digest, siteUrl, recipientEmail } = args;
  const base = siteUrl.replace(/\/+$/, "");
  const { appStoreUrl, playStoreUrl } = getKoreanQuizAppStoreLinks();
  const unsubscribeUrl = newsletterUnsubscribeUrl(recipientEmail, base);
  const hubUrl = `${base}/vocab?utm_source=newsletter&utm_campaign=popular-expressions`;

  const subject = "This week's popular Korean expression";

  const pinBlocksText = digest.pins
    .map((pin) => {
      const pageUrl = `${base}${vocabSeoPath(pin.bundleId, pin.slug)}?utm_source=newsletter&utm_campaign=popular-expressions`;
      const glosses = (pin.words ?? [])
        .slice(0, 4)
        .map((w) => {
          const rom = w.romanization?.trim() ? ` [${w.romanization}]` : "";
          return `  - ${w.hangul}${rom} — ${w.english}`;
        })
        .join("\n");
      return [
        pin.title,
        glosses,
        `  ${pageUrl}`,
        `  Image: ${pin.imageUrl}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const text = [
    "This week's popular Korean expression from What is this in Korean",
    "",
    "One of our popular expression pins — save it and practice out loud.",
    "",
    pinBlocksText,
    "",
    `Browse more: ${hubUrl}`,
    `App Store: ${appStoreUrl}`,
    playStoreUrl ? `Google Play: ${playStoreUrl}` : "",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const pinCardsHtml = digest.pins
    .map((pin) => {
      const pageUrl = `${base}${vocabSeoPath(pin.bundleId, pin.slug)}?utm_source=newsletter&utm_campaign=popular-expressions`;
      const glossRows = (pin.words ?? [])
        .slice(0, 4)
        .map(
          (w) => `
            <tr>
              <td style="padding:4px 0;font-size:14px;font-weight:600;color:#1d1d1f;vertical-align:top;">${escapeHtml(w.hangul)}</td>
              <td style="padding:4px 0 4px 10px;font-size:13px;color:#6e6e73;vertical-align:top;">
                ${w.romanization?.trim() ? `${escapeHtml(w.romanization)} · ` : ""}${escapeHtml(w.english)}
              </td>
            </tr>
          `,
        )
        .join("");

      return `
        <div style="margin:0 0 22px;padding:0;border:1px solid #e5e5ea;border-radius:18px;overflow:hidden;background:#ffffff;">
          <a href="${escapeHtml(pageUrl)}" style="display:block;text-decoration:none;">
            <img
              src="${escapeHtml(pin.imageUrl)}"
              alt="${escapeHtml(pin.title)}"
              width="560"
              style="display:block;width:100%;max-width:560px;height:auto;border:0;"
            />
          </a>
          <div style="padding:16px 18px 18px;">
            <div style="font-size:17px;font-weight:700;color:#1d1d1f;margin:0 0 10px;">${escapeHtml(pin.title)}</div>
            ${
              glossRows
                ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${glossRows}</table>`
                : ""
            }
            <div style="margin-top:14px;">
              <a href="${escapeHtml(pageUrl)}" style="display:inline-block;font-size:14px;font-weight:600;color:#0071e3;text-decoration:none;">
                Open chart →
              </a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const playStoreHtml = playStoreUrl
    ? `<a href="${escapeHtml(playStoreUrl)}" style="display:inline-block;margin-left:10px;">
        <img src="${base}/brand/store-badges/google-play.png" alt="Get it on Google Play" width="134" height="40" style="display:block;border:0;height:40px;width:auto;" />
      </a>`
    : "";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.55;color:#1d1d1f;max-width:560px;margin:0 auto;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0071e3;letter-spacing:0.02em;text-transform:uppercase;">Popular expression</p>
      <h2 style="margin:0 0 14px;font-size:24px;line-height:1.25;">This week's popular Korean expression</h2>
      <p style="margin:0 0 22px;font-size:15px;color:#424245;">
        One of our popular expression pins — glance, save, and say it out loud.
      </p>

      ${pinCardsHtml}

      <div style="margin:8px 0 0;text-align:center;">
        <a href="${escapeHtml(hubUrl)}" style="display:inline-block;background:#0071e3;color:#ffffff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;">
          Browse more vocab charts
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
        You are receiving this because you subscribed at What is this in Korean.<br />
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#0071e3;">Unsubscribe</a>
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}
