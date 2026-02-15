import { NextRequest } from "next/server";
import { DateTime } from "luxon";

import { listAllBookings, patchBooking, type Booking } from "@/lib/bookingsRepo";
import { getSlotsByIds } from "@/lib/slotsRepo";

export const runtime = "nodejs";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function adminEmails(): string[] {
  const raw = (process.env.REMINDER_ADMIN_EMAILS ?? "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x && isEmail(x));
}

async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = mustEnv("RESEND_API_KEY");
  const from = mustEnv("RESEND_FROM_EMAIL");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  const j = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      j && typeof j === "object" && "message" in j
        ? String((j as { message?: unknown }).message ?? "")
        : `HTTP ${res.status}`;
    throw new Error(`Resend failed: ${msg}`);
  }
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

type ReminderKind = "24h" | "30m";

function reminderWindow(kind: ReminderKind) {
  // Run this endpoint via cron every ~5 minutes.
  if (kind === "24h") return { targetMs: 24 * 60 * 60 * 1000, windowMs: 15 * 60 * 1000 };
  return { targetMs: 30 * 60 * 1000, windowMs: 10 * 60 * 1000 };
}

function fmtSeoul(dateKey: string, startMin: number, endMin: number) {
  const start = DateTime.fromISO(dateKey, { zone: BUSINESS_TIME_ZONE })
    .startOf("day")
    .plus({ minutes: startMin });
  const end = DateTime.fromISO(dateKey, { zone: BUSINESS_TIME_ZONE })
    .startOf("day")
    .plus({ minutes: endMin });
  return {
    start,
    end,
    label: `${start.toFormat("ccc, MMM d")} · ${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")} (Seoul Time)`,
    startMs: start.toUTC().toMillis(),
  };
}

function meetingLinks(args: {
  bookingKey: string;
  meetUrl?: string;
  meetingProvider?: string;
}) {
  const base = baseUrl().replace(/\/$/, "");
  const callFallback = `${base}/call/${encodeURIComponent(args.bookingKey)}`;
  const join = `${base}/join/${encodeURIComponent(args.bookingKey)}`;
  const adminCall = `${base}/admin/call/${encodeURIComponent(args.bookingKey)}`;
  const meetUrl = (args.meetUrl ?? "").trim();
  const provider = (args.meetingProvider ?? "").trim();
  const call = meetUrl ? meetUrl : provider === "google_meet" ? join : callFallback;
  return { call, adminCall, meetUrl, join, provider };
}

function template(args: {
  kind: ReminderKind;
  name: string;
  bookingKey: string;
  meetUrl?: string;
  meetingProvider?: string;
  timeLabel: string;
}) {
  const when =
    args.kind === "24h" ? "tomorrow" : "soon";
  const subject =
    args.kind === "24h"
      ? `Reminder: your Korean session is ${when}`
      : "Reminder: your Korean session starts soon";
  const { call, meetUrl, provider } = meetingLinks({
    bookingKey: args.bookingKey,
    meetUrl: args.meetUrl,
    meetingProvider: args.meetingProvider,
  });
  const footer = meetUrl
    ? "Tip: If Minjae isn’t there yet, Google Meet may show “Waiting for host”."
    : provider === "google_meet"
      ? "We’re preparing your Google Meet link. If you don’t see it, please contact Minjae."
      : "Lobby opens 10 minutes before class.";
  const text = `Hi ${args.name || "there"},\n\nThis is a reminder that your Korean session with Minjae is scheduled ${when}.\n\nTime: ${args.timeLabel}\nLink: ${call}\n\n${footer}\n\n— Kaja`;
  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
    <h2 style="margin: 0 0 10px;">See you ${when}</h2>
    <p style="margin: 0 0 14px;">Your Korean session with Minjae is scheduled.</p>
    <p style="margin: 0 0 6px;"><b>Time</b>: ${args.timeLabel}</p>
    <p style="margin: 0 0 18px;"><b>Session link</b>: <a href="${call}">${call}</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 12px;">${
      meetUrl
        ? "Tip: Google Meet may show “Waiting for host” if Minjae isn’t there yet."
        : provider === "google_meet"
          ? "We’re preparing your Google Meet link. If you don’t see it, please contact Minjae."
          : "Lobby opens 10 minutes before class."
    }</p>
  </div>
  `.trim();
  return { subject, text, html };
}

function adminTemplate(args: {
  kind: ReminderKind;
  memberName: string;
  memberEmail: string;
  bookingKey: string;
  meetUrl?: string;
  meetingProvider?: string;
  timeLabel: string;
}) {
  const { adminCall, call } = meetingLinks({
    bookingKey: args.bookingKey,
    meetUrl: args.meetUrl,
    meetingProvider: args.meetingProvider,
  });
  const subject =
    args.kind === "24h"
      ? `Tomorrow: session booked (${args.memberName || "Member"})`
      : `Starting soon: session (${args.memberName || "Member"})`;
  const text = `Session reminder.\n\nMember: ${args.memberName} <${args.memberEmail}>\nTime: ${args.timeLabel}\nAdmin link: ${adminCall}\nMember link: ${call}\n`;
  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
    <h2 style="margin: 0 0 10px;">Session reminder</h2>
    <p style="margin: 0 0 6px;"><b>Member</b>: ${args.memberName} &lt;${args.memberEmail}&gt;</p>
    <p style="margin: 0 0 6px;"><b>Time</b>: ${args.timeLabel}</p>
    <p style="margin: 0 0 12px;"><b>Admin link</b>: <a href="${adminCall}">${adminCall}</a></p>
    <p style="margin: 0 0 12px;"><b>Member link</b>: <a href="${call}">${call}</a></p>
  </div>
  `.trim();
  return { subject, text, html };
}

function shouldSend(msUntilStart: number, kind: ReminderKind) {
  const { targetMs, windowMs } = reminderWindow(kind);
  return msUntilStart <= targetMs && msUntilStart > targetMs - windowMs;
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminKey(req);
    if (!auth.ok) return json(401, { ok: false, error: auth.error });

    const bookings: Booking[] = await listAllBookings(5000);
    const slotIds = Array.from(new Set(bookings.map((b) => b.slotId).filter(Boolean)));
    const slots = await getSlotsByIds(slotIds);
    const slotById = new Map(slots.map((s) => [s.id, s] as const));
    const admins = adminEmails();

    const nowMs = DateTime.utc().toMillis();
    const results: Array<{ id: string; kind: ReminderKind; to: string }> = [];

    for (const b of bookings) {
      if (!b || b.status !== "confirmed") continue;
      const slot = slotById.get(b.slotId);
      if (!slot) continue;

      const { label, startMs } = fmtSeoul(slot.dateKey, slot.startMin, slot.startMin + b.durationMin);
      const msUntil = startMs - nowMs;
      if (msUntil <= 0) continue;

      const bookingKey = String(b.code || b.id);
      const memberEmail = (b.email ?? "").trim().toLowerCase();
      const memberName = (b.name ?? "").trim() || "Member";

      for (const kind of ["24h", "30m"] as const) {
        const should = shouldSend(msUntil, kind);
        if (!should) continue;

        // Member email
        const memberField: "reminder24hSentAt" | "reminder30mSentAt" =
          kind === "24h" ? "reminder24hSentAt" : "reminder30mSentAt";
        if (isEmail(memberEmail) && !b[memberField]) {
          const t = template({
            kind,
            name: memberName,
            bookingKey,
            meetUrl: b.meetUrl,
            meetingProvider: b.meetingProvider,
            timeLabel: label,
          });
          await sendResendEmail({ to: memberEmail, ...t });
          await patchBooking(b.id, { [memberField]: new Date().toISOString() } as Partial<Booking>);
          results.push({ id: b.id, kind, to: memberEmail });
        }

        // Admin email(s)
        const adminField:
          | "reminder24hAdminSentAt"
          | "reminder30mAdminSentAt" =
          kind === "24h" ? "reminder24hAdminSentAt" : "reminder30mAdminSentAt";
        if (admins.length > 0 && !b[adminField]) {
          for (const to of admins) {
            const t = adminTemplate({
              kind,
              memberName,
              memberEmail: memberEmail || "(missing)",
              bookingKey,
              meetUrl: b.meetUrl,
              meetingProvider: b.meetingProvider,
              timeLabel: label,
            });
            await sendResendEmail({ to, ...t });
            results.push({ id: b.id, kind, to });
          }
          await patchBooking(b.id, { [adminField]: new Date().toISOString() } as Partial<Booking>);
        }
      }
    }

    return json(200, { ok: true, sent: results.length, results });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

