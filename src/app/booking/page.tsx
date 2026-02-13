"use client";

import Link from "next/link";
import * as React from "react";
import {
  CalendarDays,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import { Container } from "@/components/site/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Input } from "@/components/ui/Input";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

function SkipUpdate({
  skip,
  children,
}: {
  skip: boolean;
  children: React.ReactNode;
}) {
  const last = React.useRef<React.ReactNode>(children);
  if (!skip) last.current = children;
  return <>{last.current}</>;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatWeekdayDate(d: Date) {
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  return `${weekday} ${d.getMonth() + 1}/${d.getDate()}`;
}

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function dateKeyForSeoul(d: Date) {
  return DateTime.fromJSDate(d).setZone(BUSINESS_TIME_ZONE).toISODate()!;
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function BookingPage() {
  const session = useMockSession();
  const router = useRouter();
  const desktopGridScrollerRef = React.useRef<HTMLDivElement | null>(null);
  // Show today as the left-most day by default (not week-start)
  const [weekStart, setWeekStart] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = React.useState<string>(
    () =>
      DateTime.now().setZone(BUSINESS_TIME_ZONE).toISODate() ??
      new Date().toISOString().slice(0, 10),
  );
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  );
  const [success, setSuccess] = React.useState<string | null>(null);
  const [slotsByDateKey, setSlotsByDateKey] = React.useState<
    Record<
      string,
      Array<{
        id: string;
        dateKey: string;
        startMin: number;
        endMin: number;
        capacity: number;
        bookedCount: number;
        available: number;
      }>
    >
  >({});

  type SlotResponseItem = {
    id: string;
    dateKey: string;
    startMin: number;
    endMin: number;
    capacity: number;
    bookedCount: number;
    available: number;
  };
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [slotsError, setSlotsError] = React.useState<string | null>(null);
  const [slotsSkeletonMinMs] = React.useState(250);

  const [gate, setGate] = React.useState<
    "none" | "login" | "pricing" | "confirm"
  >("none");
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profile, setProfile] = React.useState<{
    name: string;
    phone?: string;
    creditsRemaining: number;
    nextExpiry?: string;
  } | null>(null);
  const [studentId, setStudentId] = React.useState("");
  const [bookingName, setBookingName] = React.useState("");
  const [bookingEmail, setBookingEmail] = React.useState("");
  const [bookingPhone, setBookingPhone] = React.useState("");
  const welcomeName = (profile?.name ?? session.state.user?.name ?? "").trim();
  const signedLabel = session.state.user
    ? welcomeName || "Signed in"
    : "Signed out";
  const creditsRemaining = profileLoading
    ? null
    : (profile?.creditsRemaining ?? 0);
  const creditsLabel = !session.state.user
    ? null
    : creditsRemaining == null
      ? "Credits…"
      : creditsRemaining > 0
        ? `Credits ${creditsRemaining}`
        : "Add credits to book";

  const scrollDesktopGridBy = React.useCallback((dir: -1 | 1) => {
    const el = desktopGridScrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 520, behavior: "smooth" });
  }, []);

  const [desktopCanScrollLeft, setDesktopCanScrollLeft] = React.useState(false);
  const [desktopCanScrollRight, setDesktopCanScrollRight] =
    React.useState(false);

  const updateDesktopScrollHints = React.useCallback(() => {
    const el = desktopGridScrollerRef.current;
    if (!el) {
      setDesktopCanScrollLeft(false);
      setDesktopCanScrollRight(false);
      return;
    }
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft > 4;
    const right = max > 4 && el.scrollLeft < max - 4;
    setDesktopCanScrollLeft(left);
    setDesktopCanScrollRight(right);
  }, []);

  React.useEffect(() => {
    updateDesktopScrollHints();
    const el = desktopGridScrollerRef.current;
    if (!el) return;

    const onScroll = () => updateDesktopScrollHints();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateDesktopScrollHints, {
      passive: true,
    });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateDesktopScrollHints);
    };
  }, [updateDesktopScrollHints, weekStart, slotsByDateKey]);

  const days = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const hours = React.useMemo(() => {
    const out: number[] = [];
    for (let h = 9; h <= 22; h++) out.push(h);
    return out;
  }, []);

  React.useEffect(() => {
    // keep selected day inside the displayed week
    const keys = days.map(dateKeyForSeoul);
    if (!keys.includes(selectedDateKey)) {
      setSelectedDateKey(keys[0] ?? selectedDateKey);
      setSelectedSlotId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const selectedSlot = React.useMemo(() => {
    if (!selectedSlotId) return null;
    const list = slotsByDateKey[selectedDateKey] ?? [];
    return list.find((s) => s.id === selectedSlotId) ?? null;
  }, [selectedDateKey, selectedSlotId, slotsByDateKey]);

  const selectedLabel = React.useMemo(() => {
    if (!selectedSlot) return null;
    const dt = DateTime.fromISO(selectedSlot.dateKey, {
      zone: BUSINESS_TIME_ZONE,
    }).plus({
      minutes: selectedSlot.startMin,
    });
    const weekday =
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dt.weekday - 1] ?? "";
    return `${weekday} ${dt.toFormat("M/d")} · ${dt.toFormat("HH:mm")}`;
  }, [selectedSlot]);

  async function loadWeekSlots() {
    const startedAt = Date.now();
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const keys = days.map(dateKeyForSeoul);
      const results = await Promise.all(
        keys.map(async (dateKey) => {
          const res = await fetch(
            `/api/public/slots?dateKey=${encodeURIComponent(dateKey)}`,
            {
              cache: "no-store",
            },
          );
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.ok) {
            return { dateKey, slots: [] as SlotResponseItem[] };
          }
          const raw = (json?.slots ?? []) as unknown;
          const slots = Array.isArray(raw) ? (raw as SlotResponseItem[]) : [];
          return { dateKey, slots };
        }),
      );
      const next: typeof slotsByDateKey = {};
      for (const r of results) next[r.dateKey] = r.slots;
      setSlotsByDateKey(next);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : "Couldn’t load slots.");
      setSlotsByDateKey({});
    } finally {
      const elapsed = Date.now() - startedAt;
      const waitMs = Math.max(0, slotsSkeletonMinMs - elapsed);
      if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
      setSlotsLoading(false);
    }
  }

  React.useEffect(() => {
    loadWeekSlots().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  React.useEffect(() => {
    const user = session.state.user;
    if (!user) {
      setProfile(null);
      setStudentId("");
      setBookingName("");
      setBookingEmail("");
      setBookingPhone("");
      return;
    }
    const u = user;
    setBookingEmail((prev) =>
      prev.trim() ? prev : (u.email ?? "").trim(),
    );
    let cancelled = false;
    async function loadProfile() {
      setProfileLoading(true);
      try {
        const authUserId = (u as { id?: string }).id ?? "";
        const storageKey = authUserId.trim()
          ? `mj_student_id_${authUserId.trim()}`
          : (u.email ?? "").trim().toLowerCase()
            ? `mj_student_id_${(u.email ?? "").trim().toLowerCase()}`
            : "mj_student_id";
        const savedId =
          typeof window !== "undefined"
            ? (window.localStorage.getItem(storageKey) ?? "")
            : "";
        const qs = savedId.trim()
          ? `id=${encodeURIComponent(savedId.trim())}`
          : authUserId.trim()
            ? `authUserId=${encodeURIComponent(authUserId.trim())}`
            : `email=${encodeURIComponent(u.email)}`;
        const res = await fetch(`/api/public/students/upsert?${qs}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        const s = json?.data?.student as
          | {
              id?: string;
              name?: string;
              phone?: string;
              credits?: Array<{ remaining: number; expiresAt: string }>;
            }
          | null
          | undefined;
        try {
          const id =
            typeof json?.data?.student?.id === "string"
              ? json.data.student.id
              : "";
          if (id && typeof window !== "undefined")
            window.localStorage.setItem(storageKey, id);
          if (id) setStudentId(id);
        } catch {
          // ignore
        }
        const name = (s?.name ?? u.name ?? "").trim() || u.name;
        const phone = (s?.phone ?? "").trim() || "";
        const now = Date.now();
        const active = (s?.credits ?? [])
          .filter(
            (c) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now,
          )
          .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
        const creditsRemaining = active.reduce(
          (acc, c) => acc + (c.remaining ?? 0),
          0,
        );
        const nextExpiry = active[0]?.expiresAt;
        setProfile({
          name,
          phone: phone || undefined,
          creditsRemaining,
          nextExpiry,
        });
        setBookingName(name);
        setBookingEmail((prev) =>
          prev.trim() ? prev : (u.email ?? "").trim(),
        );
        setBookingPhone(phone);
      } catch {
        if (!cancelled) {
          setProfile({ name: u.name, phone: undefined, creditsRemaining: 0 });
          setStudentId("");
          setBookingName(u.name);
          setBookingEmail((prev) =>
            prev.trim() ? prev : (u.email ?? "").trim(),
          );
          setBookingPhone("");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session.state.user]);

  const goPrevWeek = () => {
    setSelectedSlotId(null);
    setSuccess(null);
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goNextWeek = () => {
    setSelectedSlotId(null);
    setSuccess(null);
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const tryReserve = () => {
    setSuccess(null);
    if (!selectedSlotId) return;
    if (!session.state.user) return setGate("login");
    if ((profile?.creditsRemaining ?? 0) <= 0) return setGate("pricing");
    return setGate("confirm");
  };

  const confirmReserve = async () => {
    if (!selectedSlotId || !selectedSlot) return;
    const user = session.state.user;
    if (!user) return;
    try {
      const email = bookingEmail.trim().toLowerCase();
      const res = await fetch(`/api/public/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          studentId,
          name: bookingName.trim() || user.name,
          email,
          phone: bookingPhone.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setSuccess(json?.error ?? "예약에 실패했습니다.");
        setGate("none");
        return;
      }
      const bookingId =
        typeof json?.booking?.id === "string" ? json.booking.id : "";

      // Also reflect in demo local state so /account shows something.
      try {
        const startISO =
          DateTime.fromISO(selectedSlot.dateKey, { zone: BUSINESS_TIME_ZONE })
            .plus({ minutes: selectedSlot.startMin })
            .toUTC()
            .toISO() ?? new Date().toISOString();
        session.reserveSlot(startISO, 50);
      } catch {
        // ignore
      }

      // Redirect to join guide immediately after booking
      if (bookingId) {
        router.push(`/join/${encodeURIComponent(bookingId)}`);
        return;
      }

      // fallback: keep current behavior if bookingId missing
      setSuccess("Booked.");
      setSelectedSlotId(null);
      setGate("none");
      await loadWeekSlots();
    } catch (e) {
      setSuccess(e instanceof Error ? e.message : "Booking failed.");
      setGate("none");
    }
  };

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              <CalendarDays className="w-8 h-8" />
              Pick a time
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a time to talk about today’s Korean.
            </p>
          </div>
          <SkipUpdate skip={profileLoading || slotsLoading}>
            <div className="flex flex-wrap items-center gap-2">
              {session.state.subscriptionPlan && (
                <Badge>
                  Subscription{" "}
                  {session.state.subscriptionPlan === "weekly1"
                    ? "Weekly (1)"
                    : "Weekly (2)"}
                </Badge>
              )}
              {session.state.passRemaining > 0 && (
                <Badge variant="muted">
                  {session.state.passRemaining} passes
                </Badge>
              )}
              <Link
                href={session.state.user ? "/account" : "/login?next=/booking"}
                className="inline-flex"
              >
                <Badge
                  variant="muted"
                  className="cursor-pointer hover:opacity-90"
                >
                  {signedLabel}
                </Badge>
              </Link>
              {session.state.user && creditsLabel && (
                <Link href="/account" className="inline-flex">
                  <Badge
                    variant={(creditsRemaining ?? 0) > 0 ? "default" : "black"}
                    className="cursor-pointer hover:opacity-90"
                  >
                    {creditsLabel}
                  </Badge>
                </Link>
              )}
            </div>
          </SkipUpdate>
        </div>

        {success && (
          <div className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 text-primary" />
              <div>{success}</div>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Pick a time</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 mr-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => scrollDesktopGridBy(-1)}
                      title="Scroll left"
                      disabled={!desktopCanScrollLeft}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => scrollDesktopGridBy(1)}
                      title="Scroll right"
                      disabled={!desktopCanScrollRight}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={goPrevWeek}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={goNextWeek}>
                    Next
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {slotsError && (
                  <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {slotsError}
                  </div>
                )}

                {/* Mobile: horizontal day selector + list */}
                {!slotsLoading && (
                  <div className="md:hidden">
                    <div className="grid grid-cols-3 gap-2">
                      {days.map((d) => {
                        const dk = dateKeyForSeoul(d);
                        const slots = slotsByDateKey[dk] ?? [];
                        const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
                        const availableCount = slots.filter((s) => {
                          if (!(s && typeof s.startMin === "number"))
                            return false;
                          const slotStart = DateTime.fromISO(s.dateKey, {
                            zone: BUSINESS_TIME_ZONE,
                          })
                            .startOf("day")
                            .plus({ minutes: s.startMin });
                          return (
                            s.available > 0 &&
                            slotStart.toMillis() > now.toMillis()
                          );
                        }).length;
                        const selected = selectedDateKey === dk;
                        return (
                          <button
                            key={dk}
                            type="button"
                            onClick={() => {
                              setSelectedDateKey(dk);
                              setSelectedSlotId(null);
                            }}
                            className={cn(
                              "rounded-xl border px-3 py-3 text-left transition",
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-white border-border hover:bg-muted/30 text-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "text-xs",
                                selected
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {formatWeekdayDate(d)}
                            </div>
                            <div className="mt-2 text-xs">
                              {slotsLoading
                                ? "Loading…"
                                : `${availableCount} available`}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {(slotsByDateKey[selectedDateKey] ?? []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No available slots.
                        </div>
                      ) : (
                        (slotsByDateKey[selectedDateKey] ?? [])
                          .slice()
                          .sort((a, b) => a.startMin - b.startMin)
                          .map((s) => {
                            const selected = selectedSlotId === s.id;
                            const now =
                              DateTime.now().setZone(BUSINESS_TIME_ZONE);
                            const slotStart = DateTime.fromISO(s.dateKey, {
                              zone: BUSINESS_TIME_ZONE,
                            })
                              .startOf("day")
                              .plus({ minutes: s.startMin });
                            const isPast =
                              slotStart.toMillis() <= now.toMillis();
                            const available = s.available > 0 && !isPast;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={!available}
                                onClick={() => {
                                  setSuccess(null);
                                  setSelectedSlotId(s.id);
                                }}
                                className={cn(
                                  "w-full rounded-xl border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                  available
                                    ? "bg-white border-border hover:bg-muted/30 text-foreground"
                                    : "bg-muted/30 border-border text-muted-foreground cursor-not-allowed",
                                  selected
                                    ? "ring-2 ring-primary border-primary"
                                    : "",
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-medium text-sm">
                                    {minutesToHhmm(s.startMin)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {isPast
                                      ? "Ended"
                                      : available
                                        ? ``
                                        : "Booked"}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* Desktop: grid */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,var(--bg-card),transparent)] transition-opacity duration-200",
                        desktopCanScrollLeft ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,var(--bg-card),transparent)] transition-opacity duration-200",
                        desktopCanScrollRight ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div
                      ref={desktopGridScrollerRef}
                      className="overflow-x-auto pb-2 pr-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div className="min-w-[1050px]">
                        <div className="grid grid-cols-[92px_repeat(7,1fr)] gap-2">
                          <div />
                          {days.map((d) => (
                            <div
                              key={d.toISOString()}
                              className="rounded-md border text-center border-border bg-muted/30 px-3 py-2"
                            >
                              <div className="text-sm font-semibold">
                                {formatWeekdayDate(d)}
                              </div>
                              {/* <div className="mt-1 text-xs text-muted-foreground">50 min</div> */}
                            </div>
                          ))}

                          {hours.map((h) => (
                            <React.Fragment key={h}>
                              <div className="flex items-center gap-2 px-1 text-sm text-primary">
                                <Clock className="size-4" />
                                {pad2(h)}:00
                              </div>
                              {days.map((d) => {
                                const dk = dateKeyForSeoul(d);
                                const list = slotsByDateKey[dk] ?? [];
                                const s =
                                  list.find((x) => x.startMin === h * 60) ??
                                  null;
                                const now =
                                  DateTime.now().setZone(BUSINESS_TIME_ZONE);
                                const slotStart = s
                                  ? DateTime.fromISO(s.dateKey, {
                                      zone: BUSINESS_TIME_ZONE,
                                    })
                                      .startOf("day")
                                      .plus({ minutes: s.startMin })
                                  : null;
                                const isPast = slotStart
                                  ? slotStart.toMillis() <= now.toMillis()
                                  : false;
                                const available = Boolean(
                                  s && s.available > 0 && !isPast,
                                );
                                const selected = Boolean(
                                  s && selectedSlotId === s.id,
                                );

                                return (
                                  <button
                                    key={`${dk}-${h}`}
                                    type="button"
                                    className={cn(
                                      "h-11 cursor-pointer rounded-md border text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                      available
                                        ? "bg-white border-border hover:bg-stone-50 text-foreground"
                                        : "bg-muted/30 border-border text-muted-foreground cursor-not-allowed",
                                      selected
                                        ? "ring-2 ring-primary border-primary"
                                        : "",
                                    )}
                                    disabled={!available}
                                    onClick={() => {
                                      setSuccess(null);
                                      if (!s) return;
                                      setSelectedDateKey(dk);
                                      setSelectedSlotId(s.id);
                                    }}
                                  >
                                    {s
                                      ? isPast
                                        ? "Ended"
                                        : available
                                          ? "Pick"
                                          : "Booked"
                                      : "—"}
                                  </button>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className=" lg:col-span-4">
            <div className="sticky top-24">
              <Card className="">
                <CardHeader>
                  <CardTitle>Selected time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SkipUpdate skip={slotsLoading || profileLoading}>
                    {selectedLabel ? (
                      <div className="mt-1 text-sm font-semibold">
                        {selectedLabel}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm font-semibold text-muted-foreground">
                        Please select a time
                      </div>
                    )}
                  </SkipUpdate>

                  <SkipUpdate
                    skip={Boolean(session.state.user && profileLoading)}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <img src="/coffeeee.png" className="w-6 -mt-1" />
                      {!session.state.user
                        ? "Sign in required"
                        : (profile?.creditsRemaining ?? 0) <= 0
                          ? "1 credit required"
                          : "1 credit will be used"}
                    </div>
                  </SkipUpdate>

                  {session.state.bookings.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold">
                        My bookings (demo)
                      </div>
                      <div className="mt-2 space-y-2">
                        {session.state.bookings.slice(0, 3).map((b) => {
                          const d = new Date(b.startISO);
                          return (
                            <div
                              key={b.id}
                              className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              <div className="font-medium">
                                {formatWeekdayDate(d)} {pad2(d.getHours())}:00
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {b.durationMin} min · booked
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {!session.state.user ? (
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      disabled={!selectedSlotId}
                    >
                      <Link href="/login?next=/booking">Continue</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedSlotId}
                      onClick={tryReserve}
                    >
                      {selectedLabel ? "Continue" : "Please select a time"}
                    </Button>
                  )}
                  {!session.state.user && (
                    <Button asChild className="w-full" variant="ghost">
                      <Link href="/login?next=/booking">Sign in</Link>
                    </Button>
                  )}
                  {session.state.user &&
                    (profile?.creditsRemaining ?? 0) <= 0 && (
                      <CheckoutButton
                        product="single"
                        className="w-full -mb-2"
                        variant="ghost"
                      >
                        Get credits
                      </CheckoutButton>
                    )}
                </CardFooter>
              </Card>

              <Card className="mt-3">
                <CardHeader>
                  <CardTitle>About the Session</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <img
                    src="/head.png"
                    className="inline-block mr-2 -mt-2  w-7 "
                  />
                  This session focuses on speaking Korean and is best for
                  learners beyond the very beginner level.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      <Modal
        open={gate === "login"}
        onClose={() => setGate("none")}
        title="Sign in required"
        description="Please sign in to continue. (Demo)"
        footer={
          <>
            <Button variant="outline" onClick={() => setGate("none")}>
              Close
            </Button>
            <Button asChild>
              <Link href="/login?next=/booking">Sign in with Google</Link>
            </Button>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">
          After signing in, get a pass/subscription and the booking button will
          unlock.
        </div>
      </Modal>

      <Modal
        open={gate === "pricing"}
        onClose={() => setGate("none")}
        title="Access required"
        description="You can pick a time once you have credits."
        footer={
          <>
            <Button variant="outline" onClick={() => setGate("none")}>
              Close
            </Button>
            <Link href="/#ways-to-use">
              <Button>Buy passes</Button>
            </Link>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">
          Payments are handled by Stripe Checkout, and credits are added to your
          account via webhook.
        </div>
      </Modal>

      <Modal
        open={gate === "confirm"}
        onClose={() => setGate("none")}
        title="Confirm time"
        description="Use this time slot?"
        footer={
          <>
            <Button variant="outline" onClick={() => setGate("none")}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const name = bookingName.trim();
                if (!name) {
                  alert("Please enter your name.");
                  return;
                }
                const email = bookingEmail.trim().toLowerCase();
                if (!email || !isEmail(email)) {
                  alert("Please enter a valid email address.");
                  return;
                }
                const phone = bookingPhone.trim();
                const digits = phone.replace(/\\D/g, "");
                if (phone && digits.length < 6) {
                  alert("Please enter a valid phone number.");
                  return;
                }
                void confirmReserve();
              }}
              disabled={!selectedSlotId}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="text-lg font-semibold text-primary">
              {selectedLabel ?? "-"}
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            Contact info
          </div>
          <div className="mt-2 grid gap-2">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Name</span>
              <Input
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="Your name"
                disabled={profileLoading}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Email</span>
              <Input
                value={bookingEmail}
                onChange={(e) => setBookingEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={profileLoading}
                inputMode="email"
                autoComplete="email"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">
                Phone (optional)
              </span>
              <PhoneInput
                value={bookingPhone}
                disabled={profileLoading}
                onChange={(next) => setBookingPhone(next)}
                placeholder="Local number"
              />
            </label>
          </div>
          <div className="rounded-md border flex items-center gap-2 border-border bg-muted/40 p-3">
            <CheckCircle strokeWidth={1.5} className="w-4 h-4 " />
            Cancellations are allowed up to 1 hour before the session.
          </div>
        </div>
      </Modal>
    </div>
  );
}
