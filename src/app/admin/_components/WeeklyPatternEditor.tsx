 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type WeeklyPattern = Record<string, Array<{ startMin: number; endMin: number }>>;

const WEEKDAYS: Array<{ key: string; label: string }> = [
  { key: "0", label: "일" },
  { key: "1", label: "월" },
  { key: "2", label: "화" },
  { key: "3", label: "수" },
  { key: "4", label: "목" },
  { key: "5", label: "금" },
  { key: "6", label: "토" },
];

function minutesToHhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hhmmToMinutes(hhmm: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function parseTimeInput(raw: string) {
  const s = raw.trim();
  if (!s) return null;

  // Accept: "9" => 09:00, "930" => 09:30, "0930" => 09:30, "9:3" => 09:03, "9:30" => 09:30
  if (/^\d{1,2}$/.test(s)) {
    const h = Number(s);
    if (h < 0 || h > 23) return null;
    return h * 60;
  }

  if (/^\d{3,4}$/.test(s)) {
    const padded = s.length === 3 ? `0${s}` : s;
    const h = Number(padded.slice(0, 2));
    const m = Number(padded.slice(2, 4));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  }

  if (/^\d{1,2}:\d{1,2}$/.test(s)) {
    const [hh, mm] = s.split(":");
    const h = Number(hh);
    const m = Number(mm);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  }

  return hhmmToMinutes(s);
}

export default function WeeklyPatternEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tz, setTz] = useState("Asia/Seoul");
  const [pattern, setPattern] = useState<WeeklyPattern>({});
  const [draft, setDraft] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteDay, setPasteDay] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [pasteErrors, setPasteErrors] = useState<string[] | null>(null);

  const totalRows = useMemo(() => Object.values(pattern).reduce((acc, v) => acc + (v?.length ?? 0), 0), [pattern]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMsg(null);
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error(json?.error ?? "설정을 불러오지 못했습니다.");
        if (cancelled) return;
        setTz(json.data?.businessTimeZone ?? "Asia/Seoul");
        const p = (json.data?.weeklyPattern ?? {}) as WeeklyPattern;
        setPattern(p);
        setDraft(() => {
          const next: Record<string, Array<{ start: string; end: string }>> = {};
          for (const [k, rows] of Object.entries(p)) {
            if (!Array.isArray(rows)) continue;
            next[k] = rows.map((r) => ({
              start: minutesToHhmm(r.startMin),
              end: minutesToHhmm(r.endMin),
            }));
          }
          return next;
        });
      } catch (e) {
        if (!cancelled) setMsg(e instanceof Error ? e.message : "설정을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function addRow(dayKey: string) {
    setPattern((prev) => {
      const list = prev[dayKey] ?? [];
      return { ...prev, [dayKey]: [...list, { startMin: 9 * 60, endMin: 10 * 60 }] };
    });
    setDraft((prev) => {
      const list = prev[dayKey] ?? [];
      return { ...prev, [dayKey]: [...list, { start: "09:00", end: "10:00" }] };
    });
  }

  function removeRow(dayKey: string, idx: number) {
    setPattern((prev) => {
      const list = prev[dayKey] ?? [];
      return { ...prev, [dayKey]: list.filter((_, i) => i !== idx) };
    });
    setDraft((prev) => {
      const list = prev[dayKey] ?? [];
      return { ...prev, [dayKey]: list.filter((_, i) => i !== idx) };
    });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessTimeZone: tz, weeklyPattern: pattern }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "저장 실패");
      setMsg("저장되었습니다.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 border rounded">로딩 중…</div>;

  return (
    <section className="p-4 border rounded space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">주간 패턴</div>
          <div className="text-sm text-muted-foreground">
            요일별로 세션 시간을 등록하세요. (총 {totalRows}개)
          </div>
        </div>
        <button className="px-3 py-2 border rounded" disabled={saving} onClick={save}>
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">시간대</span>
        <input className="px-3 py-2 border rounded" value={tz} onChange={(e) => setTz(e.target.value)} />
      </label>

      <div className="grid gap-3">
        {WEEKDAYS.map((d) => {
          const rows = pattern[d.key] ?? [];
          return (
            <div key={d.key} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div className="font-medium">{d.label}</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border rounded" onClick={() => addRow(d.key)}>
                    추가
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => {
                      setPasteDay(d.key);
                      setPasteText("");
                      setPasteErrors(null);
                      setPasteOpen(true);
                    }}
                  >
                    붙여넣기
                  </button>
                </div>
              </div>
              {rows.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">등록된 세션 없음</div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {rows.map((r, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] items-end">
                      <label className="grid gap-1">
                        <span className="text-xs text-muted-foreground">시작</span>
                        <input
                          className="px-3 py-2 border rounded"
                          inputMode="numeric"
                          placeholder="HH:MM"
                          value={draft[d.key]?.[idx]?.start ?? minutesToHhmm(r.startMin)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { start: v, end: list2[idx]?.end ?? minutesToHhmm(r.endMin) };
                              return { ...prev, [d.key]: list2 };
                            });
                          }}
                          onBlur={() => {
                            const raw = draft[d.key]?.[idx]?.start ?? minutesToHhmm(r.startMin);
                            const min = parseTimeInput(raw);
                            if (min === null) {
                              setDraft((prev) => {
                                const list2 = [...(prev[d.key] ?? [])];
                                list2[idx] = { start: minutesToHhmm(r.startMin), end: list2[idx]?.end ?? minutesToHhmm(r.endMin) };
                                return { ...prev, [d.key]: list2 };
                              });
                              return;
                            }
                            setPattern((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { ...list2[idx], startMin: min };
                              return { ...prev, [d.key]: list2 };
                            });
                            setDraft((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { start: minutesToHhmm(min), end: list2[idx]?.end ?? minutesToHhmm(r.endMin) };
                              return { ...prev, [d.key]: list2 };
                            });
                          }}
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-xs text-muted-foreground">종료</span>
                        <input
                          className="px-3 py-2 border rounded"
                          inputMode="numeric"
                          placeholder="HH:MM"
                          value={draft[d.key]?.[idx]?.end ?? minutesToHhmm(r.endMin)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { start: list2[idx]?.start ?? minutesToHhmm(r.startMin), end: v };
                              return { ...prev, [d.key]: list2 };
                            });
                          }}
                          onBlur={() => {
                            const raw = draft[d.key]?.[idx]?.end ?? minutesToHhmm(r.endMin);
                            const min = parseTimeInput(raw);
                            if (min === null) {
                              setDraft((prev) => {
                                const list2 = [...(prev[d.key] ?? [])];
                                list2[idx] = { start: list2[idx]?.start ?? minutesToHhmm(r.startMin), end: minutesToHhmm(r.endMin) };
                                return { ...prev, [d.key]: list2 };
                              });
                              return;
                            }
                            setPattern((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { ...list2[idx], endMin: min };
                              return { ...prev, [d.key]: list2 };
                            });
                            setDraft((prev) => {
                              const list2 = [...(prev[d.key] ?? [])];
                              list2[idx] = { start: list2[idx]?.start ?? minutesToHhmm(r.startMin), end: minutesToHhmm(min) };
                              return { ...prev, [d.key]: list2 };
                            });
                          }}
                        />
                      </label>
                      <button className="px-3 py-2 border rounded" onClick={() => removeRow(d.key, idx)}>
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {msg ? <div className="text-sm">{msg}</div> : null}
      <Modal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="시간 범위 붙여넣기"
        description="각 줄에 시작-종료 형식으로 붙여넣으세요. 예: 09:00-10:00"
        footer={
          <>
            <Button variant="outline" onClick={() => setPasteOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (!pasteDay) return;
                const lines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                const parsed: Array<{ startMin: number; endMin: number }> = [];
                const errors: string[] = [];
                for (const [i, line] of lines.entries()) {
                  const m = line.match(/^\s*(\d{1,2}(?::\d{1,2})?)\s*[-–—]\s*(\d{1,2}(?::\d{1,2})?)\s*$/);
                  if (!m) {
                    errors.push(`Line ${i + 1}: invalid format`);
                    continue;
                  }
                  const a = parseTimeInput(m[1]);
                  const b = parseTimeInput(m[2]);
                  if (a === null || b === null) {
                    errors.push(`Line ${i + 1}: invalid time`);
                    continue;
                  }
                  if (b <= a) {
                    errors.push(`Line ${i + 1}: end must be after start`);
                    continue;
                  }
                  parsed.push({ startMin: a, endMin: b });
                }
                if (parsed.length === 0) {
                  setPasteErrors(errors.length ? errors : ["유효한 시간 범위가 없습니다."]);
                  return;
                }
                setPattern((prev) => {
                  const list = prev[pasteDay] ?? [];
                  return { ...prev, [pasteDay]: [...list, ...parsed] };
                });
                setDraft((prev) => {
                  const list = prev[pasteDay] ?? [];
                  return {
                    ...prev,
                    [pasteDay]: [
                      ...list,
                      ...parsed.map((p) => ({ start: minutesToHhmm(p.startMin), end: minutesToHhmm(p.endMin) })),
                    ],
                  };
                });
                setPasteOpen(false);
              }}
            >
              확인
            </Button>
          </>
        }
      >
        <div className="grid gap-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full h-40 p-2 border rounded font-mono"
            placeholder={"예: 09:00-10:00\n11:00-12:00"}
          />
          {pasteErrors ? (
            <div className="text-sm text-red-600">
              {pasteErrors.map((p, i) => (
                <div key={i}>{p}</div>
              ))}
            </div>
          ) : null}
        </div>
      </Modal>
    </section>
  );
}

