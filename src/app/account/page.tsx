"use client";

import Link from "next/link";
import * as React from "react";
import { CalendarDays, CreditCard, FileText, User } from "lucide-react";
import { DateTime } from "luxon";

import { Container } from "@/components/site/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
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

function startsRelativeLabel(dateKey: string, startMin: number) {
  const zone = "Asia/Seoul";
  const start = DateTime.fromISO(dateKey, { zone })
    .startOf("day")
    .plus({ minutes: startMin });
  const rel = start.toRelative({ base: DateTime.now().setZone(zone) });
  return rel ? `Starts ${rel}` : "";
}

function statusBadge(status: string) {
  const s = String(status ?? "");
  if (s === "confirmed")
    return { text: "All set", variant: "default" as const };
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

  const [student, setStudent] = React.useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = React.useState<
    string | null
  >(null);
  const [profileSaveOk, setProfileSaveOk] = React.useState(false);
  const studentIdStorageKey = React.useMemo(() => {
    const authUserId = (session.state.user as { id?: string } | null)?.id ?? "";
    if (authUserId.trim()) return `mj_student_id_${authUserId.trim()}`;
    const email = (session.state.user?.email ?? "").trim().toLowerCase();
    return email ? `mj_student_id_${email}` : "mj_student_id";
  }, [session.state.user]);

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

  function isBookingListItem(v: unknown): v is BookingListItem {
    if (!v || typeof v !== "object") return false;
    const o = v as Record<string, unknown>;
    return (
      typeof o.id === "string" &&
      typeof o.dateKey === "string" &&
      typeof o.startMin === "number" &&
      typeof o.endMin === "number" &&
      typeof o.status === "string" &&
      (o.code === undefined || typeof o.code === "string") &&
      (o.meetingProvider === undefined || typeof o.meetingProvider === "string") &&
      (o.meetUrl === undefined || typeof o.meetUrl === "string") &&
      (o.cancelled === undefined || typeof o.cancelled === "boolean")
    );
  }

  const [bookings, setBookings] = React.useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(false);
  const [bookingActionId, setBookingActionId] = React.useState<string | null>(null);
  const [bookingActionMsg, setBookingActionMsg] = React.useState<string | null>(null);

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
      setStudent(null);
      setProfileSaveMessage(null);
      setProfileSaving(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setStudentLoading(true);
      try {
        const savedId =
          typeof window !== "undefined"
            ? (window.localStorage.getItem(studentIdStorageKey) ?? "")
            : "";
        const qs = savedId.trim()
          ? `id=${encodeURIComponent(savedId.trim())}`
          : `email=${encodeURIComponent(session.state.user!.email)}`;
        const res = await fetch(`/api/public/students/upsert?${qs}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && json?.ok) {
          const s = (json?.data?.student ?? null) as Student | null;
          if (s) {
            setStudent(s);
            const id = typeof s.id === "string" ? s.id : "";
            if (id && typeof window !== "undefined")
              window.localStorage.setItem(studentIdStorageKey, id);
            return;
          }
        }

        // If not found, create a minimal student record so inputs have a stable source of truth.
        const createRes = await fetch("/api/public/students/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.state.user!.name,
            email: session.state.user!.email,
          }),
        });
        const createJson = await createRes.json().catch(() => null);
        if (cancelled) return;
        if (createRes.ok && createJson?.ok && createJson.data?.student) {
          const s = createJson.data.student as Student;
          setStudent(s);
          const id = typeof s.id === "string" ? s.id : "";
          if (id && typeof window !== "undefined")
            window.localStorage.setItem(studentIdStorageKey, id);
        }
      } finally {
        if (!cancelled) setStudentLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session.state.user, studentIdStorageKey]);

  // Phone is edited via shared PhoneInput component

  const loadBookings = React.useCallback(async () => {
    if (!session.state.user) return;
    const sid = (student?.id ?? "").trim();
    setBookingsLoading(true);
    try {
      const qs = sid
        ? `studentId=${encodeURIComponent(sid)}`
        : `email=${encodeURIComponent(session.state.user!.email)}`;
      const res = await fetch(`/api/public/bookings?${qs}`, { cache: "no-store" });
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
  }, [session.state.user, student?.id]);

  React.useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  if (!session.state.user) {
    return (
      <div className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>My Practice</CardTitle>
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
    <div className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              My Practice
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base"></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{session.state.user.email}</Badge>
            {session.state.subscriptionPlan && (
              <Badge>Subscription {session.state.subscriptionPlan}</Badge>
            )}
            <Badge variant="muted">{creditsSummary.remaining} credits</Badge>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            variant={tab === "bookings" ? "primary" : "outline"}
            onClick={() => setTab("bookings")}
          >
            <CalendarDays className="size-4" /> Bookings
          </Button>
          <Button
            variant={tab === "payments" ? "primary" : "outline"}
            onClick={() => setTab("payments")}
          >
            <CreditCard className="size-4" /> Payments
          </Button>
          <Button
            variant={tab === "notes" ? "primary" : "outline"}
            onClick={() => setTab("notes")}
          >
            <FileText className="size-4" /> Talk notes
          </Button>
          <Button
            variant={tab === "profile" ? "primary" : "outline"}
            onClick={() => setTab("profile")}
          >
            <User className="size-4" /> Profile
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {tab === "bookings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingActionMsg ? (
                    <div className="mb-4 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {bookingActionMsg}
                    </div>
                  ) : null}
                  {bookingsLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      No bookings yet.{" "}
                      <Link
                        href="/booking"
                        className="text-foreground underline underline-offset-4"
                      >
                        Go to booking
                      </Link>
                      .
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-md border border-border bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold">
                                {b.dateKey} · {minutesToHhmm(b.startMin)}–
                                {minutesToHhmm(b.endMin)}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant={statusBadge(b.status).variant}>
                                  {statusBadge(b.status).text}
                                </Badge>
                                {b.cancelled && (
                                  <Badge variant="muted">Cancelled</Badge>
                                )}
                                {b.dateKey &&
                                  typeof b.startMin === "number" && (
                                    <span className="text-xs text-muted-foreground">
                                      {startsRelativeLabel(
                                        b.dateKey,
                                        b.startMin,
                                      )}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const hasTime =
                                  Boolean(b.dateKey) &&
                                  typeof b.startMin === "number" &&
                                  typeof b.endMin === "number";
                                const start = hasTime
                                  ? DateTime.fromISO(b.dateKey, { zone: "Asia/Seoul" })
                                      .startOf("day")
                                      .plus({ minutes: b.startMin })
                                  : null;
                                const canCancel =
                                  !b.cancelled &&
                                  b.status === "confirmed" &&
                                  Boolean(start) &&
                                  start!.toMillis() - Date.now() >= 60 * 60 * 1000;
                                const canJoin =
                                  !b.cancelled &&
                                  b.status === "confirmed" &&
                                  hasTime &&
                                  (() => {
                                    const meetUrl = (b.meetUrl ?? "").trim();
                                    if (meetUrl) return true;
                                    const provider = (b.meetingProvider ?? "").trim();
                                    if (provider === "google_meet") return false;
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
                                    {canCancel ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={bookingActionId === b.id}
                                        onClick={async () => {
                                          if (!session.state.user) return;
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
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  studentId: student?.id ?? "",
                                                  email: session.state.user!.email,
                                                }),
                                              },
                                            );
                                            const json = await res.json().catch(() => null);
                                            if (!res.ok || !json?.ok) {
                                              setBookingActionMsg(json?.error ?? "Cancellation failed.");
                                              return;
                                            }
                                            setBookingActionMsg("Booking cancelled.");
                                            await loadBookings();
                                          } catch (e) {
                                            setBookingActionMsg(
                                              e instanceof Error ? e.message : "Cancellation failed.",
                                            );
                                          } finally {
                                            setBookingActionId(null);
                                          }
                                        }}
                                      >
                                        {bookingActionId === b.id ? "Cancelling…" : "Cancel"}
                                      </Button>
                                    ) : null}

                                    <Button
                                      asChild
                                      size="sm"
                                      variant="primary"
                                      disabled={!canJoin}
                                    >
                                      {(b.meetUrl ?? "").trim() ? (
                                        <a
                                          href={(b.meetUrl ?? "").trim()}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open Google Meet
                                        </a>
                                      ) : (b.meetingProvider ?? "").trim() === "google_meet" ? (
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
                </CardContent>
              </Card>
            )}

            {tab === "payments" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payments History</CardTitle>
                </CardHeader>
                <CardContent>
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
              <Card>
                <CardHeader>
                  <CardTitle>Talk notes</CardTitle>
                  <CardDescription>Notes saved by admin.</CardDescription>
                </CardHeader>
                <CardContent>
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
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>

                  <CardDescription>
                    Manage your basic account info.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <Input
                      value={student?.name ?? session.state.user!.name}
                      onChange={(e) => {
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setStudent((prev) =>
                          prev
                            ? { ...prev, name: e.target.value }
                            : {
                                id: "",
                                name: e.target.value,
                                email: session.state.user!.email,
                              },
                        );
                      }}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <Input
                      value={student?.email ?? session.state.user!.email}
                      onChange={(e) => {
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setStudent((prev) =>
                          prev
                            ? { ...prev, email: e.target.value }
                            : {
                                id: "",
                                name: session.state.user!.name,
                                email: e.target.value,
                              },
                        );
                      }}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <PhoneInput
                      value={(student?.phone ?? "").trim()}
                      disabled={studentLoading}
                      onChange={(full) => {
                        setProfileSaveOk(false);
                        setProfileSaveMessage(null);
                        setStudent((prev) =>
                          prev
                            ? { ...prev, phone: full }
                            : {
                                id: "",
                                name: session.state.user!.name,
                                email: session.state.user!.email,
                                phone: full,
                              },
                        );
                      }}
                    />
                  </label>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        const s = student;
                        if (!s) return;
                        const name = (s.name ?? "").trim();
                        const email = (s.email ?? "").trim();
                        const phone = (s.phone ?? "").trim();
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
                        const digits = phone.replace(/\D/g, "");
                        if (phone && digits.length < 6) {
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
                          const res = await fetch(
                            "/api/public/students/upsert",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: s.id,
                                name,
                                email,
                                phone,
                              }),
                            },
                          );
                          const json = await res.json().catch(() => null);
                          if (res.ok && json?.ok) {
                            setStudent(json.data.student);
                            try {
                              const id =
                                typeof json?.data?.student?.id === "string"
                                  ? json.data.student.id
                                  : "";
                              if (id)
                                window.localStorage.setItem(
                                  studentIdStorageKey,
                                  id,
                                );
                            } catch {
                              // ignore
                            }
                            setProfileSaveOk(true);
                            setProfileSaveMessage(null);
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
                <CardContent className="p-4">
                  {creditsSummary.remaining > 0 ? (
                    <>
                      <div className="text-lg font-semibold tracking-tight">
                        {creditsSummary.remaining} Credit
                        {creditsSummary.remaining === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
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
                      You don’t have any credits right now. Purchase credits
                      anytime and you’ll be able to book a lesson immediately.
                      😊
                    </div>
                  )}

                  <div className="mt-3 flex flex-col gap-2">
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/#ways-to-use">Get More Credits</Link>
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Passes expire 30 days after purchase.
                    <br />
                    We use the earliest-expiring credits first.
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
                    className="w-full"
                    variant="ghost"
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
