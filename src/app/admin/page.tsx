 "use client";
 
import * as React from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import AdminCalendarView from "./_components/AdminCalendarView";
import AdminBookingsView from "./_components/AdminBookingsView";
import AdminRecapsView from "./_components/AdminRecapsView";
import WeeklyPatternEditor from "./_components/WeeklyPatternEditor";
import AdminStudentsView from "./_components/AdminStudentsView";
import AdminMeetingsView from "./_components/AdminMeetingsView";
 
const BUSINESS_TIME_ZONE = "Asia/Seoul";
 
export default function AdminPage() {
  const [tab, setTab] = React.useState<"calendar" | "pattern" | "bookings" | "students" | "meetings" | "recaps">("calendar");
  const [fromDateKey, setFromDateKey] = React.useState<string>(
    DateTime.now().setZone(BUSINESS_TIME_ZONE).toISODate() ?? new Date().toISOString().slice(0, 10)
  );
  const [toDateKey, setToDateKey] = React.useState<string>(
    DateTime.now().setZone(BUSINESS_TIME_ZONE).plus({ days: 7 }).toISODate() ??
      new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
   const [loading, setLoading] = React.useState(false);
 
   async function onGenerate() {
     setLoading(true);
     try {
       const res = await fetch(`/api/admin/generate-slots`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ fromDateKey, toDateKey }),
       });
       const j = await res.json();
       if (res.ok && j?.ok) {
         alert(`Added ${j.added} slots`);
       } else {
         alert(`Error: ${j?.error ?? j}`);
       }
     } finally {
       setLoading(false);
     }
   }
 
   return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">관리자</h1>
        <Link
          href="/admin/support"
          className="px-3 py-2 rounded border bg-white hover:bg-black hover:text-white transition"
        >
          Support inbox
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          className={`px-3 py-2 rounded border ${tab === "calendar" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("calendar")}
        >
          캘린더
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "pattern" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("pattern")}
        >
          주간 패턴
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "bookings" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("bookings")}
        >
          예약
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "students" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("students")}
        >
          학생
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "meetings" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("meetings")}
        >
          미팅 링크
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "recaps" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setTab("recaps")}
        >
          리캡
        </button>
      </div>

      {tab === "calendar" ? <AdminCalendarView /> : null}
      {tab === "pattern" ? <WeeklyPatternEditor /> : null}
      {tab === "bookings" ? <AdminBookingsView /> : null}
      {tab === "students" ? <AdminStudentsView /> : null}
      {tab === "meetings" ? <AdminMeetingsView /> : null}
      {tab === "recaps" ? <AdminRecapsView /> : null}
       <div className="grid gap-4 md:grid-cols-2 mb-6">
         <label className="grid gap-1">
          <span className="text-sm">시작일</span>
           <input value={fromDateKey} onChange={(e) => setFromDateKey(e.target.value)} className="px-3 py-2 border rounded" />
         </label>
         <label className="grid gap-1">
          <span className="text-sm">종료일</span>
           <input value={toDateKey} onChange={(e) => setToDateKey(e.target.value)} className="px-3 py-2 border rounded" />
         </label>
       </div>
 
      <div className="p-4 border rounded">
        <div className="font-medium mb-2">세션 생성</div>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <label className="grid gap-1">
            <span className="text-sm">시작일</span>
            <input value={fromDateKey} onChange={(e) => setFromDateKey(e.target.value)} className="px-3 py-2 border rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">종료일</span>
            <input value={toDateKey} onChange={(e) => setToDateKey(e.target.value)} className="px-3 py-2 border rounded" />
          </label>
        </div>
        <button onClick={onGenerate} className="px-4 py-2 bg-black text-white rounded" disabled={loading}>
          {loading ? "생성 중…" : "저장된 패턴으로 생성"}
        </button>
        <div className="text-sm text-muted-foreground mt-2">
          주간 패턴 탭에서 저장한 패턴을 기준으로 세션을 생성합니다.
        </div>
      </div>
     </div>
   );
 }

