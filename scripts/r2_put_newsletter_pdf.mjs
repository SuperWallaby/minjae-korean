#!/usr/bin/env node
/**
 * Upload newsletter welcome PDF to public R2.
 *
 *   npm run newsletter:upload-pdf
 *   node scripts/r2_put_newsletter_pdf.mjs [path-to-pdf]
 *
 * Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 * Optional: NEWSLETTER_PDF_R2_KEY (default downloads/kaja-korean-book-preview.pdf)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import { hasR2Config, uploadBufferToR2 } from "./lib/r2_upload.mjs";

const DEFAULT_SOURCE = resolve(ROOT, "book-preview-sample.pdf");
const DEFAULT_KEY = "downloads/kaja-korean-book-preview.pdf";

async function main() {
  loadEnvLocal();
  if (!hasR2Config()) {
    throw new Error(
      "Missing R2 env — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL",
    );
  }

  const source = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : DEFAULT_SOURCE;
  const key = process.env.NEWSLETTER_PDF_R2_KEY?.trim() || DEFAULT_KEY;
  const buffer = readFileSync(source);

  console.error(`[newsletter-pdf] uploading ${source} (${buffer.length} bytes) → ${key}`);
  const publicUrl = await uploadBufferToR2(key, buffer, "application/pdf");
  console.log(
    JSON.stringify(
      {
        ok: true,
        key,
        publicUrl,
        envHint: `NEWSLETTER_WELCOME_PDF_URL=${publicUrl}`,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
