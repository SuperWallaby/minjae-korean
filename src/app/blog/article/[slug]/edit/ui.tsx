"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import type { BlogImageOverrides, BlogPost } from "@/data/blogPosts/types";
import {
  processImageForThumbnail,
  processImageForUploadWebPOnly,
} from "@/lib/imageUpload";
import { cn } from "@/lib/utils";

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function putJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "PUT",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function uploadToR2(file: File): Promise<string> {
  const { res, json } = await postJson("/api/admin/r2/presign", {
    fileName: file.name,
    contentType: file.type,
  });
  if (!res.ok || !json?.ok) {
    throw new Error(String(json?.error ?? "Couldn't start upload"));
  }
  const uploadUrl = String(json?.data?.uploadUrl ?? "");
  const publicUrl = String(json?.data?.publicUrl ?? "");
  if (!uploadUrl || !publicUrl) throw new Error("Upload URL missing");

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");
  return publicUrl;
}

type Props = { slug: string; post: BlogPost };

export function BlogEditClient({ slug, post }: Props) {
  const [imageThumb, setImageThumb] = React.useState<string | null>(
    post.imageThumb ?? null,
  );
  const [imageLarge, setImageLarge] = React.useState<string | null>(
    post.imageLarge ?? null,
  );
  const [paragraphImages, setParagraphImages] = React.useState<
    (string | null)[]
  >((post.paragraphs ?? []).map((p) => p.image ?? null));
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpload = React.useCallback(
    async (
      file: File,
      key: string,
      onSuccess: (url: string) => void,
    ) => {
      try {
        setUploadingKey(key);
        setError(null);
        const processed =
          key === "imageThumb"
            ? await processImageForThumbnail(file)
            : await processImageForUploadWebPOnly(file);
        const url = await uploadToR2(processed);
        onSuccess(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingKey(null);
      }
    },
    [],
  );

  const saveOverrides = React.useCallback(async () => {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const overrides: BlogImageOverrides = {
        imageThumb: imageThumb ?? undefined,
        imageLarge: imageLarge ?? undefined,
        paragraphImages:
          paragraphImages.length > 0 ? paragraphImages : undefined,
      };
      const { res, json } = await putJson("/api/blog/overrides", {
        slug,
        overrides,
      });
      if (!res.ok || !json?.ok) {
        throw new Error(String(json?.error ?? "Save failed"));
      }
      setMsg("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [slug, imageThumb, imageLarge, paragraphImages]);

  const paragraphCount = post.paragraphs?.length ?? 0;
  const paragraphImagesPadded =
    paragraphImages.length >= paragraphCount
      ? paragraphImages
      : [
          ...paragraphImages,
          ...Array(paragraphCount - paragraphImages.length).fill(null),
        ];

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/article/${encodeURIComponent(slug)}`}>
              View post
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/blog">Blog list</Link>
          </Button>
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Edit images (dev only)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {post.title}
        </p>

        {error ? (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        ) : null}
        {msg ? (
          <p className="mt-3 text-sm text-emerald-600">{msg}</p>
        ) : null}

        {/* Thumbnail */}
        <section className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground">Thumbnail</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            List card and detail hero
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Thumb (list)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="thumb"
                  disabled={!!uploadingKey}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleUpload(file, "imageThumb", (url) =>
                      setImageThumb(url),
                    );
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!uploadingKey}
                  onClick={() => document.getElementById("thumb")?.click()}
                >
                  {uploadingKey === "imageThumb" ? "Uploading…" : "Upload"}
                </Button>
                {imageThumb ? (
                  <div className="relative h-14 w-20 overflow-hidden rounded border border-border">
                    <Image
                      src={imageThumb}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Large (hero)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="large"
                  disabled={!!uploadingKey}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleUpload(file, "imageLarge", (url) =>
                      setImageLarge(url),
                    );
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!!uploadingKey}
                  onClick={() => document.getElementById("large")?.click()}
                >
                  {uploadingKey === "imageLarge" ? "Uploading…" : "Upload"}
                </Button>
                {imageLarge ? (
                  <div className="relative h-14 w-20 overflow-hidden rounded border border-border">
                    <Image
                      src={imageLarge}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Paragraph images */}
        {paragraphCount > 0 ? (
          <section className="mt-8 rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold text-foreground">
              Paragraph images
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Image after each paragraph (optional)
            </p>
            <div className="mt-4 space-y-4">
              {post.paragraphs!.map((p, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground">
                      Paragraph {idx + 1}
                    </span>
                    {p.subtitle ? (
                      <p className="mt-0.5 truncate text-sm font-medium">
                        {p.subtitle}
                      </p>
                    ) : (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {String(p.content).slice(0, 50)}…
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`p-${idx}`}
                      disabled={!!uploadingKey}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const key = `p-${idx}`;
                        await handleUpload(file, key, (url) => {
                          setParagraphImages((prev) => {
                            const next = [...prev];
                            while (next.length <= idx) next.push(null);
                            next[idx] = url;
                            return next;
                          });
                        });
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!!uploadingKey}
                      onClick={() =>
                        document.getElementById(`p-${idx}`)?.click()
                      }
                    >
                      {uploadingKey === `p-${idx}` ? "…" : "Upload"}
                    </Button>
                    {paragraphImagesPadded[idx] ? (
                      <>
                        <div className="relative h-12 w-16 overflow-hidden rounded border border-border">
                          <Image
                            src={paragraphImagesPadded[idx]!}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          disabled={!!uploadingKey}
                          onClick={() => {
                            setParagraphImages((prev) => {
                              const next = [...prev];
                              while (next.length <= idx) next.push(null);
                              next[idx] = null;
                              return next;
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            disabled={saving || !!uploadingKey}
            onClick={() => void saveOverrides()}
          >
            {saving ? "Saving…" : "Save overrides"}
          </Button>
        </div>
      </Container>
    </div>
  );
}
