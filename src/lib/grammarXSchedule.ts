import { DateTime } from "luxon";

const KST = "Asia/Seoul";
/** lab-worker cron: 09:00, 15:00, 21:00 KST */
const CRON_HOURS_KST = [9, 15, 21];

export type GrammarXScheduleSlot = {
  at: string;
  atKst: string;
  label: string;
};

export function listUpcomingGrammarXSlots(count = 6): GrammarXScheduleSlot[] {
  const now = DateTime.now().setZone(KST);
  const slots: GrammarXScheduleSlot[] = [];
  let day = now.startOf("day");

  while (slots.length < count) {
    for (const hour of CRON_HOURS_KST) {
      const slot = day.set({ hour, minute: 0, second: 0, millisecond: 0 });
      if (slot <= now) continue;
      slots.push({
        at: slot.toUTC().toISO()!,
        atKst: slot.toFormat("yyyy-MM-dd HH:mm"),
        label: slot.toFormat("M/d (EEE) HH:mm"),
      });
      if (slots.length >= count) break;
    }
    day = day.plus({ days: 1 });
  }

  return slots;
}
