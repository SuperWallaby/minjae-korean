import { DateTime } from "luxon";
import { NextRequest } from "next/server";
import { listAllSlots, listSlotsByDateKey } from "@/lib/slotsRepo";

const SLOT_TIME_ZONE = "Asia/Seoul";
const US_ZONE = "America/Los_Angeles";

/** (dateKey + slotId) 기준 결정적 해시 → 같은 슬롯은 항상 같은 결과 */
function slotHash(dateKey: string, slotId: string): number {
  let h = 0;
  const s = `${dateKey}:${slotId}`;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * 미국(LA) 기준으로 인기 없을 시간대 후보.
 * 새벽 0–6시, 밤 22–23시. 이 중 해시로 산발적으로만 가짜 예약 적용.
 */
function getUSHour(dateKey: string, startMin: number): number | null {
  const slotStart = DateTime.fromISO(dateKey, { zone: SLOT_TIME_ZONE })
    .startOf("day")
    .plus({ minutes: startMin });
  if (!slotStart.isValid) return null;
  return slotStart.setZone(US_ZONE).hour;
}

/** 가짜 예약 적용 여부: 인기 없는 시간대에서 해시로 낮은 확률만 적용 (~25~35%) */
function shouldFakeBook(dateKey: string, slotId: string, hourInUS: number): boolean {
  const isUnpopular = hourInUS >= 0 && hourInUS <= 6 || hourInUS >= 22;
  if (!isUnpopular) return false;
  const h = slotHash(dateKey, slotId);
  if (hourInUS >= 0 && hourInUS <= 5) return (h % 6) < 2;
  if (hourInUS === 6) return (h % 9) === 0;
  if (hourInUS >= 22) return (h % 5) < 2;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const dateKey = req.nextUrl.searchParams.get("dateKey");
    const all = dateKey ? await listSlotsByDateKey(dateKey) : await listAllSlots();
    const filtered = all.filter((s) => !s.cancelled);
    const mapped = filtered.map((s) => {
      const realAvailable = Math.max(0, s.capacity - s.bookedCount);
      const hourInUS = getUSHour(s.dateKey, s.startMin);
      const fakeBooked =
        hourInUS !== null && shouldFakeBook(s.dateKey, s.id, hourInUS);
      const available = fakeBooked ? 0 : realAvailable;
      const bookedCount = fakeBooked ? s.capacity : s.bookedCount;
      return {
        id: s.id,
        dateKey: s.dateKey,
        startMin: s.startMin,
        endMin: s.endMin,
        capacity: s.capacity,
        bookedCount,
        available,
        fakeBooked: fakeBooked,
      };
    });
    return new Response(JSON.stringify({ ok: true, slots: mapped }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}

