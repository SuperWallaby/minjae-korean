import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

/** 리스트 항목: 공통 + vocabulary(뜻/예문/예문해석), grammarPoint(내용), pronounce(예문/예문발음) */
export type RecapListItem = {
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
};

type RecapListItemInput = Record<string, unknown>;

/** 리스트 필드의 DB/API 입력 (문자열이면 단일 항목, 배열이면 리스트) */
export type RecapListInput =
  | string
  | RecapListItem[]
  | (string | RecapListItemInput)[];

function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  const t = typeof v === "string" ? v.trim() : String(v).trim();
  return t || undefined;
}

function normalizeList(raw: unknown): RecapListItem[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    const t = raw.trim();
    return t ? [{ text: t }] : [];
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): RecapListItem | null => {
      if (typeof item === "string") {
        const t = item.trim();
        return t ? { text: t } : null;
      }
      if (item && typeof item === "object" && "text" in item) {
        const o = item as RecapListItemInput;
        const t = str(o.text);
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

/** 리캡 난이도 (1–5, 뉴스와 동일) */
export type RecapLevel = 1 | 2 | 3 | 4 | 5;

/** 리캡 노트 — 수업 후 관리자가 작성. booking에 연결되거나 연결 안 된 상태. 이름/studentId는 관리자용, 공개 API에서는 비공개. */
export type Recap = {
  id: string;
  /** 연결된 예약 ID. 없으면 "연결안된 리캡" */
  bookingId?: string;
  /** 관리자용. 공개 조회 시 비공개 */
  studentName: string;
  /** 관리자용. 공개 조회 시 비공개 */
  studentId?: string;
  /** 난이도 1–5 */
  level?: RecapLevel;
  /** 리스트형. 항목별 text + 선택적 audioUrl */
  expression: RecapListItem[];
  grammarPoint: RecapListItem[];
  vocabulary: RecapListItem[];
  mistake: RecapListItem[];
  pronounce: RecapListItem[];
  createdAt: string;
  updatedAt: string;
};

/** DB 문서: 리스트 필드는 배열로 저장. 레거시 문자열은 toRecap에서 정규화 */
type RecapDoc = Omit<Recap, "id"> & { _id: string };

type Collections = {
  recaps: Collection<RecapDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const recaps = db.collection<RecapDoc>("recaps");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await recaps.createIndex({ createdAt: -1 });
        await recaps.createIndex({ bookingId: 1 }, { sparse: true });
        await recaps.createIndex({ studentId: 1 }, { sparse: true });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { recaps };
}

function nowIso() {
  return new Date().toISOString();
}

function toRecap(doc: RecapDoc): Recap {
  const r = doc as unknown as Record<string, unknown>;
  const { _id, expression, grammarPoint, vocabulary, mistake, pronounce, ...rest } = r;
  return {
    id: String(_id),
    ...rest,
    expression: normalizeList(expression),
    grammarPoint: normalizeList(grammarPoint),
    vocabulary: normalizeList(vocabulary),
    mistake: normalizeList(mistake),
    pronounce: normalizeList(pronounce),
  } as Recap;
}

function toDoc(r: Recap): RecapDoc {
  const { id, ...rest } = r;
  return { _id: id, ...rest };
}

export async function getRecapById(id: string): Promise<Recap | null> {
  const { recaps } = await cols();
  const doc = await recaps.findOne({ _id: id });
  return doc ? toRecap(doc) : null;
}

export async function listRecaps(opts?: {
  bookingId?: string | null;
  /** true: bookingId 있는 것만, false: 없는 것만, undefined: 전체 */
  linked?: boolean;
  limit?: number;
}): Promise<Recap[]> {
  const { recaps } = await cols();
  const limit = Math.min(2000, Math.max(1, opts?.limit ?? 200));

  let filter: Record<string, unknown> = {};
  if (opts?.bookingId !== undefined && opts.bookingId !== null && opts.bookingId !== "") {
    filter.bookingId = opts.bookingId;
  } else if (opts?.linked === true) {
    filter.bookingId = { $exists: true, $nin: [null, ""] };
  } else if (opts?.linked === false) {
    filter.$or = [{ bookingId: { $exists: false } }, { bookingId: null }, { bookingId: "" }];
  }

  const list = await recaps.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return list.map(toRecap);
}

function parseLevel(v: unknown): RecapLevel | undefined {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  if (n >= 1 && n <= 5) return n as RecapLevel;
  return undefined;
}

export async function createRecap(args: {
  bookingId?: string;
  studentName: string;
  studentId?: string;
  level?: RecapLevel | number | null;
  expression?: RecapListInput;
  grammarPoint?: RecapListInput;
  vocabulary?: RecapListInput;
  mistake?: RecapListInput;
  pronounce?: RecapListInput;
}): Promise<Recap> {
  const { recaps } = await cols();
  const now = nowIso();
  const id = `recap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const doc: RecapDoc = {
    _id: id,
    bookingId: (args.bookingId ?? "").trim() || undefined,
    studentName: String(args.studentName ?? "").trim() || "—",
    studentId: (args.studentId ?? "").trim() || undefined,
    level: parseLevel(args.level),
    expression: normalizeList(args.expression),
    grammarPoint: normalizeList(args.grammarPoint),
    vocabulary: normalizeList(args.vocabulary),
    mistake: normalizeList(args.mistake),
    pronounce: normalizeList(args.pronounce),
    createdAt: now,
    updatedAt: now,
  };
  await recaps.insertOne(doc);
  return toRecap(doc);
}

export async function patchRecap(
  id: string,
  patch: Partial<
    Pick<
      Recap,
      | "bookingId"
      | "studentName"
      | "studentId"
      | "level"
      | "expression"
      | "grammarPoint"
      | "vocabulary"
      | "mistake"
      | "pronounce"
    >
  >,
): Promise<Recap | null> {
  const { recaps } = await cols();
  const cur = await recaps.findOne({ _id: id });
  if (!cur) return null;

  const next: Partial<RecapDoc> = { updatedAt: nowIso() };
  if (patch.bookingId !== undefined) next.bookingId = (patch.bookingId ?? "").trim() || undefined;
  if (patch.studentName !== undefined) next.studentName = String(patch.studentName).trim() || "—";
  if (patch.studentId !== undefined) next.studentId = (patch.studentId ?? "").trim() || undefined;
  if (patch.level !== undefined) next.level = parseLevel(patch.level);
  if (patch.expression !== undefined) next.expression = normalizeList(patch.expression);
  if (patch.grammarPoint !== undefined) next.grammarPoint = normalizeList(patch.grammarPoint);
  if (patch.vocabulary !== undefined) next.vocabulary = normalizeList(patch.vocabulary);
  if (patch.mistake !== undefined) next.mistake = normalizeList(patch.mistake);
  if (patch.pronounce !== undefined) next.pronounce = normalizeList(patch.pronounce);

  await recaps.updateOne({ _id: id }, { $set: next });
  const updated = await recaps.findOne({ _id: id });
  return updated ? toRecap(updated) : null;
}

export async function deleteRecap(id: string): Promise<boolean> {
  const { recaps } = await cols();
  const res = await recaps.deleteOne({ _id: id });
  return res.deletedCount === 1;
}
