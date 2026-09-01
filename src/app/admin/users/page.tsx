"use client";

import Link from "next/link";
import AdminStudentsView from "../_components/AdminStudentsView";

export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">유저 목록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            계정·이메일 유저. 프로필에 직업이 있으면 표시됩니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded border bg-white px-3 py-2 text-sm transition hover:bg-black hover:text-white"
        >
          관리자 홈
        </Link>
      </div>
      <AdminStudentsView />
    </div>
  );
}
