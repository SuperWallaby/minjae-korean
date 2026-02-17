import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

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
  product?: "trial" | "single" | "monthly" | "custom";
  kind: "single_pass" | "pass_pack_8";
  total: number;
  remaining: number;
  purchasedAt: string;
  expiresAt: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
};

export type CouponRedemption = {
  code: string; // normalized (trimmed/uppercased)
  redeemedAt: string; // ISO
};

export type Student = {
  id: string;
  name: string;
  email: string;
  authUserId?: string;
  // Keep legacy combined phone for compatibility, but store canonical parts too.
  phone?: string;
  phoneCountry?: string; // e.g. "+82"
  phoneNumber?: string; // digits only
  sessionWish?: string;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string;
  adminNote?: string;
  notes: StudentNote[];
  payments: PaymentRecord[];
  credits: CreditGrant[];
  couponRedemptions?: CouponRedemption[];
};

type StudentDoc = Omit<Student, "id"> & { _id: string };

type Collections = {
  students: Collection<StudentDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const students = db.collection<StudentDoc>("students");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await students.createIndex({ authUserId: 1 }, { unique: true, sparse: true });
        await students.createIndex({ email: 1 }, { unique: true, sparse: true });
        await students.createIndex({ updatedAt: -1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { students };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

function normalizeAuthUserId(v: string) {
  return (v ?? "").trim();
}

function digitsOnly(s: string) {
  return (s ?? "").replace(/\D/g, "");
}

function parsePhone(full: string | undefined): { country?: string; number?: string; full?: string } {
  const raw = (full ?? "").trim();
  if (!raw) return {};
  const m = raw.match(/^\+(\d{1,3})(.*)$/);
  if (m) {
    const country = `+${m[1]}`;
    const number = digitsOnly(m[2] ?? "");
    return number ? { country, number, full: `${country}${number}` } : { country };
  }
  const number = digitsOnly(raw);
  const country = "+82";
  return number ? { country, number, full: `${country}${number}` } : {};
}

function toStudent(doc: StudentDoc): Student {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export function hasUsedFirstTrial(s: Student): boolean {
  const credits = Array.isArray(s.credits) ? s.credits : [];
  return credits.some((c) => (c.product ?? "") === "trial" && Number(c.total ?? 0) > 0);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { students } = await cols();
  const doc = await students.findOne({ _id: id });
  return doc ? toStudent(doc) : null;
}

export async function findStudentByAuthUserId(authUserId: string): Promise<Student | null> {
  const { students } = await cols();
  const a = normalizeAuthUserId(authUserId);
  if (!a) return null;
  const doc = await students.findOne({ authUserId: a });
  return doc ? toStudent(doc) : null;
}

export async function findStudentByEmail(email: string): Promise<Student | null> {
  const { students } = await cols();
  const e = normalizeEmail(email);
  if (!e) return null;
  const doc = await students.findOne({ email: e });
  return doc ? toStudent(doc) : null;
}

export async function upsertStudentByAuthUserId(args: {
  authUserId: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<Student | null> {
  const { students } = await cols();
  const authUserId = normalizeAuthUserId(args.authUserId);
  const email = normalizeEmail(args.email);
  if (!authUserId) return null;
  if (!email) return null;
  const now = nowIso();

  // Prefer authUserId match; otherwise, if email exists, link it.
  const byAuth = await students.findOne({ authUserId });
  if (byAuth) {
    const phoneParsed = args.phone !== undefined ? parsePhone(args.phone) : {};
    const patch: Partial<StudentDoc> = {
      authUserId,
      email: byAuth.email?.trim() ? byAuth.email : email,
      name: byAuth.name?.trim() ? byAuth.name : args.name.trim() || byAuth.name,
      phone:
        args.phone !== undefined
          ? (phoneParsed.full ?? ((args.phone ?? "").trim() || undefined))
          : byAuth.phone,
      phoneCountry: args.phone !== undefined ? (phoneParsed.country ?? undefined) : byAuth.phoneCountry,
      phoneNumber: args.phone !== undefined ? (phoneParsed.number ?? undefined) : byAuth.phoneNumber,
      updatedAt: now,
    };
    await students.updateOne({ _id: byAuth._id }, { $set: patch });
    const next = await students.findOne({ _id: byAuth._id });
    return next ? toStudent(next) : toStudent({ ...byAuth, ...patch });
  }

  const byEmail = await students.findOne({ email });
  if (byEmail) {
    const phoneParsed = args.phone !== undefined ? parsePhone(args.phone) : {};
    const patch: Partial<StudentDoc> = {
      authUserId,
      name: byEmail.name?.trim() ? byEmail.name : args.name.trim() || byEmail.name,
      phone:
        args.phone !== undefined
          ? (phoneParsed.full ?? ((args.phone ?? "").trim() || undefined))
          : byEmail.phone,
      phoneCountry: args.phone !== undefined ? (phoneParsed.country ?? undefined) : byEmail.phoneCountry,
      phoneNumber: args.phone !== undefined ? (phoneParsed.number ?? undefined) : byEmail.phoneNumber,
      updatedAt: now,
    };
    await students.updateOne({ _id: byEmail._id }, { $set: patch });
    const next = await students.findOne({ _id: byEmail._id });
    return next ? toStudent(next) : toStudent({ ...byEmail, ...patch });
  }

  const phoneParsed = parsePhone(args.phone);
  const doc: StudentDoc = {
    _id: `stu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: args.name.trim() || "Student",
    email,
    authUserId,
    phone: phoneParsed.full ?? undefined,
    phoneCountry: phoneParsed.country ?? undefined,
    phoneNumber: phoneParsed.number ?? undefined,
    sessionWish: undefined,
    createdAt: now,
    updatedAt: now,
    stripeCustomerId: undefined,
    adminNote: "",
    notes: [],
    payments: [],
    credits: [],
    couponRedemptions: [],
  };
  await students.insertOne(doc);
  return toStudent(doc);
}

export async function upsertStudentByEmail(args: { name: string; email: string }): Promise<Student | null> {
  const { students } = await cols();
  const email = normalizeEmail(args.email);
  if (!email) return null;
  const now = nowIso();
  const existing = await students.findOne({ email });
  if (!existing) {
    const doc: StudentDoc = {
      _id: `stu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: args.name.trim() || "Student",
      email,
      authUserId: undefined,
      phone: undefined,
      sessionWish: undefined,
      createdAt: now,
      updatedAt: now,
      stripeCustomerId: undefined,
      adminNote: "",
      notes: [],
      payments: [],
      credits: [],
      couponRedemptions: [],
    };
    await students.insertOne(doc);
    return toStudent(doc);
  }
  const patch: Partial<StudentDoc> = {
    name: existing.name?.trim() ? existing.name : args.name.trim(),
    updatedAt: now,
  };
  await students.updateOne({ _id: existing._id }, { $set: patch });
  const next = await students.findOne({ _id: existing._id });
  return next ? toStudent(next) : toStudent({ ...existing, ...patch });
}

export async function listStudents(args?: { q?: string; limit?: number }): Promise<Student[]> {
  const { students } = await cols();
  const limit = Math.min(2000, Math.max(1, Math.floor(args?.limit ?? 500)));
  const q = (args?.q ?? "").trim();
  const filter =
    q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
          ],
        }
      : {};
  const list = await students.find(filter).sort({ updatedAt: -1 }).limit(limit).toArray();
  return list.map(toStudent);
}

export async function createStudent(args: { name: string; email: string; phone?: string }): Promise<Student | null> {
  const { students } = await cols();
  const email = normalizeEmail(args.email);
  if (!email) return null;
  const now = nowIso();
  const existing = await students.findOne({ email });
  if (existing) return toStudent(existing);
  const phoneParsed = parsePhone(args.phone);
  const doc: StudentDoc = {
    _id: `stu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: args.name.trim() || "Student",
    email,
    authUserId: undefined,
    phone: phoneParsed.full ?? undefined,
    phoneCountry: phoneParsed.country ?? undefined,
    phoneNumber: phoneParsed.number ?? undefined,
    sessionWish: undefined,
    createdAt: now,
    updatedAt: now,
    stripeCustomerId: undefined,
    adminNote: "",
    notes: [],
    payments: [],
    credits: [],
  };
  await students.insertOne(doc);
  return toStudent(doc);
}

export async function patchStudent(
  id: string,
  patch: Partial<
    Pick<
      Student,
      "name" | "email" | "phone" | "phoneCountry" | "phoneNumber" | "adminNote" | "authUserId" | "sessionWish"
    >
  >,
): Promise<Student | null> {
  const { students } = await cols();
  const cur = await students.findOne({ _id: id });
  if (!cur) return null;
  const now = nowIso();
  const phoneFromParts =
    patch.phoneCountry !== undefined || patch.phoneNumber !== undefined
      ? (() => {
          const c = String(patch.phoneCountry ?? cur.phoneCountry ?? "+82").trim() || "+82";
          const n = digitsOnly(String(patch.phoneNumber ?? cur.phoneNumber ?? ""));
          return n ? { phone: `${c}${n}`, phoneCountry: c, phoneNumber: n } : { phone: undefined, phoneCountry: c, phoneNumber: undefined };
        })()
      : null;
  const phoneFromFull = patch.phone !== undefined ? parsePhone(String(patch.phone)) : null;
  const nextPatch: Partial<StudentDoc> = {
    ...(patch.name !== undefined ? { name: String(patch.name) } : null),
    ...(patch.email !== undefined ? { email: normalizeEmail(String(patch.email)) } : null),
    ...(patch.authUserId !== undefined ? { authUserId: normalizeAuthUserId(String(patch.authUserId)) || undefined } : null),
    ...(phoneFromParts
      ? { phone: phoneFromParts.phone, phoneCountry: phoneFromParts.phoneCountry, phoneNumber: phoneFromParts.phoneNumber }
      : null),
    ...(phoneFromParts
      ? null
      : phoneFromFull
        ? { phone: phoneFromFull.full ?? undefined, phoneCountry: phoneFromFull.country, phoneNumber: phoneFromFull.number }
        : patch.phone !== undefined
          ? { phone: String(patch.phone).trim() || undefined }
          : null),
    ...(patch.phoneCountry !== undefined ? { phoneCountry: String(patch.phoneCountry).trim() || undefined } : null),
    ...(patch.phoneNumber !== undefined ? { phoneNumber: digitsOnly(String(patch.phoneNumber)) || undefined } : null),
    ...(patch.sessionWish !== undefined ? { sessionWish: String(patch.sessionWish).trim() || undefined } : null),
    ...(patch.adminNote !== undefined ? { adminNote: String(patch.adminNote) } : null),
    updatedAt: now,
  };
  await students.updateOne({ _id: id }, { $set: nextPatch });
  const next = await students.findOne({ _id: id });
  return next ? toStudent(next) : toStudent({ ...cur, ...nextPatch });
}

export async function deleteAllStudents(): Promise<void> {
  const { students } = await cols();
  await students.deleteMany({});
}

// Credits helpers (minimal set needed for booking/cancel flows)

export async function consumeCreditsByStudentId(studentId: string, count: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = Math.max(0, Math.floor(count));
  if (!c) return { ok: true };
  const s = await getStudentById(studentId);
  if (!s) return { ok: false, error: "Student not found" };

  // Greedy consume from soonest-expiring.
  const now = Date.now();
  const active = (s.credits ?? [])
    .filter((g) => (g.remaining ?? 0) > 0 && Date.parse(g.expiresAt) > now)
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
  const total = active.reduce((acc, g) => acc + (g.remaining ?? 0), 0);
  if (total < c) return { ok: false, error: "No active credits" };

  let need = c;
  const nextCredits = (s.credits ?? []).map((g) => ({ ...g }));
  // Map id -> index
  const idxById = new Map(nextCredits.map((g, i) => [g.id, i] as const));
  for (const g of active) {
    if (need <= 0) break;
    const idx = idxById.get(g.id);
    if (idx == null) continue;
    const cur = nextCredits[idx];
    const take = Math.min(need, Math.max(0, cur.remaining ?? 0));
    cur.remaining = Math.max(0, (cur.remaining ?? 0) - take);
    need -= take;
  }
  await (await cols()).students.updateOne({ _id: studentId }, { $set: { credits: nextCredits, updatedAt: nowIso() } });
  return { ok: true };
}

export async function restoreCreditsByStudentId(studentId: string, count: number): Promise<void> {
  const c = Math.max(0, Math.floor(count));
  if (!c) return;
  const s = await getStudentById(studentId);
  if (!s) return;

  // Restore to the most recently purchased active credit first (best-effort).
  const now = Date.now();
  const grants = (s.credits ?? []).map((g) => ({ ...g }));
  const activeIdx = grants
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => Date.parse(g.expiresAt) > now)
    .sort((a, b) => Date.parse(b.g.purchasedAt) - Date.parse(a.g.purchasedAt));

  let remaining = c;
  for (const { i } of activeIdx) {
    if (remaining <= 0) break;
    const g = grants[i];
    const maxAdd = Math.max(0, (g.total ?? 0) - (g.remaining ?? 0));
    if (maxAdd <= 0) continue;
    const add = Math.min(maxAdd, remaining);
    g.remaining = Math.max(0, (g.remaining ?? 0) + add);
    remaining -= add;
  }

  await (await cols()).students.updateOne({ _id: studentId }, { $set: { credits: grants, updatedAt: nowIso() } });
}

export async function consumeCreditsByEmail(email: string, count: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = await findStudentByEmail(email);
  if (!s) return { ok: false, error: "Student not found" };
  return consumeCreditsByStudentId(s.id, count);
}

export async function restoreCreditsByEmail(email: string, count: number): Promise<void> {
  const s = await findStudentByEmail(email);
  if (!s) return;
  await restoreCreditsByStudentId(s.id, count);
}

export async function addStripeCreditsByEmail(args: {
  email: string;
  name?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  product?: CreditGrant["product"];
  kind: CreditGrant["kind"];
  total: number;
  purchasedAt: string;
  expiresAt: string;
}): Promise<{ ok: true; student: Student; credit: CreditGrant } | { ok: false; error: string }> {
  const email = normalizeEmail(args.email);
  if (!email) return { ok: false, error: "Invalid email" };
  const base =
    (await findStudentByEmail(email)) ??
    (await upsertStudentByEmail({ name: (args.name ?? "Student").trim() || "Student", email }));
  if (!base) return { ok: false, error: "Student not found" };

  const credit: CreditGrant = {
    id: `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    source: "stripe",
    product: args.product ?? "custom",
    kind: args.kind,
    total: Math.max(0, Math.floor(args.total)),
    remaining: Math.max(0, Math.floor(args.total)),
    purchasedAt: args.purchasedAt,
    expiresAt: args.expiresAt,
    stripeSessionId: args.stripeSessionId,
    stripePaymentIntentId: args.stripePaymentIntentId,
    stripeCustomerId: args.stripeCustomerId,
  };

  const payment: PaymentRecord = {
    id: `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: "pass_pack",
    amount: 0,
    createdAt: args.purchasedAt,
    memo: args.product ? `stripe:${args.product}` : "stripe",
  };

  const { students } = await cols();
  await students.updateOne(
    { _id: base.id },
    {
      $set: {
        ...(args.stripeCustomerId ? { stripeCustomerId: args.stripeCustomerId } : null),
        updatedAt: nowIso(),
      },
      $push: { credits: credit, payments: payment },
    },
  );
  const next = await students.findOne({ _id: base.id });
  return { ok: true, student: next ? toStudent(next) : base, credit };
}

export async function adjustStudentCreditsById(args: {
  studentId: string;
  delta: number;
  memo?: string;
  expiresInDays?: number;
}): Promise<
  | { ok: true; student: Student; credit?: CreditGrant }
  | { ok: false; error: string }
> {
  const studentId = (args.studentId ?? "").trim();
  if (!studentId) return { ok: false, error: "Missing studentId" };
  const delta = Number(args.delta);
  if (!Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) {
    return { ok: false, error: "Invalid delta" };
  }
  const s = await getStudentById(studentId);
  if (!s) return { ok: false, error: "Student not found" };

  if (delta < 0) {
    const need = Math.abs(delta);
    const consumed = await consumeCreditsByStudentId(studentId, need);
    if (!consumed.ok) return { ok: false, error: consumed.error };
    const next = await getStudentById(studentId);
    if (!next) return { ok: false, error: "Student not found" };
    return { ok: true, student: next };
  }

  const days = Number.isFinite(args.expiresInDays) ? Math.max(1, Math.floor(args.expiresInDays as number)) : 30;
  const purchasedAt = nowIso();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const credit: CreditGrant = {
    id: `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    source: "admin",
    product: "custom",
    kind: "single_pass",
    total: delta,
    remaining: delta,
    purchasedAt,
    expiresAt,
  };

  const { students } = await cols();
  await students.updateOne(
    { _id: studentId },
    { $push: { credits: credit }, $set: { updatedAt: nowIso(), adminNote: s.adminNote ?? "" } },
  );
  const next = await getStudentById(studentId);
  if (!next) return { ok: false, error: "Student not found" };
  return { ok: true, student: next, credit };
}

function normalizeCouponCode(v: string) {
  return String(v ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export async function redeemCouponByStudentId(args: {
  studentId: string;
  code: string;
  credits?: number;
}): Promise<
  | { ok: true; student: Student; credit: CreditGrant }
  | { ok: false; error: string }
> {
  const studentId = String(args.studentId ?? "").trim();
  if (!studentId) return { ok: false, error: "Missing studentId" };

  const code = normalizeCouponCode(args.code);
  if (!code) return { ok: false, error: "Missing code" };

  const credits = Math.max(1, Math.floor(Number(args.credits ?? 2)));
  const purchasedAt = nowIso();
  // Use end-of-day UTC to avoid timezone offsets showing the previous day in some zones.
  const expiresAt = new Date(Date.UTC(9999, 11, 31, 23, 59, 59, 999)).toISOString();

  const credit: CreditGrant = {
    id: `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    source: "admin",
    product: "custom",
    kind: "single_pass",
    total: credits,
    remaining: credits,
    purchasedAt,
    expiresAt,
  };

  const { students } = await cols();
  const res = await students.updateOne(
    { _id: studentId, "couponRedemptions.code": { $ne: code } },
    {
      $push: {
        credits: credit,
        couponRedemptions: { code, redeemedAt: purchasedAt },
      },
      $set: { updatedAt: nowIso() },
    },
  );

  if (res.modifiedCount !== 1) {
    return { ok: false, error: "Coupon already used" };
  }

  const next = await getStudentById(studentId);
  if (!next) return { ok: false, error: "Student not found" };
  return { ok: true, student: next, credit };
}

export async function addPayment(
  studentId: string,
  rec: { type: PaymentRecord["type"]; amount: number; memo?: string },
): Promise<PaymentRecord | null> {
  const s = await getStudentById(studentId);
  if (!s) return null;
  const payment: PaymentRecord = {
    id: `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: rec.type,
    amount: Number(rec.amount ?? 0),
    createdAt: nowIso(),
    memo: typeof rec.memo === "string" ? rec.memo : undefined,
  };
  const { students } = await cols();
  await students.updateOne({ _id: studentId }, { $push: { payments: payment }, $set: { updatedAt: nowIso() } });
  return payment;
}

export async function deletePayment(studentId: string, paymentId: string): Promise<boolean> {
  const { students } = await cols();
  const res = await students.updateOne(
    { _id: studentId },
    { $pull: { payments: { id: paymentId } }, $set: { updatedAt: nowIso() } },
  );
  return res.modifiedCount === 1;
}

export async function addStudentNote(studentId: string, body: string): Promise<StudentNote | null> {
  const s = await getStudentById(studentId);
  if (!s) return null;
  const note: StudentNote = {
    id: `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    body: String(body),
    createdAt: nowIso(),
  };
  const { students } = await cols();
  await students.updateOne({ _id: studentId }, { $push: { notes: note }, $set: { updatedAt: nowIso() } });
  return note;
}

export async function deleteStudentNote(studentId: string, noteId: string): Promise<boolean> {
  const { students } = await cols();
  const res = await students.updateOne(
    { _id: studentId },
    { $pull: { notes: { id: noteId } }, $set: { updatedAt: nowIso() } },
  );
  return res.modifiedCount === 1;
}

