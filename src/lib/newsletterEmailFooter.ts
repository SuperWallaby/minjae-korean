import {
  ITALKI_AFFILIATE_URL,
  PREPLY_AFFILIATE_URL,
} from "@/lib/affiliateTutor";
import { newsletterUnsubscribeUrl } from "@/lib/newsletterUnsubscribe";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function withNewsletterUtm(rawUrl: string, campaign: string): string {
  try {
    const u = new URL(rawUrl);
    if (!u.searchParams.get("utm_source")) {
      u.searchParams.set("utm_source", "newsletter");
    }
    if (!u.searchParams.get("utm_medium")) {
      u.searchParams.set("utm_medium", "email");
    }
    if (!u.searchParams.get("utm_campaign")) {
      u.searchParams.set("utm_campaign", campaign);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

export function newsletterTutorLinks(campaign: string) {
  return {
    italki: withNewsletterUtm(ITALKI_AFFILIATE_URL, campaign),
    preply: withNewsletterUtm(PREPLY_AFFILIATE_URL, campaign),
  };
}

/** Find a Korean tutor — two affiliate buttons (place above app badges). */
export function newsletterTutorCtaHtml(campaign: string): string {
  const { italki, preply } = newsletterTutorLinks(campaign);
  return `
      <div style="margin:28px 0 0;padding:18px 16px;border-radius:16px;background:#f5f5f7;text-align:center;">
        <div style="font-size:15px;font-weight:700;color:#1d1d1f;margin:0 0 6px;">Find a Korean tutor</div>
        <div style="font-size:13px;color:#6e6e73;margin:0 0 14px;line-height:1.45;">
          Ready for real conversation? Book 1:1 lessons with our partners.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            <td style="padding:0 6px 8px;">
              <a href="${escapeHtml(italki)}" style="display:inline-block;background:#0071e3;color:#ffffff;padding:11px 16px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap;">
                italki · $10 OFF
              </a>
            </td>
            <td style="padding:0 6px 8px;">
              <a href="${escapeHtml(preply)}" style="display:inline-block;background:#1d1d1f;color:#ffffff;padding:11px 16px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap;">
                Preply · 50%
              </a>
            </td>
          </tr>
        </table>
      </div>
  `.trim();
}

export function newsletterTutorCtaText(campaign: string): string {
  const { italki, preply } = newsletterTutorLinks(campaign);
  return [
    "Find a Korean tutor:",
    `italki ($10 OFF): ${italki}`,
    `Preply (50%): ${preply}`,
  ].join("\n");
}

export function newsletterUnsubscribeHtml(args: {
  recipientEmail: string;
  siteUrl: string;
}): string {
  const base = args.siteUrl.replace(/\/+$/, "");
  const unsubscribeUrl = newsletterUnsubscribeUrl(args.recipientEmail, base);
  return `
      <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#86868b;text-align:center;">
        You are receiving this because you subscribed at Kaja Korean.<br />
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#0071e3;">Unsubscribe</a>
      </p>
  `.trim();
}

export function newsletterUnsubscribeText(args: {
  recipientEmail: string;
  siteUrl: string;
}): string {
  const base = args.siteUrl.replace(/\/+$/, "");
  const unsubscribeUrl = newsletterUnsubscribeUrl(args.recipientEmail, base);
  return `Unsubscribe: ${unsubscribeUrl}`;
}

/** Full footer when there is no separate app-store block (e.g. welcome). */
export function newsletterEmailFooterHtml(args: {
  recipientEmail: string;
  siteUrl: string;
  campaign: string;
}): string {
  return [
    newsletterTutorCtaHtml(args.campaign),
    newsletterUnsubscribeHtml(args),
  ].join("\n");
}

export function newsletterEmailFooterText(args: {
  recipientEmail: string;
  siteUrl: string;
  campaign: string;
}): string {
  return [
    newsletterTutorCtaText(args.campaign),
    "",
    newsletterUnsubscribeText(args),
  ].join("\n");
}
