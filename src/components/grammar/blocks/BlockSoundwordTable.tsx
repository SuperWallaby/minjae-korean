"use client";

import type { SoundwordTableRow } from "@/data/grammarTypes";
import { Describe } from "@/components/article/Describe";
import { SoundPlayButton } from "@/components/article/SoundPlayButton";
import { Mic, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  headers: [string, string, string];
  rows: SoundwordTableRow[];
};

const isDev = process.env.NODE_ENV === "development";

/**
 * 오디오 path 규칙:
 * - row.sound 있으면 그대로, 없으면 word(산정) → /audio/{word}.mp3
 */
function safeAudioFileName(text: string): string {
  return text.replace(/\//g, "-").replace(/\\/g, "-");
}

function defaultSoundPath(row: SoundwordTableRow): string {
  const w = (row.word ?? "").trim();
  const forPath = safeAudioFileName(w).replace(/\.+$/, "");
  return `/audio/${encodeURIComponent(forPath || w)}.mp3`;
}

/** path에서 API에 넘길 filename 추출 (예: /audio/ㄷ-group.mp3 → ㄷ-group.mp3) */
function pathToFilename(path: string): string {
  const segment = path.replace(/^\/audio\//, "").replace(/\/+/g, "");
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function BlockSoundwordTable({ headers, rows }: Props) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [headChecked, setHeadChecked] = useState(false);
  const [deletedPaths, setDeletedPaths] = useState<Set<string>>(new Set());
  const [missingPaths, setMissingPaths] = useState<Set<string>>(new Set());
  const [updatedAtByPath, setUpdatedAtByPath] = useState<Record<string, number>>({});
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingPathRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/audio-overrides.json")
      .then((r) => r.ok ? r.json() : {})
      .then((data) =>
        setOverrides(
          typeof data === "object" && data != null && !Array.isArray(data)
            ? (data as Record<string, string>)
            : {},
        ),
      )
      .catch(() => setOverrides({}));
  }, []);

  /** 행별 override: key는 path 또는 path::rowIndex (같은 path여도 행마다 다른 파일) */
  const getActualPath = useCallback((path: string, rowIndex: number) => {
    return overrides[`${path}::${rowIndex}`] ?? overrides[path] ?? path;
  }, [overrides]);

  useEffect(() => {
    setHeadChecked(false);
    const entries: { missingKey: string; actual: string }[] = [];
    rows.forEach((row, i) => {
      const logical = row.sound ?? defaultSoundPath(row);
      entries.push({ missingKey: `${logical}::${i}`, actual: getActualPath(logical, i) });
    });
    Promise.all(
      entries.map(({ missingKey, actual }) =>
        fetch(actual, { method: "HEAD" })
          .then((res) => (res.ok ? null : missingKey))
          .catch(() => missingKey)
      )
    ).then((results) => {
      setMissingPaths(new Set(results.filter((p): p is string => p != null)));
      setHeadChecked(true);
    });
  }, [rows, overrides, getActualPath]);

  const handleDelete = useCallback(async (path: string, rowIndex: number) => {
    const key = overrides[`${path}::${rowIndex}`] ? `${path}::${rowIndex}` : overrides[path] ? path : null;
    const actualPath = overrides[`${path}::${rowIndex}`] ?? overrides[path] ?? path;
    const res = await fetch(`/api/admin/audio?path=${encodeURIComponent(actualPath)}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (json?.ok) {
      setDeletedPaths((prev) => new Set(prev).add(`${path}::${rowIndex}`));
      if (key) {
        await fetch(`/api/admin/audio/overrides?path=${encodeURIComponent(key)}`, { method: "DELETE" });
        setOverrides((prev) => { const next = { ...prev }; delete next[key]; return next; });
      }
    }
  }, [overrides]);

  const handleEditStart = useCallback((i: number, word: string) => {
    setEditRow(i);
    setEditValue(typeof word === "string" ? word : "");
  }, []);

  const onSaveSuccess = useCallback((path: string) => {
    setEditRow(null);
    setEditValue("");
    setUpdatedAtByPath((prev) => ({ ...prev, [path]: Date.now() }));
    setDeletedPaths((prev) => { const next = new Set(prev); next.delete(path); return next; });
    setMissingPaths((prev) => { const next = new Set(prev); next.delete(path); return next; });
  }, []);

  const handleEditSubmit = useCallback(
    async (path: string) => {
      const filename = pathToFilename(path);
      setSubmitting(true);
      try {
        const res = await fetch("/api/admin/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editValue.trim(), filename }),
        });
        const json = await res.json().catch(() => ({}));
        if (json?.ok) onSaveSuccess(path);
      } finally {
        setSubmitting(false);
      }
    },
    [editValue, onSaveSuccess]
  );

  const recordingRowRef = useRef<number | null>(null);

  const handleRecordStart = useCallback(async (path: string, rowIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const pathToUse = recordingPathRef.current;
        const rowIndexToUse = recordingRowRef.current;
        if (pathToUse != null && rowIndexToUse != null && chunksRef.current.length) {
          const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          const newFilename = `rec-${uniqueId}.mp3`;
          const newPath = `/audio/${newFilename}`;
          const overrideKey = `${pathToUse}::${rowIndexToUse}`;
          setSubmitting(true);
          try {
            const fd = new FormData();
            fd.append("file", new Blob(chunksRef.current, { type: "audio/webm" }), "recording.webm");
            fd.append("filename", newFilename);
            const up = await fetch("/api/admin/audio", { method: "POST", body: fd });
            const upJson = await up.json().catch(() => ({}));
            if (!upJson?.ok) return;
            const ov = await fetch("/api/admin/audio/overrides", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ originalPath: overrideKey, newPath }),
            });
            const ovJson = await ov.json().catch(() => ({}));
            if (ovJson?.ok) {
              setOverrides((prev) => ({ ...prev, [overrideKey]: newPath }));
              setUpdatedAtByPath((prev) => ({ ...prev, [newPath]: Date.now() }));
              setDeletedPaths((prev) => { const n = new Set(prev); n.delete(pathToUse); n.delete(overrideKey); return n; });
              setMissingPaths((prev) => { const n = new Set(prev); n.delete(overrideKey); return n; });
              onSaveSuccess(pathToUse);
            }
          } finally {
            setSubmitting(false);
          }
        }
        recordingPathRef.current = null;
        recordingRowRef.current = null;
      };
      mediaRecorderRef.current = mr;
      recordingPathRef.current = path;
      recordingRowRef.current = rowIndex;
      setRecording(true);
      mr.start();
    } catch {
      setRecording(false);
      recordingPathRef.current = null;
      recordingRowRef.current = null;
    }
  }, [onSaveSuccess]);

  const handleRecordStop = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") mr.stop();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[280px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left font-semibold">{headers[0]}</th>
            <th className="px-4 py-2.5 text-left font-semibold">{headers[1]}</th>
            <th className="px-4 py-2.5 text-left font-semibold">{headers[2]}</th>
            <th className="w-10 px-2 py-2.5" aria-label="Play" />
            {isDev && <th className="w-20 px-2 py-2.5" aria-label="Dev" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const sound = row.sound ?? defaultSoundPath(row);
            const actualPath = getActualPath(sound, i);
            const hidePlay = !headChecked || deletedPaths.has(`${sound}::${i}`) || deletedPaths.has(sound) || missingPaths.has(`${sound}::${i}`);
            const isEditing = editRow === i;
            const playSrc = updatedAtByPath[actualPath] ? `${actualPath}?t=${updatedAtByPath[actualPath]}` : actualPath;

            return (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <Describe>{row.word}</Describe>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.phonetic ?? "—"}
                </td>
                <td className="px-4 py-2">{row.meaning ?? "—"}</td>
                <td className="px-2 py-2">
                  {!hidePlay && (
                    <SoundPlayButton
                      src={playSrc}
                      aria-label={`Play ${row.word}`}
                    />
                  )}
                </td>
                {isDev && (
                  <td className="px-2 py-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(sound, i)}
                      title="녹음 파일 삭제"
                      className="p-1.5 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition"
                      aria-label="녹음 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditStart(i, row.word ?? "")}
                      title="단어 입력 후 TTS로 교체"
                      className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition"
                      aria-label="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {isEditing && (
                      <span className="flex items-center gap-1 flex-wrap">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="새 단어/문장"
                          className="w-32 px-2 py-1 text-sm border border-border rounded"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={submitting || !editValue.trim()}
                          onClick={() => handleEditSubmit(sound)}
                          className="text-sm px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                        >
                          TTS 생성
                        </button>
                        {!recording ? (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleRecordStart(sound, i)}
                            title="내 목소리 녹음"
                            className="text-sm px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            내 목소리
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRecordStop}
                            className="text-sm px-2 py-1 rounded border border-destructive bg-destructive/10 text-destructive"
                          >
                            녹음 중지
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditRow(null); setEditValue(""); }}
                          className="text-sm px-2 py-1 rounded border border-border"
                        >
                          취소
                        </button>
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
