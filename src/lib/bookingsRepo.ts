import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type BookingStatus = "confirmed" | "cancelled" | "no_show";

export type Booking = {
  id: string;
  code?: string; // short meeting code, e.g. kaja022a1
  open?: boolean; // open meeting: anyone with link can join
  title?: string;
  slotId: string;
  // When durationMin is 50, slotId2 must be set (blocks adjacent grid slot).
  slotId2?: string;
  durationMin: 25 | 50;
  studentId?: string;
  name: string;
  email?: string;
  status: BookingStatus;
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

type BookingDoc = Omit<Booking, "id"> & { _id: string };

type Collections = {
  bookings: Collection<BookingDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const bookings = db.collection<BookingDoc>("bookings");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await bookings.createIndex({ createdAt: -1 });
        await bookings.createIndex({ studentId: 1, createdAt: -1 });
        await bookings.createIndex({ slotId: 1 });
        await bookings.createIndex({ slotId2: 1 });
        await bookings.createIndex({ code: 1 }, { unique: true, sparse: true });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { bookings };
}

function toBooking(doc: BookingDoc): Booking {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function toDoc(b: Booking): BookingDoc {
  const { id, ...rest } = b;
  return { _id: id, ...rest };
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { bookings } = await cols();
  const doc = await bookings.findOne({ _id: id });
  return doc ? toBooking(doc) : null;
}

export async function findBookingByKey(key: string): Promise<Booking | null> {
  const k = String(key ?? "").trim();
  if (!k) return null;
  const { bookings } = await cols();
  const doc = await bookings.findOne({ $or: [{ _id: k }, { code: k }] });
  return doc ? toBooking(doc) : null;
}

export async function listBookingsByStudentId(studentId: string): Promise<Booking[]> {
  const { bookings } = await cols();
  const list = await bookings.find({ studentId }).sort({ createdAt: -1 }).limit(500).toArray();
  return list.map(toBooking);
}

export async function listBookingsByEmail(email: string): Promise<Booking[]> {
  const { bookings } = await cols();
  const normalized = email.trim().toLowerCase();
  const list = await bookings.find({ email: normalized }).sort({ createdAt: -1 }).limit(500).toArray();
  return list.map(toBooking);
}

export async function listAllBookings(limit = 2000): Promise<Booking[]> {
  const { bookings } = await cols();
  const list = await bookings.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return list.map(toBooking);
}

export async function listBookingsBySlotIds(slotIds: string[]): Promise<Booking[]> {
  const ids = slotIds.filter(Boolean);
  if (!ids.length) return [];
  const { bookings } = await cols();
  const list = await bookings
    .find({ $or: [{ slotId: { $in: ids } }, { slotId2: { $in: ids } }] })
    .sort({ createdAt: -1 })
    .limit(2000)
    .toArray();
  return list.map(toBooking);
}

export async function createBooking(b: Booking): Promise<Booking> {
  const { bookings } = await cols();
  await bookings.insertOne(toDoc(b));
  return b;
}

export async function patchBooking(id: string, patch: Partial<Omit<Booking, "id">>): Promise<Booking | null> {
  const { bookings } = await cols();
  await bookings.updateOne({ _id: id }, { $set: patch });
  const next = await bookings.findOne({ _id: id });
  return next ? toBooking(next) : null;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const { bookings } = await cols();
  const res = await bookings.deleteOne({ _id: id });
  return res.deletedCount === 1;
}

export async function deleteAllBookings(): Promise<void> {
  const { bookings } = await cols();
  await bookings.deleteMany({});
}

