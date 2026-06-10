"use client";

import Link from "next/link";
import AdminStudentsView from "../_components/AdminStudentsView";

export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">유저 목록</h1>
          <p className="text-sm text-muted-foreground mt-1">학생 프로필의 직업(계정 → 프로필)이 있으면 여기에 표시됩니다.</p>
        </div>
        <Link href="/admin" className="px-3 py-2 rounded border bg-white hover:bg-black hover:text-white transition text-sm">
          관리자 홈
        </Link>
      </div>
      <AdminStudentsView />
    </div>
  );
}
