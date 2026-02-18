"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArticleJsonEditor,
  type ArticleJsonPayload,
} from "@/components/article/ArticleJsonEditor";
import { UnsplashSearchModal } from "@/components/article/UnsplashSearchModal";
import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  processImageForThumbnail,
  processImageForUploadWebPOnly,
} from "@/lib/imageUpload";
import { cn } from "@/lib/utils";

type ReadingLevel = 1 | 2 | 3 | 4 | 5;

type ParagraphBlock = {
  image?: string;
  subtitle: string;
  content: string;
};

type VocabItem = {
  sound?: string;
  word: string;
  description_en: string;
  example: string;
  image?: string;
  phonetic?: string;
  exampleSound?: string;
};

type Article = {
  slug: string;
  articleCode?: string;
  levels: ReadingLevel[];
  level: ReadingLevel;
  title: string;
  audio?: string;
  imageThumb?: string;
  imageLarge?: string;
  paragraphs: ParagraphBlock[];
  vocabulary: VocabItem[];
  questions: string[];
  discussion: string[];
  createdAt?: string;
  updatedAt?: string;
};

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

async function del(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function uploadToR2(file: File): Promise<string> {
  const { res, json } = await postJson("/api/admin/r2/presign", {
    fileName: file.name,
    contentType: file.type,
  });
  if (!res.ok || !json?.ok) {
    throw new Error(String(json?.error ?? "Couldn’t start upload"));
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

function toLines(s: string): string[] {
  return String(s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function toTextareaLines(list: string[]): string {
  return (list ?? []).filter(Boolean).join("\n");
}

export function ArticleEditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const [ttsGenerating, setTtsGenerating] = React.useState(false);
  const [articleEdgeTtsGenerating, setArticleEdgeTtsGenerating] =
    React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [jsonParseError, setJsonParseError] = React.useState<string | null>(
    null,
  );
  const [draft, setDraft] = React.useState<Article | null>(null);
  const [unsplashForIdx, setUnsplashForIdx] = React.useState<number | null>(
    null,
  );
  const [wordTtsKey, setWordTtsKey] = React.useState<string | null>(null);
  const [exampleTtsKey, setExampleTtsKey] = React.useState<string | null>(null);
  const [autoRunning, setAutoRunning] = React.useState(false);
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const applyJsonPayload = React.useCallback((payload: ArticleJsonPayload) => {
    setDraft((prev) =>
      prev ? ({ ...payload, slug: prev.slug } as Article) : null,
    );
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/articles/${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.ok || !json?.data?.article) {
          setError(String(json?.error ?? "Couldn’t load article"));
          return;
        }
        setDraft(json.data.article as Article);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Couldn’t load article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const setLevelChecked = React.useCallback(
    (lvl: ReadingLevel, on: boolean) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const set = new Set(prev.levels ?? []);
        if (on) set.add(lvl);
        else set.delete(lvl);
        const next = Array.from(set.values()).sort((a, b) => a - b);
        return { ...prev, levels: next.length ? next : [prev.level] };
      });
    },
    [],
  );

  const save = React.useCallback(async () => {
    if (!draft) return;
    if (saving) return;
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const { res, json } = await putJson(
        `/api/admin/articles/${encodeURIComponent(slug)}`,
        {
          articleCode: draft.articleCode,
          title: draft.title,
          level: draft.level,
          levels: draft.levels,
          audio: draft.audio,
          imageThumb: draft.imageThumb,
          imageLarge: draft.imageLarge,
          paragraphs: draft.paragraphs,
          vocabulary: draft.vocabulary,
          questions: draft.questions,
          discussion: draft.discussion,
        },
      );
      if (!res.ok || !json?.ok)
        throw new Error(String(json?.error ?? "Save failed"));
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [draft, router, saving, slug]);

  const onDelete = React.useCallback(async () => {
    if (!draft) return;
    const ok = window.confirm("Delete this article? This cannot be undone.");
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      const { res, json } = await del(
        `/api/admin/articles/${encodeURIComponent(slug)}`,
      );
      if (!res.ok || !json?.ok)
        throw new Error(String(json?.error ?? "Delete failed"));
      router.push("/news");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }, [draft, router, slug]);

  if (loading) {
    return (
      <div className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Container>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="text-sm text-muted-foreground">
            {error || "Not found."}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/news">Back</Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Editing</div>
            <div className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {draft.title || "Untitled"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              slug: <span className="font-mono">{draft.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/news/article/${encodeURIComponent(draft.slug)}`}>
                Preview
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : msg ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-emerald-700">
            {msg}
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-2">
            <ArticleJsonEditor
              value={draft}
              onChange={applyJsonPayload}
              onParseError={setJsonParseError}
            />
            {jsonParseError ? (
              <p className="text-sm text-rose-600">{jsonParseError}</p>
            ) : null}
          </div>
          <div className="grid gap-8">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">Basics</div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Title</span>
                  <Input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((p) => (p ? { ...p, title: e.target.value } : p))
                    }
                    placeholder="Title"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">
                    articleCode
                  </span>
                  <Input
                    value={draft.articleCode ?? ""}
                    onChange={(e) =>
                      setDraft((p) =>
                        p
                          ? {
                              ...p,
                              articleCode: e.target.value.trim() || undefined,
                            }
                          : p,
                      )
                    }
                    placeholder="(optional) teacher-provided code"
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">Level</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={cn(
                          "h-9 rounded-full border px-4 text-sm transition",
                          draft.level === n
                            ? "bg-black text-white"
                            : "bg-white hover:bg-muted/40",
                        )}
                        onClick={() =>
                          setDraft((p) =>
                            p ? { ...p, level: n as ReadingLevel } : p,
                          )
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid gap-2">
                    <div className="text-xs text-muted-foreground">Levels</div>
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const lvl = n as ReadingLevel;
                        const checked = (draft.levels ?? []).includes(lvl);
                        return (
                          <label
                            key={n}
                            className="inline-flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setLevelChecked(lvl, e.target.checked)
                              }
                            />
                            {n}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-xs text-muted-foreground">Audio</span>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <Input
                      value={draft.audio ?? ""}
                      onChange={(e) =>
                        setDraft((p) =>
                          p
                            ? {
                                ...p,
                                audio: e.target.value.trim() || undefined,
                              }
                            : p,
                        )
                      }
                      placeholder="https://…"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        ttsGenerating ||
                        articleEdgeTtsGenerating ||
                        Boolean(uploadingKey)
                      }
                      onClick={async () => {
                        const ttsText = [
                          (draft.title ?? "").trim(),
                          ...(draft.paragraphs ?? []).flatMap((p) =>
                            [p.subtitle?.trim(), p.content?.trim()].filter(
                              Boolean,
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .join("\n");
                        if (!ttsText) {
                          setError(
                            "Add title or paragraph content to generate TTS.",
                          );
                          return;
                        }
                        setTtsGenerating(true);
                        setError(null);
                        try {
                          const { res, json } = await postJson(
                            "/api/admin/tts",
                            {
                              text: ttsText,
                            },
                          );
                          if (!res.ok || !json?.ok || !json?.url) {
                            throw new Error(json?.error ?? "TTS failed");
                          }
                          setDraft((p) =>
                            p ? { ...p, audio: String(json.url) } : p,
                          );
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "TTS failed",
                          );
                        } finally {
                          setTtsGenerating(false);
                        }
                      }}
                    >
                      {ttsGenerating ? "Generating…" : "TTS 생성"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        articleEdgeTtsGenerating ||
                        Boolean(uploadingKey) ||
                        ![
                          (draft.title ?? "").trim(),
                          ...(draft.paragraphs ?? []).flatMap((p) =>
                            [p.subtitle?.trim(), p.content?.trim()].filter(
                              Boolean,
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .join("\n")
                      }
                      onClick={async () => {
                        const ttsText = [
                          (draft.title ?? "").trim(),
                          ...(draft.paragraphs ?? []).flatMap((p) =>
                            [p.subtitle?.trim(), p.content?.trim()].filter(
                              Boolean,
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .join("\n");
                        if (!ttsText || !draft) return;
                        setArticleEdgeTtsGenerating(true);
                        setError(null);
                        try {
                          const { res, json } = await postJson(
                            "/api/admin/tts/word",
                            { text: ttsText },
                          );
                          if (!res.ok || !json?.ok) {
                            setError(
                              json?.error ??
                                "TTS failed (본문이 길면 실패할 수 있음)",
                            );
                            return;
                          }
                          const url = String(json?.url ?? "");
                          if (url) {
                            setDraft((p) => (p ? { ...p, audio: url } : p));
                          }
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "TTS failed",
                          );
                        } finally {
                          setArticleEdgeTtsGenerating(false);
                        }
                      }}
                    >
                      {articleEdgeTtsGenerating
                        ? "Generating…"
                        : "Generate (edge-tts)"}
                    </Button>
                  </div>
                  {(draft.audio ?? "").trim() ? (
                    <audio
                      controls
                      src={(draft.audio ?? "").trim()}
                      className="w-full"
                    />
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">Images</div>
              <div className="mt-4 grid gap-6">
                {[
                  {
                    key: "imageThumb",
                    label: "Thumbnail",
                    field: "imageThumb" as const,
                  },
                  {
                    key: "imageLarge",
                    label: "Large",
                    field: "imageLarge" as const,
                  },
                ].map((row) => (
                  <div key={row.key} className="grid gap-2">
                    <div className="text-xs text-muted-foreground">
                      {row.label}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={(draft[row.field] ?? "") as string}
                        onChange={(e) =>
                          setDraft((p) =>
                            p
                              ? {
                                  ...p,
                                  [row.field]:
                                    e.target.value.trim() || undefined,
                                }
                              : p,
                          )
                        }
                        placeholder="https://…"
                      />
                      <div className="shrink-0">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[row.key] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={Boolean(uploadingKey)}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setUploadingKey(row.key);
                              const processed =
                                row.key === "imageThumb"
                                  ? await processImageForThumbnail(file)
                                  : await processImageForUploadWebPOnly(file);
                              const url = await uploadToR2(processed);
                              setDraft((p) =>
                                p ? { ...p, [row.field]: url } : p,
                              );
                            } catch (err) {
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Upload failed",
                              );
                            } finally {
                              setUploadingKey(null);
                              e.target.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(uploadingKey)}
                          onClick={() =>
                            fileInputRefs.current[row.key]?.click()
                          }
                        >
                          {uploadingKey === row.key ? "Uploading…" : "Upload"}
                        </Button>
                      </div>
                    </div>

                    {(draft[row.field] ?? "") ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/10">
                        <div className="relative aspect-video w-full">
                          <Image
                            src={String(draft[row.field])}
                            alt=""
                            fill
                            className="object-cover object-center"
                            unoptimized
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">Paragraphs</div>
              <div className="mt-4 grid gap-4">
                {(draft.paragraphs ?? []).map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Block {idx + 1}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.paragraphs.slice();
                            next.splice(idx, 1);
                            return { ...prev, paragraphs: next };
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <Input
                        value={p.subtitle}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.paragraphs.slice();
                            next[idx] = {
                              ...next[idx],
                              subtitle: e.target.value,
                            };
                            return { ...prev, paragraphs: next };
                          })
                        }
                        placeholder="Subtitle"
                      />

                      <textarea
                        className="min-h-28 rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={p.content}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.paragraphs.slice();
                            next[idx] = {
                              ...next[idx],
                              content: e.target.value,
                            };
                            return { ...prev, paragraphs: next };
                          })
                        }
                        placeholder="Content (multiple sentences allowed)"
                      />

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={p.image ?? ""}
                          onChange={(e) =>
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.paragraphs.slice();
                              next[idx] = {
                                ...next[idx],
                                image: e.target.value.trim() || undefined,
                              };
                              return { ...prev, paragraphs: next };
                            })
                          }
                          placeholder="Image URL"
                        />
                        <div className="shrink-0">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[`para-${idx}`] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={Boolean(uploadingKey)}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const key = `para-${idx}`;
                              try {
                                setUploadingKey(key);
                                const processed =
                                  await processImageForUploadWebPOnly(file);
                                const url = await uploadToR2(processed);
                                setDraft((prev) => {
                                  if (!prev) return prev;
                                  const next = prev.paragraphs.slice();
                                  next[idx] = { ...next[idx], image: url };
                                  return { ...prev, paragraphs: next };
                                });
                              } catch (err) {
                                setError(
                                  err instanceof Error
                                    ? err.message
                                    : "Upload failed",
                                );
                              } finally {
                                setUploadingKey(null);
                                e.target.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={Boolean(uploadingKey)}
                            onClick={() =>
                              fileInputRefs.current[`para-${idx}`]?.click()
                            }
                          >
                            {uploadingKey === `para-${idx}`
                              ? "Uploading…"
                              : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            paragraphs: [
                              ...(prev.paragraphs ?? []),
                              { subtitle: "", content: "" },
                            ],
                          }
                        : prev,
                    )
                  }
                >
                  Add paragraph
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">Vocabulary</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    autoRunning ||
                    !draft ||
                    (draft.vocabulary ?? []).length === 0
                  }
                  onClick={async () => {
                    if (!draft) return;
                    setAutoRunning(true);
                    setError(null);
                    try {
                      const articleText = [
                        (draft.title ?? "").trim(),
                        ...(draft.paragraphs ?? []).flatMap((p) =>
                          [p.subtitle?.trim(), p.content?.trim()].filter(
                            Boolean,
                          ),
                        ),
                      ]
                        .filter(Boolean)
                        .join("\n");
                      if (articleText) {
                        const { res, json } = await postJson(
                          "/api/admin/tts/word",
                          { text: articleText },
                        );
                        if (res.ok && json?.ok && json?.url) {
                          setDraft((p) =>
                            p ? { ...p, audio: String(json.url) } : p,
                          );
                        }
                      }
                      const vocab = draft.vocabulary ?? [];
                      for (let idx = 0; idx < vocab.length; idx++) {
                        const v = vocab[idx];
                        if (v.word?.trim()) {
                          const { res: r1, json: j1 } = await postJson(
                            "/api/admin/tts/word",
                            { text: v.word.trim() },
                          );
                          if (r1.ok && j1?.ok && j1?.url) {
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                sound: String(j1.url),
                              };
                              return { ...prev, vocabulary: next };
                            });
                          }
                        }
                        if (v.example?.trim()) {
                          const { res: r2, json: j2 } = await postJson(
                            "/api/admin/tts/word",
                            { text: v.example.trim() },
                          );
                          if (r2.ok && j2?.ok && j2?.url) {
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                exampleSound: String(j2.url),
                              };
                              return { ...prev, vocabulary: next };
                            });
                          }
                        }
                        if (v.word?.trim()) {
                          const unsplashRes = await fetch(
                            `/api/admin/unsplash/search?q=${encodeURIComponent(v.word.trim())}`,
                          );
                          const unsplashJson = await unsplashRes
                            .json()
                            .catch(() => null);
                          if (
                            unsplashRes.ok &&
                            unsplashJson?.ok &&
                            unsplashJson?.results?.[0]?.url
                          ) {
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                image: unsplashJson.results[0].url,
                              };
                              return { ...prev, vocabulary: next };
                            });
                          }
                          await new Promise((r) => setTimeout(r, 400));
                        }
                      }
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Auto failed");
                    } finally {
                      setAutoRunning(false);
                    }
                  }}
                >
                  {autoRunning ? "Auto…" : "Auto"}
                </Button>
              </div>
              <div className="mt-4 grid gap-4">
                {(draft.vocabulary ?? []).map((v, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        Item {idx + 1}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.vocabulary.slice();
                            next.splice(idx, 1);
                            return { ...prev, vocabulary: next };
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-3">
                      <Input
                        value={v.word}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.vocabulary.slice();
                            next[idx] = { ...next[idx], word: e.target.value };
                            return { ...prev, vocabulary: next };
                          })
                        }
                        placeholder="Word"
                      />
                      <Input
                        value={v.description_en}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.vocabulary.slice();
                            next[idx] = {
                              ...next[idx],
                              description_en: e.target.value,
                            };
                            return { ...prev, vocabulary: next };
                          })
                        }
                        placeholder="English description"
                      />
                      <Input
                        value={v.example}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.vocabulary.slice();
                            next[idx] = {
                              ...next[idx],
                              example: e.target.value,
                            };
                            return { ...prev, vocabulary: next };
                          })
                        }
                        placeholder="Example"
                      />
                      <Input
                        value={v.phonetic ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => {
                            if (!prev) return prev;
                            const next = prev.vocabulary.slice();
                            next[idx] = {
                              ...next[idx],
                              phonetic: e.target.value.trim() || undefined,
                            };
                            return { ...prev, vocabulary: next };
                          })
                        }
                        placeholder="Phonetic (e.g. IPA)"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={v.image ?? ""}
                          onChange={(e) =>
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                image: e.target.value.trim() || undefined,
                              };
                              return { ...prev, vocabulary: next };
                            })
                          }
                          placeholder="Image URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUnsplashForIdx(idx)}
                        >
                          Search Unsplash
                        </Button>
                      </div>
                      <div className="flex-wrap flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={v.sound ?? ""}
                          onChange={(e) =>
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                sound: e.target.value.trim() || undefined,
                              };
                              return { ...prev, vocabulary: next };
                            })
                          }
                          placeholder="Sound URL"
                        />
                        <div className="shrink-0">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[`sound-${idx}`] = el;
                            }}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            disabled={Boolean(uploadingKey)}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const key = `sound-${idx}`;
                              try {
                                setUploadingKey(key);
                                const url = await uploadToR2(file);
                                setDraft((prev) => {
                                  if (!prev) return prev;
                                  const next = prev.vocabulary.slice();
                                  next[idx] = { ...next[idx], sound: url };
                                  return { ...prev, vocabulary: next };
                                });
                              } catch (err) {
                                setError(
                                  err instanceof Error
                                    ? err.message
                                    : "Upload failed",
                                );
                              } finally {
                                setUploadingKey(null);
                                e.target.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={Boolean(uploadingKey)}
                            onClick={() =>
                              fileInputRefs.current[`sound-${idx}`]?.click()
                            }
                          >
                            {uploadingKey === `sound-${idx}`
                              ? "Uploading…"
                              : "Upload"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!v.word.trim() || wordTtsKey !== null}
                            onClick={async () => {
                              const w = v.word.trim();
                              if (!w || !draft) return;
                              setWordTtsKey(`sound-${idx}`);
                              setError(null);
                              try {
                                const { res, json } = await postJson(
                                  "/api/admin/tts/word",
                                  {
                                    text: w,
                                  },
                                );
                                if (!res.ok || !json?.ok) {
                                  setError(json?.error ?? "TTS failed");
                                  return;
                                }
                                const url = String(json?.url ?? "");
                                if (url) {
                                  setDraft((prev) => {
                                    if (!prev) return prev;
                                    const next = prev.vocabulary.slice();
                                    next[idx] = { ...next[idx], sound: url };
                                    return { ...prev, vocabulary: next };
                                  });
                                }
                              } catch (e) {
                                setError(
                                  e instanceof Error ? e.message : "TTS failed",
                                );
                              } finally {
                                setWordTtsKey(null);
                              }
                            }}
                          >
                            {wordTtsKey === `sound-${idx}`
                              ? "Generating…"
                              : "Generate (edge-tts)"}
                          </Button>
                        </div>
                        {v.sound ? (
                          <audio
                            controls
                            src={v.sound}
                            className="h-8 max-w-[160px]"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={v.exampleSound ?? ""}
                          onChange={(e) =>
                            setDraft((prev) => {
                              if (!prev) return prev;
                              const next = prev.vocabulary.slice();
                              next[idx] = {
                                ...next[idx],
                                exampleSound:
                                  e.target.value.trim() || undefined,
                              };
                              return { ...prev, vocabulary: next };
                            })
                          }
                          placeholder="Example audio URL"
                        />
                        <div className="shrink-0">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[`exampleSound-${idx}`] = el;
                            }}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            disabled={Boolean(uploadingKey)}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setUploadingKey(`exampleSound-${idx}`);
                                const url = await uploadToR2(file);
                                setDraft((prev) => {
                                  if (!prev) return prev;
                                  const next = prev.vocabulary.slice();
                                  next[idx] = {
                                    ...next[idx],
                                    exampleSound: url,
                                  };
                                  return { ...prev, vocabulary: next };
                                });
                              } catch (err) {
                                setError(
                                  err instanceof Error
                                    ? err.message
                                    : "Upload failed",
                                );
                              } finally {
                                setUploadingKey(null);
                                e.target.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={Boolean(uploadingKey)}
                            onClick={() =>
                              fileInputRefs.current[
                                `exampleSound-${idx}`
                              ]?.click()
                            }
                          >
                            {uploadingKey === `exampleSound-${idx}`
                              ? "Uploading…"
                              : "Upload"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              !v.example.trim() || exampleTtsKey !== null
                            }
                            onClick={async () => {
                              const ex = v.example.trim();
                              if (!ex || !draft) return;
                              setExampleTtsKey(`exampleSound-${idx}`);
                              setError(null);
                              try {
                                const { res, json } = await postJson(
                                  "/api/admin/tts/word",
                                  { text: ex },
                                );
                                if (!res.ok || !json?.ok) {
                                  setError(json?.error ?? "TTS failed");
                                  return;
                                }
                                const url = String(json?.url ?? "");
                                if (url) {
                                  setDraft((prev) => {
                                    if (!prev) return prev;
                                    const next = prev.vocabulary.slice();
                                    next[idx] = {
                                      ...next[idx],
                                      exampleSound: url,
                                    };
                                    return {
                                      ...prev,
                                      vocabulary: next,
                                    };
                                  });
                                }
                              } catch (e) {
                                setError(
                                  e instanceof Error ? e.message : "TTS failed",
                                );
                              } finally {
                                setExampleTtsKey(null);
                              }
                            }}
                          >
                            {exampleTtsKey === `exampleSound-${idx}`
                              ? "Generating…"
                              : "Generate (edge-tts)"}
                          </Button>
                        </div>
                        {v.exampleSound ? (
                          <audio
                            controls
                            src={v.exampleSound}
                            className="h-8 max-w-[160px]"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            vocabulary: [
                              ...(prev.vocabulary ?? []),
                              {
                                word: "",
                                description_en: "",
                                example: "",
                                image: undefined,
                                phonetic: undefined,
                                exampleSound: undefined,
                              },
                            ],
                          }
                        : prev,
                    )
                  }
                >
                  Add vocab
                </Button>
              </div>
            </section>

            <UnsplashSearchModal
              open={unsplashForIdx !== null}
              onClose={() => setUnsplashForIdx(null)}
              defaultQuery={
                unsplashForIdx !== null
                  ? ((draft.vocabulary ?? [])[unsplashForIdx]?.word ?? "")
                  : ""
              }
              onSelect={(url) => {
                if (unsplashForIdx === null) return;
                setDraft((prev) => {
                  if (!prev) return prev;
                  const next = prev.vocabulary.slice();
                  next[unsplashForIdx] = {
                    ...next[unsplashForIdx],
                    image: url,
                  };
                  return { ...prev, vocabulary: next };
                });
                setUnsplashForIdx(null);
              }}
            />

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">
                Questions & Discussion
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">
                    Questions (one per line)
                  </span>
                  <textarea
                    className="min-h-32 rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={toTextareaLines(draft.questions ?? [])}
                    onChange={(e) =>
                      setDraft((p) =>
                        p ? { ...p, questions: toLines(e.target.value) } : p,
                      )
                    }
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">
                    Discussion prompts (one per line)
                  </span>
                  <textarea
                    className="min-h-32 rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={toTextareaLines(draft.discussion ?? [])}
                    onChange={(e) =>
                      setDraft((p) =>
                        p ? { ...p, discussion: toLines(e.target.value) } : p,
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-rose-600">
                    Danger zone
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Delete the article permanently.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void onDelete()}
                  disabled={saving}
                >
                  Delete
                </Button>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
