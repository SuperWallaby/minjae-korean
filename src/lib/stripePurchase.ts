/** localStorage: last verified Stripe checkout on this device (convenience only; email is source of truth). */
export const LAST_STRIPE_PURCHASE_STORAGE_KEY = "mj_last_stripe_purchase_v1";

export type LastStripePurchaseStored = {
  sessionId: string;
  product: string;
  savedAt: number;
};

/** Public PDF filename in /public (URL-encoded in href). */
const BOOK_PDF_FILE = "[Korean] Beyond Translation.pdf";

export const BOOK_PDF_HREF = `/${encodeURIComponent(BOOK_PDF_FILE)}`;

export function maskEmailForDisplay(email: string) {
  const t = email.trim().toLowerCase();
  const at = t.indexOf("@");
  if (at < 1) return "";
  const local = t.slice(0, at);
  const domain = t.slice(at + 1);
  if (!domain) return "";
  const vis =
    local.length <= 2 ? local[0] + "•" : local.slice(0, 2) + "•••";
  return `${vis}@${domain}`;
}
