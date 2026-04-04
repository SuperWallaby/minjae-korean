"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { processImageForThumbnail } from "@/lib/imageUpload";
import { uploadFileToR2 } from "@/lib/uploadFileToR2";

type Props = {
  slug: string;
  title: string;
  backHref: string;
};

export function ExamEditClient({ slug, title, backHref }: Props) {
  const [covers, setCovers] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const imageThumb = covers[slug] ?? "";

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
          setCovers({});
        }
      } catch {
        if (!cancelled) setError("표지를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const processed = await processImageForThumbnail(file);
      const url = await uploadFileToR2(processed);
      setCovers((prev) => ({ ...prev, [slug]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">표지 불러오는 중…</div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        표지 이미지는 업로드 시 썸네일용으로 리사이즈·WebP 최적화 후 저장됩니다.
      </p>
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">표지 이미지</label>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <button
            type="button"
            className="shrink-0 rounded border border-border bg-white px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "업로드 중…" : "이미지 업로드"}
          </button>
        </div>
        {imageThumb?.trim() ? (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted/10">
            <Image
              src={imageThumb}
              alt=""
              fill
              className="object-cover object-center"
              unoptimized
              sizes="(max-width: 768px) 100vw, 28rem"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-sm text-muted-foreground">
            표지 없음
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
        <Link
          href={backHref}
          className="rounded border border-border bg-white px-4 py-2 text-sm hover:bg-muted"
        >
          취소
        </Link>
      </div>
    </div>
  );
}
