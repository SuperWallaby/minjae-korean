# Google Meet mode setup

Kaja can generate a Google Meet link automatically at **booking time** by creating a Google Calendar event with `conferenceData`.

## How it works

- When `MEETING_PROVIDER=google_meet`, `POST /api/public/bookings` will:
  - create the booking (as usual)
  - call Google Calendar API to create an event
  - store `meetUrl` on the booking
- Anywhere that uses `/call/{bookingKey}` will **redirect to Google Meet** when `meetUrl` exists.

## Required environment variables

See `env.example`:

- `MEETING_PROVIDER=google_meet`
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (usually `primary`)

## Getting a refresh token (one-time)

This implementation uses **one organizer Google account** (Minjae/partner account) and a long-lived OAuth2 `refresh_token`.

1. In Google Cloud Console:
   - Create (or pick) a project
   - Enable **Google Calendar API**
   - Configure **OAuth consent screen** (External is fine for personal accounts)
   - Create **OAuth Client ID** (Web application)
2. Obtain a refresh token:
   - Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Authorize scope: `https://www.googleapis.com/auth/calendar.events`
   - Make sure you request **offline** access so a `refresh_token` is returned
3. Put the resulting `refresh_token` into `GOOGLE_CALENDAR_REFRESH_TOKEN` on the server.

## Notes

- The Calendar call is configured with `sendUpdates=none` to avoid sending Google Calendar invite emails automatically. Kaja provides the Meet link directly in the UI and reminder emails.
- If the Meet creation fails, the booking still succeeds, but `meetError` is stored on the booking for debugging.

