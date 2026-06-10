"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { BroadcastAccountFilter } from "@/lib/studentsRepo";

const FILTERS: { value: BroadcastAccountFilter; label: string; hint: string }[] = [
  { value: "all", label: "전체 (이메일 있는 학생)", hint: "Mongo students 전원" },
  { value: "linked", label: "로그인 연동 회원", hint: "authUserId가 있는 계정" },
  { value: "unlinked", label: "미연동 (이메일만)", hint: "로그인 미연동 학생 레코드" },
  { value: "active_credits", label: "유효 크레딧 보유", hint: "남은 크레딧·만료 전" },
];

export default function AdminBulkBroadcastForm() {
  const [accountFilter, setAccountFilter] = React.useState<BroadcastAccountFilter>("linked");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sendSite, setSendSite] = React.useState(true);
  const [sendPush, setSendPush] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          accountFilter,
          sendSite,
          sendPush,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(String(json?.error ?? `HTTP ${res.status}`));
        return;
      }
      const d = json.data;
      setResult(
        `발송 완료: 대상 ${d.recipientCount}명 · 사이트 수신 레코드 ${d.siteReceiptCount}건 · 푸시 전달 ${d.pushDelivered}건` +
          (d.broadcastId ? ` · broadcastId: ${d.broadcastId}` : ""),
      );
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 mb-8">
      <h2 className="font-serif text-xl font-semibold tracking-tight">일괄 알림</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        계정 구분으로 대상을 고르고, <strong>사이트 알림</strong>(계정 알림함)과 <strong>앱(브라우저) 푸시</strong>(회원이 알림을 켠 기기)를 함께 또는 따로 보낼 수 있습니다.
      </p>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">계정 타입</span>
          <select
            className="h-11 rounded-lg border border-border bg-white px-3 text-sm"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value as BroadcastAccountFilter)}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">{FILTERS.find((x) => x.value === accountFilter)?.hint}</span>
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium">제목</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 수업 일정 변경 안내" required />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium">본문</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="알림 내용을 입력하세요."
          />
        </label>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={sendSite} onChange={(e) => setSendSite(e.target.checked)} />
            사이트 알림 (알림함)
          </label>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
            앱(브라우저) 푸시
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy || !title.trim() || !body.trim()}>
            {busy ? "발송 중…" : "선택한 대상에게 보내기"}
          </Button>
          <span className="text-xs text-muted-foreground">최대 10,000명까지 처리합니다.</span>
        </div>

        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        {result ? <div className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</div> : null}
      </form>
    </div>
  );
}
