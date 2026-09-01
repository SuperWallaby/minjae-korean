"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AdminBulkBroadcastForm from "./_components/AdminBulkBroadcastForm";
import AdminSupportInboxView from "./_components/AdminSupportInboxView";

type AdminTab = "messages" | "broadcast";

function AdminPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState<AdminTab>("messages");

  React.useLayoutEffect(() => {
    const t = searchParams.get("tab");
    if (t === "broadcast" || t === "notifications") setTab("broadcast");
    else setTab("messages");
  }, [searchParams]);

  const selectTab = React.useCallback(
    (t: AdminTab) => {
      setTab(t);
      router.replace(t === "broadcast" ? "/admin?tab=broadcast" : "/admin", {
        scroll: false,
      });
    },
    [router],
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">관리자</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            How to study Korean — support, users, email broadcast.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className="rounded border bg-white px-3 py-2 transition hover:bg-black hover:text-white"
          >
            유저 목록
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          className={`rounded border px-3 py-2 ${tab === "messages" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("messages")}
        >
          메시지
        </button>
        <button
          type="button"
          className={`rounded border px-3 py-2 ${tab === "broadcast" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => selectTab("broadcast")}
        >
          이메일 발송
        </button>
      </div>

      {tab === "messages" ? <AdminSupportInboxView embedded /> : null}
      {tab === "broadcast" ? (
        <section className="rounded border p-4">
          <AdminBulkBroadcastForm />
        </section>
      ) : null}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">로딩 중…</div>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}
