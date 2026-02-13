 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import Link from "next/link";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

type BookingRow = {
  id: string;
  code?: string;
  name?: string;
  email?: string;
  status?: string;
};

type SlotRow = {
  id: string;
  startMin: number;
  endMin: number;
  capacity: number;
  bookedCount: number;
  cancelled?: boolean;
  bookings?: BookingRow[];
};

type DayRow = { dateKey: string; slots: SlotRow[] };

function isSlotRow(v: unknown): v is SlotRow {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.startMin === "number" &&
    typeof o.endMin === "number" &&
    typeof o.capacity === "number" &&
    typeof o.bookedCount === "number"
  );
}

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AdminCalendarView() {
  const [monthKey, setMonthKey] = useState(() =>
    DateTime.now().setZone(BUSINESS_TIME_ZONE).toFormat("yyyy-LL")
  );
  const monthDt = useMemo(
    () => DateTime.fromFormat(monthKey, "yyyy-LL", { zone: BUSINESS_TIME_ZONE }),
    [monthKey]
  );
  const fromDateKey = useMemo(() => monthDt.startOf("month").toISODate()!, [monthDt]);
  const toDateKey = useMemo(() => monthDt.endOf("month").toISODate()!, [monthDt]);

  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DayRow[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/calendar?fromDateKey=${encodeURIComponent(fromDateKey)}&toDateKey=${encodeURIComponent(
            toDateKey
          )}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) {
          if (!cancelled) setDays([]);
          return;
        }
        if (cancelled) return;
        const raw = (json.data?.days ?? []) as unknown;
        const nextDays: DayRow[] = Array.isArray(raw)
          ? raw
              .map((d) => {
                if (!d || typeof d !== "object") return null;
                const o = d as Record<string, unknown>;
                const dateKey = typeof o.dateKey === "string" ? o.dateKey : "";
                const slotsRaw = Array.isArray(o.slots) ? o.slots : [];
                const slots = slotsRaw.filter(isSlotRow);
                if (!dateKey) return null;
                return { dateKey, slots };
              })
              .filter((v): v is DayRow => Boolean(v))
          : [];
        setDays(nextDays);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fromDateKey, toDateKey]);

  const gridDays = useMemo(() => {
    const start = monthDt.startOf("month");
    const end = monthDt.endOf("month");

    // Luxon weekday: 1=Mon..7=Sun. We want Sunday-start calendar.
    const startWeekday = start.weekday === 7 ? 0 : start.weekday; // 0..6
    const offset = startWeekday;

    const list: Array<{ kind: "blank" } | { kind: "day"; dateKey: string; dt: DateTime }> = [];
    for (let i = 0; i < offset; i++) list.push({ kind: "blank" });

    let cur = start;
    while (cur <= end) {
      list.push({ kind: "day", dateKey: cur.toISODate()!, dt: cur });
      cur = cur.plus({ days: 1 });
    }
    return list;
  }, [monthDt]);

  const dayMap = useMemo(() => {
    const m = new Map<string, DayRow>();
    for (const d of days) m.set(d.dateKey, d);
    return m;
  }, [days]);

  async function cancelSlot(slotId: string, nextCancelled: boolean) {
    await fetch(`/api/admin/slots/${encodeURIComponent(slotId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelled: nextCancelled }),
    });
    // reload current month
    const res = await fetch(
      `/api/admin/calendar?fromDateKey=${encodeURIComponent(fromDateKey)}&toDateKey=${encodeURIComponent(toDateKey)}`,
      { cache: "no-store" }
    );
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) setDays(json.data.days ?? []);
  }

  async function deleteSlot(slotId: string) {
    await fetch(`/api/admin/slots/${encodeURIComponent(slotId)}`, { method: "DELETE" });
    const res = await fetch(
      `/api/admin/calendar?fromDateKey=${encodeURIComponent(fromDateKey)}&toDateKey=${encodeURIComponent(toDateKey)}`,
      { cache: "no-store" }
    );
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) setDays(json.data.days ?? []);
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">캘린더</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthKey(monthDt.minus({ months: 1 }).toFormat("yyyy-LL"))}
            className="px-3 py-1 rounded border"
          >
            이전
          </button>
          <div className="px-3 py-1 rounded border bg-white/80">{monthDt.toFormat("LLLL yyyy")}</div>
          <button
            onClick={() => setMonthKey(monthDt.plus({ months: 1 }).toFormat("yyyy-LL"))}
            className="px-3 py-1 rounded border"
          >
            다음
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_360px] items-start">
        <div className="grid grid-cols-7 gap-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className="text-xs font-semibold text-muted-foreground px-1">
              {d}
            </div>
          ))}
          {gridDays.map((item, idx) => {
            if (item.kind === "blank") return <div key={`b-${idx}`} className="min-h-[110px]" />;
            const slots = dayMap.get(item.dateKey)?.slots ?? [];
            const visible = slots.slice(0, 3);
            const extra = Math.max(0, slots.length - visible.length);
            const selected = selectedDateKey === item.dateKey;
            return (
              <button
                key={item.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(item.dateKey)}
                className={`min-h-[110px] rounded border p-2 text-left hover:bg-muted/20 transition ${
                  selected ? "border-black" : "border-border"
                }`}
              >
                <div className="text-xs font-semibold">{item.dt.day}</div>
                <div className="mt-1 space-y-1">
                  {visible.map((s) => (
                    <div
                      key={s.id}
                      className={`text-[11px] px-2 py-1 rounded border ${s.cancelled ? "opacity-60 line-through" : ""}`}
                    >
                      {minutesToHhmm(s.startMin)} · {s.bookedCount}/{s.capacity}
                    </div>
                  ))}
                  {extra ? <div className="text-[11px] text-muted-foreground">+{extra}개</div> : null}
                  {!loading && slots.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground">—</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded border p-4 bg-white/60">
          <div className="font-medium mb-2">선택된 날짜</div>
          {selectedDateKey ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{selectedDateKey}</div>
              {(dayMap.get(selectedDateKey)?.slots ?? []).length === 0 ? (
                <div className="text-sm text-muted-foreground">세션 없음</div>
              ) : (
                (dayMap.get(selectedDateKey)?.slots ?? []).map((s) => (
                  <div key={s.id} className="rounded border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">
                        {minutesToHhmm(s.startMin)}–{minutesToHhmm(s.endMin)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.bookedCount}/{s.capacity}
                      </div>
                    </div>
                    {s.cancelled ? (
                      <div className="mt-1 text-xs text-red-600 font-semibold">취소됨</div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded border"
                        onClick={(e) => {
                          e.preventDefault();
                          cancelSlot(s.id, !s.cancelled).catch(() => {});
                        }}
                      >
                        {s.cancelled ? "취소 해제" : "세션 취소"}
                      </button>
                      {s.cancelled ? (
                        <button
                          className="px-3 py-1 rounded border"
                          onClick={(e) => {
                            e.preventDefault();
                            const ok = window.confirm("취소된 세션을 삭제할까요?");
                            if (!ok) return;
                            deleteSlot(s.id).catch(() => {});
                          }}
                        >
                          삭제
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">예약</div>
                      {(s.bookings ?? []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">예약 없음</div>
                      ) : (
                        <div className="space-y-1">
                          {(s.bookings ?? []).map((b) => (
                            <div key={b.id} className="flex items-center justify-between gap-3 text-sm">
                              <div className="min-w-0">
                                <div className="truncate">
                                  {b.name} · {b.email} · {b.status}
                                </div>
                              </div>
                              <Link
                                href={`/admin/call/${encodeURIComponent(String(b.code || b.id))}`}
                                className={`shrink-0 rounded border px-2 py-1 text-xs ${
                                  b.status === "confirmed"
                                    ? "bg-black text-white"
                                    : "pointer-events-none bg-white text-muted-foreground opacity-60"
                                }`}
                                aria-disabled={b.status !== "confirmed"}
                                tabIndex={b.status === "confirmed" ? 0 : -1}
                              >
                                Open call
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">달력에서 날짜를 선택하세요.</div>
          )}
        </div>
      </div>
    </section>
  );
}

