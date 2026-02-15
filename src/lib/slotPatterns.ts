import { DateTime } from "luxon";
import type { Slot } from "./slotsRepo";

// pattern: map of weekday (0=Sun..6=Sat) -> array of { startMin, endMin }
export type WeeklyPattern = Record<
  string,
  Array<{ startMin: number; endMin: number }>
>;

export function generateSlotsFromPattern(args: {
  pattern: WeeklyPattern;
  fromDateKey: string; // YYYY-MM-DD
  toDateKey: string;
  tz?: string;
}): Slot[] {
  const tz = args.tz ?? "UTC";
  const from = DateTime.fromISO(args.fromDateKey, { zone: tz }).startOf("day");
  const to = DateTime.fromISO(args.toDateKey, { zone: tz }).startOf("day");
  const out: Slot[] = [];
  let cur = from;
  while (cur <= to) {
    const weekday = cur.weekday === 7 ? 0 : cur.weekday; // convert 1..7 to 0..6 with Sunday=0
    const list = args.pattern[String(weekday)] ?? [];
    for (const item of list) {
      const dateKey = cur.toISODate() ?? cur.toFormat("yyyy-LL-dd");
      const slot: Slot = {
        id: `s-${dateKey}-${item.startMin}`,
        dateKey,
        startMin: item.startMin,
        endMin: item.endMin,
        capacity: 1,
        bookedCount: 0,
        cancelled: false,
      };
      out.push(slot);
    }
    cur = cur.plus({ days: 1 });
  }
  return out;
}

