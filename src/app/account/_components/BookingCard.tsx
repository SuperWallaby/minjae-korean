import Link from "next/link";
import * as React from "react";
import { CopyIcon } from "lucide-react";
import { DateTime } from "luxon";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  bookingBadge,
  bookingLocalTimes,
  callWindowForBooking,
  minutesToHhmm,
  startsRelativeLabel,
} from "./bookingUtils";

type Booking = {
  id: string;
  code?: string;
  meetingProvider?: string;
  meetUrl?: string;
  dateKey: string;
  startMin: number;
  endMin: number;
  status: string;
  cancelled?: boolean;
};

export function BookingCard(props: {
  booking: Booking;
  displayZone: string;
  bookingActionId: string | null;
  copiedBookingId: string | null;
  onCopyLink: (bookingId: string, text: string) => void | Promise<void>;
  onCancel: (booking: Booking) => Promise<void>;
}) {
  const { booking: b, displayZone, bookingActionId, copiedBookingId } = props;

  const { startLocal, endLocal } = bookingLocalTimes({
    dateKey: b.dateKey,
    startMin: b.startMin,
    endMin: b.endMin,
    displayZone,
  });

  const timeRange =
    startLocal.isValid && endLocal.isValid
      ? `${startLocal.toFormat("h:mm")}–${endLocal.toFormat("h:mm a")}`
      : `${minutesToHhmm(b.startMin)}–${minutesToHhmm(b.endMin)}`;

  const dateLabel = startLocal.isValid
    ? startLocal.toFormat("ccc, MMM d")
    : b.dateKey;

  const info = bookingBadge(b);

  const relative =
    b.dateKey && typeof b.startMin === "number"
      ? startsRelativeLabel(b.dateKey, b.startMin, displayZone)
      : "";

  const hasTime =
    Boolean(b.dateKey) &&
    typeof b.startMin === "number" &&
    typeof b.endMin === "number";

  const start = hasTime
    ? DateTime.fromISO(b.dateKey, { zone: "Asia/Seoul" })
        .startOf("day")
        .plus({ minutes: b.startMin })
    : null;

  const meetingKey = String(b.code || b.id);
  const provider = String(b.meetingProvider ?? "").trim();
  const meetUrl = (b.meetUrl ?? "").trim();

  const fallbackPath =
    provider === "google_meet"
      ? `/join/${encodeURIComponent(meetingKey)}`
      : `/call/${encodeURIComponent(meetingKey)}`;

  const meetingLink =
    meetUrl ||
    (typeof window === "undefined"
      ? fallbackPath
      : new URL(fallbackPath, window.location.origin).toString());

  const startMillis = start ? start.toMillis() : null;
  const canCancel =
    !b.cancelled &&
    b.status === "confirmed" &&
    typeof startMillis === "number" &&
    startMillis - Date.now() >= 60 * 60 * 1000;

  let canJoin = false;
  if (!b.cancelled && b.status === "confirmed" && hasTime) {
    if (meetUrl) canJoin = true;
    else if (provider === "google_meet") canJoin = false;
    else {
      const w = callWindowForBooking(b.dateKey, b.startMin, b.endMin);
      const now = DateTime.utc();
      canJoin = now >= w.openAt.toUTC() && now <= w.closeAt.toUTC();
    }
  }

  const cancelDisabled =
    bookingActionId === b.id ||
    b.cancelled ||
    b.status !== "confirmed" ||
    !hasTime ||
    !canCancel;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div>
            <div className="text-xl font-semibold tracking-tight text-foreground">
              {timeRange}
            </div>
            <div className="text-xs text-muted-foreground">{dateLabel}</div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn("text-xs font-semibold text-foreground", {
                "text-emerald-600": info.variant === "default",
                "text-rose-600": info.variant === "muted",
                "text-stone-600": info.variant === "outline",
              })}
            >
              {info.text}
            </span>
            {relative ? (
              <span
                className={cn(
                  "text-xs",
                  relative === "Starts soon" || relative === "Starts now"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {relative}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto border-border text-rose-500 disabled:text-stone-800"
            disabled={cancelDisabled}
            title={
              canCancel
                ? "Cancel this booking (allowed up to 1 hour before the session)."
                : "Cancellation is allowed up to 1 hour before the session."
            }
            onClick={async () => {
              if (!canCancel) return;
              const ok = window.confirm(
                "Cancel this booking? (Allowed up to 1 hour before the session.)",
              );
              if (!ok) return;
              await props.onCancel(b);
            }}
          >
            {bookingActionId === b.id ? "Cancelling…" : "Cancel"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => void props.onCopyLink(b.id, meetingLink)}
            disabled={!meetingLink}
          >
            {copiedBookingId === b.id ? "Copied" : "Copy link"}{" "}
            <CopyIcon className="size-4" />
          </Button>

          <Button
            asChild
            size="sm"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={!canJoin}
          >
            {meetUrl ? (
              <a href={meetUrl} target="_blank" rel="noreferrer">
                Open Meet Link
              </a>
            ) : provider === "google_meet" ? (
              <a href={`/join/${encodeURIComponent(meetingKey)}`}>
                Meet link unavailable
              </a>
            ) : (
              <Link href={`/call/${encodeURIComponent(meetingKey)}`}>
                Enter lesson
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
