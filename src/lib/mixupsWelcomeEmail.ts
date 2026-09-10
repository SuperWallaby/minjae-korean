import type { NewsletterSubscriber } from "@/lib/newsletterSubscribersRepo";
import {
  MIXUPS_LIST,
  mixupsCopyForLang,
  mixupsPath,
} from "@/lib/pronounceMixups";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";
import {
  newsletterUnsubscribeHtml,
  newsletterUnsubscribeText,
} from "@/lib/newsletterEmailFooter";

export function isMixupsSubscribe(body: {
  list?: unknown;
  source?: unknown;
}): boolean {
  if (body.list === MIXUPS_LIST) return true;
  const source = typeof body.source === "string" ? body.source : "";
  return source.startsWith("getpronounce_mixups");
}

export function buildMixupsWelcomeEmail(email: string, lang?: string) {
  const origin = pronounceSiteOrigin();
  const copy = mixupsCopyForLang(lang);
  const pageUrl = `${origin}${mixupsPath(copy.lang)}`;
  const footerHtml = newsletterUnsubscribeHtml({
    recipientEmail: email,
    siteUrl: origin,
  });
  const footerText = newsletterUnsubscribeText({
    recipientEmail: email,
    siteUrl: origin,
  });
  const subject = `[GetPronounce] ${copy.langName} mix-ups — you're on the list`;
  const text = [
    `You're on the ${copy.langName} mix-ups list.`,
    "",
    `Each week: one pair English speakers mix up, plus a few new ${copy.langName} words, with audio.`,
    "Confirmation is this email. The first audio set goes out on the next weekly send.",
    "",
    pageUrl,
    "",
    footerText,
  ].join("\n");
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.55; color: #1b1511; max-width: 520px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#5c5348;">${copy.kicker}</p>
      <h2 style="margin: 0 0 12px; font-size: 20px;">You're on the mix-ups list</h2>
      <p style="margin: 0 0 14px;">Each week you'll get <strong>one pair English speakers mix up</strong>, plus a few new ${copy.langName} words, with audio. Not a long newsletter.</p>
      <p style="margin: 0 0 18px;">This email is the confirmation. The first audio set goes out on the next weekly send.</p>
      <p style="margin: 0 0 8px;"><a href="${pageUrl}" style="color:#1b1511;">How the list works</a></p>
      ${footerHtml}
    </div>
  `.trim();
  return { subject, text, html };
}

export function subscriberIsMixups(
  row: Pick<NewsletterSubscriber, "lists">,
): boolean {
  return (row.lists || []).includes(MIXUPS_LIST);
}
