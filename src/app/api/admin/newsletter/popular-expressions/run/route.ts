import { NextRequest } from "next/server";

import { flattenExpressionPinsForEmail } from "@/lib/newsletterExpressionImageEmail";
import {
  finishNewsletterPopularExpressionsWeekRun,
  getNewsletterPopularExpressionsWeekRun,
  markNewsletterPopularExpressionsWeekStarted,
} from "@/lib/newsletterPopularExpressionsLogsRepo";
import {
  buildPopularExpressionsDigest,
  buildPopularExpressionsEmail,
  popularExpressionsWeekKey,
} from "@/lib/newsletterPopularExpressions";
import { listActiveNewsletterSubscribers } from "@/lib/newsletterSubscribersRepo";
import { sendResendEmail } from "@/lib/resendEmail";

export const runtime = "nodejs";
export const maxDuration = 300;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireAdminKey(req: NextRequest) {
  const expected = (process.env.ADMIN_API_KEY ?? "").trim();
  if (!expected) return { ok: false as const, error: "Missing ADMIN_API_KEY" };
  const got =
    (req.headers.get("x-admin-key") ?? "").trim() ||
    (req.nextUrl.searchParams.get("key") ?? "").trim();
  if (!got || got !== expected) return { ok: false as const, error: "Unauthorized" };
  return { ok: true as const };
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function GET(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) return json(401, { ok: false, error: auth.error });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const force = req.nextUrl.searchParams.get("force") === "1";
  const testTo =
    req.nextUrl.searchParams.get("testTo")?.trim().toLowerCase() || "";
  const weekKey =
    req.nextUrl.searchParams.get("week")?.trim() ||
    popularExpressionsWeekKey();

  if (testTo && !isEmail(testTo)) {
    return json(400, { ok: false, error: "Invalid testTo email" });
  }

  try {
    if (!force && !testTo) {
      const existing = await getNewsletterPopularExpressionsWeekRun(weekKey);
      if (existing) {
        return json(200, {
          ok: true,
          skipped: true,
          reason: "already_sent",
          weekKey,
          existing,
        });
      }
    }

    const digest = buildPopularExpressionsDigest(weekKey);
    const subscribers = testTo
      ? [{ email: testTo, subscribedAt: new Date().toISOString() }]
      : await listActiveNewsletterSubscribers();
    const base = siteUrl();
    const emailDigest = dryRun
      ? digest
      : await flattenExpressionPinsForEmail(digest);

    if (dryRun) {
      const preview = buildPopularExpressionsEmail({
        digest: emailDigest,
        siteUrl: base,
        recipientEmail: subscribers[0]?.email || "preview@example.com",
      });
      return json(200, {
        ok: true,
        dryRun: true,
        weekKey,
        pins: digest.pins.map((p) => ({
          bundleId: p.bundleId,
          title: p.title,
          format: p.format,
          pinnedAt: p.pinnedAt,
          imageUrl: p.imageUrl,
        })),
        subscriberCount: subscribers.length,
        preview: {
          subject: preview.subject,
          text: preview.text,
        },
      });
    }

    if (subscribers.length === 0) {
      return json(200, {
        ok: true,
        skipped: true,
        reason: testTo ? "invalid_test_to" : "no_subscribers",
        weekKey,
        pins: digest.pins.map((p) => p.bundleId),
      });
    }

    if (!testTo) {
      await markNewsletterPopularExpressionsWeekStarted({
        weekKey,
        pinIds: digest.pins.map((p) => p.bundleId),
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: { email: string; error: string }[] = [];

    for (const subscriber of subscribers) {
      try {
        const mail = buildPopularExpressionsEmail({
          digest: emailDigest,
          siteUrl: base,
          recipientEmail: subscriber.email,
        });
        await sendResendEmail({
          to: subscriber.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        });
        sent += 1;
      } catch (e) {
        failed += 1;
        errors.push({
          email: subscriber.email,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      await sleep(250);
    }

    if (!testTo) {
      await finishNewsletterPopularExpressionsWeekRun({
        weekKey,
        recipientCount: sent,
        failedCount: failed,
      });
    }

    return json(200, {
      ok: true,
      weekKey,
      testTo: testTo || undefined,
      pins: digest.pins.map((p) => ({
        bundleId: p.bundleId,
        title: p.title,
        format: p.format,
      })),
      sent,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (e) {
    return json(500, {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
