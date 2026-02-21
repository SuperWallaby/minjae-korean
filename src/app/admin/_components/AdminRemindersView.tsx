"use client";

import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

type ReminderLogItem = {
  id: string;
  bookingId: string;
  kind: string;
  role: string;
  to: string;
  memberName?: string;
  timeLabel?: string;
  sentAt: string;
};

function isReminderLogItem(v: unknown): v is ReminderLogItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.bookingId === "string" &&
    typeof o.kind === "string" &&
    typeof o.role === "string" &&
    typeof o.to === "string" &&
    typeof o.sentAt === "string"
  );
}

export default function AdminRemindersView() {
  const [logs, setLogs] = useState<ReminderLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/admin/reminders/history?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.logs)) {
          setLogs(data.logs.filter(isReminderLogItem));
        } else {
          setError(data?.error ?? "Failed to load");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-4 text-muted-foreground">
        로딩 중…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-rose-600">
        {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-4 text-muted-foreground">
        발송 이력이 없습니다. 크론으로 리마인더를 실행하면 여기에 기록됩니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-border">
        <thead>
          <tr className="bg-muted/50">
            <th className="border border-border px-3 py-2 text-left">발송 시각</th>
            <th className="border border-border px-3 py-2 text-left">종류</th>
            <th className="border border-border px-3 py-2 text-left">수신</th>
            <th className="border border-border px-3 py-2 text-left">이름</th>
            <th className="border border-border px-3 py-2 text-left">수업 시간</th>
            <th className="border border-border px-3 py-2 text-left">예약 ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const sent = DateTime.fromISO(log.sentAt, { zone: "utc" }).setZone(BUSINESS_TIME_ZONE);
            return (
              <tr key={log.id} className="hover:bg-muted/20">
                <td className="border border-border px-3 py-2 whitespace-nowrap">
                  {sent.toFormat("yyyy-MM-dd HH:mm")}
                </td>
                <td className="border border-border px-3 py-2">
                  <span className={log.kind === "1h" || log.kind === "24h" ? "text-amber-700" : "text-blue-700"}>
                    {log.kind === "1h" ? "1시간 전" : log.kind === "24h" ? "24시간 전" : "30분 전"}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({log.role === "member" ? "학생" : "관리자"})
                  </span>
                </td>
                <td className="border border-border px-3 py-2 font-mono text-xs">{log.to}</td>
                <td className="border border-border px-3 py-2">{log.memberName ?? "—"}</td>
                <td className="border border-border px-3 py-2 text-muted-foreground">{log.timeLabel ?? "—"}</td>
                <td className="border border-border px-3 py-2 font-mono text-xs">{log.bookingId.slice(0, 8)}…</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        최근 {logs.length}건 (발송된 리마인더만 표시)
      </p>
    </div>
  );
}
