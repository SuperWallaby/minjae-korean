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

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
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

function toLines(s: string): string[] {
  return String(s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function ArticleNewClient() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [articleCode, setArticleCode] = React.useState("");
  const [level, setLevel] = React.useState<ReadingLevel>(1);
  const [levels, setLevels] = React.useState<ReadingLevel[]>([1]);
  const [audio, setAudio] = React.useState("");
  const [imageThumb, setImageThumb] = React.useState("");
  const [imageLarge, setImageLarge] = React.useState("");
  const [paragraphs, setParagraphs] = React.useState<ParagraphBlock[]>([
    { subtitle: "", content: "" },
  ]);
  const [vocabulary, setVocabulary] = React.useState<VocabItem[]>([]);
  const [questionsText, setQuestionsText] = React.useState("");
  const [discussionText, setDiscussionText] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const [ttsGenerating, setTtsGenerating] = React.useState(false);
  const [articleEdgeTtsGenerating, setArticleEdgeTtsGenerating] =
    React.useState(false);
  const [jsonParseError, setJsonParseError] = React.useState<string | null>(
    null,
  );
  const [unsplashForIdx, setUnsplashForIdx] = React.useState<number | null>(
    null,
  );
  const [wordTtsKey, setWordTtsKey] = React.useState<string | null>(null);
  const [exampleTtsKey, setExampleTtsKey] = React.useState<string | null>(null);
  const [autoRunning, setAutoRunning] = React.useState(false);
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const payloadForJson: ArticleJsonPayload = React.useMemo(
    () => ({
      title,
      articleCode: articleCode.trim() || undefined,
      level,
      levels,
      audio: audio.trim() || undefined,
      imageThumb: imageThumb.trim() || undefined,
      imageLarge: imageLarge.trim() || undefined,
      paragraphs,
      vocabulary,
      questions: toLines(questionsText),
      discussion: toLines(discussionText),
    }),
    [
      title,
      articleCode,
      level,
      levels,
      audio,
      imageThumb,
      imageLarge,
      paragraphs,
      vocabulary,
      questionsText,
      discussionText,
    ],
  );

  const applyJsonPayload = React.useCallback((p: ArticleJsonPayload) => {
    setTitle(p.title ?? "");
    setArticleCode(p.articleCode ?? "");
    setLevel((p.level as ReadingLevel) ?? 1);
    setLevels(p.levels?.length ? (p.levels as ReadingLevel[]) : [1]);
    setAudio(p.audio ?? "");
    setImageThumb(p.imageThumb ?? "");
    setImageLarge(p.imageLarge ?? "");
    setParagraphs(
      p.paragraphs?.length ? p.paragraphs : [{ subtitle: "", content: "" }],
    );
    setVocabulary(p.vocabulary ?? []);
    setQuestionsText((p.questions ?? []).join("\n"));
    setDiscussionText((p.discussion ?? []).join("\n"));
  }, []);

  const create = React.useCallback(async () => {
    if (!title.trim()) return;
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const { res, json } = await postJson("/api/admin/articles", {
        title,
        level,
        levels,
        articleCode: articleCode.trim() || undefined,
        audio: audio.trim() || undefined,
        imageThumb: imageThumb.trim() || undefined,
        imageLarge: imageLarge.trim() || undefined,
        paragraphs,
        vocabulary,
        questions: toLines(questionsText),
        discussion: toLines(discussionText),
      });
      if (!res.ok || !json?.ok || !json?.data?.article?.slug) {
        throw new Error(String(json?.error ?? "Create failed"));
      }
      const slug = String(json.data.article.slug);
      router.push(`/news/article/${encodeURIComponent(slug)}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setLoading(false);
    }
  }, [
    articleCode,
    audio,
    discussionText,
    imageLarge,
    imageThumb,
    level,
    levels,
    loading,
    paragraphs,
    questionsText,
    router,
    title,
    vocabulary,
  ]);

  const setLevelChecked = React.useCallback(
    (lvl: ReadingLevel, on: boolean) => {
      setLevels((prev) => {
        const set = new Set(prev ?? []);
        if (on) set.add(lvl);
        else set.delete(lvl);
        const next = Array.from(set.values()).sort((a, b) => a - b);
        return next.length ? next : [level];
      });
    },
    [level],
  );

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Dev admin</div>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              New article
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/news">Back</Link>
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-2">
            <ArticleJsonEditor
              value={payloadForJson}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article title"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">
                    articleCode
                  </span>
                  <Input
                    value={articleCode}
                    onChange={(e) => setArticleCode(e.target.value)}
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
                          level === n
                            ? "bg-black text-white"
                            : "bg-white hover:bg-muted/40",
                        )}
                        onClick={() => setLevel(n as ReadingLevel)}
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
                        const checked = levels.includes(lvl);
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
                  <div className="text-xs text-muted-foreground">Audio</div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <Input
                      value={audio}
                      onChange={(e) => setAudio(e.target.value)}
                      placeholder="Audio URL"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        ttsGenerating ||
                        articleEdgeTtsGenerating ||
                        Boolean(uploadingKey)
                      }
                      onClick={async () => {
                        const ttsText = [
                          title.trim(),
                          ...paragraphs.flatMap((p) =>
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
                          setAudio(String(json.url));
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
                          title.trim(),
                          ...(paragraphs ?? []).flatMap((p) =>
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
                          title.trim(),
                          ...(paragraphs ?? []).flatMap((p) =>
                            [p.subtitle?.trim(), p.content?.trim()].filter(
                              Boolean,
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .join("\n");
                        if (!ttsText) return;
                        setArticleEdgeTtsGenerating(true);
                        setError(null);
                        try {
                          const { res, json } = await postJson(
                            "/api/admin/tts/word",
                            {
                              text: ttsText,
                            },
                          );
                          if (!res.ok || !json?.ok) {
                            setError(
                              json?.error ??
                                "TTS failed (본문이 길면 실패할 수 있음)",
                            );
                            return;
                          }
                          setAudio(String(json?.url ?? ""));
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
                    <div className="shrink-0">
                      <input
                        ref={(el) => {
                          fileInputRefs.current["audio"] = el;
                        }}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        disabled={Boolean(uploadingKey)}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingKey("audio");
                            const url = await uploadToR2(file);
                            setAudio(url);
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
                        onClick={() => fileInputRefs.current["audio"]?.click()}
                      >
                        {uploadingKey === "audio" ? "Uploading…" : "Upload"}
                      </Button>
                    </div>
                  </div>
                  {audio.trim() ? (
                    <audio
                      controls
                      src={audio.trim()}
                      className="mt-2 w-full"
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
                    value: imageThumb,
                    setValue: setImageThumb,
                  },
                  {
                    key: "imageLarge",
                    label: "Large",
                    value: imageLarge,
                    setValue: setImageLarge,
                  },
                ].map((row) => (
                  <div key={row.key} className="grid gap-2">
                    <div className="text-xs text-muted-foreground">
                      {row.label}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={row.value}
                        onChange={(e) => row.setValue(e.target.value)}
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
                              row.setValue(url);
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
                    {row.value.trim() ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-muted/10">
                        <div className="relative aspect-video w-full">
                          <Image
                            src={row.value.trim()}
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
                {paragraphs.map((p, idx) => (
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
                        onClick={() => {
                          setParagraphs((prev) => {
                            const next = prev.slice();
                            next.splice(idx, 1);
                            return next.length
                              ? next
                              : [{ subtitle: "", content: "" }];
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <Input
                        value={p.subtitle}
                        onChange={(e) =>
                          setParagraphs((prev) => {
                            const next = prev.slice();
                            next[idx] = {
                              ...next[idx],
                              subtitle: e.target.value,
                            };
                            return next;
                          })
                        }
                        placeholder="Subtitle"
                      />
                      <textarea
                        className="min-h-28 rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={p.content}
                        onChange={(e) =>
                          setParagraphs((prev) => {
                            const next = prev.slice();
                            next[idx] = {
                              ...next[idx],
                              content: e.target.value,
                            };
                            return next;
                          })
                        }
                        placeholder="Content"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={p.image ?? ""}
                          onChange={(e) =>
                            setParagraphs((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                image: e.target.value.trim() || undefined,
                              };
                              return next;
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
                                setParagraphs((prev) => {
                                  const next = prev.slice();
                                  next[idx] = { ...next[idx], image: url };
                                  return next;
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
                    setParagraphs((prev) => [
                      ...prev,
                      { subtitle: "", content: "" },
                    ])
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
                  disabled={autoRunning || vocabulary.length === 0}
                  onClick={async () => {
                    setAutoRunning(true);
                    setError(null);
                    try {
                      const articleText = [
                        title.trim(),
                        ...paragraphs.flatMap((p) =>
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
                          {
                            text: articleText,
                          },
                        );
                        if (res.ok && json?.ok && json?.url) {
                          setAudio(String(json.url));
                        }
                      }
                      for (let idx = 0; idx < vocabulary.length; idx++) {
                        const v = vocabulary[idx];
                        if (v.word?.trim()) {
                          const { res: r1, json: j1 } = await postJson(
                            "/api/admin/tts/word",
                            { text: v.word.trim() },
                          );
                          if (r1.ok && j1?.ok && j1?.url) {
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                sound: String(j1.url),
                              };
                              return next;
                            });
                          }
                        }
                        if (v.example?.trim()) {
                          const { res: r2, json: j2 } = await postJson(
                            "/api/admin/tts/word",
                            { text: v.example.trim() },
                          );
                          if (r2.ok && j2?.ok && j2?.url) {
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                exampleSound: String(j2.url),
                              };
                              return next;
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
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                image: unsplashJson.results[0].url,
                              };
                              return next;
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
                {vocabulary.map((v, idx) => (
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
                          setVocabulary((prev) => {
                            const next = prev.slice();
                            next.splice(idx, 1);
                            return next;
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
                          setVocabulary((prev) => {
                            const next = prev.slice();
                            next[idx] = { ...next[idx], word: e.target.value };
                            return next;
                          })
                        }
                        placeholder="Word"
                      />
                      <Input
                        value={v.description_en}
                        onChange={(e) =>
                          setVocabulary((prev) => {
                            const next = prev.slice();
                            next[idx] = {
                              ...next[idx],
                              description_en: e.target.value,
                            };
                            return next;
                          })
                        }
                        placeholder="English description"
                      />
                      <Input
                        value={v.example}
                        onChange={(e) =>
                          setVocabulary((prev) => {
                            const next = prev.slice();
                            next[idx] = {
                              ...next[idx],
                              example: e.target.value,
                            };
                            return next;
                          })
                        }
                        placeholder="Example"
                      />
                      <Input
                        value={v.phonetic ?? ""}
                        onChange={(e) =>
                          setVocabulary((prev) => {
                            const next = prev.slice();
                            next[idx] = {
                              ...next[idx],
                              phonetic: e.target.value.trim() || undefined,
                            };
                            return next;
                          })
                        }
                        placeholder="Phonetic (e.g. IPA)"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={v.image ?? ""}
                          onChange={(e) =>
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                image: e.target.value.trim() || undefined,
                              };
                              return next;
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
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          value={v.sound ?? ""}
                          onChange={(e) =>
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                sound: e.target.value.trim() || undefined,
                              };
                              return next;
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
                                setVocabulary((prev) => {
                                  const next = prev.slice();
                                  next[idx] = { ...next[idx], sound: url };
                                  return next;
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
                              if (!w) return;
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
                                  setVocabulary((prev) => {
                                    const next = prev.slice();
                                    next[idx] = { ...next[idx], sound: url };
                                    return next;
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
                            setVocabulary((prev) => {
                              const next = prev.slice();
                              next[idx] = {
                                ...next[idx],
                                exampleSound:
                                  e.target.value.trim() || undefined,
                              };
                              return next;
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
                                setVocabulary((prev) => {
                                  const next = prev.slice();
                                  next[idx] = {
                                    ...next[idx],
                                    exampleSound: url,
                                  };
                                  return next;
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
                              if (!ex) return;
                              setExampleTtsKey(`exampleSound-${idx}`);
                              setError(null);
                              try {
                                const { res, json } = await postJson(
                                  "/api/admin/tts/word",
                                  {
                                    text: ex,
                                  },
                                );
                                if (!res.ok || !json?.ok) {
                                  setError(json?.error ?? "TTS failed");
                                  return;
                                }
                                const url = String(json?.url ?? "");
                                if (url) {
                                  setVocabulary((prev) => {
                                    const next = prev.slice();
                                    next[idx] = {
                                      ...next[idx],
                                      exampleSound: url,
                                    };
                                    return next;
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
                    setVocabulary((prev) => [
                      ...prev,
                      {
                        word: "",
                        description_en: "",
                        example: "",
                        image: undefined,
                        phonetic: undefined,
                        exampleSound: undefined,
                      },
                    ])
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
                  ? (vocabulary[unsplashForIdx]?.word ?? "")
                  : ""
              }
              onSelect={(url) => {
                if (unsplashForIdx === null) return;
                setVocabulary((prev) => {
                  const next = prev.slice();
                  next[unsplashForIdx] = {
                    ...next[unsplashForIdx],
                    image: url,
                  };
                  return next;
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
                    value={questionsText}
                    onChange={(e) => setQuestionsText(e.target.value)}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">
                    Discussion prompts (one per line)
                  </span>
                  <textarea
                    className="min-h-32 rounded-md border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={discussionText}
                    onChange={(e) => setDiscussionText(e.target.value)}
                  />
                </label>
              </div>
            </section>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={loading || !title.trim()}
                onClick={() => void create()}
              >
                {loading ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
