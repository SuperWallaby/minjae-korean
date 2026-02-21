"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DateTime } from "luxon";

import { SoundPlayButton } from "@/components/article/SoundPlayButton";
import { smartUnsplashSearch } from "@/lib/smartUnsplash";

/** API/목록에서 오는 리스트 항목 */
type RecapListItem = {
  text: string;
  audioUrl?: string;
  phonetic?: string;
  imageUrl?: string;
  meaning?: string;
  example?: string;
  exampleTranslation?: string;
  examplePhonetic?: string;
  exampleAudioUrl?: string;
  content?: string;
};

const LEVELS = [1, 2, 3, 4, 5] as const;

type RecapItem = {
  id: string;
  bookingId?: string;
  studentName: string;
  studentId?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  expression: RecapListItem[];
  grammarPoint: RecapListItem[];
  vocabulary: RecapListItem[];
  mistake: RecapListItem[];
  pronounce: RecapListItem[];
  createdAt: string;
  updatedAt: string;
};

const LIST_FIELD_KEYS = ["expression", "grammarPoint", "vocabulary", "mistake", "pronounce"] as const;
const LIST_FIELD_LABELS: Record<(typeof LIST_FIELD_KEYS)[number], string> = {
  expression: "Expression",
  grammarPoint: "Grammar Point",
  vocabulary: "Vocabulary",
  mistake: "Mistake",
  pronounce: "Pronounce",
};

type ListRow = {
  text: string;
  audioUrl: string;
  phonetic: string;
  imageUrl: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  examplePhonetic: string;
  exampleAudioUrl: string;
  content: string;
};

const defaultListRow = (): ListRow => ({
  text: "",
  audioUrl: "",
  phonetic: "",
  imageUrl: "",
  meaning: "",
  example: "",
  exampleTranslation: "",
  examplePhonetic: "",
  exampleAudioUrl: "",
  content: "",
});

const defaultForm = () => ({
  bookingId: "",
  studentName: "",
  studentId: "",
  level: "" as "" | "1" | "2" | "3" | "4" | "5",
  expression: [defaultListRow()] as ListRow[],
  grammarPoint: [defaultListRow()] as ListRow[],
  vocabulary: [defaultListRow()] as ListRow[],
  mistake: [defaultListRow()] as ListRow[],
  pronounce: [defaultListRow()] as ListRow[],
});

function toListRows(items: RecapListItem[]): ListRow[] {
  if (!items.length) return [defaultListRow()];
  return items.map((i) => ({
    text: i.text,
    audioUrl: i.audioUrl ?? "",
    phonetic: i.phonetic ?? "",
    imageUrl: i.imageUrl ?? "",
    meaning: i.meaning ?? "",
    example: i.example ?? "",
    exampleTranslation: i.exampleTranslation ?? "",
    examplePhonetic: i.examplePhonetic ?? "",
    exampleAudioUrl: i.exampleAudioUrl ?? "",
    content: i.content ?? "",
  }));
}

function toListItems(rows: ListRow[]): RecapListItem[] {
  return rows
    .map((r) => ({
      text: r.text.trim(),
      audioUrl: r.audioUrl.trim() || undefined,
      phonetic: r.phonetic.trim() || undefined,
      imageUrl: r.imageUrl.trim() || undefined,
      meaning: r.meaning.trim() || undefined,
      example: r.example.trim() || undefined,
      exampleTranslation: r.exampleTranslation.trim() || undefined,
      examplePhonetic: r.examplePhonetic.trim() || undefined,
      exampleAudioUrl: r.exampleAudioUrl.trim() || undefined,
      content: r.content.trim() || undefined,
    }))
    .filter((r) => r.text.length > 0);
}

async function uploadToR2(file: File): Promise<string> {
  const res = await fetch("/api/admin/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(String(json?.error ?? "업로드 실패"));
  const uploadUrl = String(json?.data?.uploadUrl ?? "");
  const publicUrl = String(json?.data?.publicUrl ?? "");
  if (!uploadUrl || !publicUrl) throw new Error("업로드 URL 없음");
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error("업로드 실패");
  return publicUrl;
}

const JSON_EXAMPLE = `[
  {
    "studentName": "홍길동",
    "level": 2,
    "expression": [
      { "text": "오늘 날씨가 좋아요", "audioUrl": "https://...", "phonetic": "오늘 나시가 조아요" },
      { "text": "내일 봐요" }
    ],
    "grammarPoint": [
      { "text": "-아/어서", "content": "이유나 원인을 나타내는 연결 어미입니다." }
    ],
    "vocabulary": [
      { "text": "날씨", "meaning": "weather", "example": "오늘 날씨가 좋아요", "exampleTranslation": "The weather is nice today.", "phonetic": "nal-ssi", "imageUrl": "https://..." }
    ],
    "mistake": [{ "text": "먹었어요 → 먹겠어요", "audioUrl": "https://..." }],
    "pronounce": [{ "text": "좋아요", "example": "좋아요 → 조아요", "audioUrl": "https://..." }]
  }
]`;

const RECAP_JSON_TYPES = `/** 필드별 용도 정리
 * - Expression: text, phonetic, audioUrl (이미지 X)
 * - Grammar Point: text (제목), content (내용) (이미지·음성 X)
 * - Vocabulary: text, meaning, example, exampleTranslation, phonetic, audioUrl, imageUrl
 * - Mistake: text, phonetic, audioUrl, imageUrl
 * - Pronounce: text, example, examplePhonetic, exampleAudioUrl, phonetic, audioUrl
 */

interface RecapListItem {
  text: string;
  audioUrl?: string;
  phonetic?: string;
  imageUrl?: string;
  /** vocabulary: 뜻 */
  meaning?: string;
  /** vocabulary / pronounce: 예문 */
  example?: string;
  /** vocabulary: 예문 해석 */
  exampleTranslation?: string;
  /** 예문 발음 기호 */
  examplePhonetic?: string;
  /** 예문 발음 오디오 URL */
  exampleAudioUrl?: string;
  /** grammarPoint: 내용 */
  content?: string;
}

/** 리스트 필드: 문자열 배열 또는 RecapListItem[] */
type RecapListInput = string[] | RecapListItem[];

/** JSON 입력: 단일 객체 또는 이 타입의 배열 */
interface RecapJsonInput {
  studentName?: string;
  bookingId?: string;
  studentId?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  expression?: RecapListInput;
  grammarPoint?: RecapListInput;
  vocabulary?: RecapListInput;
  mistake?: RecapListInput;
  pronounce?: RecapListInput;
}`;

const JSON_GUIDE = (
  <div className="rounded-lg border border-border bg-white p-4">
    <div className="mb-2 text-sm font-medium text-foreground">Recap JSON — 타입 정의</div>
    <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs font-mono text-muted-foreground whitespace-pre">
      {RECAP_JSON_TYPES}
    </pre>
  </div>
);

type RecapInput = {
  bookingId?: string;
  studentName?: string;
  studentId?: string;
  level?: number | string;
  expression?: unknown;
  grammarPoint?: unknown;
  vocabulary?: unknown;
  mistake?: unknown;
  pronounce?: unknown;
};

export default function AdminRecapsView() {
  const [filter, setFilter] = useState<"all" | "linked" | "unlinked">("all");
  const [items, setItems] = useState<RecapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showJsonForm, setShowJsonForm] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [form, setForm] = useState(defaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Record<string, string | ListRow[]>>>({});
  const [ttsKey, setTtsKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [batchTtsInProgress, setBatchTtsInProgress] = useState(false);
  const [batchImageInProgress, setBatchImageInProgress] = useState(false);
  const [batchJsonTtsInProgress, setBatchJsonTtsInProgress] = useState(false);
  const [batchJsonImageInProgress, setBatchJsonImageInProgress] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [imageTarget, setImageTarget] = useState<{ field: string; idx: number; forEdit?: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "linked") params.set("linked", "true");
      if (filter === "unlinked") params.set("linked", "false");
      const res = await fetch(`/api/admin/recaps?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && Array.isArray(json.data?.items)) {
        setItems(json.data.items as RecapItem[]);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/recaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: form.bookingId.trim() || undefined,
          studentName: form.studentName.trim() || "—",
          studentId: form.studentId.trim() || undefined,
          level: form.level ? parseInt(form.level, 10) : undefined,
          expression: toListItems(form.expression),
          grammarPoint: toListItems(form.grammarPoint),
          vocabulary: toListItems(form.vocabulary),
          mistake: toListItems(form.mistake),
          pronounce: toListItems(form.pronounce),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setForm(defaultForm());
        setShowForm(false);
        load();
      } else {
        alert(json?.error ?? "저장 실패");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function normalizeListInput(raw: unknown): RecapListItem[] {
    if (raw == null) return [];
    if (typeof raw === "string") {
      const t = raw.trim();
      return t ? [{ text: t }] : [];
    }
    if (!Array.isArray(raw)) return [];
    const str = (v: unknown) => (v != null && typeof v === "string" ? v.trim() || undefined : undefined);
    return raw
      .map((item): RecapListItem | null => {
        if (typeof item === "string") {
          const t = item.trim();
          return t ? { text: t } : null;
        }
        if (item && typeof item === "object" && "text" in item) {
          const o = item as Record<string, unknown>;
          const t = String(o.text ?? "").trim();
          if (!t) return null;
          return {
            text: t,
            ...(str(o.audioUrl) && { audioUrl: str(o.audioUrl) }),
            ...(str(o.phonetic) && { phonetic: str(o.phonetic) }),
            ...(str(o.imageUrl) && { imageUrl: str(o.imageUrl) }),
            ...(str(o.meaning) && { meaning: str(o.meaning) }),
            ...(str(o.example) && { example: str(o.example) }),
            ...(str(o.exampleTranslation) && { exampleTranslation: str(o.exampleTranslation) }),
            ...(str(o.examplePhonetic) && { examplePhonetic: str(o.examplePhonetic) }),
            ...(str(o.exampleAudioUrl) && { exampleAudioUrl: str(o.exampleAudioUrl) }),
            ...(str(o.content) && { content: str(o.content) }),
          };
        }
        return null;
      })
      .filter((r): r is RecapListItem => r != null);
  }

  function normalizeRecapInput(raw: unknown): RecapInput | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const levelVal = o.level;
    const level =
      levelVal != null
        ? typeof levelVal === "number"
          ? levelVal >= 1 && levelVal <= 5
            ? levelVal
            : undefined
          : (() => {
              const n = parseInt(String(levelVal), 10);
              return n >= 1 && n <= 5 ? n : undefined;
            })()
        : undefined;
    return {
      bookingId: o.bookingId != null ? String(o.bookingId).trim() : undefined,
      studentName: o.studentName != null ? String(o.studentName).trim() : undefined,
      studentId: o.studentId != null ? String(o.studentId).trim() : undefined,
      level,
      expression: o.expression,
      grammarPoint: o.grammarPoint,
      vocabulary: o.vocabulary,
      mistake: o.mistake,
      pronounce: o.pronounce,
    };
  }

  async function runJsonBatchTts() {
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      alert("JSON을 입력해 주세요.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      alert("JSON 형식이 올바르지 않습니다.\n" + String(err));
      return;
    }

    const processItems = async (items: unknown[]): Promise<boolean> => {
      let updated = false;
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;
        const raw = typeof obj.text === "string" ? obj.text.trim() : "";
        const existingAudio = typeof obj.audioUrl === "string" ? obj.audioUrl.trim() : "";
        if (!raw || (existingAudio && existingAudio.startsWith("http"))) continue;
        const text = getTextForTts(raw);
        if (!text) continue; // 영어 제외 후 한글이 없으면 스킵
        try {
          const res = await fetch("/api/admin/tts/word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          const json = await res.json().catch(() => null);
          if (res.ok && json?.ok && json.url) {
            obj.audioUrl = json.url;
            updated = true;
          }
        } catch {}
      }
      return updated;
    };

    setBatchJsonTtsInProgress(true);
    let updated = false;
    try {
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first && typeof first === "object" && "text" in first) {
          updated = await processItems(parsed);
        } else {
          for (const recap of parsed) {
            if (!recap || typeof recap !== "object") continue;
            const sections = ["expression", "vocabulary", "mistake", "pronounce"] as const;
            for (const sectionKey of sections) {
              const items = (recap as Record<string, unknown>)[sectionKey];
              if (Array.isArray(items)) {
                const res = await processItems(items);
                if (res) updated = true;
              }
            }
          }
        }
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        const sections = ["expression", "vocabulary", "mistake", "pronounce"] as const;
        let foundSection = false;
        for (const sectionKey of sections) {
          if (sectionKey in obj && Array.isArray(obj[sectionKey])) {
            foundSection = true;
            const res = await processItems(obj[sectionKey] as unknown[]);
            if (res) updated = true;
          }
        }
        if (!foundSection && "text" in obj) {
          updated = await processItems([obj]);
        }
      }

      if (updated) {
        setJsonInput(JSON.stringify(parsed, null, 2));
      } else {
        alert("생성할 발음이 없습니다.\n(text 필드가 있는 항목이 필요합니다)");
      }
    } finally {
      setBatchJsonTtsInProgress(false);
    }
  }

  async function runJsonBatchImage() {
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      alert("JSON을 입력해 주세요.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      alert("JSON 형식이 올바르지 않습니다.\n" + String(err));
      return;
    }

    const results: { text: string; status: string }[] = [];
    const processItems = async (items: unknown[]): Promise<boolean> => {
      let updated = false;
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;
        const text = typeof obj.text === "string" ? obj.text.trim() : "";
        const existingImg = typeof obj.imageUrl === "string" ? obj.imageUrl.trim() : "";
        if (!text) continue;
        if (existingImg && existingImg.startsWith("http")) {
          results.push({ text, status: "이미 있음" });
          continue;
        }
        try {
          const imgRes = await smartUnsplashSearch(text);
          if (imgRes) {
            obj.imageUrl = imgRes;
            results.push({ text, status: "성공" });
            updated = true;
          } else {
            results.push({ text, status: "이미지 못찾음" });
          }
        } catch (err) {
          results.push({ text, status: `에러: ${err}` });
        }
      }
      return updated;
    };

    setBatchJsonImageInProgress(true);
    let updated = false;
    try {
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first && typeof first === "object" && "text" in first) {
          updated = await processItems(parsed);
        } else {
          for (const recap of parsed) {
            if (!recap || typeof recap !== "object") continue;
            const items = (recap as Record<string, unknown>).vocabulary;
            if (Array.isArray(items)) {
              const res = await processItems(items);
              if (res) updated = true;
            }
          }
        }
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        if ("vocabulary" in obj && Array.isArray(obj.vocabulary)) {
          updated = await processItems(obj.vocabulary as unknown[]);
        } else if ("text" in obj) {
          updated = await processItems([obj]);
        }
      }

      if (updated) {
        setJsonInput(JSON.stringify(parsed, null, 2));
        const summary = results.map((r) => `${r.text}: ${r.status}`).join("\n");
        alert(`이미지 검색 완료:\n${summary}`);
      } else if (results.length === 0) {
        alert("이미지를 검색할 항목이 없습니다.\n(vocabulary 배열 내 text 필드가 필요합니다)");
      } else {
        const summary = results.map((r) => `${r.text}: ${r.status}`).join("\n");
        alert(`이미지 검색 실패:\n${summary}`);
      }
    } finally {
      setBatchJsonImageInProgress(false);
    }
  }

  async function handleCreateFromJson(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      alert("JSON을 입력해 주세요.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      alert("JSON 형식이 올바르지 않습니다.\n" + String(err));
      return;
    }
    const list: RecapInput[] = Array.isArray(parsed)
      ? parsed.map(normalizeRecapInput).filter((r): r is RecapInput => r != null)
      : [normalizeRecapInput(parsed)].filter((r): r is RecapInput => r != null);

    if (list.length === 0) {
      alert("유효한 리캡 항목이 없습니다. 객체 또는 객체 배열을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    let created = 0;
    const errors: string[] = [];
    try {
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const body = {
          bookingId: item.bookingId || undefined,
          studentName: item.studentName || "—",
          studentId: item.studentId || undefined,
          level: item.level,
          expression: normalizeListInput(item.expression),
          grammarPoint: normalizeListInput(item.grammarPoint),
          vocabulary: normalizeListInput(item.vocabulary),
          mistake: normalizeListInput(item.mistake),
          pronounce: normalizeListInput(item.pronounce),
        };
        const res = await fetch("/api/admin/recaps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.ok) {
          created++;
        } else {
          errors.push(`#${i + 1}: ${json?.error ?? "저장 실패"}`);
        }
      }
      if (created > 0) {
        setJsonInput("");
        setShowJsonForm(false);
        load();
      }
      if (errors.length > 0) {
        alert(`${created}건 저장됨. 실패: ${errors.join("; ")}`);
      } else if (created === list.length) {
        alert(`${created}건 저장되었습니다.`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: string, e: React.FormEvent) {
    e.preventDefault();
    const patch: Record<string, unknown> = {};
    if (editForm.bookingId !== undefined) patch.bookingId = editForm.bookingId;
    if (editForm.studentName !== undefined) patch.studentName = editForm.studentName;
    if (editForm.studentId !== undefined) patch.studentId = editForm.studentId;
    if (editForm.level !== undefined) {
      const v = (editForm.level as string)?.trim();
      patch.level = v ? parseInt(v, 10) : undefined;
    }
    for (const key of LIST_FIELD_KEYS) {
      const rows = editForm[key];
      if (Array.isArray(rows)) patch[key] = toListItems(rows);
    }
    if (Object.keys(patch).length === 0) {
      setEditingId(null);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/recaps/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setEditingId(null);
        setEditForm({});
        load();
      } else {
        alert(json?.error ?? "수정 실패");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 리캡을 삭제할까요?")) return;
    const res = await fetch(`/api/admin/recaps/${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) {
      load();
      if (editingId === id) setEditingId(null);
    } else {
      alert(json?.error ?? "삭제 실패");
    }
  }

  function startEdit(item: RecapItem) {
    setEditingId(item.id);
    setEditForm({
      studentName: item.studentName,
      studentId: item.studentId ?? "",
      bookingId: item.bookingId ?? "",
      level: item.level != null ? String(item.level) : "",
      expression: toListRows(item.expression),
      grammarPoint: toListRows(item.grammarPoint),
      vocabulary: toListRows(item.vocabulary),
      mistake: toListRows(item.mistake),
      pronounce: toListRows(item.pronounce),
    });
  }

  /** 영어(알파벳)·특수문자를 제거한 한글만 반환. 비어 있으면 null (TTS 스킵) */
  function getTextForTts(text: string): string | null {
    const t = text.trim();
    if (!t) return null;
    const koreanOnly = t.replace(/[a-zA-Z]/g, "").replace(/[^\uAC00-\uD7A3\s0-9.,?!'"]/g, "").trim();
    return koreanOnly || null;
  }
  type ListSource = { expression: ListRow[]; grammarPoint: ListRow[]; vocabulary: ListRow[]; mistake: ListRow[]; pronounce: ListRow[] };
  function collectTtsTasks(src: ListSource): { field: keyof ListSource; idx: number; text: string; kind: "text" | "example" }[] {
    const tasks: { field: keyof ListSource; idx: number; text: string; kind: "text" | "example" }[] = [];
    (["expression", "vocabulary", "mistake", "pronounce"] as const).forEach((field) => {
      const rows = src[field] ?? [];
      rows.forEach((row, idx) => {
        const raw = row.text?.trim();
        const text = raw ? getTextForTts(raw) : null;
        if (text && !row.audioUrl?.trim()) tasks.push({ field, idx, text, kind: "text" });
        const rawExample = field === "pronounce" ? row.example?.trim() : "";
        const example = rawExample ? getTextForTts(rawExample) : null;
        if (example && !row.exampleAudioUrl?.trim()) tasks.push({ field, idx, text: example, kind: "example" });
      });
    });
    return tasks;
  }
  function collectEmptyImageSlots(src: ListSource): { field: keyof ListSource; idx: number; text: string }[] {
    const slots: { field: keyof ListSource; idx: number; text: string }[] = [];
    (["vocabulary"] as const).forEach((field) => {
      const rows = src[field] ?? [];
      rows.forEach((row, idx) => {
        if (row.text?.trim() && !row.imageUrl?.trim()) slots.push({ field, idx, text: row.text.trim() });
      });
    });
    return slots;
  }
  async function runBatchTts(useEditForm: boolean) {
    const src = useEditForm ? (editForm as ListSource) : (form as ListSource);
    const tasks = collectTtsTasks(src);
    if (tasks.length === 0) {
      alert("발음이 비어 있는 항목이 없습니다.");
      return;
    }
    setBatchTtsInProgress(true);
    try {
      if (useEditForm) {
        let next = { ...editForm } as Record<string, ListRow[]>;
        for (const { field, idx, text, kind } of tasks) {
          const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
          const j = await res.json().catch(() => null);
          if (res.ok && j?.ok && j?.url) {
            const rows = [...(next[field] ?? [])];
            const row = rows[idx] ?? defaultListRow();
            if (kind === "text") rows[idx] = { ...row, audioUrl: String(j.url) };
            else rows[idx] = { ...row, exampleAudioUrl: String(j.url) };
            next = { ...next, [field]: rows };
            setEditForm((p) => ({ ...p, ...next }));
          }
          await new Promise((r) => setTimeout(r, 200));
        }
      } else {
        let next = { ...form };
        for (const { field, idx, text, kind } of tasks) {
          const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
          const j = await res.json().catch(() => null);
          if (res.ok && j?.ok && j?.url) {
            const rows = [...(next[field] as ListRow[])];
            const row = rows[idx] ?? defaultListRow();
            if (kind === "text") rows[idx] = { ...row, audioUrl: String(j.url) };
            else rows[idx] = { ...row, exampleAudioUrl: String(j.url) };
            next = { ...next, [field]: rows };
            setForm(next);
          }
          await new Promise((r) => setTimeout(r, 200));
        }
      }
      alert(`발음 ${tasks.length}건 생성 완료.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "일괄 생성 실패");
    } finally {
      setBatchTtsInProgress(false);
    }
  }
  async function runBatchImage(useEditForm: boolean) {
    const src = useEditForm ? (editForm as ListSource) : (form as ListSource);
    const slots = collectEmptyImageSlots(src);
    if (slots.length === 0) {
      alert("이미지가 비어 있는 항목이 없습니다.");
      return;
    }
    setBatchImageInProgress(true);
    let found = 0;
    try {
      for (const { field, idx, text } of slots) {
        const url = await smartUnsplashSearch(text);
        if (url) {
          found++;
          if (useEditForm) {
            setEditForm((p) => {
              const rows = [...((p[field] as ListRow[]) ?? [])];
              const row = rows[idx] ?? defaultListRow();
              rows[idx] = { ...row, imageUrl: url };
              return { ...p, [field]: rows };
            });
          } else {
            setForm((p) => {
              const rows = [...(p[field] as ListRow[])];
              const row = rows[idx] ?? defaultListRow();
              rows[idx] = { ...row, imageUrl: url };
              return { ...p, [field]: rows };
            });
          }
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      alert(`이미지 ${found}/${slots.length}건 검색 완료.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "이미지 검색 실패");
    } finally {
      setBatchImageInProgress(false);
    }
  }

  const formatDate = (iso: string) =>
    DateTime.fromISO(iso).setZone("Asia/Seoul").toFormat("yyyy-MM-dd HH:mm");

  return (
    <section className="mt-6">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          const target = imageTarget;
          e.target.value = "";
          if (!file || !target) return;
          setUploadingKey(`${target.field}-${target.idx}`);
          try {
            const url = await uploadToR2(file);
            if (target.forEdit) {
              setEditForm((p) => ({
                ...p,
                [target.field]: ((p[target.field] as ListRow[]) ?? []).map((r, i) =>
                  i === target.idx ? { ...r, imageUrl: url } : r,
                ),
              }));
            } else {
              setForm((p) => {
                const key = target.field as keyof typeof p;
                const list = (p[key] as ListRow[]) ?? [];
                return {
                  ...p,
                  [key]: list.map((r, i) => (i === target.idx ? { ...r, imageUrl: url } : r)),
                };
              });
            }
          } catch (err) {
            alert(err instanceof Error ? err.message : "이미지 업로드 실패");
          } finally {
            setUploadingKey(null);
            setImageTarget(null);
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-lg font-semibold">리캡 노트</div>
        <div className="flex items-center gap-2">
          {(["all", "linked", "unlinked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`px-3 py-1.5 rounded border text-sm ${
                filter === f ? "bg-black text-white" : "bg-white hover:bg-muted/40"
              }`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : f === "linked" ? "연결됨" : "연결 안 됨"}
            </button>
          ))}
          {!showForm && !showJsonForm && (
            <>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => setShowForm(true)}
              >
                새 리캡
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => setShowJsonForm(true)}
              >
                JSON으로 입력
              </button>
            </>
          )}
          {showForm && (
            <>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => {
                  setShowForm(false);
                  setShowJsonForm(true);
                }}
              >
                JSON 모드로 전환
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => setShowForm(false)}
              >
                취소
              </button>
            </>
          )}
          {showJsonForm && (
            <>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => {
                  setShowJsonForm(false);
                  setShowForm(true);
                }}
              >
                일반 모드로 전환
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded border bg-white hover:bg-black hover:text-white transition"
                onClick={() => setShowJsonForm(false)}
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>

      {showJsonForm && (
        <form onSubmit={handleCreateFromJson} className="p-4 mb-6 border rounded bg-muted/20 space-y-3">
          <div className="font-medium">JSON으로 리캡 입력</div>
          {JSON_GUIDE}
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={JSON_EXAMPLE}
            rows={14}
            className="w-full px-3 py-2 border rounded font-mono text-sm resize-y"
            spellCheck={false}
          />
          <div className="sticky bottom-0 -mx-4 -mb-3 mt-3 flex flex-wrap gap-2 items-center bg-white border-t border-border px-4 py-3 shadow-sm">
            <button
              type="button"
              disabled={batchJsonTtsInProgress || batchJsonImageInProgress || submitting || !jsonInput.trim()}
              onClick={runJsonBatchTts}
              className="px-3 py-1.5 rounded border border-orange-400 text-orange-600 disabled:opacity-50"
            >
              {batchJsonTtsInProgress ? "발음 생성 중…" : "🎤 발음 일괄 생성"}
            </button>
            <button
              type="button"
              disabled={batchJsonTtsInProgress || batchJsonImageInProgress || submitting || !jsonInput.trim()}
              onClick={runJsonBatchImage}
              className="px-3 py-1.5 rounded border border-emerald-500 text-emerald-600 disabled:opacity-50"
            >
              {batchJsonImageInProgress ? "이미지 검색 중…" : "🖼️ 이미지 자동 검색"}
            </button>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={submitting || batchJsonTtsInProgress || batchJsonImageInProgress || !jsonInput.trim()}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {submitting ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setShowJsonForm(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 mb-6 border rounded bg-muted/20 space-y-4">
          <div className="font-medium">새 리캡 노트</div>
          <label className="block">
            <span className="text-sm text-muted-foreground">Booking ID (선택)</span>
            <input
              type="text"
              value={form.bookingId}
              onChange={(e) => setForm((p) => ({ ...p, bookingId: e.target.value }))}
              placeholder="연결할 예약 ID"
              className="mt-0.5 w-full px-3 py-2 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Student Name * (관리자용·공개 시 비공개)</span>
            <input
              type="text"
              value={form.studentName}
              onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))}
              className="mt-0.5 w-full px-3 py-2 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Student ID (optional, 관리자용·공개 시 비공개)</span>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              className="mt-0.5 w-full px-3 py-2 border rounded"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Level (1–5, 선택)</span>
            <select
              value={form.level}
              onChange={(e) =>
                setForm((p) => ({ ...p, level: e.target.value as "" | "1" | "2" | "3" | "4" | "5" }))
              }
              className="mt-0.5 w-full px-3 py-2 border rounded bg-white"
            >
              <option value="">—</option>
              {LEVELS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {/* Expression: text, phonetic, audio only */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Expression (리스트)</span>
            {(form.expression as ListRow[]).map((row, idx) => (
              <div key={idx} className="p-3 border rounded space-y-2 bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => setForm((p) => ({ ...p, expression: (p.expression as ListRow[]).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))}
                    placeholder="표현"
                    className="flex-1 min-w-[150px] px-3 py-2 border rounded"
                  />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, expression: (p.expression as ListRow[]).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm text-muted-foreground hover:bg-muted">삭제</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <input type="text" value={row.phonetic} onChange={(e) => setForm((p) => ({ ...p, expression: (p.expression as ListRow[]).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음기호" className="w-32 px-2 py-1.5 border rounded" />
                  <input type="url" value={row.audioUrl} onChange={(e) => setForm((p) => ({ ...p, expression: (p.expression as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="사운드 URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                  <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`form-exp-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setForm((p) => ({ ...p, expression: (p.expression as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `form-exp-${idx}` ? "…" : "발음"}</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm((p) => ({ ...p, expression: [...(p.expression as ListRow[]), defaultListRow()] }))} className="text-sm text-muted-foreground hover:text-foreground">+ 항목 추가</button>
          </div>

          {/* Grammar Point: text (title), content only */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Grammar Point (리스트)</span>
            {(form.grammarPoint as ListRow[]).map((row, idx) => (
              <div key={idx} className="p-3 border rounded space-y-2 bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => setForm((p) => ({ ...p, grammarPoint: (p.grammarPoint as ListRow[]).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))}
                    placeholder="제목"
                    className="flex-1 min-w-[150px] px-3 py-2 border rounded"
                  />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, grammarPoint: (p.grammarPoint as ListRow[]).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm text-muted-foreground hover:bg-muted">삭제</button>
                </div>
                <textarea
                  value={row.content}
                  onChange={(e) => setForm((p) => ({ ...p, grammarPoint: (p.grammarPoint as ListRow[]).map((r, i) => i === idx ? { ...r, content: e.target.value } : r) }))}
                  placeholder="내용"
                  rows={2}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            ))}
            <button type="button" onClick={() => setForm((p) => ({ ...p, grammarPoint: [...(p.grammarPoint as ListRow[]), defaultListRow()] }))} className="text-sm text-muted-foreground hover:text-foreground">+ 항목 추가</button>
          </div>

          {/* Vocabulary: News-style layout */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Vocabulary (리스트)</span>
            {(form.vocabulary as ListRow[]).map((row, idx) => (
              <div key={idx} className="rounded-xl border border-border p-4 bg-white space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Item {idx + 1}</span>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm text-muted-foreground hover:bg-muted">삭제</button>
                </div>
                <input type="text" value={row.text} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="단어" className="w-full px-3 py-2 border rounded" />
                <input type="text" value={row.meaning} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, meaning: e.target.value } : r) }))} placeholder="뜻 (English description)" className="w-full px-3 py-2 border rounded" />
                <input type="text" value={row.example} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, example: e.target.value } : r) }))} placeholder="예문" className="w-full px-3 py-2 border rounded" />
                <input type="text" value={row.exampleTranslation} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, exampleTranslation: e.target.value } : r) }))} placeholder="예문 해석" className="w-full px-3 py-2 border rounded" />
                <input type="text" value={row.phonetic} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음기호 (e.g. IPA)" className="w-full px-3 py-2 border rounded" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input type="url" value={row.imageUrl} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, imageUrl: e.target.value } : r) }))} placeholder="이미지 URL" className="flex-1 px-3 py-2 border rounded" />
                  <button type="button" disabled={uploadingKey !== null} onClick={() => { setImageTarget({ field: "vocabulary", idx }); setTimeout(() => fileInputRef.current?.click(), 0); }} className="px-3 py-2 rounded border disabled:opacity-50 text-sm shrink-0">{uploadingKey === `vocabulary-${idx}` ? "업로드 중…" : "이미지 업로드"}</button>
                  {row.imageUrl ? <a href={row.imageUrl} target="_blank" rel="noreferrer" className="inline-block shrink-0"><img src={row.imageUrl} alt="" className="h-10 w-10 object-cover rounded border" /></a> : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input type="url" value={row.audioUrl} onChange={(e) => setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="사운드 URL" className="flex-1 px-3 py-2 border rounded" />
                  <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-3 py-2 rounded border disabled:opacity-50 text-sm shrink-0" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`form-voc-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setForm((p) => ({ ...p, vocabulary: (p.vocabulary as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `form-voc-${idx}` ? "생성 중…" : "발음 생성"}</button>
                  {row.audioUrl ? <audio controls src={row.audioUrl} className="h-8 max-w-[160px] shrink-0" /> : null}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm((p) => ({ ...p, vocabulary: [...(p.vocabulary as ListRow[]), defaultListRow()] }))} className="text-sm text-muted-foreground hover:text-foreground">+ 항목 추가</button>
          </div>

          {/* Mistake & Pronounce */}
          <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/10">
            <span className="text-sm font-medium text-muted-foreground">{LIST_FIELD_LABELS.mistake}</span>
            <div className="space-y-2">
              {(form.mistake as ListRow[]).map((row, idx) => (
                <div key={idx} className="p-2 border rounded space-y-2 bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={row.text}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          mistake: (p.mistake as ListRow[]).map((r, i) =>
                            i === idx ? { ...r, text: e.target.value } : r,
                          ),
                        }))
                      }
                      placeholder="텍스트"
                      className="flex-1 min-w-[120px] px-3 py-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          mistake: (p.mistake as ListRow[]).filter((_, i) => i !== idx),
                        }))
                      }
                      className="px-2 py-1 rounded border text-sm"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <input type="text" value={row.phonetic} onChange={(e) => setForm((p) => ({ ...p, mistake: (p.mistake as ListRow[]).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음" className="w-32 px-2 py-1.5 border rounded" />
                    <input type="url" value={row.audioUrl} onChange={(e) => setForm((p) => ({ ...p, mistake: (p.mistake as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                    <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`form-mistake-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setForm((p) => ({ ...p, mistake: (p.mistake as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `form-mistake-${idx}` ? "…" : "발음"}</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setForm((p) => ({ ...p, mistake: [...(p.mistake as ListRow[]), defaultListRow()] }))} className="text-sm text-muted-foreground">+ Mistake 추가</button>
            </div>
            <span className="text-sm font-medium text-muted-foreground block mt-3">Pronounce (Mistake 내)</span>
            <div className="space-y-2">
              {(form.pronounce as ListRow[]).map((row, idx) => (
                <div key={idx} className="p-2 border rounded space-y-2 bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <input type="text" value={row.text} onChange={(e) => setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="표현" className="flex-1 min-w-[120px] px-3 py-2 border rounded" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm">삭제</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <input type="text" value={row.example} onChange={(e) => setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, example: e.target.value } : r) }))} placeholder="예문" className="flex-1 min-w-[120px] px-2 py-1.5 border rounded" />
                    <input type="text" value={row.examplePhonetic} onChange={(e) => setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, examplePhonetic: e.target.value } : r) }))} placeholder="예문 발음" className="w-32 px-2 py-1.5 border rounded" />
                    <button type="button" disabled={!row.example.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.example.trim(); if (!t) return; setTtsKey(`form-pron-ex-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, exampleAudioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `form-pron-ex-${idx}` ? "…" : "예문 발음"}</button>
                    <input type="url" value={row.audioUrl} onChange={(e) => setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                    <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`form-pron-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setForm((p) => ({ ...p, pronounce: (p.pronounce as ListRow[]).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `form-pron-${idx}` ? "…" : "발음"}</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setForm((p) => ({ ...p, pronounce: [...(p.pronounce as ListRow[]), defaultListRow()] }))} className="text-sm text-muted-foreground">+ Pronounce 추가</button>
            </div>
          </div>
          <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 flex flex-wrap gap-2 items-center bg-white border-t border-border px-4 py-3 shadow-sm">
            <button
              type="button"
              disabled={batchTtsInProgress || submitting}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => runBatchTts(false)}
            >
              {batchTtsInProgress ? "발음 일괄 생성 중…" : "발음 일괄 생성"}
            </button>
            <button
              type="button"
              disabled={batchImageInProgress || submitting}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => runBatchImage(false)}
            >
              {batchImageInProgress ? "이미지 검색 중…" : "이미지 자동 검색"}
            </button>
            <button
              type="submit"
              disabled={submitting || !form.studentName.trim()}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {submitting ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => setShowForm(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">로딩 중…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">리캡이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="p-4 border rounded bg-white">
              {editingId === r.id ? (
                <form onSubmit={(e) => handleUpdate(r.id, e)} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">수정</span>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground"
                      onClick={() => setEditingId(null)}
                    >
                      닫기
                    </button>
                  </div>
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Booking ID</span>
                    <input
                      type="text"
                      value={(editForm.bookingId as string | undefined) ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, bookingId: e.target.value }))}
                      className="mt-0.5 w-full px-3 py-2 border rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Student Name (관리자용·공개 시 비공개)</span>
                    <input
                      type="text"
                      value={(editForm.studentName as string | undefined) ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, studentName: e.target.value }))}
                      className="mt-0.5 w-full px-3 py-2 border rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Student ID (관리자용·공개 시 비공개)</span>
                    <input
                      type="text"
                      value={(editForm.studentId as string | undefined) ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, studentId: e.target.value }))}
                      placeholder="Student ID"
                      className="mt-0.5 w-full px-3 py-2 border rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-muted-foreground">Level (1–5)</span>
                    <select
                      value={(editForm.level as string | undefined) ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, level: e.target.value }))}
                      className="mt-0.5 w-full px-3 py-2 border rounded bg-white"
                    >
                      <option value="">—</option>
                      {LEVELS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  {/* Expression: text, phonetic, audio only */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Expression</span>
                    {((editForm.expression ?? []) as ListRow[]).map((row, idx) => (
                      <div key={idx} className="p-3 border rounded space-y-2 bg-muted/20">
                        <div className="flex flex-wrap items-center gap-2">
                          <input type="text" value={row.text} onChange={(e) => setEditForm((p) => ({ ...p, expression: ((p.expression as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="표현" className="flex-1 min-w-[150px] px-3 py-2 border rounded" />
                          <button type="button" onClick={() => setEditForm((p) => ({ ...p, expression: ((p.expression as ListRow[]) ?? []).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm">삭제</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <input type="text" value={row.phonetic} onChange={(e) => setEditForm((p) => ({ ...p, expression: ((p.expression as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음기호" className="w-32 px-2 py-1.5 border rounded" />
                          <input type="url" value={row.audioUrl} onChange={(e) => setEditForm((p) => ({ ...p, expression: ((p.expression as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="사운드 URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                          <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`edit-exp-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setEditForm((p) => ({ ...p, expression: ((p.expression as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `edit-exp-${idx}` ? "…" : "발음"}</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setEditForm((p) => ({ ...p, expression: [...((p.expression as ListRow[]) ?? []), defaultListRow()] }))} className="text-sm text-muted-foreground">+ 항목 추가</button>
                  </div>

                  {/* Grammar Point: text (title), content only */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Grammar Point</span>
                    {((editForm.grammarPoint ?? []) as ListRow[]).map((row, idx) => (
                      <div key={idx} className="p-3 border rounded space-y-2 bg-muted/20">
                        <div className="flex flex-wrap items-center gap-2">
                          <input type="text" value={row.text} onChange={(e) => setEditForm((p) => ({ ...p, grammarPoint: ((p.grammarPoint as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="제목" className="flex-1 min-w-[150px] px-3 py-2 border rounded" />
                          <button type="button" onClick={() => setEditForm((p) => ({ ...p, grammarPoint: ((p.grammarPoint as ListRow[]) ?? []).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm">삭제</button>
                        </div>
                        <textarea value={row.content} onChange={(e) => setEditForm((p) => ({ ...p, grammarPoint: ((p.grammarPoint as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, content: e.target.value } : r) }))} placeholder="내용" rows={2} className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setEditForm((p) => ({ ...p, grammarPoint: [...((p.grammarPoint as ListRow[]) ?? []), defaultListRow()] }))} className="text-sm text-muted-foreground">+ 항목 추가</button>
                  </div>

                  {/* Vocabulary: News-style layout */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Vocabulary</span>
                    {((editForm.vocabulary ?? []) as ListRow[]).map((row, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 bg-white space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Item {idx + 1}</span>
                          <button type="button" onClick={() => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm text-muted-foreground hover:bg-muted">삭제</button>
                        </div>
                        <input type="text" value={row.text} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="단어" className="w-full px-3 py-2 border rounded" />
                        <input type="text" value={row.meaning} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, meaning: e.target.value } : r) }))} placeholder="뜻 (English description)" className="w-full px-3 py-2 border rounded" />
                        <input type="text" value={row.example} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, example: e.target.value } : r) }))} placeholder="예문" className="w-full px-3 py-2 border rounded" />
                        <input type="text" value={row.exampleTranslation} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, exampleTranslation: e.target.value } : r) }))} placeholder="예문 해석" className="w-full px-3 py-2 border rounded" />
                        <input type="text" value={row.phonetic} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음기호 (e.g. IPA)" className="w-full px-3 py-2 border rounded" />
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input type="url" value={row.imageUrl} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, imageUrl: e.target.value } : r) }))} placeholder="이미지 URL" className="flex-1 px-3 py-2 border rounded" />
                          <button type="button" disabled={uploadingKey !== null} onClick={() => { setImageTarget({ field: "vocabulary", idx, forEdit: true }); setTimeout(() => fileInputRef.current?.click(), 0); }} className="px-3 py-2 rounded border disabled:opacity-50 text-sm shrink-0">{uploadingKey === `vocabulary-${idx}` ? "업로드 중…" : "이미지 업로드"}</button>
                          {row.imageUrl ? <a href={row.imageUrl} target="_blank" rel="noreferrer" className="inline-block shrink-0"><img src={row.imageUrl} alt="" className="h-10 w-10 object-cover rounded border" /></a> : null}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input type="url" value={row.audioUrl} onChange={(e) => setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="사운드 URL" className="flex-1 px-3 py-2 border rounded" />
                          <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-3 py-2 rounded border disabled:opacity-50 text-sm shrink-0" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`edit-voc-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setEditForm((p) => ({ ...p, vocabulary: ((p.vocabulary as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `edit-voc-${idx}` ? "생성 중…" : "발음 생성"}</button>
                          {row.audioUrl ? <audio controls src={row.audioUrl} className="h-8 max-w-[160px] shrink-0" /> : null}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setEditForm((p) => ({ ...p, vocabulary: [...((p.vocabulary as ListRow[]) ?? []), defaultListRow()] }))} className="text-sm text-muted-foreground">+ 항목 추가</button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/10">
                    <span className="text-sm font-medium text-muted-foreground">{LIST_FIELD_LABELS.mistake}</span>
                    <div className="space-y-2">
                      {((editForm.mistake as ListRow[]) ?? []).map((row, idx) => (
                        <div key={idx} className="p-2 border rounded space-y-2 bg-white">
                          <div className="flex flex-wrap items-center gap-2">
                            <input type="text" value={row.text} onChange={(e) => setEditForm((p) => ({ ...p, mistake: ((p.mistake as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="텍스트" className="flex-1 min-w-[120px] px-3 py-2 border rounded" />
                            <button type="button" onClick={() => setEditForm((p) => ({ ...p, mistake: ((p.mistake as ListRow[]) ?? []).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm">삭제</button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <input type="text" value={row.phonetic} onChange={(e) => setEditForm((p) => ({ ...p, mistake: ((p.mistake as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, phonetic: e.target.value } : r) }))} placeholder="발음" className="w-32 px-2 py-1.5 border rounded" />
                            <input type="url" value={row.audioUrl} onChange={(e) => setEditForm((p) => ({ ...p, mistake: ((p.mistake as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                            <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`edit-mistake-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setEditForm((p) => ({ ...p, mistake: ((p.mistake as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `edit-mistake-${idx}` ? "…" : "발음"}</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setEditForm((p) => ({ ...p, mistake: [...((p.mistake as ListRow[]) ?? []), defaultListRow()] }))} className="text-sm text-muted-foreground">+ Mistake 추가</button>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground block mt-3">Pronounce (Mistake 내)</span>
                    <div className="space-y-2">
                      {((editForm.pronounce as ListRow[]) ?? []).map((row, idx) => (
                        <div key={idx} className="p-2 border rounded space-y-2 bg-white">
                          <div className="flex flex-wrap items-center gap-2">
                            <input type="text" value={row.text} onChange={(e) => setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))} placeholder="표현" className="flex-1 min-w-[120px] px-3 py-2 border rounded" />
                            <button type="button" onClick={() => setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).filter((_, i) => i !== idx) }))} className="px-2 py-1 rounded border text-sm">삭제</button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <input type="text" value={row.example} onChange={(e) => setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, example: e.target.value } : r) }))} placeholder="예문" className="flex-1 min-w-[120px] px-2 py-1.5 border rounded" />
                            <input type="text" value={row.examplePhonetic} onChange={(e) => setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, examplePhonetic: e.target.value } : r) }))} placeholder="예문 발음" className="w-32 px-2 py-1.5 border rounded" />
                            <button type="button" disabled={!row.example.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.example.trim(); if (!t) return; setTtsKey(`edit-pron-ex-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, exampleAudioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `edit-pron-ex-${idx}` ? "…" : "예문 발음"}</button>
                            <input type="url" value={row.audioUrl} onChange={(e) => setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: e.target.value } : r) }))} placeholder="URL" className="flex-1 min-w-[100px] px-2 py-1.5 border rounded" />
                            <button type="button" disabled={!row.text.trim() || ttsKey !== null} className="px-2 py-1.5 rounded border disabled:opacity-50" onClick={async () => { const t = row.text.trim(); if (!t) return; setTtsKey(`edit-pron-${idx}`); try { const res = await fetch("/api/admin/tts/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }); const j = await res.json().catch(() => null); if (res.ok && j?.ok && j?.url) setEditForm((p) => ({ ...p, pronounce: ((p.pronounce as ListRow[]) ?? []).map((r, i) => i === idx ? { ...r, audioUrl: String(j.url) } : r) })); else alert(j?.error ?? "실패"); } finally { setTtsKey(null); } }}>{ttsKey === `edit-pron-${idx}` ? "…" : "발음"}</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setEditForm((p) => ({ ...p, pronounce: [...((p.pronounce as ListRow[]) ?? []), defaultListRow()] }))} className="text-sm text-muted-foreground">+ Pronounce 추가</button>
                    </div>
                  </div>
                  <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 flex flex-wrap gap-2 items-center bg-white border-t border-border px-4 py-3 shadow-sm">
                    <button
                      type="button"
                      disabled={batchTtsInProgress || submitting}
                      className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                      onClick={() => runBatchTts(true)}
                    >
                      {batchTtsInProgress ? "발음 일괄 생성 중…" : "발음 일괄 생성"}
                    </button>
                    <button
                      type="button"
                      disabled={batchImageInProgress || submitting}
                      className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                      onClick={() => runBatchImage(true)}
                    >
                      {batchImageInProgress ? "이미지 검색 중…" : "이미지 자동 검색"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-3 py-1.5 rounded bg-black text-white text-sm disabled:opacity-50"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded border text-sm"
                      onClick={() => handleDelete(r.id)}
                    >
                      삭제
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-medium">
                      {r.studentName}
                      {r.studentId ? ` (${r.studentId})` : ""}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          r.bookingId ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.bookingId ? "연결됨" : "연결 안 됨"}
                      </span>
                      {r.level != null ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                          Lv.{r.level}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          const url = `${typeof window !== "undefined" ? window.location.origin : ""}/recap/${r.id}`;
                          navigator.clipboard.writeText(url).then(
                            () => alert("공개 링크가 복사되었습니다."),
                            () => {},
                          );
                        }}
                      >
                        링크 복사
                      </button>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(r)}
                      >
                        수정
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {/* Expression: text, phonetic, audio (NO image) */}
                    {r.expression?.length ? (
                      <div>
                        <span className="text-muted-foreground">{LIST_FIELD_LABELS.expression}: </span>
                        <ul className="list-disc list-inside mt-0.5 space-y-1">
                          {(r.expression as RecapListItem[]).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 flex-wrap">
                              <span>{item.text}</span>
                              {item.phonetic ? <span className="text-muted-foreground">[{item.phonetic}]</span> : null}
                              {item.audioUrl ? <SoundPlayButton src={item.audioUrl} size="sm" aria-label="재생" /> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Grammar Point: text (title), content (NO image, NO audio) */}
                    {r.grammarPoint?.length ? (
                      <div>
                        <span className="text-muted-foreground">{LIST_FIELD_LABELS.grammarPoint}: </span>
                        <ul className="list-disc list-inside mt-0.5 space-y-1">
                          {(r.grammarPoint as RecapListItem[]).map((item, i) => (
                            <li key={i}>
                              <span className="font-medium">{item.text}</span>
                              {item.content ? <span className="text-muted-foreground"> — {item.content}</span> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Vocabulary: image, text, phonetic, audio, meaning, example, exampleTranslation */}
                    {r.vocabulary?.length ? (
                      <div>
                        <span className="text-muted-foreground">{LIST_FIELD_LABELS.vocabulary}: </span>
                        <ul className="list-disc list-inside mt-0.5 space-y-1">
                          {(r.vocabulary as RecapListItem[]).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 flex-wrap">
                              {item.imageUrl ? (
                                <a href={item.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                                  <img src={item.imageUrl} alt="" className="h-6 w-6 object-cover rounded border" />
                                </a>
                              ) : null}
                              <div>
                                <span>{item.text}</span>
                                {item.phonetic ? <span className="text-muted-foreground ml-1">[{item.phonetic}]</span> : null}
                                {item.audioUrl ? <SoundPlayButton src={item.audioUrl} size="sm" aria-label="재생" /> : null}
                                {item.meaning ? <span className="text-muted-foreground"> — {item.meaning}</span> : null}
                                {item.example ? (
                                  <span className="block text-muted-foreground text-xs mt-0.5">
                                    예: {item.example}
                                    {item.exampleTranslation ? ` → ${item.exampleTranslation}` : ""}
                                  </span>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {(r.mistake?.length || r.pronounce?.length) ? (
                      <div>
                        <span className="text-muted-foreground">{LIST_FIELD_LABELS.mistake}</span>
                        {r.mistake?.length ? (
                          <ul className="list-disc list-inside mt-0.5 space-y-1">
                            {(r.mistake as RecapListItem[]).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 flex-wrap">
                                <span>{item.text}</span>
                                {item.phonetic ? (
                                  <span className="text-muted-foreground">[{item.phonetic}]</span>
                                ) : null}
                                {item.audioUrl ? (
                                  <SoundPlayButton src={item.audioUrl} size="sm" aria-label="재생" />
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {r.pronounce?.length ? (
                          <>
                            <span className="text-muted-foreground block mt-1"> / {LIST_FIELD_LABELS.pronounce}: </span>
                            <ul className="list-disc list-inside mt-0.5 space-y-1">
                              {(r.pronounce as RecapListItem[]).map((item, i) => (
                                <li key={i} className="flex items-center gap-2 flex-wrap">
                                  <span>{item.text}</span>
                                  {item.phonetic ? (
                                    <span className="text-muted-foreground">[{item.phonetic}]</span>
                                  ) : null}
                                  {item.audioUrl ? (
                                    <SoundPlayButton src={item.audioUrl} size="sm" aria-label="재생" />
                                  ) : null}
                                  {item.example ? (
                                    <span className="text-muted-foreground">
                                      — 예: {item.example}
                                      {item.examplePhonetic ? ` [${item.examplePhonetic}]` : ""}
                                    </span>
                                  ) : null}
                                  {item.exampleAudioUrl ? (
                                    <SoundPlayButton src={item.exampleAudioUrl} size="sm" aria-label="예문 재생" />
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
