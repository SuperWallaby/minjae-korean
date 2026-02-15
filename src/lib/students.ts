import fs from "fs";
import path from "path";

import type { Booking } from "./db";

export type StudentNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type PaymentRecord = {
  id: string;
  type: "pass_pack" | "subscription" | "other";
  amount: number; // KRW
  createdAt: string;
  memo?: string;
};

export type CreditGrant = {
  id: string;
  source: "stripe" | "admin";
  // Stripe product category (used for eligibility rules like 1-time trial).
  product?: "trial" | "single" | "monthly" | "custom";
  kind: "single_pass" | "pass_pack_8";
  total: number;
  remaining: number;
  purchasedAt: string; // ISO
  expiresAt: string; // ISO
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  // Stable identity from auth provider (e.g. "google:123", "apple:ABC").
  // This is the preferred key for ownership/entitlements; email is contact info only.
  authUserId?: string;
  phone?: string;
  // Member's preference for lesson/session style or goals (free-form text).
  sessionWish?: string;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string;
  adminNote?: string;
  notes: StudentNote[];
  payments: PaymentRecord[];
  credits: CreditGrant[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STUDENTS_PATH = path.join(DATA_DIR, "students.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STUDENTS_PATH)) fs.writeFileSync(STUDENTS_PATH, "[]", "utf-8");
}

function readJson<T>(p: string): T {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return [] as unknown as T;
  }
}

function writeJson<T>(p: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

function normalizeAuthUserId(v: string) {
  return (v ?? "").trim();
}

function addDays(iso: string, days: number) {
  const ms = Date.parse(iso);
  return new Date(ms + days * 24 * 60 * 60 * 1000).toISOString();
}

export function listStudents(): Student[] {
  const raw = readJson<unknown>(STUDENTS_PATH);
  if (!Array.isArray(raw)) return [];
  return raw.map((s): Student => {
    const obj = s && typeof s === "object" ? (s as Record<string, unknown>) : ({} as Record<string, unknown>);
    return {
      id: String(obj.id ?? ""),
      name: String(obj.name ?? "Student"),
      email: normalizeEmail(String(obj.email ?? "")),
      authUserId:
        typeof obj.authUserId === "string" && obj.authUserId.trim()
          ? obj.authUserId.trim()
          : undefined,
      phone: typeof obj.phone === "string" && obj.phone.trim() ? obj.phone.trim() : undefined,
      sessionWish:
        typeof obj.sessionWish === "string" && obj.sessionWish.trim()
          ? obj.sessionWish.trim()
          : undefined,
      createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
      updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString(),
      stripeCustomerId: typeof obj.stripeCustomerId === "string" ? obj.stripeCustomerId : undefined,
      adminNote: typeof obj.adminNote === "string" ? obj.adminNote : "",
      notes: Array.isArray(obj.notes) ? (obj.notes as StudentNote[]) : [],
      payments: Array.isArray(obj.payments) ? (obj.payments as PaymentRecord[]) : [],
      credits: Array.isArray(obj.credits) ? (obj.credits as CreditGrant[]) : [],
    };
  });
}

export function saveStudents(students: Student[]) {
  writeJson(STUDENTS_PATH, students);
}

export function getStudentById(id: string): Student | null {
  return listStudents().find((s) => s.id === id) ?? null;
}

export function findStudentByAuthUserId(authUserId: string): Student | null {
  const a = normalizeAuthUserId(authUserId);
  if (!a) return null;
  return listStudents().find((s) => normalizeAuthUserId(s.authUserId ?? "") === a) ?? null;
}

export function findStudentByEmail(email: string): Student | null {
  const e = normalizeEmail(email);
  if (!e) return null;
  return listStudents().find((s) => normalizeEmail(s.email) === e) ?? null;
}

export function createStudent(args: { name: string; email: string; phone?: string }): Student {
  const now = new Date().toISOString();
  const s: Student = {
    id: uid("stu"),
    name: args.name.trim(),
    email: normalizeEmail(args.email),
    authUserId: undefined,
    phone: (args.phone ?? "").trim() || undefined,
    sessionWish: undefined,
    createdAt: now,
    updatedAt: now,
    notes: [],
    payments: [],
    credits: [],
    adminNote: "",
  };
  const list = listStudents();
  list.unshift(s);
  saveStudents(list);
  return s;
}

export function patchStudent(
  id: string,
  patch: Partial<
    Pick<Student, "name" | "email" | "phone" | "adminNote" | "authUserId" | "sessionWish">
  >,
): Student | null {
  const list = listStudents();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const cur = list[idx];
  const next: Student = {
    ...cur,
    ...(patch.name !== undefined ? { name: String(patch.name) } : null),
    ...(patch.email !== undefined ? { email: normalizeEmail(String(patch.email)) } : null),
    ...(patch.authUserId !== undefined
      ? { authUserId: normalizeAuthUserId(String(patch.authUserId)) || undefined }
      : null),
    ...(patch.phone !== undefined ? { phone: String(patch.phone).trim() || undefined } : null),
    ...(patch.sessionWish !== undefined
      ? { sessionWish: String(patch.sessionWish).trim() || undefined }
      : null),
    ...(patch.adminNote !== undefined ? { adminNote: String(patch.adminNote) } : null),
    updatedAt: new Date().toISOString(),
  };
  list[idx] = next;
  saveStudents(list);
  return next;
}

export function upsertStudentByAuthUserId(args: {
  authUserId: string;
  name: string;
  email: string;
  phone?: string;
}): Student | null {
  const authUserId = normalizeAuthUserId(args.authUserId);
  const email = normalizeEmail(args.email);
  if (!authUserId) return null;
  if (!email) return null;

  const list = listStudents();

  // 1) Prefer direct authUserId match.
  const byAuthIdx = list.findIndex((s) => normalizeAuthUserId(s.authUserId ?? "") === authUserId);
  if (byAuthIdx !== -1) {
    const cur = list[byAuthIdx];
    const next: Student = {
      ...cur,
      authUserId,
      email: cur.email?.trim() ? cur.email : email,
      name: cur.name?.trim() ? cur.name : args.name.trim() || cur.name,
      phone: args.phone !== undefined ? (args.phone ?? "").trim() || undefined : cur.phone,
      updatedAt: new Date().toISOString(),
    };
    list[byAuthIdx] = next;
    saveStudents(list);
    return next;
  }

  // 2) If email already exists, link authUserId to that record (migration path).
  const byEmailIdx = list.findIndex((s) => normalizeEmail(s.email) === email);
  if (byEmailIdx !== -1) {
    const cur = list[byEmailIdx];
    const next: Student = {
      ...cur,
      authUserId,
      name: cur.name?.trim() ? cur.name : args.name.trim() || cur.name,
      phone: args.phone !== undefined ? (args.phone ?? "").trim() || undefined : cur.phone,
      updatedAt: new Date().toISOString(),
    };
    list[byEmailIdx] = next;
    saveStudents(list);
    return next;
  }

  // 3) Else create a new student.
  const now = new Date().toISOString();
  const s: Student = {
    id: uid("stu"),
    name: args.name.trim() || "Student",
    email,
    authUserId,
    phone: (args.phone ?? "").trim() || undefined,
    createdAt: now,
    updatedAt: now,
    notes: [],
    payments: [],
    credits: [],
    adminNote: "",
  };
  list.unshift(s);
  saveStudents(list);
  return s;
}

export function upsertStudentByEmail(args: { name: string; email: string }): Student | null {
  const email = normalizeEmail(args.email);
  if (!email) return null;
  const list = listStudents();
  const idx = list.findIndex((s) => normalizeEmail(s.email) === email);
  if (idx === -1) {
    const now = new Date().toISOString();
    const s: Student = {
      id: uid("stu"),
      name: args.name.trim() || "학생",
      email,
      createdAt: now,
      updatedAt: now,
      notes: [],
      payments: [],
      credits: [],
      adminNote: "",
    };
    list.unshift(s);
    saveStudents(list);
    return s;
  }
  const cur = list[idx];
  const next: Student = {
    ...cur,
    name: cur.name?.trim() ? cur.name : args.name.trim(),
    updatedAt: new Date().toISOString(),
  };
  list[idx] = next;
  saveStudents(list);
  return next;
}

export function addStripeCreditsByEmail(args: {
  email: string;
  name?: string;
  stripeCustomerId?: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  product?: CreditGrant["product"];
  kind: CreditGrant["kind"];
  total: number;
  purchasedAt: string;
  expiresAt: string;
}): { ok: true; student: Student; credit: CreditGrant } | { ok: false; error: string } {
  const email = normalizeEmail(args.email);
  if (!email) return { ok: false, error: "Invalid email" };

  const list = listStudents();
  const idx = list.findIndex((s) => normalizeEmail(s.email) === email);
  const now = new Date().toISOString();
  const base: Student =
    idx === -1
      ? {
          id: uid("stu"),
          name: (args.name ?? "").trim() || "Student",
          email,
          createdAt: now,
          updatedAt: now,
          notes: [],
          payments: [],
          credits: [],
          adminNote: "",
        }
      : list[idx];

  if ((base.credits ?? []).some((c) => c.stripeSessionId === args.stripeSessionId)) {
    const existing = (base.credits ?? []).find((c) => c.stripeSessionId === args.stripeSessionId)!;
    return { ok: true, student: base, credit: existing };
  }

  const credit: CreditGrant = {
    id: uid("cr"),
    source: "stripe",
    product: args.product,
    kind: args.kind,
    total: args.total,
    remaining: args.total,
    purchasedAt: args.purchasedAt,
    expiresAt: args.expiresAt,
    stripeSessionId: args.stripeSessionId,
    stripePaymentIntentId: args.stripePaymentIntentId,
    stripeCustomerId: args.stripeCustomerId,
  };

  const next: Student = {
    ...base,
    name: base.name?.trim() ? base.name : (args.name ?? "").trim() || base.name,
    stripeCustomerId: args.stripeCustomerId ?? base.stripeCustomerId,
    credits: [credit, ...(base.credits ?? [])],
    updatedAt: now,
  };

  if (idx === -1) list.unshift(next);
  else list[idx] = next;
  saveStudents(list);
  return { ok: true, student: next, credit };
}

export function hasUsedFirstTrial(student: Student): boolean {
  return (student.credits ?? []).some((c) => c.product === "trial");
}

export function summarizeActiveCredits(student: Student, nowISO = new Date().toISOString()) {
  const now = Date.parse(nowISO);
  const active = (student.credits ?? [])
    .filter((c) => c.remaining > 0 && Date.parse(c.expiresAt) > now)
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
  const remaining = active.reduce((acc, c) => acc + (c.remaining ?? 0), 0);
  const nextExpiry = active[0]?.expiresAt ?? null;
  return { remaining, nextExpiry, active };
}

export function consumeOneCreditByEmail(email: string, nowISO = new Date().toISOString()) {
  const e = normalizeEmail(email);
  if (!e) return { ok: false as const, error: "Invalid email" };

  const list = listStudents();
  const idx = list.findIndex((s) => normalizeEmail(s.email) === e);
  if (idx === -1) return { ok: false as const, error: "No student" };
  const cur = list[idx];

  const now = Date.parse(nowISO);
  const credits = (cur.credits ?? []).slice().sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
  const pickIdx = credits.findIndex((c) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now);
  if (pickIdx === -1) return { ok: false as const, error: "No active credits" };

  const picked = credits[pickIdx];
  credits[pickIdx] = { ...picked, remaining: Math.max(0, (picked.remaining ?? 0) - 1) };

  const next: Student = { ...cur, credits, updatedAt: new Date().toISOString() };
  list[idx] = next;
  saveStudents(list);
  return { ok: true as const, student: next };
}

export function consumeOneCreditByStudentId(studentId: string, nowISO = new Date().toISOString()) {
  const id = String(studentId ?? "").trim();
  if (!id) return { ok: false as const, error: "Invalid studentId" };

  const list = listStudents();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { ok: false as const, error: "No student" };
  const cur = list[idx];

  const now = Date.parse(nowISO);
  const credits = (cur.credits ?? [])
    .slice()
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
  const pickIdx = credits.findIndex(
    (c) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now,
  );
  if (pickIdx === -1) return { ok: false as const, error: "No active credits" };

  const picked = credits[pickIdx];
  credits[pickIdx] = {
    ...picked,
    remaining: Math.max(0, (picked.remaining ?? 0) - 1),
  };

  const next: Student = { ...cur, credits, updatedAt: new Date().toISOString() };
  list[idx] = next;
  saveStudents(list);
  return { ok: true as const, student: next };
}

export function restoreOneCreditByEmail(email: string, nowISO = new Date().toISOString()) {
  const e = normalizeEmail(email);
  if (!e) return { ok: false as const, error: "Invalid email" };

  const list = listStudents();
  const idx = list.findIndex((s) => normalizeEmail(s.email) === e);
  if (idx === -1) return { ok: false as const, error: "No student" };
  const cur = list[idx];

  const now = Date.parse(nowISO);
  const credits = (cur.credits ?? []).slice().sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));

  // Prefer restoring into the earliest-expiring active grant that has room.
  const pickIdx = credits.findIndex(
    (c) =>
      Date.parse(c.expiresAt) > now &&
      (c.remaining ?? 0) < Math.max(0, c.total ?? 0),
  );

  if (pickIdx !== -1) {
    const picked = credits[pickIdx];
    credits[pickIdx] = {
      ...picked,
      remaining: Math.min(Math.max(0, picked.total ?? 0), (picked.remaining ?? 0) + 1),
    };
  } else {
    const purchasedAt = nowISO;
    const expiresAt = addDays(purchasedAt, 30);
    const credit: CreditGrant = {
      id: uid("cr"),
      source: "admin",
      kind: "single_pass",
      total: 1,
      remaining: 1,
      purchasedAt,
      expiresAt,
    };
    credits.unshift(credit);
  }

  const next: Student = { ...cur, credits, updatedAt: new Date().toISOString() };
  list[idx] = next;
  saveStudents(list);
  return { ok: true as const, student: next };
}

export function restoreOneCreditByStudentId(studentId: string, nowISO = new Date().toISOString()) {
  const id = String(studentId ?? "").trim();
  if (!id) return { ok: false as const, error: "Invalid studentId" };

  const list = listStudents();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { ok: false as const, error: "No student" };
  const cur = list[idx];

  const now = Date.parse(nowISO);
  const credits = (cur.credits ?? [])
    .slice()
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));

  // Prefer restoring into the earliest-expiring active grant that has room.
  const pickIdx = credits.findIndex(
    (c) =>
      Date.parse(c.expiresAt) > now &&
      (c.remaining ?? 0) < Math.max(0, c.total ?? 0),
  );

  if (pickIdx !== -1) {
    const picked = credits[pickIdx];
    credits[pickIdx] = {
      ...picked,
      remaining: Math.min(
        Math.max(0, picked.total ?? 0),
        (picked.remaining ?? 0) + 1,
      ),
    };
  } else {
    const purchasedAt = nowISO;
    const expiresAt = addDays(purchasedAt, 30);
    const credit: CreditGrant = {
      id: uid("cr"),
      source: "admin",
      kind: "single_pass",
      total: 1,
      remaining: 1,
      purchasedAt,
      expiresAt,
    };
    credits.unshift(credit);
  }

  const next: Student = { ...cur, credits, updatedAt: new Date().toISOString() };
  list[idx] = next;
  saveStudents(list);
  return { ok: true as const, student: next };
}

export function addStudentNote(studentId: string, body: string): StudentNote | null {
  const list = listStudents();
  const idx = list.findIndex((s) => s.id === studentId);
  if (idx === -1) return null;
  const note: StudentNote = { id: uid("note"), body: body.trim(), createdAt: new Date().toISOString() };
  list[idx] = { ...list[idx], notes: [note, ...(list[idx].notes ?? [])], updatedAt: new Date().toISOString() };
  saveStudents(list);
  return note;
}

export function deleteStudentNote(studentId: string, noteId: string): boolean {
  const list = listStudents();
  const idx = list.findIndex((s) => s.id === studentId);
  if (idx === -1) return false;
  const before = list[idx].notes ?? [];
  const after = before.filter((n) => n.id !== noteId);
  list[idx] = { ...list[idx], notes: after, updatedAt: new Date().toISOString() };
  saveStudents(list);
  return before.length !== after.length;
}

export function addPayment(studentId: string, payment: Omit<PaymentRecord, "id" | "createdAt"> & { createdAt?: string }): PaymentRecord | null {
  const list = listStudents();
  const idx = list.findIndex((s) => s.id === studentId);
  if (idx === -1) return null;
  const rec: PaymentRecord = {
    id: uid("pay"),
    type: payment.type,
    amount: payment.amount,
    memo: payment.memo ?? "",
    createdAt: payment.createdAt ?? new Date().toISOString(),
  };
  list[idx] = { ...list[idx], payments: [rec, ...(list[idx].payments ?? [])], updatedAt: new Date().toISOString() };
  saveStudents(list);
  return rec;
}

export function deletePayment(studentId: string, paymentId: string): boolean {
  const list = listStudents();
  const idx = list.findIndex((s) => s.id === studentId);
  if (idx === -1) return false;
  const before = list[idx].payments ?? [];
  const after = before.filter((p) => p.id !== paymentId);
  list[idx] = { ...list[idx], payments: after, updatedAt: new Date().toISOString() };
  saveStudents(list);
  return before.length !== after.length;
}

export function importStudentsFromBookings(bookings: Booking[]): { created: number; updated: number } {
  let created = 0;
  let updated = 0;
  for (const b of bookings) {
    const email = normalizeEmail(b.email ?? "");
    if (!email) continue;
    const before = findStudentByEmail(email);
    const s = upsertStudentByEmail({ name: b.name ?? "학생", email });
    if (!s) continue;
    if (!before) created++;
    else updated++;
  }
  return { created, updated };
}

export function adjustStudentCreditsById(args: {
  studentId: string;
  delta: number; // + add credits, - deduct credits
  memo?: string;
  expiresInDays?: number; // only used when delta > 0
  nowISO?: string;
}): { ok: true; student: Student; credit?: CreditGrant } | { ok: false; error: string } {
  const studentId = String(args.studentId ?? "").trim();
  const delta = args.delta;
  const nowISO = args.nowISO ?? new Date().toISOString();

  if (!studentId) return { ok: false, error: "Invalid studentId" };
  if (!Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) return { ok: false, error: "Invalid delta" };
  if (Math.abs(delta) > 1000) return { ok: false, error: "Delta too large" };

  const list = listStudents();
  const idx = list.findIndex((s) => s.id === studentId);
  if (idx === -1) return { ok: false, error: "Not found" };

  const cur = list[idx];
  const credits = (cur.credits ?? []).slice();

  const note: StudentNote = {
    id: uid("note"),
    createdAt: nowISO,
    body: "",
  };

  if (delta > 0) {
    const purchasedAt = nowISO;
    const expiresInDays = Number.isFinite(args.expiresInDays) ? Number(args.expiresInDays) : 30;
    if (!Number.isFinite(expiresInDays) || expiresInDays <= 0 || expiresInDays > 3650) {
      return { ok: false, error: "Invalid expiresInDays" };
    }
    const expiresAt = addDays(purchasedAt, Math.floor(expiresInDays));

    const credit: CreditGrant = {
      id: uid("cr"),
      source: "admin",
      kind: "single_pass",
      total: delta,
      remaining: delta,
      purchasedAt,
      expiresAt,
    };
    credits.unshift(credit);

    note.body =
      `크레딧 조정: +${delta} (만료: ${expiresAt.slice(0, 10)})` + (args.memo?.trim() ? `\n메모: ${args.memo.trim()}` : "");

    const next: Student = {
      ...cur,
      credits,
      notes: [note, ...(cur.notes ?? [])],
      updatedAt: nowISO,
    };
    list[idx] = next;
    saveStudents(list);
    return { ok: true, student: next, credit };
  }

  // delta < 0: deduct from active credits (earliest expiry first)
  const needTotal = Math.abs(delta);
  const now = Date.parse(nowISO);
  const activeIdxs = credits
    .map((c, i) => ({ i, c }))
    .filter(({ c }) => (c.remaining ?? 0) > 0 && Date.parse(c.expiresAt) > now)
    .sort((a, b) => Date.parse(a.c.expiresAt) - Date.parse(b.c.expiresAt));

  const available = activeIdxs.reduce((acc, x) => acc + (x.c.remaining ?? 0), 0);
  if (available < needTotal) return { ok: false, error: "Not enough active credits" };

  let need = needTotal;
  for (const { i } of activeIdxs) {
    if (need <= 0) break;
    const c = credits[i];
    const curRem = c.remaining ?? 0;
    if (curRem <= 0) continue;
    const take = Math.min(need, curRem);
    credits[i] = { ...c, remaining: curRem - take };
    need -= take;
  }

  note.body = `크레딧 조정: ${delta}` + (args.memo?.trim() ? `\n메모: ${args.memo.trim()}` : "");

  const next: Student = {
    ...cur,
    credits,
    notes: [note, ...(cur.notes ?? [])],
    updatedAt: nowISO,
  };
  list[idx] = next;
  saveStudents(list);
  return { ok: true, student: next };
}

