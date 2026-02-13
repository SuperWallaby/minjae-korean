import { BookingCallClient } from "@/components/stream/BookingCallClient";
import { findBookingByKey } from "@/lib/db";

export default async function CallPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = findBookingByKey(bookingId);
  const openMeeting = Boolean(booking?.open);
  return <BookingCallClient bookingId={bookingId} role="student" openMeeting={openMeeting} allowGuests={openMeeting} />;
}

