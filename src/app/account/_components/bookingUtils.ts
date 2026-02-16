import { DateTime } from "luxon";

export function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function callWindowForBooking(
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

export function startsRelativeLabel(
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

export function bookingLocalTimes(args: {
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

export function formatBookingTimeLabel(args: {
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

export function zoneToCityLabel(tz: string) {
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

export type BookingBadgeInfo = {
  text: string;
  variant: "default" | "muted" | "outline";
  className?: string;
};

export function statusBadge(status: string): BookingBadgeInfo {
  const s = String(status ?? "");
  if (s === "confirmed")
    return {
      text: "All set",
      variant: "default",
      className:
        "bg-included-2 text-[color-mix(in_srgb,var(--foreground)_82%,var(--included-2)_18%)] ring-1 ring-black/5",
    };
  if (s === "cancelled") return { text: "Cancelled", variant: "muted" };
  if (s === "no_show") return { text: "Missed", variant: "muted" };
  return { text: s || "—", variant: "outline" };
}

export function bookingBadge(b: {
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

