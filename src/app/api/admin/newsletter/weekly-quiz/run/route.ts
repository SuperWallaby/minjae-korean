import { NextRequest } from "next/server";

import {
  finishNewsletterQuizWeekRun,
  getNewsletterQuizWeekRun,
  markNewsletterQuizWeekStarted,
} from "@/lib/newsletterQuizLogsRepo";
import { listActiveNewsletterSubscribers } from "@/lib/newsletterSubscribersRepo";
import {
  buildWeeklyPictureQuiz,
  buildWeeklyQuizEmail,
  newsletterWeekKey,
} from "@/lib/newsletterWeeklyQuiz";
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

export async function GET(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) return json(401, { ok: false, error: auth.error });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const force = req.nextUrl.searchParams.get("force") === "1";
  const weekKey = req.nextUrl.searchParams.get("week")?.trim() || newsletterWeekKey();

  try {
    if (!force) {
      const existing = await getNewsletterQuizWeekRun(weekKey);
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

    const quiz = await buildWeeklyPictureQuiz(weekKey);
    const subscribers = await listActiveNewsletterSubscribers();
    const base = siteUrl();

    if (dryRun) {
      const preview = buildWeeklyQuizEmail({
        quiz,
        siteUrl: base,
        recipientEmail: subscribers[0]?.email || "preview@example.com",
      });
      return json(200, {
        ok: true,
        dryRun: true,
        weekKey,
        quiz,
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
        reason: "no_subscribers",
        weekKey,
        quiz,
      });
    }

    await markNewsletterQuizWeekStarted({
      weekKey,
      quizWord: quiz.word,
      quizId: quiz.targetQuizId,
    });

    let sent = 0;
    let failed = 0;
    const errors: { email: string; error: string }[] = [];

    for (const subscriber of subscribers) {
      try {
        const mail = buildWeeklyQuizEmail({
          quiz,
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

    await finishNewsletterQuizWeekRun({
      weekKey,
      recipientCount: sent,
      failedCount: failed,
    });

    return json(200, {
      ok: true,
      weekKey,
      quiz: {
        word: quiz.word,
        targetQuizId: quiz.targetQuizId,
        answer: quiz.options.find((o) => o.correct)?.letter,
      },
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
