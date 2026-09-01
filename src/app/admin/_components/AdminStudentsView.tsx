"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  notes?: Array<{ id: string; body: string; createdAt: string }>;
};

function formatIso(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

/** User list for the blog site — no 1:1 booking / pass / credit UI. */
export default function AdminStudentsView() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");

  async function loadList() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        cache: "no-store",
      });
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

  async function openDetail(s: UserRow) {
    setSelected(s);
    const res = await fetch(`/api/admin/students/${encodeURIComponent(s.id)}`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) setSelected(json.data.student);
  }

  async function addNote(body: string) {
    if (!selected) return;
    const res = await fetch(
      `/api/admin/students/${encodeURIComponent(selected.id)}/notes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      },
    );
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) {
      await openDetail(selected);
    }
  }

  return (
    <section className="rounded border p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">유저 목록</div>
          <div className="text-sm text-muted-foreground">총 {total}명</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름/이메일 검색"
          />
          <Button
            variant="outline"
            onClick={() => loadList()}
            disabled={loading}
          >
            검색
          </Button>
          <Button onClick={() => setCreateOpen(true)}>유저 추가</Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">로딩 중…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">유저가 없습니다.</div>
        ) : (
          items.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openDetail(s)}
              className="w-full rounded border px-4 py-3 text-left transition hover:bg-muted/20"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="font-medium">{s.name}</div>
                {(s.occupation ?? "").trim() ? (
                  <div
                    className="max-w-[min(100%,18rem)] shrink-0 truncate text-sm text-muted-foreground"
                    title={(s.occupation ?? "").trim()}
                  >
                    {(s.occupation ?? "").trim()}
                  </div>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground">{s.email}</div>
            </button>
          ))
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="유저 추가"
        description="이름/이메일로 레코드를 만듭니다."
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
                  body: JSON.stringify({
                    name: createName,
                    email: createEmail,
                    phone: createPhone,
                  }),
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
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">이메일</span>
            <Input
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">전화 (선택)</span>
            <Input
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : "유저"}
        description={
          selected ? (
            <span className="block space-y-0.5">
              <span className="block">{selected.email}</span>
              {(selected.occupation ?? "").trim() ? (
                <span className="block text-sm text-muted-foreground">
                  {(selected.occupation ?? "").trim()}
                </span>
              ) : null}
            </span>
          ) : (
            ""
          )
        }
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            닫기
          </Button>
        }
      >
        {!selected ? null : (
          <div className="space-y-3">
            <div className="grid gap-2">
              <textarea
                id="newNote"
                className="min-h-[80px] w-full rounded border p-3 text-sm"
                placeholder="메모를 남기세요…"
              />
              <Button
                onClick={() => {
                  const el = document.getElementById(
                    "newNote",
                  ) as HTMLTextAreaElement | null;
                  const v = el?.value ?? "";
                  if (!v.trim()) return;
                  addNote(v).catch(() => {});
                  if (el) el.value = "";
                }}
              >
                메모 추가
              </Button>
            </div>

            {(selected.notes ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">메모가 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {(selected.notes ?? []).map((n) => (
                  <div key={n.id} className="rounded border p-3">
                    <div className="text-xs text-muted-foreground">
                      {formatIso(n.createdAt)}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-sm">
                      {n.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
