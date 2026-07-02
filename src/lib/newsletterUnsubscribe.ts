import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return (
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.AUTH_JWT_SECRET?.trim() ||
    process.env.ADMIN_API_KEY?.trim() ||
    ""
  );
}

export function newsletterUnsubscribeToken(email: string): string {
  const key = secret();
  if (!key) throw new Error("Missing NEWSLETTER_UNSUBSCRIBE_SECRET or AUTH_JWT_SECRET");
  const normalized = email.trim().toLowerCase();
  return createHmac("sha256", key)
    .update(`newsletter-unsub:${normalized}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyNewsletterUnsubscribeToken(
  email: string,
  token: string,
): boolean {
  const expected = newsletterUnsubscribeToken(email);
  const got = token.trim();
  if (!got || got.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function newsletterUnsubscribeUrl(email: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const normalized = encodeURIComponent(email.trim().toLowerCase());
  const token = newsletterUnsubscribeToken(email);
  return `${base}/api/public/newsletter/unsubscribe?email=${normalized}&token=${token}`;
}
