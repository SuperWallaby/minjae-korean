import fs from "fs";
import path from "path";

export type Slot = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  startMin: number;
  endMin: number;
  capacity: number;
  bookedCount: number;
  cancelled?: boolean;
  notes?: string;
};

export type Booking = {
  id: string;
  code?: string; // short meeting code, e.g. kaja022a1
  open?: boolean; // open meeting: anyone with link can join
  title?: string;
  slotId: string;
  studentId?: string;
  name: string;
  email?: string;
  status: "confirmed" | "cancelled" | "no_show";
  createdAt: string;
  // Meeting provider (Kaja Meet vs Google Meet)
  meetingProvider?: "kaja" | "google_meet";
  // Google Meet link (derived from Google Calendar conference data)
  meetUrl?: string;
  // Google Calendar bookkeeping
  calendarEventId?: string;
  calendarHtmlLink?: string;
  // Debug/ops fields for Meet creation
  meetCreatedAt?: string;
  meetError?: string;
  // Reminder email bookkeeping (ISO timestamps). Used to prevent duplicate sends.
  reminder24hSentAt?: string;
  reminder24hAdminSentAt?: string;
  reminder30mSentAt?: string;
  reminder30mAdminSentAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const SLOTS_PATH = path.join(DATA_DIR, "slots.json");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

const BOOKING_CODE_PREFIX = "kaja";
const BOOKING_CODE_LEN = 5;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SLOTS_PATH)) fs.writeFileSync(SLOTS_PATH, "[]", "utf-8");
  if (!fs.existsSync(BOOKINGS_PATH)) fs.writeFileSync(BOOKINGS_PATH, "[]", "utf-8");
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

export function listSlots(): Slot[] {
  return readJson<Slot[]>(SLOTS_PATH);
}

export function saveSlots(slots: Slot[]) {
  writeJson(SLOTS_PATH, slots);
}

export function getSlotById(id: string) {
  return listSlots().find((s) => s.id === id) ?? null;
}

export function addSlot(slot: Slot) {
  const slots = listSlots();
  slots.push(slot);
  saveSlots(slots);
  return slot;
}

export function updateSlot(id: string, patch: Partial<Slot>) {
  const slots = listSlots();
  const idx = slots.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated = { ...slots[idx], ...patch };
  slots[idx] = updated;
  saveSlots(slots);
  return updated;
}

export function deleteSlot(id: string) {
  let slots = listSlots();
  slots = slots.filter((s) => s.id !== id);
  saveSlots(slots);
}

export function listBookings(): Booking[] {
  const list = readJson<Booking[]>(BOOKINGS_PATH);
  // Lazy migrate: ensure every booking has a short code.
  const existing = new Set<string>();
  for (const b of list) {
    if (typeof b.id === "string" && b.id) existing.add(b.id);
    if (typeof b.code === "string" && b.code) existing.add(b.code);
  }

  let changed = false;
  for (const b of list) {
    if (!b || typeof b !== "object") continue;
    if (typeof b.code === "string" && b.code.trim()) continue;
    (b as Booking).code = generateUniqueBookingCode(existing);
    existing.add((b as Booking).code!);
    changed = true;
  }
  if (changed) saveBookings(list);
  return list;
}

export function saveBookings(bookings: Booking[]) {
  writeJson(BOOKINGS_PATH, bookings);
}

export function addBooking(b: Booking) {
  const bookings = listBookings();
  if (!b.code || !String(b.code).trim()) {
    const existing = new Set<string>();
    for (const x of bookings) {
      if (typeof x.id === "string" && x.id) existing.add(x.id);
      if (typeof x.code === "string" && x.code) existing.add(x.code);
    }
    b.code = generateUniqueBookingCode(existing);
  }
  bookings.push(b);
  saveBookings(bookings);
  return b;
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  const bookings = listBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const updated = { ...bookings[idx], ...patch };
  bookings[idx] = updated;
  saveBookings(bookings);
  return updated;
}

export function deleteBooking(id: string) {
  const bookings = listBookings();
  const next = bookings.filter((b) => b.id !== id);
  if (next.length === bookings.length) return false;
  saveBookings(next);
  return true;
}

function randomAlnum(len: number) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function generateUniqueBookingCode(existing: Set<string>) {
  for (let i = 0; i < 2000; i++) {
    const code = `${BOOKING_CODE_PREFIX}${randomAlnum(BOOKING_CODE_LEN)}`;
    if (!existing.has(code)) return code;
  }
  throw new Error("Failed to generate unique booking code");
}

export function findBookingByKey(key: string): Booking | null {
  const k = String(key ?? "").trim();
  if (!k) return null;
  const list = listBookings();
  return list.find((b) => b.id === k || b.code === k) ?? null;
}

export function seedSample() {
  ensureDataDir();
  const slots: Slot[] = [
    {
      id: "s-1",
      dateKey: "2026-02-10",
      startMin: 9 * 60,
      endMin: 10 * 60,
      capacity: 1,
      bookedCount: 0,
    },
    {
      id: "s-2",
      dateKey: "2026-02-11",
      startMin: 14 * 60,
      endMin: 15 * 60,
      capacity: 1,
      bookedCount: 0,
    },
  ];
  writeJson(SLOTS_PATH, slots);
  writeJson(BOOKINGS_PATH, []);
}

