"use client";

import Link from "next/link";
import * as React from "react";
import {
  CalendarDays,
  CopyIcon,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { DateTime } from "luxon";

import { Container } from "@/components/site/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { WithLoading } from "@/components/WithLoading";
import {
  DEFAULT_PHONE_COUNTRY,
  formatPhoneFull,
  parsePhoneParts,
  PhonePartsInput,
} from "@/components/ui/PhonePartsInput";

type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  sessionWish?: string;
  notes?: Array<{ id: string; body: string; createdAt: string }>;
  payments?: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
    memo?: string;
  }>;
  credits?: Array<{
    id: string;
    remaining: number;
    expiresAt: string;
    purchasedAt: string;
    kind: string;
    total: number;
  }>;
};

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function callWindowForBooking(
  dateKey: string,
  startMin: number,
  endMin: number,
) {
  const zone = "Asia/Seoul";
  const start = DateTime.fromISO(dateKey, { zone })
    .startOf("day")
    .plus({ minutes: startMin });
  const end = DateTime.fromISO(dateKey, { zone })
    .startOf("day")
    .plus({ minutes: endMin });
  const openAt = start.minus({ minutes: 10 });
  const closeAt = end.plus({ minutes: 10 });
  return { start, end, openAt, closeAt };
}

function startsRelativeLabel(
  dateKey: string,
  startMin: number,
  displayZone: string,
) {
  const zone = "Asia/Seoul";
  const startSeoul = DateTime.fromISO(dateKey, { zone })
    .startOf("day")
    .plus({ minutes: startMin });
  const now = DateTime.now().setZone(displayZone);
  const start = startSeoul.setZone(displayZone);
  const diffMs = start.toMillis() - now.toMillis();
  // Emphasize very near start times.
  if (diffMs <= 2 * 60 * 1000 && diffMs >= -5 * 60 * 1000) return "Starts now";
  if (diffMs > 0 && diffMs <= 60 * 60 * 1000) return "Starts soon";
  const rel = start.toRelative({ base: now });
  if (!rel) return "";
  const v = String(rel);
  if (v.endsWith("ago")) return `Started ${v}`;
  return `Starts ${v}`;
}

function formatBookingTimeLabel(args: {
  dateKey: string;
  startMin: number;
  endMin: number;
  displayZone: string;
}) {
  const { dateKey, startMin, endMin, displayZone } = args;
  const { startLocal, endLocal } = bookingLocalTimes({
    dateKey,
    startMin,
    endMin,
    displayZone,
  });
  if (!startLocal.isValid || !endLocal.isValid) {
    return `${dateKey} · ${minutesToHhmm(startMin)}–${minutesToHhmm(endMin)}`;
  }
  return `${startLocal.toFormat("ccc, MMM d")} · ${startLocal.toFormat("h:mm")}–${endLocal.toFormat("h:mm a")}`;
}

function bookingLocalTimes(args: {
  dateKey: string;
  startMin: number;
  endMin: number;
  displayZone: string;
}) {
  const { dateKey, startMin, endMin, displayZone } = args;
  const startSeoul = DateTime.fromISO(dateKey, { zone: "Asia/Seoul" })
    .startOf("day")
    .plus({ minutes: startMin });
  const endSeoul = DateTime.fromISO(dateKey, { zone: "Asia/Seoul" })
    .startOf("day")
    .plus({ minutes: endMin });
  return {
    startLocal: startSeoul.setZone(displayZone),
    endLocal: endSeoul.setZone(displayZone),
  };
}

function zoneToCityLabel(tz: string) {
  if (!tz) return "";
  // common mapping for nicer labels
  const map: Record<string, string> = {
    "Asia/Seoul": "Seoul Time",
    "Asia/Tokyo": "Tokyo Time",
    "Asia/Shanghai": "Shanghai Time",
    "Asia/Hong_Kong": "Hong Kong Time",
    "America/New_York": "New York Time",
    "America/Los_Angeles": "Los Angeles Time",
    "Europe/London": "London Time",
    "Europe/Paris": "Paris Time",
  };
  if (map[tz]) return map[tz];
  const parts = String(tz).split("/");
  const city = parts.length > 1 ? parts[1].replace(/_/g, " ") : parts[0];
  return `${city} Time`;
}

function bookingBadge(b: {
  dateKey?: string;
  startMin?: number;
  endMin?: number;
  status?: string;
}) {
  // If the booking has a time and it's already ended, show Past.
  try {
    if (b.dateKey && typeof b.endMin === "number") {
      const end = DateTime.fromISO(b.dateKey, { zone: "Asia/Seoul" })
        .startOf("day")
        .plus({ minutes: b.endMin });
      if (DateTime.now().setZone("Asia/Seoul") > end) {
        return { text: "Past", variant: "muted" as const, className: "" };
      }
    }
  } catch {
    // ignore parsing errors
  }
  return statusBadge(String(b.status ?? ""));
}

function statusBadge(status: string) {
  const s = String(status ?? "");
  if (s === "confirmed")
    return {
      text: "All set",
      variant: "default" as const,
      className:
        "bg-included-2 text-[color-mix(in_srgb,var(--foreground)_82%,var(--included-2)_18%)] ring-1 ring-black/5 dark:ring-white/10",
    };
  if (s === "cancelled")
    return { text: "Cancelled", variant: "muted" as const };
  if (s === "no_show") return { text: "Missed", variant: "muted" as const };
  return { text: s || "—", variant: "outline" as const };
}

export default function AccountPage() {
  const session = useMockSession();
  const [tab, setTab] = React.useState<
    "bookings" | "payments" | "notes" | "profile"
  >("bookings");
  const [bookingsView, setBookingsView] = React.useState<"coming" | "finished">(
    "coming",
  );

  const displayZone = React.useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return typeof tz === "string" && tz.trim() ? tz.trim() : "Asia/Seoul";
    } catch {
      return "Asia/Seoul";
    }
  }, []);

  const student = session.state.student as Student | null;
  const studentLoading = session.accountLoading;
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = React.useState<
    string | null
  >(null);
  const [profileSaveOk, setProfileSaveOk] = React.useState(false);
  const [profileDirty, setProfileDirty] = React.useState(false);
  const [profileDraft, setProfileDraft] = React.useState<{
    name: string;
    email: string;
    phoneCountry: string;
    phoneNumber: string;
    sessionWish: string;
  }>({
    name: "",
    email: "",
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phoneNumber: "",
    sessionWish: "",
  });
  const sessionStudentId = (session.state.user?.studentId ?? "").trim();

  type BookingListItem = {
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

  const isBookingListItem = React.useCallback(
    (v: unknown): v is BookingListItem => {
      if (!v || typeof v !== "object") return false;
      const o = v as Record<string, unknown>;
      return (
        typeof o.id === "string" &&
        typeof o.dateKey === "string" &&
        typeof o.startMin === "number" &&
        typeof o.endMin === "number" &&
        typeof o.status === "string" &&
        (o.code === undefined || typeof o.code === "string") &&
        (o.meetingProvider === undefined ||
          typeof o.meetingProvider === "string") &&
        (o.meetUrl === undefined || typeof o.meetUrl === "string") &&
        (o.cancelled === undefined || typeof o.cancelled === "boolean")
      );
    },
    [],
  );

  const [bookings, setBookings] = React.useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(true);
  const [bookingActionId, setBookingActionId] = React.useState<string | null>(
    null,
  );
  const [bookingActionMsg, setBookingActionMsg] = React.useState<string | null>(
    null,
  );
  const [copiedBookingId, setCopiedBookingId] = React.useState<string | null>(
    null,
  );
  const copyTimerRef = React.useRef<number | null>(null);

  const copyText = React.useCallback(
    async (bookingId: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedBookingId(bookingId);
        if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(
          () => setCopiedBookingId(null),
          1200,
        );
      } catch {
        // ignore
      }
    },
    [],
  );

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const creditsSummary = React.useMemo(() => {
    const now = Date.now();
    const active = (student?.credits ?? [])
      .filter((c) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now)
      .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
    const remaining = active.reduce((acc, c) => acc + (c.remaining ?? 0), 0);
    const nextExpiry = active[0]?.expiresAt ?? null;
    return { remaining, nextExpiry, active };
  }, [student?.credits]);

  React.useEffect(() => {
    if (!session.state.user) {
      setProfileSaveMessage(null);
      setProfileSaving(false);
      setProfileSaveOk(false);
      setProfileDirty(false);
      setProfileDraft({
        name: "",
        email: "",
        phoneCountry: DEFAULT_PHONE_COUNTRY,
        phoneNumber: "",
        sessionWish: "",
      });
      return;
    }
    if (profileDirty) return;
    const fallbackPhoneParts = parsePhoneParts((student?.phone ?? "").trim());
    setProfileDraft({
      name: (student?.name ?? session.state.user.name ?? "").trim(),
      email: (student?.email ?? session.state.user.email ?? "").trim(),
      phoneCountry:
        (student?.phoneCountry ?? "").trim() ||
        fallbackPhoneParts.country ||
        DEFAULT_PHONE_COUNTRY,
      phoneNumber:
        (student?.phoneNumber ?? "").trim() || fallbackPhoneParts.number,
      sessionWish: (student?.sessionWish ?? "").trim(),
    });
  }, [
    profileDirty,
    session.state.user,
    student?.id,
    student?.name,
    student?.email,
    student?.phone,
    student?.phoneCountry,
    student?.phoneNumber,
    student?.sessionWish,
  ]);

  // Phone is edited via shared PhoneInput component

  const loadBookings = React.useCallback(async () => {
    if (!session.state.user) return;
    const sid = (sessionStudentId || student?.id || "").trim();
    setBookingsLoading(true);
    try {
      const qs = sid
        ? `studentId=${encodeURIComponent(sid)}`
        : `email=${encodeURIComponent(session.state.user!.email)}`;
      const res = await fetch(`/api/public/bookings?${qs}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        const raw = (json.data?.items ?? []) as unknown;
        const next = Array.isArray(raw) ? raw.filter(isBookingListItem) : [];
        setBookings(next);
      } else {
        setBookings([]);
      }
    } finally {
      setBookingsLoading(false);
    }
  }, [isBookingListItem, session.state.user, sessionStudentId, student?.id]);

  React.useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const bookingsByView = React.useMemo(() => {
    const now = DateTime.now().setZone(displayZone);
    const coming: BookingListItem[] = [];
    const finished: BookingListItem[] = [];
    for (const b of bookings) {
      try {
        if (!b.dateKey) {
          coming.push(b);
          continue;
        }
        const { endLocal } = bookingLocalTimes({
          dateKey: b.dateKey,
          startMin: b.startMin,
          endMin: b.endMin,
          displayZone,
        });
        if (!endLocal.isValid) {
          coming.push(b);
          continue;
        }
        if (endLocal.toMillis() < now.toMillis()) finished.push(b);
        else coming.push(b);
      } catch {
        coming.push(b);
      }
    }
    return { coming, finished };
  }, [bookings, displayZone]);

  const visibleBookings =
    bookingsView === "finished"
      ? bookingsByView.finished
      : bookingsByView.coming;

  if (studentLoading) return null;

  if (!session.state.user) {
    return (
      <div className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle> Please Signin.</CardTitle>
              <CardDescription>
                Sign in to manage your profile, bookings, and payments.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="w-full" size="lg">
                <Link href="/login?next=/account">Sign in</Link>
              </Button>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/booking">Go to booking</Link>
              </Button>
            </CardFooter>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-16">
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {!!student?.name ? student.name : "My Practice."}
            </h1>
            {/* <p className="mt-2 text-sm text-muted-foreground sm:text-base"></p> */}
          </div>
          {/* <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{session.state.user.email}</Badge>
            {session.state.subscriptionPlan && (
              <Badge>Subscription {session.state.subscriptionPlan}</Badge>
            )}
            <Badge variant="muted">{creditsSummary.remaining} credits</Badge>
          </div> */}
        </div>

        <div className="mt-6">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div
              role="tablist"
              className="inline-flex w-max items-center gap-1 rounded-xl border border-border bg-muted/20 p-1"
            >
              {(
                [
                  { id: "bookings", label: "Bookings", Icon: CalendarDays },
                  { id: "notes", label: "Talk notes", Icon: FileText },
                  { id: "profile", label: "Profile", Icon: User },
                  { id: "payments", label: "Payments", Icon: CreditCard },
                ] as const
              ).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted/40",
                    )}
                  >
                    <t.Icon className="size-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:grid lg:items-stretch gap-6 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-8 lg:h-full">
            {tab === "bookings" && (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex justify-between md:block">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>Bookings</CardTitle>
                    <div className="hidden sm:block text-[10px] text-stone-600">
                      {zoneToCityLabel(displayZone)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div
                      role="tablist"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={bookingsView === "coming"}
                        onClick={() => setBookingsView("coming")}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                          bookingsView === "coming"
                            ? "bg-foreground text-background"
                            : "text-foreground/80 hover:bg-muted/40",
                        )}
                      >
                        Coming
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={bookingsView === "finished"}
                        onClick={() => setBookingsView("finished")}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                          bookingsView === "finished"
                            ? "bg-foreground text-background"
                            : "text-foreground/80 hover:bg-muted/40",
                        )}
                      >
                        Finished
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {bookingActionMsg ? (
                    <div className="mb-4 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {bookingActionMsg}
                    </div>
                  ) : null}
                  <WithLoading
                    loading={bookingsLoading}
                    minMs={350}
                    delayMs={120}
                    fallback={
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2">
                                <div className="h-4 w-56 rounded bg-muted/40" />
                                <div className="flex items-center gap-2">
                                  <div className="h-5 w-16 rounded-full bg-muted/40" />
                                  <div className="h-3 w-24 rounded bg-muted/40" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-9 w-24 rounded-full bg-muted/40" />
                                <div className="h-9 w-28 rounded-full bg-muted/40" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    {visibleBookings.length === 0 ? (
                      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        {bookingsView === "finished" ? (
                          <>No finished sessions yet.</>
                        ) : (
                          <>
                            No upcoming bookings.{" "}
                            <Link
                              href="/booking"
                              className="text-foreground underline underline-offset-4"
                            >
                              Go to booking
                            </Link>
                            .
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleBookings.map((b) => (
                          <div
                            key={b.id}
                            className="rounded-xl border border-border bg-card p-4 "
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div className="min-w-0">
                                {(() => {
                                  const { startLocal, endLocal } =
                                    bookingLocalTimes({
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
                                  return (
                                    <div>
                                      <div className="text-xl font-semibold tracking-tight text-foreground">
                                        {timeRange}
                                      </div>
                                      <div className=" text-xs text-muted-foreground">
                                        {dateLabel}
                                      </div>
                                    </div>
                                  );
                                })()}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {(() => {
                                    const info = bookingBadge(b);
                                    return (
                                      <Badge
                                        variant={info.variant}
                                        className={cn(
                                          "text-[11px] px-2 py-0.5",
                                          info.className,
                                        )}
                                      >
                                        {info.text}
                                      </Badge>
                                    );
                                  })()}
                                  {b.cancelled && (
                                    <Badge
                                      variant="muted"
                                      className="text-[11px] px-2 py-0.5"
                                    >
                                      Cancelled
                                    </Badge>
                                  )}
                                  {b.dateKey &&
                                    typeof b.startMin === "number" &&
                                    (() => {
                                      const v = startsRelativeLabel(
                                        b.dateKey,
                                        b.startMin,
                                        displayZone,
                                      );
                                      return (
                                        <span
                                          className={cn(
                                            "text-xs",
                                            v === "Starts soon" ||
                                              v === "Starts now"
                                              ? "text-foreground font-semibold"
                                              : "text-muted-foreground",
                                          )}
                                        >
                                          {v}
                                        </span>
                                      );
                                    })()}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                {(() => {
                                  const hasTime =
                                    Boolean(b.dateKey) &&
                                    typeof b.startMin === "number" &&
                                    typeof b.endMin === "number";
                                  const start = hasTime
                                    ? DateTime.fromISO(b.dateKey, {
                                        zone: "Asia/Seoul",
                                      })
                                        .startOf("day")
                                        .plus({ minutes: b.startMin })
                                    : null;
                                  const meetingKey = String(b.code || b.id);
                                  const provider = String(
                                    b.meetingProvider ?? "",
                                  ).trim();
                                  const meetUrl = (b.meetUrl ?? "").trim();
                                  const fallbackPath =
                                    provider === "google_meet"
                                      ? `/join/${encodeURIComponent(meetingKey)}`
                                      : `/call/${encodeURIComponent(meetingKey)}`;
                                  const meetingLink =
                                    meetUrl ||
                                    (typeof window === "undefined"
                                      ? fallbackPath
                                      : new URL(
                                          fallbackPath,
                                          window.location.origin,
                                        ).toString());
                                  const canCancel =
                                    !b.cancelled &&
                                    b.status === "confirmed" &&
                                    Boolean(start) &&
                                    start!.toMillis() - Date.now() >=
                                      60 * 60 * 1000;
                                  const canJoin =
                                    !b.cancelled &&
                                    b.status === "confirmed" &&
                                    hasTime &&
                                    (() => {
                                      if (meetUrl) return true;
                                      if (provider === "google_meet")
                                        return false;
                                      const w = callWindowForBooking(
                                        b.dateKey,
                                        b.startMin,
                                        b.endMin,
                                      );
                                      const now = DateTime.utc();
                                      return (
                                        now >= w.openAt.toUTC() &&
                                        now <= w.closeAt.toUTC()
                                      );
                                    })();

                                  return (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full sm:w-auto border-border text-rose-500 hover:bg-red-50/60 active:bg-red-100/70 dark:hover:bg-red-950/20"
                                        disabled={
                                          bookingActionId === b.id ||
                                          b.cancelled ||
                                          b.status !== "confirmed" ||
                                          !hasTime ||
                                          !canCancel
                                        }
                                        title={
                                          canCancel
                                            ? "Cancel this booking (allowed up to 1 hour before the session)."
                                            : "Cancellation is allowed up to 1 hour before the session."
                                        }
                                        onClick={async () => {
                                          if (!session.state.user) return;
                                          if (!canCancel) return;
                                          const ok = window.confirm(
                                            "Cancel this booking? (Allowed up to 1 hour before the session.)",
                                          );
                                          if (!ok) return;
                                          setBookingActionId(b.id);
                                          setBookingActionMsg(null);
                                          try {
                                            const res = await fetch(
                                              `/api/public/bookings/${encodeURIComponent(String(b.id))}/cancel`,
                                              {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  studentId: (
                                                    sessionStudentId ||
                                                    student?.id ||
                                                    ""
                                                  ).trim(),
                                                  email:
                                                    session.state.user!.email,
                                                }),
                                              },
                                            );
                                            const json = await res
                                              .json()
                                              .catch(() => null);
                                            if (!res.ok || !json?.ok) {
                                              setBookingActionMsg(
                                                json?.error ??
                                                  "Cancellation failed.",
                                              );
                                              return;
                                            }
                                            setBookingActionMsg(
                                              "Booking cancelled.",
                                            );
                                            await loadBookings();
                                          } catch (e) {
                                            setBookingActionMsg(
                                              e instanceof Error
                                                ? e.message
                                                : "Cancellation failed.",
                                            );
                                          } finally {
                                            setBookingActionId(null);
                                          }
                                        }}
                                      >
                                        {bookingActionId === b.id
                                          ? "Cancelling…"
                                          : "Cancel"}
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() =>
                                          void copyText(b.id, meetingLink)
                                        }
                                        disabled={!meetingLink}
                                      >
                                        {copiedBookingId === b.id
                                          ? "Copied"
                                          : "Copy link"}{" "}
                                        <CopyIcon className="size-4" />
                                      </Button>

                                      <Button
                                        asChild
                                        size="sm"
                                        variant="primary"
                                        className="w-full sm:w-auto"
                                        disabled={!canJoin}
                                      >
                                        {(b.meetUrl ?? "").trim() ? (
                                          <a
                                            href={(b.meetUrl ?? "").trim()}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            Open Meet Link
                                          </a>
                                        ) : (b.meetingProvider ?? "").trim() ===
                                          "google_meet" ? (
                                          <a
                                            href={`/join/${encodeURIComponent(String(b.code || b.id))}`}
                                          >
                                            Meet link unavailable
                                          </a>
                                        ) : (
                                          <Link
                                            href={`/call/${encodeURIComponent(String(b.code || b.id))}`}
                                          >
                                            Enter lesson
                                          </Link>
                                        )}
                                      </Button>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </WithLoading>
                </CardContent>
              </Card>
            )}

            {tab === "payments" && (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Payments History</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {studentLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : (student?.payments ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No payments.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(student?.payments ?? []).map((p) => (
                        <div
                          key={p.id}
                          className="rounded-md border border-border bg-card p-4"
                        >
                          <div className="text-sm font-semibold">
                            {p.amount.toLocaleString("en-US")} KRW · {p.type}
                          </div>
                          {p.memo && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {p.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "notes" && (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Talk notes</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {studentLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : (student?.notes ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      The note will arrive within 5 minutes after the session
                      ends. 🤗
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(student?.notes ?? []).map((n) => (
                        <div
                          key={n.id}
                          className="rounded-md border border-border bg-card p-4"
                        >
                          <div className="text-xs text-muted-foreground">
                            {new Date(n.createdAt).toLocaleString("en-US")}
                          </div>
                          <div className="mt-2 text-sm whitespace-pre-wrap">
                            {n.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === "profile" && (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>

                  <CardDescription>
                    Manage your basic account info.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 flex-1">
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <Input
                      value={profileDraft.name}
                      onChange={(e) => {
                        setProfileDirty(true);
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setProfileDraft((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <Input
                      value={profileDraft.email}
                      onChange={(e) => {
                        setProfileDirty(true);
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setProfileDraft((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                      }}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <PhonePartsInput
                      country={profileDraft.phoneCountry}
                      number={profileDraft.phoneNumber}
                      disabled={studentLoading}
                      onChange={(next) => {
                        setProfileDirty(true);
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setProfileDraft((prev) => ({
                          ...prev,
                          phoneCountry:
                            next.country.trim() || DEFAULT_PHONE_COUNTRY,
                          phoneNumber: next.number,
                        }));
                      }}
                    />
                  </label>
                  <label className="grid mt-2 gap-1">
                    <span className="mb-px inline-block text-sm text-muted-foreground">
                      How would you like your session to be?
                    </span>
                    <textarea
                      className="min-h-28 w-full resize-y rounded-md border border-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
                      value={profileDraft.sessionWish}
                      placeholder="Conversational practice, business Korean, mistake correction."
                      onChange={(e) => {
                        setProfileDirty(true);
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setProfileDraft((prev) => ({
                          ...prev,
                          sessionWish: e.target.value,
                        }));
                      }}
                    />
                  </label>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        const name = (profileDraft.name ?? "").trim();
                        const email = (profileDraft.email ?? "").trim();
                        const phoneFull = formatPhoneFull({
                          country:
                            (profileDraft.phoneCountry ?? "").trim() ||
                            DEFAULT_PHONE_COUNTRY,
                          number: profileDraft.phoneNumber ?? "",
                        });
                        const sessionWish = (
                          profileDraft.sessionWish ?? ""
                        ).trim();
                        // Basic client-side validation
                        if (!name) {
                          setProfileSaveOk(false);
                          setProfileSaveMessage("Please enter your name.");
                          return;
                        }
                        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          email,
                        );
                        if (!email || !emailOk) {
                          setProfileSaveOk(false);
                          setProfileSaveMessage(
                            "Please enter a valid email address.",
                          );
                          return;
                        }
                        // optional: basic phone check (at least 6 digits)
                        const digits = String(
                          profileDraft.phoneNumber ?? "",
                        ).replace(/\D/g, "");
                        if (digits && digits.length < 6) {
                          setProfileSaveOk(false);
                          setProfileSaveMessage(
                            "Please enter a valid phone number.",
                          );
                          return;
                        }

                        setProfileSaving(true);
                        setProfileSaveMessage(null);
                        setProfileSaveOk(false);
                        try {
                          const id = (
                            sessionStudentId ||
                            student?.id ||
                            ""
                          ).trim();
                          if (!id) {
                            setProfileSaveOk(false);
                            setProfileSaveMessage(
                              "Account is still loading. Please try again.",
                            );
                            return;
                          }
                          const res = await fetch(
                            "/api/public/students/upsert",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id,
                                name,
                                email,
                                phone: phoneFull || undefined,
                                phoneCountry:
                                  (profileDraft.phoneCountry ?? "").trim() ||
                                  DEFAULT_PHONE_COUNTRY,
                                phoneNumber: profileDraft.phoneNumber,
                                sessionWish,
                              }),
                            },
                          );
                          const json = await res.json().catch(() => null);
                          if (res.ok && json?.ok) {
                            setProfileSaveOk(true);
                            setProfileSaveMessage(null);
                            setProfileDirty(false);
                            await session.refreshSession();
                          } else {
                            setProfileSaveOk(false);
                            setProfileSaveMessage(
                              json?.error ?? `Save failed (HTTP ${res.status})`,
                            );
                          }
                        } catch (e) {
                          setProfileSaveOk(false);
                          setProfileSaveMessage(
                            e instanceof Error ? e.message : "Save failed.",
                          );
                        } finally {
                          setProfileSaving(false);
                        }
                      }}
                      disabled={profileSaving}
                      className={
                        profileSaveOk && !profileSaving
                          ? "bg-included-2 text-foreground hover:brightness-95 active:brightness-90"
                          : ""
                      }
                    >
                      {profileSaving
                        ? "Saving…"
                        : profileSaveOk
                          ? "Saved"
                          : "Save profile"}
                    </Button>
                    {profileSaveMessage && (
                      <div className="text-sm text-muted-foreground">
                        {profileSaveMessage}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-3">
              <Card>
                <CardContent className="pt-6">
                  {creditsSummary.remaining > 0 ? (
                    <>
                      <div className="flex items-end justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                          <div className="text-4xl font-semibold tracking-tight text-foreground">
                            {creditsSummary.remaining}
                          </div>
                          <div className="text-sm font-semibold text-muted-foreground">
                            Credit{creditsSummary.remaining === 1 ? "" : "s"}{" "}
                            remaining
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-foreground/75">
                        {creditsSummary.nextExpiry ? (
                          <>
                            Available until{" "}
                            {new Date(
                              creditsSummary.nextExpiry,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </>
                        ) : (
                          <>Available</>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      You don’t have any credits right now.<br></br>Purchase
                      credits anytime and you’ll be able to book a session
                      immediately.
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-2">
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/#ways-to-use">Get More Credits</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full" variant="primary">
                    <Link href="/booking">Pick a time</Link>
                  </Button>
                  <Button
                    className="w-full border-border/80 bg-muted/10 hover:bg-muted/25"
                    variant="outline"
                    onClick={() => session.signOut()}
                  >
                    Sign out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
