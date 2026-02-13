import { BookingCallClient } from "@/components/stream/BookingCallClient";
import { findBookingByKey } from "@/lib/db";

export default async function AdminCallPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = findBookingByKey(bookingId);
  const openMeeting = Boolean(booking?.open);
  return <BookingCallClient bookingId={bookingId} role="teacher" teacherKeyRequired={!openMeeting} openMeeting={openMeeting} allowGuests={openMeeting} />;
}

