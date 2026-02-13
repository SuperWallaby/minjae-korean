 "use client";

import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import Link from "next/link";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

type BookingItem = {
  id: string;
  code?: string;
  name: string;
  email?: string;
  dateKey?: string;
  startMin?: number;
  endMin?: number;
  status: string;
};

function isBookingItem(v: unknown): v is BookingItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.status === "string" &&
    (o.code === undefined || typeof o.code === "string") &&
    (o.email === undefined || typeof o.email === "string") &&
    (o.dateKey === undefined || typeof o.dateKey === "string") &&
    (o.startMin === undefined || typeof o.startMin === "number") &&
    (o.endMin === undefined || typeof o.endMin === "number")
  );
}

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AdminBookingsView() {
  const [q, setQ] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BookingItem[]>([]);

  useEffect(() => {
    // simple initial load: today's bookings
    const today = DateTime.now().setZone(BUSINESS_TIME_ZONE).toISODate() ?? "";
    setDateKey(today);
    search({ dateKey: today }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(opts?: { q?: string; dateKey?: string }) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const qv = opts?.q ?? q;
      const dk = opts?.dateKey ?? dateKey;
      if (qv) params.set("q", qv);
      if (dk) params.set("dateKey", dk);
      const res = await fetch(`/api/admin/bookings/search?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setItems([]);
        return;
      }
      const raw = (json.data?.items ?? []) as unknown;
      const next = Array.isArray(raw) ? raw.filter(isBookingItem) : [];
      setItems(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">예약 목록</div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름 또는 이메일"
            className="px-3 py-1 border rounded"
          />
          <input
            type="date"
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="px-3 py-1 border rounded"
          />
          <button onClick={() => search({ q, dateKey })} className="px-3 py-1 rounded border">
            검색
          </button>
        </div>
      </div>

      {loading ? (
        <div>로딩 중…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted">예약이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="p-3 border rounded">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {b.name} · {b.email}
                  </div>
                  <div className="text-sm">
                    {b.dateKey} · {minutesToHhmm(b.startMin ?? 0)}–
                    {minutesToHhmm(b.endMin ?? 0)} · 상태: {b.status}
                  </div>
                </div>

                {(() => {
                  const canOpen = b.status === "confirmed";
                  return (
                    <Link
                      href={`/admin/call/${encodeURIComponent(String(b.code || b.id))}`}
                      className={`px-3 py-1 rounded border text-sm ${
                        canOpen
                          ? "bg-black text-white"
                          : "bg-white text-muted-foreground pointer-events-none opacity-60"
                      }`}
                      aria-disabled={!canOpen}
                      tabIndex={canOpen ? 0 : -1}
                    >
                      Open call
                    </Link>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

