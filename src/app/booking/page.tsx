"use client";

import Link from "next/link";
import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import { Container } from "@/components/site/Container";
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
import Image from "next/image";
import {
  DEFAULT_PHONE_COUNTRY,
  parsePhoneParts,
} from "@/components/ui/PhonePartsInput";
import {
  ConfirmBookingModal,
  type ConfirmBookingContact,
} from "@/components/booking/ConfirmBookingModal";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

function getBrowserTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof tz === "string" && tz.trim() ? tz.trim() : null;
  } catch {
    return null;
  }
}

function resolveDisplayZone(siteZone: string) {
  const browserTz = getBrowserTimeZone();
  const preferred = browserTz ?? siteZone;

  const dt = DateTime.local().setZone(preferred);
  if (dt.isValid) {
    return {
      zoneName: preferred,
      source: browserTz ? ("browser" as const) : ("site" as const),
    };
  }

  return { zoneName: siteZone, source: "site" as const };
}

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

export default function BookingPage() {
  const session = useMockSession();
  const router = useRouter();
  const desktopGridScrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [durationMin, setDurationMin] = React.useState<25 | 50>(25);
  const creditsNeeded = durationMin === 50 ? 2 : 1;
  // Show today as the left-most day by default (not week-start)
  const [weekStart, setWeekStart] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = React.useState<string>(
    () => DateTime.now().toISODate() ?? new Date().toISOString().slice(0, 10),
  );
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  );
  const [success, setSuccess] = React.useState<string | null>(null);
  const tz = React.useMemo(() => resolveDisplayZone(BUSINESS_TIME_ZONE), []);
  const displayZone = tz.zoneName;
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

  const slotById = React.useMemo(() => {
    const m = new Map<string, SlotResponseItem>();
    for (const list of Object.values(slotsByDateKey)) {
      for (const s of list) m.set(s.id, s);
    }
    return m;
  }, [slotsByDateKey]);

  const slotByDateStartMin = React.useMemo(() => {
    const out: Record<string, Map<number, SlotResponseItem>> = {};
    for (const [dateKey, list] of Object.entries(slotsByDateKey)) {
      const m = new Map<number, SlotResponseItem>();
      for (const s of list) m.set(s.startMin, s);
      out[dateKey] = m;
    }
    return out;
  }, [slotsByDateKey]);

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
  const [profileReloadTick, setProfileReloadTick] = React.useState(0);
  const [studentId, setStudentId] = React.useState("");
  const [contactPrefill, setContactPrefill] =
    React.useState<ConfirmBookingContact>({
      name: "",
      email: "",
      phoneCountry: DEFAULT_PHONE_COUNTRY,
      phoneNumber: "",
    });
  // const welcomeName = (profile?.name ?? session.state.user?.name ?? "").trim();
  // const signedLabel = session.state.user
  //   ? welcomeName || "Signed in"
  //   : "Signed out";
  const creditsRemaining = profileLoading
    ? null
    : (profile?.creditsRemaining ?? 0);
  const creditsLabel = !session.state.user
    ? null
    : creditsRemaining == null
      ? "Credits…"
      : creditsRemaining > 0
        ? `${creditsRemaining} credits remaining`
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

  const displayDayKeys = React.useMemo(() => {
    return days.map(
      (d) =>
        DateTime.fromJSDate(d, { zone: displayZone }).toISODate() ??
        d.toISOString().slice(0, 10),
    );
  }, [days, displayZone]);

  const seoulKeysToFetch = React.useMemo(() => {
    try {
      const startLocal = DateTime.fromJSDate(weekStart, {
        zone: displayZone,
      }).startOf("day");
      const endLocal = startLocal.plus({ days: 6 });
      const seoulStart = startLocal
        .setZone(BUSINESS_TIME_ZONE)
        .minus({ days: 1 })
        .startOf("day");
      const seoulEnd = endLocal
        .setZone(BUSINESS_TIME_ZONE)
        .plus({ days: 1 })
        .startOf("day");

      const out: string[] = [];
      let dt = seoulStart;
      const endMs = seoulEnd.toMillis();
      while (dt.toMillis() <= endMs) {
        const k = dt.toISODate();
        if (k) out.push(k);
        dt = dt.plus({ days: 1 });
      }
      return Array.from(new Set(out));
    } catch {
      return displayDayKeys;
    }
  }, [displayDayKeys, displayZone, weekStart]);

  const dayStartMsByDateKey = React.useMemo(() => {
    const out: Record<string, number> = {};
    const keys = new Set<string>([
      ...Object.keys(slotsByDateKey),
      ...seoulKeysToFetch,
    ]);
    for (const k of keys) {
      try {
        out[k] = DateTime.fromISO(k, { zone: BUSINESS_TIME_ZONE })
          .startOf("day")
          .toMillis();
      } catch {
        // ignore
      }
    }
    return out;
  }, [seoulKeysToFetch, slotsByDateKey]);

  const localSlotIndex = React.useMemo(() => {
    const visible = new Set(displayDayKeys);
    const byDay: Record<string, Map<number, SlotResponseItem>> = {};
    for (const k of displayDayKeys) byDay[k] = new Map();
    const localStartMins: number[] = [];

    for (const list of Object.values(slotsByDateKey)) {
      for (const s of list) {
        try {
          const startLocal = DateTime.fromISO(s.dateKey, {
            zone: BUSINESS_TIME_ZONE,
          })
            .startOf("day")
            .plus({ minutes: s.startMin })
            .setZone(displayZone);
          const dayKey = startLocal.toISODate();
          if (!dayKey || !visible.has(dayKey)) continue;
          const localMin = startLocal.hour * 60 + startLocal.minute;
          (byDay[dayKey] ?? (byDay[dayKey] = new Map())).set(localMin, s);
          localStartMins.push(localMin);
        } catch {
          // ignore
        }
      }
    }

    return { byDay, localStartMins };
  }, [displayDayKeys, displayZone, slotsByDateKey]);

  const gridStep = React.useMemo(() => {
    const mins = localSlotIndex.localStartMins;
    if (mins.length === 0) return 30 as const;
    const anyNon30 = mins.some((m) => m % 30 !== 0);
    if (!anyNon30) return 30 as const;
    const all15 = mins.every((m) => m % 15 === 0);
    return all15 ? (15 as const) : (30 as const);
  }, [localSlotIndex.localStartMins]);

  const showFifteenMinuteWarning = React.useMemo(() => {
    return gridStep === 15;
  }, [gridStep]);

  const timeRows = React.useMemo(() => {
    const mins = localSlotIndex.localStartMins;
    const fallbackMin = 9 * 60;
    const fallbackMax = 22 * 60;
    const min = mins.length ? Math.min(...mins) : fallbackMin;
    const max = mins.length ? Math.max(...mins) : fallbackMax;
    const start = Math.max(0, Math.floor(min / gridStep) * gridStep);
    const end = Math.min(
      24 * 60 - gridStep,
      Math.ceil(max / gridStep) * gridStep,
    );
    const out: number[] = [];
    for (let m = start; m <= end; m += gridStep) out.push(m);
    return out;
  }, [gridStep, localSlotIndex.localStartMins]);

  React.useEffect(() => {
    // keep selected day inside the displayed week
    if (!displayDayKeys.includes(selectedDateKey)) {
      setSelectedDateKey(displayDayKeys[0] ?? selectedDateKey);
      setSelectedSlotId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayDayKeys]);

  const selectedSlot = React.useMemo(() => {
    if (!selectedSlotId) return null;
    return slotById.get(selectedSlotId) ?? null;
  }, [selectedSlotId, slotById]);

  const selectedSlot2 = React.useMemo(() => {
    if (durationMin !== 50) return null;
    if (!selectedSlot) return null;
    const m = slotByDateStartMin[selectedSlot.dateKey];
    return m?.get(selectedSlot.startMin + 30) ?? null;
  }, [durationMin, selectedSlot, slotByDateStartMin]);

  const selectedSlot2Id = selectedSlot2?.id ?? null;

  const bookableById = React.useMemo(() => {
    const nowMs = Date.now();
    const out = new Map<string, { ok: boolean; reason: string | null }>();
    for (const s of slotById.values()) {
      const dayStartMs =
        dayStartMsByDateKey[s.dateKey] ??
        DateTime.fromISO(s.dateKey, { zone: BUSINESS_TIME_ZONE })
          .startOf("day")
          .toMillis();
      const slotStartMs = dayStartMs + s.startMin * 60 * 1000;
      if (slotStartMs <= nowMs) {
        out.set(s.id, { ok: false, reason: "Ended" });
        continue;
      }
      if (!(s.available > 0)) {
        out.set(s.id, { ok: false, reason: "Booked" });
        continue;
      }
      if (durationMin === 25) {
        out.set(s.id, { ok: true, reason: null });
        continue;
      }
      const next = slotByDateStartMin[s.dateKey]?.get(s.startMin + 30) ?? null;
      if (!next || !(next.available > 0)) {
        out.set(s.id, { ok: false, reason: "" });
        continue;
      }
      out.set(s.id, { ok: true, reason: null });
    }
    return out;
  }, [dayStartMsByDateKey, durationMin, slotByDateStartMin, slotById]);

  const selectedOk = React.useMemo(() => {
    if (!selectedSlotId) return false;
    return bookableById.get(selectedSlotId)?.ok ?? false;
  }, [bookableById, selectedSlotId]);

  const selectedLabel = React.useMemo(() => {
    if (!selectedSlot) return null;
    const dtSeoul = DateTime.fromISO(selectedSlot.dateKey, {
      zone: BUSINESS_TIME_ZONE,
    })
      .startOf("day")
      .plus({ minutes: selectedSlot.startMin });
    const dt = dtSeoul.setZone(displayZone);
    const end = dt.plus({ minutes: durationMin });
    const weekday =
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dt.weekday - 1] ?? "";
    return `${weekday} ${dt.toFormat("MMM d")} · ${dt.toFormat("HH:mm")}–${end.toFormat("HH:mm")}`;
  }, [displayZone, durationMin, selectedSlot]);

  const weekRangeLabel = React.useMemo(() => {
    try {
      const start = DateTime.fromJSDate(weekStart, {
        zone: displayZone,
      }).startOf("day");
      const end = start.plus({ days: 6 });
      if (start.hasSame(end, "year")) {
        return `${start.toFormat("MMM d")} — ${end.toFormat("MMM d")}`;
      }
      return `${start.toFormat("MMM d, yyyy")} — ${end.toFormat("MMM d, yyyy")}`;
    } catch {
      return "";
    }
  }, [displayZone, weekStart]);

  const loadWeekSlots = React.useCallback(async () => {
    const startedAt = Date.now();
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const results = await Promise.all(
        seoulKeysToFetch.map(async (dateKey) => {
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
  }, [seoulKeysToFetch, slotsSkeletonMinMs]);

  React.useEffect(() => {
    void loadWeekSlots();
  }, [loadWeekSlots]);

  React.useEffect(() => {
    const user = session.state.user;
    if (!user) {
      setProfile(null);
      setStudentId("");
      setContactPrefill({
        name: "",
        email: "",
        phoneCountry: DEFAULT_PHONE_COUNTRY,
        phoneNumber: "",
      });
      return;
    }
    const u = user;
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
              phoneCountry?: string;
              phoneNumber?: string;
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
        const phoneFull = (s?.phone ?? "").trim() || "";
        const phoneParts =
          (s?.phoneCountry ?? "").trim() || (s?.phoneNumber ?? "").trim()
            ? {
                country:
                  (s?.phoneCountry ?? "").trim() || DEFAULT_PHONE_COUNTRY,
                number: (s?.phoneNumber ?? "").trim(),
              }
            : parsePhoneParts(phoneFull);
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
          phone: phoneFull || undefined,
          creditsRemaining,
          nextExpiry,
        });
        setContactPrefill({
          name,
          email: (u.email ?? "").trim(),
          phoneCountry: phoneParts.country || DEFAULT_PHONE_COUNTRY,
          phoneNumber: phoneParts.number || "",
        });
      } catch {
        if (!cancelled) {
          setProfile({ name: u.name, phone: undefined, creditsRemaining: 0 });
          setStudentId("");
          setContactPrefill({
            name: (u.name ?? "").trim(),
            email: (u.email ?? "").trim(),
            phoneCountry: DEFAULT_PHONE_COUNTRY,
            phoneNumber: "",
          });
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [profileReloadTick, session.state.user]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onRefresh = () => setProfileReloadTick((v) => v + 1);
    window.addEventListener("mj_profile_refresh", onRefresh);
    return () => window.removeEventListener("mj_profile_refresh", onRefresh);
  }, []);

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
    if (!selectedOk) return;
    if (!session.state.user) return setGate("login");
    if ((profile?.creditsRemaining ?? 0) < creditsNeeded)
      return setGate("pricing");
    return setGate("confirm");
  };

  const confirmReserveWithContact = async (c: ConfirmBookingContact) => {
    if (!selectedSlotId || !selectedSlot) return;
    if (!selectedOk) return;
    const user = session.state.user;
    if (!user) return;
    try {
      const email = (c.email ?? "").trim().toLowerCase();
      const res = await fetch(`/api/public/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          durationMin,
          studentId,
          name: (c.name ?? "").trim() || user.name,
          email,
          phoneCountry: (c.phoneCountry ?? "").trim() || DEFAULT_PHONE_COUNTRY,
          phoneNumber: String(c.phoneNumber ?? "").replace(/\D/g, ""),
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
        session.reserveSlot(startISO, durationMin);
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
    <div className={`py-14 ${slotsLoading ? "sm:cursor-wait" : ""}`}>
      <TopProgressBar active={slotsLoading} />
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {/* <img src="/calendar.webp" alt="Time" className="w-8 h-8" /> */}
              Pick Session time
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a time for Korean session with Minjae.
            </p>
          </div>
          <SkipUpdate skip={profileLoading || slotsLoading}>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedToggle
                size="lg"
                value={durationMin}
                options={[
                  { value: 25, label: "25 min" },
                  { value: 50, label: "50 min" },
                ]}
                onChange={(next) => {
                  setDurationMin(next);
                  if (next === 50) {
                    // If current selection is not eligible for 50, clear it.
                    if (!selectedSlot) return;
                    const nextSlot =
                      slotByDateStartMin[selectedSlot.dateKey]?.get(
                        selectedSlot.startMin + 30,
                      ) ?? null;
                    if (!nextSlot || !(nextSlot.available > 0))
                      setSelectedSlotId(null);
                  }
                }}
              />
              {/* <Link
                href={session.state.user ? "/account" : "/login?next=/booking"}
                className="inline-flex"
              >
                <Badge
                  variant="muted"
                  className="cursor-pointer hover:opacity-90"
                >
                  {signedLabel}
                </Badge>
              </Link> */}
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

        <div className="mt-6 md:mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{weekRangeLabel}</CardTitle>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Times shown in your time{" "}
                    <span className="font-medium rounded-md px-1 py-0.5 text-xs inline-block">
                      {" "}
                      ({displayZone})
                    </span>
                    {showFifteenMinuteWarning ? (
                      <span className="ml-2 text-amber-600">
                        (15-minute offset detected)
                      </span>
                    ) : null}
                  </div>
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
                  <div className="whitespace-nowrap rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {slotsError}
                  </div>
                )}

                {/* Mobile: horizontal day selector + list */}
                <div className="md:hidden">
                  <div className="grid grid-cols-2 gap-2">
                    {days.map((d, i) => {
                      const dk =
                        displayDayKeys[i] ?? d.toISOString().slice(0, 10);
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
                            "w-full rounded-xl border px-4 py-3 text-center transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "bg-white border-border cursor-pointer hover:bg-stone-50 text-foreground",
                            selected
                              ? "ring-2 ring-primary border-primary"
                              : "",
                          )}
                        >
                          <div className="text-sm font-semibold">
                            {formatWeekdayDate(d)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {slotsLoading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading…
                      </div>
                    ) : Array.from(
                        (
                          localSlotIndex.byDay[selectedDateKey] ?? new Map()
                        ).entries(),
                      ).length === 0 ? (
                      <div className="text-sm whitespace-nowrap text-muted-foreground">
                        No available slots.
                      </div>
                    ) : (
                      Array.from(
                        (
                          localSlotIndex.byDay[selectedDateKey] ?? new Map()
                        ).entries(),
                      )
                        .sort((a, b) => a[0] - b[0])
                        .map(([localStartMin, s]) => {
                          const selectedPrimary = selectedSlotId === s.id;
                          const selectedSecondary = Boolean(
                            selectedSlot2Id && selectedSlot2Id === s.id,
                          );
                          const b = bookableById.get(s.id) ?? {
                            ok: false,
                            reason: "—",
                          };
                          const available = b.ok;
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
                                "w-full rounded-xl text-center border px-4 py-3  transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                available
                                  ? "bg-white border-border cursor-pointer hover:bg-stone-50 text-foreground"
                                  : "bg-muted/30 border-border text-muted-foreground cursor-not-allowed",
                                selectedPrimary
                                  ? "ring-2 ring-primary border-primary"
                                  : "",
                                selectedSecondary && !selectedPrimary
                                  ? "ring-2 ring-primary/35 border-primary/40 bg-primary/5"
                                  : "",
                              )}
                            >
                              <div className="flex-col md:flex-row flex flex-wrap items-center justify-around gap-1">
                                <div className="font-medium text-sm">
                                  {minutesToHhmm(localStartMin)}
                                </div>
                                {!available && (
                                  <div className="text-xs whitespace-nowrap text-muted-foreground">
                                    {available ? "" : b.reason}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-y-0 left-20 z-10 w-20 bg-[linear-gradient(90deg,var(--bg-card),transparent)] transition-opacity duration-200",
                        desktopCanScrollLeft ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div
                      className={cn(
                        " absolute inset-y-0 left-0 z-10 bg-card w-20",
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
                          {/* Sticky corner so the time column stays readable while scrolling */}
                          <div className="sticky left-0 z-30 bg-card" />
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

                          {timeRows.map((startMin) => (
                            <React.Fragment key={startMin}>
                              <div className="sticky left-0 z-20 flex items-center gap-2 px-1 text-sm text-primary bg-card">
                                <Clock className="size-4" />
                                {minutesToHhmm(startMin)}
                              </div>
                              {days.map((d, i) => {
                                const dk =
                                  displayDayKeys[i] ??
                                  d.toISOString().slice(0, 10);
                                const s =
                                  localSlotIndex.byDay[dk]?.get(startMin) ??
                                  null;
                                const b = s
                                  ? (bookableById.get(s.id) ?? {
                                      ok: false,
                                      reason: "—",
                                    })
                                  : { ok: false, reason: "—" };
                                const available = Boolean(s && b.ok);
                                const selectedPrimary = Boolean(
                                  s && selectedSlotId === s.id,
                                );
                                const selectedSecondary = Boolean(
                                  s &&
                                  selectedSlot2Id &&
                                  selectedSlot2Id === s.id,
                                );

                                return (
                                  <button
                                    key={`${dk}-${startMin}`}
                                    type="button"
                                    className={cn(
                                      "h-11 cursor-pointer rounded-md border text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                      available
                                        ? "bg-white border-border hover:bg-stone-50 text-foreground"
                                        : "bg-muted/30 border-border text-muted-foreground cursor-not-allowed",
                                      selectedPrimary
                                        ? "ring-2 ring-primary border-primary"
                                        : "",
                                      selectedSecondary && !selectedPrimary
                                        ? "ring-2 ring-primary/35 border-primary/40 bg-primary/5"
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
                                    {s ? (available ? "Pick" : b.reason) : "—"}
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
                      <Image
                        width={24}
                        height={30}
                        src="/coffeeee.webp"
                        alt="Coffee"
                        className="-mt-1"
                      />
                      {!session.state.user
                        ? "Please sign in"
                        : (profile?.creditsRemaining ?? 0) < creditsNeeded
                          ? `${creditsNeeded} credits required`
                          : `${creditsNeeded} credit${creditsNeeded === 1 ? "" : "s"} will be used`}
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
                                {formatWeekdayDate(d)} {pad2(d.getHours())}:
                                {pad2(d.getMinutes())}
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
                      disabled={!selectedSlotId || !selectedOk}
                    >
                      <Link href="/login?next=/booking">Continue</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedSlotId || !selectedOk}
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
                    (profile?.creditsRemaining ?? 0) < creditsNeeded && (
                      <Button asChild className="w-full" variant="ghost">
                        <Link href="/#ways-to-use">Get credits</Link>
                      </Button>
                    )}
                </CardFooter>
              </Card>

              <Card className="mt-3">
                <CardHeader>
                  <CardTitle>About the Session</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <Image
                    width={28}
                    height={25}
                    src="/head.webp"
                    alt="Head"
                    className="inline-block mr-2 -mt-2  "
                  />
                  This session is working with Google Meet. You will receive a
                  link to the meeting after you book the session.
                </CardContent>
              </Card>
              {session.state.user && creditsLabel && (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full hover:bg-muted text-stone-500 rounded-md px-3 py-2 text-center text-sm justify-center flex mt-2"
                >
                  <Link href="/#ways-to-use">{creditsLabel}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>

      <Modal
        open={gate === "login"}
        onClose={() => setGate("none")}
        title="Please sign in"
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
        title="Class pass required"
        description="You need a class pass to book a lesson."
        footer={
          <>
            <Button variant="outline" onClick={() => setGate("none")}>
              Maybe later
            </Button>
            <Link href="/#ways-to-use">
              <Button>Get class pass</Button>
            </Link>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">
          Purchase a class pass to reserve your session. Your pass will be
          available immediately after payment.
        </div>
      </Modal>

      <ConfirmBookingModal
        open={gate === "confirm"}
        onClose={() => setGate("none")}
        selectedLabel={selectedLabel}
        disabled={!selectedSlotId || !selectedOk || profileLoading}
        initialContact={contactPrefill}
        onConfirm={async (c) => {
          await confirmReserveWithContact(c);
        }}
      />
    </div>
  );
}
