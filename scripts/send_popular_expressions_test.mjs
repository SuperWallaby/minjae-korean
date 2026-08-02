#!/usr/bin/env node
/**
 * Local preview / one-off test for popular-expressions newsletter.
 *
 *   npx tsx scripts/send_popular_expressions_test.mjs
 *   npx tsx scripts/send_popular_expressions_test.mjs you@example.com
 */
import { loadEnvLocal } from "./lib/env_local.mjs";

async function main() {
  loadEnvLocal();
  const email = (process.argv[2] || "").trim().toLowerCase();

  const {
    buildPopularExpressionsDigest,
    buildPopularExpressionsEmail,
  } = await import("../src/lib/newsletterPopularExpressions.ts");

  const digest = buildPopularExpressionsDigest();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";
  const mail = buildPopularExpressionsEmail({
    digest,
    siteUrl,
    recipientEmail: email || "preview@example.com",
  });

  console.log("weekKey:", digest.weekKey);
  console.log(
    "pins:",
    digest.pins.map((p) => ({
      id: p.bundleId,
      format: p.format,
      ageDays: p.pinAgeDays != null ? Number(p.pinAgeDays.toFixed(1)) : null,
      score: p.popularityScore != null ? Number(p.popularityScore.toFixed(2)) : null,
      saves: p.saveCount ?? null,
      impressions: p.impressionCount ?? null,
      pinnedAt: p.pinnedAt || null,
    })),
  );
  console.log("subject:", mail.subject);
  console.log("--- text ---");
  console.log(mail.text);

  if (!email) {
    console.log(
      "\n(No email arg — preview only. Pass an address to send via Resend.)",
    );
    return;
  }

  const { sendResendEmail } = await import("../src/lib/resendEmail.ts");
  await sendResendEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  console.log(`\nSent test to ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
