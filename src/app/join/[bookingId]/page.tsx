"use client";

import Link from "next/link";
import * as React from "react";
import { DateTime } from "luxon";
import {
  CheckCircle2,
  Clock,
  Video,
  Mic,
  Shield,
  ExternalLink,
  CopyIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { cn } from "@/lib/utils";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

type BookingListItem = {
  id: string;
  code?: string;
  status: string;
  createdAt: string;
  slotId: string;
  dateKey: string;
  startMin: number;
  endMin: number;
  cancelled: boolean;
};

function isBookingListItem(v: unknown): v is BookingListItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    (o.code === undefined || typeof o.code === "string") &&
    typeof o.status === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.dateKey === "string" &&
    typeof o.startMin === "number" &&
    typeof o.endMin === "number"
  );
}

function matchesBookingKey(v: unknown, bookingKey: string): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.id === bookingKey || o.code === bookingKey;
}

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

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}h ${mm}m`;
  if (mm > 0) return `${mm}m ${ss}s`;
  return `${ss}s`;
}

export default function JoinGuidePage() {
  const router = useRouter();
  const session = useMockSession();

  // Use useParams() in client component to avoid sync dynamic params error.
  const routeParams = useParams<{ bookingId?: string | string[] }>();
  const bookingId = Array.isArray(routeParams.bookingId)
    ? (routeParams.bookingId[0] ?? "")
    : (routeParams.bookingId ?? "");
  const userEmail = session.state.user?.email ?? "";
  const studentIdStorageKey = React.useMemo(() => {
    const authUserId = (session.state.user as { id?: string } | null)?.id ?? "";
    if (authUserId.trim()) return `mj_student_id_${authUserId.trim()}`;
    const email = (session.state.user?.email ?? "").trim().toLowerCase();
    return email ? `mj_student_id_${email}` : "mj_student_id";
  }, [session.state.user]);
  const [meetingKey, setMeetingKey] = React.useState<string>(bookingId);
  React.useEffect(() => setMeetingKey(bookingId), [bookingId]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<{
    id: string;
    code?: string;
    dateKey: string;
    startMin: number;
    endMin: number;
    createdAt: string;
    status: string;
  } | null>(null);

  // Polling-ish clock for countdown
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (!userEmail) return;
    let sid = "";
    try {
      sid =
        typeof window !== "undefined"
          ? (window.localStorage.getItem(studentIdStorageKey) ?? "").trim()
          : "";
    } catch {
      sid = "";
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = sid
          ? `studentId=${encodeURIComponent(sid)}`
          : `email=${encodeURIComponent(userEmail)}`;
        const res = await fetch(`/api/public/bookings?${qs}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.ok) {
          setError(json?.error ?? "예약 정보를 불러오지 못했습니다.");
          return;
        }
        const itemsRaw = (json?.data?.items ?? []) as unknown;
        const items = Array.isArray(itemsRaw) ? itemsRaw : [];
        const foundRaw =
          items.find((x) => matchesBookingKey(x, bookingId)) ?? null;
        const found = isBookingListItem(foundRaw) ? foundRaw : null;
        if (!found) {
          setError("이 예약을 찾을 수 없어요. (로그인 이메일을 확인해주세요)");
          return;
        }
        setBooking(found);
        setMeetingKey(
          (found.code ?? "").trim() ? (found.code ?? "").trim() : found.id,
        );
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "예약 정보를 불러오지 못했습니다.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId, userEmail, studentIdStorageKey]);

  const tz = React.useMemo(() => resolveDisplayZone(BUSINESS_TIME_ZONE), []);
  const displayZone = tz.zoneName;
  const startSeoul = booking
    ? DateTime.fromISO(booking.dateKey, { zone: BUSINESS_TIME_ZONE })
        .startOf("day")
        .plus({ minutes: booking.startMin })
    : null;
  const endSeoul = booking
    ? DateTime.fromISO(booking.dateKey, { zone: BUSINESS_TIME_ZONE })
        .startOf("day")
        .plus({ minutes: booking.endMin })
    : null;
  const startLocal = startSeoul ? startSeoul.setZone(displayZone) : null;
  const endLocal = endSeoul ? endSeoul.setZone(displayZone) : null;
  const openAt = startSeoul ? startSeoul.minus({ minutes: 10 }) : null;
  const canEnterLobby = Boolean(openAt && nowMs >= openAt.toMillis());

  const meetingUrl =
    typeof window === "undefined"
      ? `/call/${encodeURIComponent(meetingKey)}`
      : `${window.location.origin}/call/${encodeURIComponent(meetingKey)}`;

  const [copied, setCopied] = React.useState(false);
  const [permissionsRequested, setPermissionsRequested] = React.useState(false);
  const [permStatus, setPermStatus] = React.useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [permChecking, setPermChecking] = React.useState(false);

  const requestPermissions = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("mediaDevices" in navigator)) return;
    if (permChecking) return;
    setPermChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((t) => t.stop());
      setPermStatus("granted");
    } catch (err: any) {
      const name = err && err.name ? String(err.name) : "";
      if (
        name === "NotAllowedError" ||
        name === "SecurityError" ||
        name === "NotReadableError"
      ) {
        setPermStatus("denied");
      } else {
        setPermStatus("unknown");
      }
    } finally {
      setPermChecking(false);
    }
  }, [permChecking]);
  const copyMeetingUrl = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [meetingUrl]);

  // Prompt camera & microphone permission once on page load (best-effort)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("mediaDevices" in navigator)) return;
    if (permissionsRequested) return;
    setPermissionsRequested(true);
    void requestPermissions();
    // run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = React.useMemo(() => {
    const list = [
      {
        ko: "오늘도 만나서 반가워요. 천천히 준비해요.",
        en: "So glad to see you. Let’s get ready, gently.",
      },
      {
        ko: "잘 오셨어요. 숨 한번, 그리고 시작!",
        en: "You made it. One breath, then we begin.",
      },
      {
        ko: "괜찮아요. 여기서는 천천히 해도 돼요.",
        en: "It’s okay to go slow here.",
      },
      {
        ko: "준비가 되면 문이 열릴 거예요 :)",
        en: "When you’re ready, the door will open :)",
      },
    ];

    return list[Math.floor(Math.random() * list.length)] ?? list[0];
  }, [bookingId]);

  function statusLabel(status: string) {
    if (status === "confirmed") return "Confirmed";
    if (status === "cancelled") return "Cancelled";
    if (status === "no_show") return "Missed";
    return status || "—";
  }

  const bookingStatus = booking?.status ?? "";
  const statusUI = (() => {
    if (!bookingStatus)
      return { text: "Booking confirmed", tone: "muted" as const };
    if (bookingStatus === "confirmed")
      return { text: "Booking confirmed", tone: "good" as const };
    if (bookingStatus === "cancelled")
      return { text: "Booking cancelled", tone: "bad" as const };
    if (bookingStatus === "no_show")
      return { text: "Session missed", tone: "bad" as const };
    return {
      text: `Status: ${statusLabel(bookingStatus)}`,
      tone: "muted" as const,
    };
  })();

  // Keep status pill neutral (avoid "system-y" colors here).
  const statusPillClass = "border-border bg-card text-primary";
  const statusIconClass = "text-primary";

  const permDotClass =
    permStatus === "granted"
      ? "bg-emerald-500"
      : permStatus === "denied"
        ? "bg-red-500"
        : "bg-muted-foreground/40";

  if (!session.state.user) {
    return (
      <div className="py-10 sm:py-14">
        <Container className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>
                Sign in with the email you used for booking to see your lobby
                link.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="w-full" size="lg">
                <Link
                  href={`/login?next=${encodeURIComponent(`/join/${bookingId}`)}`}
                >
                  Sign in
                </Link>
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
      <Container className="max-w-3xl">
        <div className="text-center">
          <div
            className={cn(
              "mx-auto inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold",
              statusPillClass,
            )}
          >
            {statusUI.text}
          </div>
          <div className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            You’re all set ✨
          </div>
          <div className="mt-2 text-sm text-muted-foreground sm:text-base">
            Your session with Minjae is booked.
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <div className="font-semibold">Couldn’t load booking</div>
            <div className="mt-1 text-muted-foreground">{error}</div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4">
          {/* Link (primary) */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Meeting link</CardTitle>
              <CardDescription>
                Save this link for your session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Session link
                  </div>
                  <div
                    className="mt-1 break-all font-mediums text-sm text-foreground/90"
                    title={meetingUrl}
                  >
                    {meetingUrl}
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => void copyMeetingUrl()}
                    className={cn(
                      copied ? "bg-primary text-white" : "",
                      "bg-black text-white hover:bg-black/90 active:bg-black/80",
                    )}
                  >
                    {copied ? "Copied" : "Copy"} <CopyIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Your session</CardTitle>
              <CardDescription>Here’s what’s scheduled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="default"
                  className="ring-1 ring-black/5 dark:ring-white/10"
                >
                  {displayZone} Time
                </Badge>
                <Badge
                  variant="default"
                  className="ring-1 ring-black/5 dark:ring-white/10"
                >
                  {statusLabel(booking?.status ?? "")}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  Time
                </div>
                <div className="text-right text-sm font-semibold text-foreground">
                  {startLocal && endLocal
                    ? `${startLocal.toFormat("ccc, MMM d")} · ${startLocal.toFormat("h:mm a")}–${endLocal.toFormat("h:mm a")}`
                    : loading
                      ? "Loading…"
                      : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Join the session</CardTitle>
              <CardDescription>
                Your lobby opens 10 minutes before class.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                disabled={!booking || Boolean(error) || !canEnterLobby}
                onClick={() =>
                  router.push(`/call/${encodeURIComponent(meetingKey)}`)
                }
              >
                Enter lobby
              </Button>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", permDotClass)} />
                    <Video className="size-4" />
                    Camera
                  </div>
                  <div className="text-xs">
                    {permStatus === "granted"
                      ? "Ready"
                      : permStatus === "denied"
                        ? "Blocked"
                        : "Check needed"}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", permDotClass)} />
                    <Mic className="size-4" />
                    Microphone
                  </div>
                  <div className="text-xs">
                    {permStatus === "granted"
                      ? "Ready"
                      : permStatus === "denied"
                        ? "Blocked"
                        : "Check needed"}
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="justify-start px-0"
                    disabled={permChecking || permStatus === "granted"}
                    onClick={() => void requestPermissions()}
                  >
                    {permStatus === "granted"
                      ? "Permissions ready"
                      : permChecking
                        ? "Checking…"
                        : "Check permissions"}
                  </Button>
                  {permStatus === "denied" ? (
                    <div className="text-xs text-muted-foreground">
                      If it’s blocked, enable Camera & Microphone in your browser site settings.
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                  {canEnterLobby
                    ? "Lobby is open. You can enter now."
                    : openAt
                      ? `Lobby opens in ${formatCountdown(openAt.toMillis() - nowMs)}`
                      : "Lobby opens 10 minutes before class."}
                </div>
                {permStatus === "denied" ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="size-4" />
                    Please allow camera & microphone permissions to join
                    smoothly.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href="/account">
              My bookings <ExternalLink className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href="/booking">Pick another time</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

// <div className="mt-6">
// <Card>
//   <CardHeader>
//     <CardTitle>If you can’t connect</CardTitle>
//     <CardDescription>Most issues are fixed with these quick checks.</CardDescription>
//   </CardHeader>
//   <CardContent className="space-y-3 text-sm text-muted-foreground">
//     <div className="rounded-lg border border-border bg-muted/30 p-3">
//       - Chrome is recommended.<br />- Check if another tab/app is using your camera or microphone.
//     </div>
//     <div className="rounded-lg border border-border bg-muted/30 p-3">
//       - Some school/company networks may block P2P.<br />- In that case we may fall back to TURN (it can take a few seconds).
//     </div>
//   </CardContent>
// </Card>
// </div>
