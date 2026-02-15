import { BookingCallClient } from "@/components/stream/BookingCallClient";
import { findBookingByKey } from "@/lib/bookingsRepo";
import { redirect } from "next/navigation";

export default async function AdminCallRoomPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await findBookingByKey(bookingId);
  const meetUrl = (booking?.meetUrl ?? "").trim();
  if (meetUrl) redirect(meetUrl);
  if ((booking?.meetingProvider ?? "") === "google_meet") {
    return (
      <div className="min-h-[60vh] px-6 py-14">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6">
          <div className="text-lg font-semibold">Google Meet link unavailable</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Meet link creation failed for this booking. Check the server env/token and rebook or regenerate.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="rounded-full border border-border bg-card px-4 py-2 text-sm"
              href="/admin"
            >
              Back to admin
            </a>
          </div>
        </div>
      </div>
    );
  }
  const openMeeting = Boolean(booking?.open);
  return (
    <BookingCallClient
      bookingId={bookingId}
      role="teacher"
      mode="room"
      teacherKeyRequired={false}
      openMeeting={openMeeting}
      allowGuests={openMeeting}
    />
  );
}

