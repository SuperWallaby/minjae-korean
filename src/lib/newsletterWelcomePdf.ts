/** Stable public R2 object for subscribe welcome email (see scripts/r2_put_newsletter_pdf.mjs). */
export const NEWSLETTER_WELCOME_PDF_R2_KEY =
  "downloads/kaja-korean-book-preview.pdf";

export const NEWSLETTER_WELCOME_PDF_DEFAULT_URL =
  "https://file.kajakorean.com/downloads/kaja-korean-book-preview.pdf";

export const NEWSLETTER_WELCOME_BOOK_COVER_PATH = "/book-samples/book-cover.png";

export function resolveNewsletterWelcomePdfUrl(): string {
  const fromEnv = process.env.NEWSLETTER_WELCOME_PDF_URL?.trim();
  if (fromEnv) return fromEnv;

  const publicBase = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (publicBase) {
    return `${publicBase}/${NEWSLETTER_WELCOME_PDF_R2_KEY}`;
  }

  return NEWSLETTER_WELCOME_PDF_DEFAULT_URL;
}

/** Absolute HTTPS URL for book cover image in welcome email `<img>`. */
export function resolveNewsletterWelcomeBookCoverUrl(): string {
  const fromEnv = process.env.NEWSLETTER_WELCOME_BOOK_COVER_URL?.trim();
  if (fromEnv) return fromEnv;

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";
  return `${site}${NEWSLETTER_WELCOME_BOOK_COVER_PATH}`;
}
