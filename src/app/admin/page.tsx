"use client";

import * as React from "react";
import { Suspense } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminCalendarView from "./_components/AdminCalendarView";
import AdminBookingsView from "./_components/AdminBookingsView";
import AdminRecapsView from "./_components/AdminRecapsView";
import AdminRemindersView from "./_components/AdminRemindersView";
import WeeklyPatternEditor from "./_components/WeeklyPatternEditor";
import AdminStudentsView from "./_components/AdminStudentsView";
import AdminMeetingsView from "./_components/AdminMeetingsView";
import AdminExamsCoversView from "./_components/AdminExamsCoversView";
import AdminExamsVoiceView from "./_components/AdminExamsVoiceView";
import AdminSupportInboxView from "./_components/AdminSupportInboxView";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

type AdminTab =
  | "calendar"
  | "pattern"
  | "bookings"
  | "students"
  | "meetings"
  | "recaps"
  | "notifications"
  | "exams"
  | "messages";

function AdminPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState<AdminTab>("calendar");

  React.useLayoutEffect(() => {
    const t = searchParams.get("tab");
    if (t === "messages") setTab("messages");
    else if (t === "notifications") setTab("notifications");
  }, [searchParams]);

  const selectTab = React.useCallback(
    (t: AdminTab) => {
      setTab(t);
      if (t === "messages") {
        router.replace("/admin?tab=messages", { scroll: false });
      } else if (t === "notifications") {
        router.replace("/admin?tab=notifications", { scroll: false });
      } else {
        router.replace("/admin", { scroll: false });
      }
    },
    [router],
  );
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
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin?tab=messages"
            className="px-3 py-2 rounded border bg-white hover:bg-black hover:text-white transition"
          >
            Support inbox
          </Link>
          <Link
            href="/admin?tab=notifications"
            className="px-3 py-2 rounded border bg-white hover:bg-black hover:text-white transition"
          >
            알림
          </Link>
          <Link
            href="/admin/users"
            className="px-3 py-2 rounded border bg-white hover:bg-black hover:text-white transition"
          >
            유저 목록
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          className={`px-3 py-2 rounded border ${tab === "calendar" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("calendar")}
        >
          캘린더
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "pattern" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("pattern")}
        >
          주간 패턴
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "bookings" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("bookings")}
        >
          예약
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "students" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("students")}
        >
          학생
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "meetings" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("meetings")}
        >
          미팅 링크
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "recaps" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("recaps")}
        >
          리캡
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "notifications" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("notifications")}
          type="button"
        >
          알림
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "exams" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("exams")}
        >
          시험 표지
        </button>
        <button
          className={`px-3 py-2 rounded border ${tab === "messages" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("messages")}
          type="button"
        >
          메시지
        </button>
      </div>

      {tab === "messages" ? <AdminSupportInboxView embedded /> : null}
      {tab === "notifications" ? <AdminRemindersView embedded /> : null}
      {tab === "calendar" ? <AdminCalendarView /> : null}
      {tab === "pattern" ? <WeeklyPatternEditor /> : null}
      {tab === "bookings" ? <AdminBookingsView /> : null}
      {tab === "students" ? <AdminStudentsView /> : null}
      {tab === "meetings" ? <AdminMeetingsView /> : null}
      {tab === "recaps" ? <AdminRecapsView /> : null}
      {tab === "exams" ? (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-semibold">시험 표지</h2>
            <AdminExamsCoversView />
          </section>
          <section>
            <h2 className="mb-4 text-lg font-semibold">보이스 생성</h2>
            <AdminExamsVoiceView />
          </section>
        </div>
      ) : null}
      {tab !== "messages" && tab !== "notifications" ? (
        <>
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
        </>
      ) : null}
     </div>
   );
 }

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">로딩 중…</div>}>
      <AdminPageInner />
    </Suspense>
  );
}
