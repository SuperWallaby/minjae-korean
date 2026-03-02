"use client";

import * as React from "react";
import { composeHangeulSyllable } from "@/lib/hangeulCompose";
import { SoundPlayButton } from "@/components/article/SoundPlayButton";
import { Mic, Pencil } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

type Props = {
  consonants: string[];
  vowels: string[];
};

/** 오디오 경로: public/audio/{글자}.mp3 (일괄 생성 스크립트와 동일 규칙) */
function syllableAudioSrc(syllable: string): string {
  return `/audio/${encodeURIComponent(syllable)}.mp3`;
}

/** path에서 API에 넘길 filename (예: /audio/가.mp3 → 가.mp3) */
function pathToFilename(path: string): string {
  const segment = path.replace(/^\/audio\//, "").replace(/\/+/g, "");
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** 모음(행) × 자음(열) 조합 테이블 — 가, 나, 다, … 클릭 시 소리 재생. 개발 모드에서 셀별 수정/직접 녹음 가능 */
export function BlockHangeulSyllableTable({ consonants, vowels }: Props) {
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [updatedAtByPath, setUpdatedAtByPath] = React.useState<Record<string, number>>({});
  const [recording, setRecording] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const recordingPathRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    fetch("/audio-overrides.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) =>
        setOverrides(
          typeof data === "object" && data != null && !Array.isArray(data)
            ? (data as Record<string, string>)
            : {},
        ),
      )
      .catch(() => setOverrides({}));
  }, []);

  const onSaveSuccess = React.useCallback((path: string) => {
    setEditingCell(null);
    setEditValue("");
    setUpdatedAtByPath((prev) => ({ ...prev, [path]: Date.now() }));
  }, []);

  const handleTtsSubmit = React.useCallback(
    async (syllable: string) => {
      const path = syllableAudioSrc(syllable);
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

  const handleRecordStart = React.useCallback(
    async (syllable: string) => {
      const logicalPath = syllableAudioSrc(syllable);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size) chunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setRecording(false);
          const pathToUse = recordingPathRef.current;
          if (pathToUse && chunksRef.current.length) {
            const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const newFilename = `rec-${uniqueId}.mp3`;
            const newPath = `/audio/${newFilename}`;
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
                body: JSON.stringify({ originalPath: logicalPath, newPath }),
              });
              const ovJson = await ov.json().catch(() => ({}));
              if (ovJson?.ok) {
                setOverrides((prev) => ({ ...prev, [logicalPath]: newPath }));
                setUpdatedAtByPath((prev) => ({ ...prev, [newPath]: Date.now() }));
                onSaveSuccess(logicalPath);
              }
            } finally {
              setSubmitting(false);
            }
          }
          recordingPathRef.current = null;
        };
        mediaRecorderRef.current = mr;
        recordingPathRef.current = logicalPath;
        setRecording(true);
        mr.start();
      } catch {
        setRecording(false);
        recordingPathRef.current = null;
      }
    },
    [onSaveSuccess]
  );

  const handleRecordStop = React.useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") mr.stop();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[320px] text-center text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-12 px-2 py-2 font-semibold text-muted-foreground">
              모음 \ 자음
            </th>
            {consonants.map((c) => (
              <th key={c} className="px-2 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vowels.map((v) => (
            <tr key={v} className="border-b border-border last:border-0">
              <td className="px-2 py-2 font-medium text-muted-foreground">
                {v}
              </td>
              {consonants.map((c) => {
                const syllable = composeHangeulSyllable(c, v);
                return (
                  <SyllableCell
                    key={`${c}-${v}`}
                    syllable={syllable}
                    isDev={isDev}
                    overrides={overrides}
                    editingCell={editingCell}
                    setEditingCell={setEditingCell}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    submitting={submitting}
                    recording={recording}
                    updatedAtByPath={updatedAtByPath}
                    onTtsSubmit={handleTtsSubmit}
                    onRecordStart={handleRecordStart}
                    onRecordStop={handleRecordStop}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type SyllableCellProps = {
  syllable: string;
  isDev: boolean;
  overrides: Record<string, string>;
  editingCell: string | null;
  setEditingCell: (s: string | null) => void;
  editValue: string;
  setEditValue: (s: string) => void;
  submitting: boolean;
  recording: boolean;
  updatedAtByPath: Record<string, number>;
  onTtsSubmit: (syllable: string) => void;
  onRecordStart: (syllable: string) => void;
  onRecordStop: () => void;
};

function SyllableCell({
  syllable,
  isDev,
  overrides,
  editingCell,
  setEditingCell,
  editValue,
  setEditValue,
  submitting,
  recording,
  updatedAtByPath,
  onTtsSubmit,
  onRecordStart,
  onRecordStop,
}: SyllableCellProps) {
  const path = syllableAudioSrc(syllable);
  const actualPath = overrides[path] ?? path;
  const isEditing = editingCell === syllable;
  const src = updatedAtByPath[actualPath] ? `${actualPath}?t=${updatedAtByPath[actualPath]}` : actualPath;

  return (
    <td className="px-2 py-2 align-top">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-0.5">
          <SoundPlayButton
            src={src}
            aria-label={`${syllable} 재생`}
            size="sm"
          />
          <span className="text-base font-medium">{syllable}</span>
          {isDev && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditingCell(syllable);
                setEditValue(syllable);
              }}
              title="TTS 또는 내 목소리로 교체"
              className="p-1 rounded border border-border text-muted-foreground hover:text-foreground"
              aria-label="수정"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
        {isDev && isEditing && (
          <div className="flex flex-wrap items-center gap-1 text-left">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="TTS 문구"
              className="w-16 px-1.5 py-0.5 text-xs border border-border rounded"
            />
            <button
              type="button"
              disabled={submitting || !editValue.trim()}
              onClick={() => onTtsSubmit(syllable)}
              className="text-xs px-1.5 py-0.5 rounded bg-primary text-primary-foreground disabled:opacity-50"
            >
              TTS
            </button>
            {!recording ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => onRecordStart(syllable)}
                title="내 목소리 녹음"
                className="text-xs px-1.5 py-0.5 rounded border border-border flex items-center gap-0.5"
              >
                <Mic className="h-3 w-3" />
                녹음
              </button>
            ) : (
              <button
                type="button"
                onClick={onRecordStop}
                className="text-xs px-1.5 py-0.5 rounded border border-destructive bg-destructive/10 text-destructive"
              >
                중지
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditingCell(null)}
              className="text-xs px-1.5 py-0.5 rounded border border-border"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </td>
  );
}
