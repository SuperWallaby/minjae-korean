import AdminBulkBroadcastForm from "../_components/AdminBulkBroadcastForm";

/** Deep link: email broadcast (formerly lesson reminder inbox). */
export default function AdminNotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">이메일 발송</h1>
      <section className="rounded border p-4">
        <AdminBulkBroadcastForm />
      </section>
    </div>
  );
}
