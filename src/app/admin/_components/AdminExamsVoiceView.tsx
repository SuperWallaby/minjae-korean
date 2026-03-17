"use client";

import * as React from "react";

const EXAM_OPTIONS = [
  { kind: "placement" as const, slug: "placement", label: "Placement (등급 받기)" },
];

type VoiceItem = {
  id: string;
  type: string;
  textToSpeak: string;
  instruction: string;
  audioUrl?: string;
};

export default function AdminExamsVoiceView() {
  const [exam, setExam] = React.useState(EXAM_OPTIONS[0]);
  const [items, setItems] = React.useState<VoiceItem[]>([]);
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [generatingId, setGeneratingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadVoiceItems = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, overridesRes] = await Promise.all([
        fetch(`/api/admin/exams/voice-items?kind=${exam.kind}&slug=${exam.slug}`),
        fetch("/api/admin/exams/audio-overrides"),
      ]);
      const itemsJson = await itemsRes.json().catch(() => null);
      const overridesJson = await overridesRes.json().catch(() => null);
      if (itemsRes.ok && itemsJson?.ok) setItems(itemsJson.items ?? []);
      if (overridesRes.ok && overridesJson?.ok) setOverrides(overridesJson.overrides ?? {});
    } catch {
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [exam.kind, exam.slug]);

  React.useEffect(() => {
    loadVoiceItems();
  }, [loadVoiceItems]);

  const handleGenerate = async (item: VoiceItem) => {
    const text = item.textToSpeak?.trim();
    if (!text) {
      setError("재생할 텍스트가 없습니다.");
      return;
    }
    setError(null);
    setGeneratingId(item.id);
    try {
      const ttsRes = await fetch("/api/admin/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const ttsJson = await ttsRes.json().catch(() => null);
      if (!ttsRes.ok || !ttsJson?.url) {
        setError(ttsJson?.error ?? "TTS 생성 실패");
        return;
      }
      const next = { ...overrides, [item.id]: ttsJson.url };
      setOverrides(next);
      const saveRes = await fetch("/api/admin/exams/audio-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: next }),
      });
      const saveJson = await saveRes.json().catch(() => null);
      if (!saveRes.ok || !saveJson?.ok) {
        setError(saveJson?.error ?? "저장 실패");
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">보이스 생성 (dictation / audio_mcq)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          보이스가 들어가는 문제(dictation, audio_mcq)에서 버튼을 누르면 TTS로 음성을 생성해 저장합니다. 시험 풀 때 해당 오디오가 재생됩니다.
        </p>
      </div>
      <div className="flex gap-2">
        <select
          className="rounded border border-border bg-white px-3 py-2 text-sm"
          value={`${exam.kind}:${exam.slug}`}
          onChange={(e) => {
            const v = e.target.value;
            const found = EXAM_OPTIONS.find((o) => `${o.kind}:${o.slug}` === v);
            if (found) setExam(found);
          }}
        >
          {EXAM_OPTIONS.map((o) => (
            <option key={`${o.kind}:${o.slug}`} value={`${o.kind}:${o.slug}`}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded border border-border bg-white px-3 py-2 text-sm hover:bg-muted"
          onClick={loadVoiceItems}
          disabled={loading}
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
          이 시험에는 dictation / audio_mcq 문제가 없습니다. 문제를 추가한 뒤 다시 불러오세요.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.id} · {item.type}
                </span>
                {overrides[item.id] || item.audioUrl ? (
                  <span className="text-xs text-green-600 dark:text-green-400">보이스 있음</span>
                ) : null}
              </div>
              {item.instruction ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.instruction}</p>
              ) : null}
              <p className="text-sm font-medium">TTS 텍스트: {item.textToSpeak || "(없음)"}</p>
              <div>
                <button
                  type="button"
                  className="rounded border border-border bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                  disabled={!!generatingId}
                  onClick={() => handleGenerate(item)}
                >
                  {generatingId === item.id ? "생성 중…" : "보이스 생성"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
