 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  adminNote?: string;
  notes?: Array<{ id: string; body: string; createdAt: string }>;
  payments?: Array<{ id: string; type: string; amount: number; createdAt: string; memo?: string }>;
  credits?: Array<{
    id: string;
    source: "stripe" | "admin";
    kind: string;
    total: number;
    remaining: number;
    purchasedAt: string;
    expiresAt: string;
  }>;
};

function formatIso(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type BookingItem = {
  id: string;
  dateKey: string;
  startMin: number;
  endMin: number;
  status: string;
};

export default function AdminStudentsView() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [detailTab, setDetailTab] = useState<"notes" | "bookings" | "payments" | "credits">("notes");
  const [detailBookings, setDetailBookings] = useState<BookingItem[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");

  const [creditDelta, setCreditDelta] = useState<number>(1);
  const [creditExpiresInDays, setCreditExpiresInDays] = useState<number>(30);
  const [creditMemo, setCreditMemo] = useState("");

  async function loadList() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/students?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setItems([]);
        return;
      }
      setItems(json.data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(() => items.length, [items]);

  async function importFromBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_from_bookings" }),
      });
      await res.json().catch(() => null);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(s: Student) {
    setSelected(s);
    setDetailTab("notes");
    setDetailBookings([]);
    setCreditDelta(1);
    setCreditExpiresInDays(30);
    setCreditMemo("");
    // fetch latest student
    const res = await fetch(`/api/admin/students/${encodeURIComponent(s.id)}`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) setSelected(json.data.student);
  }

  async function addNote(body: string) {
    if (!selected) return;
    const res = await fetch(`/api/admin/students/${encodeURIComponent(selected.id)}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) {
      await openDetail(selected);
    }
  }

  async function addPayment(type: string, amount: number, memo: string) {
    if (!selected) return;
    const res = await fetch(`/api/admin/students/${encodeURIComponent(selected.id)}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount, memo }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) {
      await openDetail(selected);
    }
  }

  async function loadBookingsForStudent() {
    if (!selected) return;
    const params = new URLSearchParams();
    params.set("studentId", selected.id);
    const res = await fetch(`/api/admin/bookings/search?${params.toString()}`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) setDetailBookings(json.data.items ?? []);
    else setDetailBookings([]);
  }

  function creditSummary(s: Student) {
    const now = Date.now();
    const active = (s.credits ?? [])
      .filter((c) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now)
      .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
    const remaining = active.reduce((acc, c) => acc + (c.remaining ?? 0), 0);
    const nextExpiry = active[0]?.expiresAt ?? null;
    return { remaining, nextExpiry, active };
  }

  async function adjustCredits() {
    if (!selected) return;
    if (!Number.isFinite(creditDelta) || !Number.isInteger(creditDelta) || creditDelta === 0) return alert("변경 수량을 입력하세요");
    if (Math.abs(creditDelta) > 1000) return alert("변경 수량이 너무 큽니다");

    const res = await fetch(`/api/admin/students/${encodeURIComponent(selected.id)}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delta: creditDelta,
        memo: creditMemo,
        expiresInDays: creditDelta > 0 ? creditExpiresInDays : undefined,
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) return alert(json?.error ?? "크레딧 조정 실패");

    setCreditMemo("");
    await openDetail(selected);
    setDetailTab("credits");
  }

  return (
    <section className="rounded border p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-lg font-semibold">학생 목록</div>
          <div className="text-sm text-muted-foreground">총 {total}명</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름/이메일 검색" />
          <Button variant="outline" onClick={() => loadList()} disabled={loading}>
            검색
          </Button>
          <Button variant="outline" onClick={importFromBookings} disabled={loading}>
            예약에서 가져오기
          </Button>
          <Button onClick={() => setCreateOpen(true)}>학생 추가</Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">로딩 중…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">학생이 없습니다.</div>
        ) : (
          items.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openDetail(s)}
              className="w-full text-left rounded border px-4 py-3 hover:bg-muted/20 transition"
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.email}</div>
            </button>
          ))
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="학생 추가"
        description="이름/이메일 기반으로 학생을 생성합니다."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              닫기
            </Button>
            <Button
              onClick={async () => {
                const res = await fetch("/api/admin/students", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: createName, email: createEmail, phone: createPhone }),
                });
                const json = await res.json().catch(() => null);
                if (res.ok && json?.ok) {
                  setCreateOpen(false);
                  setCreateName("");
                  setCreateEmail("");
                  setCreatePhone("");
                  await loadList();
                } else {
                  alert(json?.error ?? "생성 실패");
                }
              }}
              disabled={!createName.trim() || !createEmail.trim()}
            >
              생성
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">이름</span>
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">이메일</span>
            <Input value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">전화 (선택)</span>
            <Input value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.name}` : "학생"}
        description={selected ? selected.email : ""}
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            닫기
          </Button>
        }
      >
        {!selected ? null : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={detailTab === "notes" ? "primary" : "outline"} onClick={() => setDetailTab("notes")}>
                노트
              </Button>
              <Button
                variant={detailTab === "bookings" ? "primary" : "outline"}
                onClick={() => {
                  setDetailTab("bookings");
                  loadBookingsForStudent().catch(() => {});
                }}
              >
                예약내역
              </Button>
              <Button variant={detailTab === "payments" ? "primary" : "outline"} onClick={() => setDetailTab("payments")}>
                결제내역
              </Button>
              <Button variant={detailTab === "credits" ? "primary" : "outline"} onClick={() => setDetailTab("credits")}>
                크레딧
              </Button>
            </div>

            {detailTab === "notes" ? (
              <div className="space-y-3">
                <div className="grid gap-2">
                  <textarea
                    id="newNote"
                    className="w-full min-h-[80px] rounded border p-3 text-sm"
                    placeholder="학생 노트/기록을 남기세요…"
                  />
                  <Button
                    onClick={() => {
                      const el = document.getElementById("newNote") as HTMLTextAreaElement | null;
                      const v = el?.value ?? "";
                      if (!v.trim()) return;
                      addNote(v).catch(() => {});
                      if (el) el.value = "";
                    }}
                  >
                    노트 추가
                  </Button>
                </div>

                {(selected.notes ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">노트가 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {(selected.notes ?? []).map((n) => (
                      <div key={n.id} className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">{formatIso(n.createdAt)}</div>
                        <div className="text-sm whitespace-pre-wrap mt-1">{n.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {detailTab === "bookings" ? (
              <div className="space-y-2">
                {detailBookings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">예약 내역이 없습니다.</div>
                ) : (
                  detailBookings.map((b) => (
                    <div key={b.id} className="rounded border p-3">
                      <div className="font-medium">
                        {b.dateKey} · {minutesToHhmm(b.startMin)}–{minutesToHhmm(b.endMin)}
                      </div>
                      <div className="text-sm text-muted-foreground">상태: {b.status}</div>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {detailTab === "payments" ? (
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-3">
                  <select id="payType" className="px-3 py-2 border rounded text-sm" defaultValue="pass_pack">
                    <option value="pass_pack">패스</option>
                    <option value="subscription">구독</option>
                    <option value="other">기타</option>
                  </select>
                  <input id="payAmount" className="px-3 py-2 border rounded text-sm" placeholder="금액(KRW)" inputMode="numeric" />
                  <input id="payMemo" className="px-3 py-2 border rounded text-sm" placeholder="메모(선택)" />
                </div>
                <Button
                  onClick={() => {
                    const typeEl = document.getElementById("payType") as HTMLSelectElement | null;
                    const amountEl = document.getElementById("payAmount") as HTMLInputElement | null;
                    const memoEl = document.getElementById("payMemo") as HTMLInputElement | null;
                    const type = typeEl?.value ?? "other";
                    const amount = Number(amountEl?.value ?? 0);
                    const memo = memoEl?.value ?? "";
                    if (!Number.isFinite(amount) || amount <= 0) return alert("금액을 입력하세요");
                    addPayment(type, amount, memo).catch(() => {});
                    if (amountEl) amountEl.value = "";
                    if (memoEl) memoEl.value = "";
                  }}
                >
                  결제 추가
                </Button>

                {(selected.payments ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">결제 내역이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {(selected.payments ?? []).map((p) => (
                      <div key={p.id} className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">{formatIso(p.createdAt)}</div>
                        <div className="text-sm mt-1">
                          {p.type} · {p.amount.toLocaleString("ko-KR")}원
                        </div>
                        {p.memo ? <div className="text-sm text-muted-foreground mt-1">{p.memo}</div> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {detailTab === "credits" ? (
              <div className="space-y-3">
                <div className="rounded border p-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-medium">보유 크레딧</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        남은 크레딧: {creditSummary(selected).remaining}
                        {creditSummary(selected).nextExpiry ? ` · 다음 만료: ${formatIso(creditSummary(selected).nextExpiry!)}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded border p-3 space-y-2">
                  <div className="font-medium">크레딧 조정</div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <label className="grid gap-1">
                      <span className="text-sm">변경 수량(+추가 / -차감)</span>
                      <Input
                        type="number"
                        value={String(creditDelta)}
                        onChange={(e) => setCreditDelta(Number(e.target.value))}
                        inputMode="numeric"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm">만료(일) (추가 시)</span>
                      <Input
                        type="number"
                        value={String(creditExpiresInDays)}
                        onChange={(e) => setCreditExpiresInDays(Number(e.target.value))}
                        inputMode="numeric"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm">메모(선택)</span>
                      <Input value={creditMemo} onChange={(e) => setCreditMemo(e.target.value)} placeholder="예: 보상/보정" />
                    </label>
                  </div>
                  <Button onClick={() => adjustCredits().catch(() => {})}>적용</Button>
                  <div className="text-sm text-muted-foreground">
                    차감은 가장 먼저 만료되는 크레딧부터 사용됩니다. (보유량보다 많이 차감은 불가)
                  </div>
                </div>

                {(selected.credits ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">크레딧 내역이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {(selected.credits ?? [])
                      .slice()
                      .sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt))
                      .map((c) => (
                        <div key={c.id} className="rounded border p-3">
                          <div className="text-xs text-muted-foreground">
                            구매/지급: {formatIso(c.purchasedAt)} · 만료: {formatIso(c.expiresAt)}
                          </div>
                          <div className="text-sm mt-1">
                            {c.source} · {c.kind} · {c.remaining}/{c.total}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </section>
  );
}

