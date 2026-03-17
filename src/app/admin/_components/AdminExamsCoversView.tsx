"use client";

import * as React from "react";
import Image from "next/image";
import { processImageForThumbnail } from "@/lib/imageUpload";

const EXAM_ENTRIES: { slug: string; label: string }[] = [
  { slug: "placement", label: "Placement (등급 받기)" },
  // { slug: "a1-01", label: "A1 Level Test 01" },
  // { slug: "a1-01", label: "A1 Level Test 01" },
  // { slug: "a2-01", label: "A2 Level Test 01" },
  // { slug: "topik-i-01", label: "TOPIK I Mock 01" },
  // { slug: "topik-ii-01", label: "TOPIK II Mock 01" },
];

async function uploadToR2(file: File): Promise<string> {
  const res = await fetch("/api/admin/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok)
    throw new Error(String(json?.error ?? "업로드 실패"));
  const uploadUrl = String(json?.data?.uploadUrl ?? "");
  const publicUrl = String(json?.data?.publicUrl ?? "");
  if (!uploadUrl || !publicUrl) throw new Error("업로드 URL 없음");
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error("업로드 실패");
  return publicUrl;
}

export default function AdminExamsCoversView() {
  const [covers, setCovers] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingSlug, setUploadingSlug] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/exams/covers");
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && json?.ok && json.covers) {
          setCovers(json.covers);
        } else {
          const empty: Record<string, string> = {};
          EXAM_ENTRIES.forEach((e) => (empty[e.slug] = ""));
          setCovers(empty);
        }
      } catch {
        if (!cancelled) setError("표지 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpload = async (slug: string, file: File) => {
    setError(null);
    setUploadingSlug(slug);
    try {
      const processed = await processImageForThumbnail(file);
      const url = await uploadToR2(processed);
      setCovers((prev) => ({ ...prev, [slug]: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploadingSlug(null);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/exams/covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ covers }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "저장 실패");
        return;
      }
      setCovers(json.covers ?? covers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        표지 목록 불러오는 중…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        시험별 표지 이미지를 등록합니다. 업로드 시 썸네일용으로 리사이즈·WebP
        최적화 후 R2에 올라갑니다. 저장하면 /exams 목록에 반영됩니다.
      </p>
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {EXAM_ENTRIES.map(({ slug, label }) => (
          <div
            key={slug}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
          >
            <div className="text-sm font-medium">{label}</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                ref={(el) => {
                  fileInputRefs.current[slug] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(slug, file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="shrink-0 rounded border border-border bg-white px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                disabled={!!uploadingSlug}
                onClick={() => fileInputRefs.current[slug]?.click()}
              >
                {uploadingSlug === slug ? "업로드 중…" : "표지 업로드"}
              </button>
            </div>
            {covers[slug]?.trim() ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/10">
                <Image
                  src={covers[slug]}
                  alt=""
                  fill
                  className="object-cover object-center"
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-sm text-muted-foreground">
                표지 없음
              </div>
            )}
          </div>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "저장 중…" : "표지 저장"}
        </button>
      </div>
    </div>
  );
}
