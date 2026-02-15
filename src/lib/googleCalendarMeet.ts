// Server-only helper for creating Google Meet links via Google Calendar API.
//
// Auth model: single organizer Google account with OAuth2 refresh_token.
// This file must only be imported from server/runtime="nodejs" routes.

type TokenCache = { accessToken: string; expiresAtMs: number };

let cached: TokenCache | null = null;

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export async function getGoogleAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAtMs - now > 30_000) return cached.accessToken;

  const clientId = mustEnv("GOOGLE_CALENDAR_CLIENT_ID");
  const clientSecret = mustEnv("GOOGLE_CALENDAR_CLIENT_SECRET");
  const refreshToken = mustEnv("GOOGLE_CALENDAR_REFRESH_TOKEN");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const r = asRecord(json);
    const msg =
      safeString(r?.error_description) || safeString(r?.error) || `HTTP ${res.status}`;
    throw new Error(`Google token error: ${msg}`);
  }

  const r = asRecord(json);
  const accessToken = safeString(r?.access_token);
  const expiresIn = Number(r?.expires_in);
  if (!accessToken) throw new Error("Google token error: missing access_token");

  const ttlMs = Number.isFinite(expiresIn) ? Math.max(60_000, expiresIn * 1000) : 50 * 60_000;
  cached = { accessToken, expiresAtMs: now + ttlMs };
  return accessToken;
}

export type CreateMeetEventArgs = {
  calendarId: string;
  requestId: string; // stable idempotency key for conference creation
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  timeZone?: string; // e.g. "Asia/Seoul"
  attendees?: string[]; // emails (optional)
};

export type CreateMeetEventResult = {
  eventId: string;
  htmlLink: string;
  meetUrl: string;
};

export async function createMeetEvent(
  args: CreateMeetEventArgs,
): Promise<CreateMeetEventResult> {
  const token = await getGoogleAccessToken();

  const attendeeEmails = (args.attendees ?? [])
    .map((e) => String(e).trim().toLowerCase())
    .filter(Boolean);

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(args.calendarId)}/events`,
  );
  url.searchParams.set("conferenceDataVersion", "1");
  // Avoid emailing invite updates; Kaja will provide the Meet link directly.
  url.searchParams.set("sendUpdates", "none");

  const body = {
    summary: args.summary,
    description: args.description ?? "",
    start: {
      dateTime: args.startISO,
      ...(args.timeZone ? { timeZone: args.timeZone } : null),
    },
    end: {
      dateTime: args.endISO,
      ...(args.timeZone ? { timeZone: args.timeZone } : null),
    },
    ...(attendeeEmails.length
      ? { attendees: attendeeEmails.map((email) => ({ email })) }
      : null),
    conferenceData: {
      createRequest: {
        requestId: args.requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const r = asRecord(json);
    const err = asRecord(r?.error);
    const msg = safeString(err?.message) || safeString(r?.error) || `HTTP ${res.status}`;
    throw new Error(`Google Calendar error: ${msg}`);
  }

  const r = asRecord(json);
  const eventId = safeString(r?.id);
  const htmlLink = safeString(r?.htmlLink);
  const meetUrl = safeString(r?.hangoutLink);

  if (!eventId) throw new Error("Google Calendar error: missing event id");
  if (!meetUrl) throw new Error("Google Calendar error: missing Meet link (hangoutLink)");

  return { eventId, htmlLink, meetUrl };
}

