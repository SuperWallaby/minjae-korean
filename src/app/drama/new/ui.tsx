"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { processImageForThumbnail } from "@/lib/imageUpload";
import type {
  CEFR,
  DramaCard,
  DramaChunk,
  Drama,
  AidBlock,
  Lexeme,
} from "@/lib/dramaRepo";

type DramaPayload = Partial<DramaCard> & { title: string; slug?: string };

const DEFAULT_PAYLOAD: DramaPayload = {
  title: "Drama Title",
  artist: "Series / Drama Name",
  slug: "drama-title-series",
  level: "B1",
  language: "ko",
  tags: ["emotion"],
  source: { provider: "youtube", videoId: "" },
  chunks: [
    {
      id: "chunk_0",
      index: 0,
      lines: ["대사 첫줄"],
      aid: {
        blocks: [
          { type: "translation", text: "First line translation" },
          { type: "explanation", text: "Explanation of the lyrics" },
        ] as AidBlock[],
      },
    },
  ],
};

function normalizePayload(parsed: unknown): DramaPayload | null {
  const o =
    parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  if (!o.title) return null;

  const level = String(o.level ?? "A1")
    .trim()
    .toUpperCase();
  const validLevel: CEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const cefr = validLevel.includes(level as CEFR) ? (level as CEFR) : "A1";

  return {
    title: typeof o.title === "string" ? o.title : "",
    artist: typeof o.artist === "string" ? o.artist : "",
    slug: typeof o.slug === "string" ? o.slug : undefined,
    level: cefr,
    language: typeof o.language === "string" ? o.language : undefined,
    tags: Array.isArray(o.tags) ? o.tags.map(String) : undefined,
    source:
      o.source && typeof o.source === "object"
        ? (o.source as DramaPayload["source"])
        : undefined,
    images:
      o.images && typeof o.images === "object"
        ? (o.images as DramaCard["images"])
        : undefined,
    lexicon: Array.isArray(o.lexicon)
      ? (o.lexicon as DramaCard["lexicon"])
      : undefined,
    chunks: Array.isArray(o.chunks) ? (o.chunks as DramaChunk[]) : [],
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
  };
}

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

type DramaNewClientProps = {
  initialDrama?: Drama | null;
};

export function DramaNewClient({ initialDrama }: DramaNewClientProps) {
  const router = useRouter();
  const [text, setText] = React.useState(() =>
    initialDrama
      ? JSON.stringify(initialDrama, null, 2)
      : JSON.stringify(DEFAULT_PAYLOAD, null, 2),
  );
  const [error, setError] = React.useState<string | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [ttsLexId, setTtsLexId] = React.useState<string | null>(null);
  const [ttsBatchInProgress, setTtsBatchInProgress] = React.useState(false);
  const [previewWide, setPreviewWide] = React.useState(false);
  const [thumbUploading, setThumbUploading] = React.useState(false);
  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialDrama?.slug);

  async function uploadImageToR2(file: File): Promise<string> {
    const res = await fetch("/api/admin/r2/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: `drama-thumb-${Date.now()}-${file.name}`,
        contentType: file.type || "image/webp",
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) throw new Error(String(json?.error ?? "업로드 실패"));
    const uploadUrl = String(json?.data?.uploadUrl ?? "");
    const publicUrl = String(json?.data?.publicUrl ?? "");
    if (!uploadUrl || !publicUrl) throw new Error("업로드 URL 없음");
    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "image/webp" },
      body: file,
    });
    if (!put.ok) throw new Error("업로드 실패");
    return publicUrl;
  }

  const setLexemeAudioUrl = React.useCallback(
    (lexId: string, audioUrl: string) => {
      setText((prev) => {
        try {
          const parsed = JSON.parse(prev) as {
            lexicon?: Record<string, unknown>[];
          };
          const lexicon = Array.isArray(parsed.lexicon)
            ? [...parsed.lexicon]
            : [];
          const i = lexicon.findIndex(
            (l) => String((l as { id?: string }).id) === lexId,
          );
          if (i < 0) return prev;
          const lex = { ...(lexicon[i] as Record<string, unknown>), audioUrl };
          lexicon[i] = lex;
          return JSON.stringify({ ...parsed, lexicon }, null, 2);
        } catch {
          return prev;
        }
      });
    },
    [],
  );

  const setLexemeAudioUrls = React.useCallback(
    (updates: Record<string, string>) => {
      if (Object.keys(updates).length === 0) return;
      setText((prev) => {
        try {
          const parsed = JSON.parse(prev) as {
            lexicon?: Record<string, unknown>[];
          };
          const lexicon = Array.isArray(parsed.lexicon)
            ? [...parsed.lexicon]
            : [];
          lexicon.forEach((l, i) => {
            const id = String((l as { id?: string }).id);
            if (updates[id])
              lexicon[i] = {
                ...(l as Record<string, unknown>),
                audioUrl: updates[id],
              };
          });
          return JSON.stringify({ ...parsed, lexicon }, null, 2);
        } catch {
          return prev;
        }
      });
    },
    [],
  );

  const setChunkRange = React.useCallback(
    (chunkIndex: number, startSec: number | undefined, endSec: number | undefined) => {
      setText((prev) => {
        try {
          const parsed = JSON.parse(prev) as { chunks?: Record<string, unknown>[] };
          const chunks = Array.isArray(parsed.chunks) ? [...parsed.chunks] : [];
          if (chunkIndex < 0 || chunkIndex >= chunks.length) return prev;
          const ch = { ...(chunks[chunkIndex] as Record<string, unknown>) };
          const existing = ch.range as { startMs?: number; endMs?: number } | undefined;
          const existingStartSec = existing?.startMs != null ? existing.startMs / 1000 : undefined;
          const existingEndSec = existing?.endMs != null ? existing.endMs / 1000 : undefined;
          const newStart = startSec ?? existingStartSec;
          const newEnd = endSec ?? existingEndSec;
          if (newStart == null && newEnd == null) {
            delete ch.range;
          } else {
            const s = (Number.isFinite(newStart) ? newStart : 0) as number;
            const e = (Number.isFinite(newEnd) ? newEnd : s) as number;
            ch.range = { startMs: Math.round(s * 1000), endMs: Math.round(e * 1000) };
          }
          chunks[chunkIndex] = ch;
          return JSON.stringify({ ...parsed, chunks }, null, 2);
        } catch {
          return prev;
        }
      });
    },
    [],
  );

  const setSourceVideoId = React.useCallback((videoIdValue: string) => {
    setText((prev) => {
      try {
        const parsed = JSON.parse(prev) as { source?: Record<string, unknown> };
        const next = { ...parsed, source: { provider: "youtube", videoId: videoIdValue.trim() } };
        return JSON.stringify(next, null, 2);
      } catch {
        return prev;
      }
    });
  }, []);

  const setDramaImages = React.useCallback(
    (images: { thumb?: string; large?: string }) => {
      setText((prev) => {
        try {
          const parsed = JSON.parse(prev) as Record<string, unknown>;
          const next = { ...parsed, images };
          return JSON.stringify(next, null, 2);
        } catch {
          return prev;
        }
      });
    },
    []
  );
  const payload = React.useMemo(() => {
    try {
      const parsed = JSON.parse(text);
      setParseError(null);
      return normalizePayload(parsed);
    } catch {
      setParseError("Invalid JSON");
      return null;
    }
  }, [text]);

  const videoId =
    payload?.source?.provider === "youtube" && payload.source.videoId
      ? String(payload.source.videoId).trim()
      : "";
  const ytPlayerRef = React.useRef<{
    getCurrentTime(): number;
    seekTo(s: number): void;
  } | null>(null);
  const ytContainerRef = React.useRef<HTMLDivElement>(null);
  const [ytApiReady, setYtApiReady] = React.useState(false);
  const [_ytPlayerReady, setYtPlayerReady] = React.useState(false);
  const ytCreatedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as { YT?: { Player: unknown } }).YT?.Player) {
      setYtApiReady(true);
      return;
    }
    const prev = (window as unknown as { onYouTubeIframeAPIReady?: () => void })
      .onYouTubeIframeAPIReady;
    (
      window as unknown as { onYouTubeIframeAPIReady?: () => void }
    ).onYouTubeIframeAPIReady = () => {
      setYtApiReady(true);
      prev?.();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(tag, first);
    return () => {
      (
        window as unknown as { onYouTubeIframeAPIReady?: () => void }
      ).onYouTubeIframeAPIReady = prev;
    };
  }, []);

  React.useEffect(() => {
    if (!videoId || !ytApiReady || !ytContainerRef.current) return;
    if (ytCreatedRef.current === videoId) return;
    ytCreatedRef.current = videoId;
    ytPlayerRef.current = null;
    setYtPlayerReady(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const YT = (window as any).YT;
    if (!YT) return;
    try {
      const player = new YT.Player(ytContainerRef.current, {
        videoId,
        width: 320,
        height: 180,
        events: {
          onReady(e: {
            target: { getCurrentTime(): number; seekTo(s: number): void };
          }) {
            ytPlayerRef.current = e.target;
            setYtPlayerReady(true);
          },
        },
      });
      if (player && !ytPlayerRef.current) ytPlayerRef.current = player;
    } catch {
      ytCreatedRef.current = null;
    }
    return () => {
      ytPlayerRef.current = null;
      setYtPlayerReady(false);
    };
  }, [videoId, ytApiReady]);

  const save = React.useCallback(async () => {
    if (!payload || !payload.title.trim()) {
      setError("Title is required");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      if (isEdit && initialDrama?.slug) {
        const { res, json } = await patchJson("/api/admin/dramas", {
          ...payload,
          slug: initialDrama.slug,
        });
        if (!res.ok || !json?.ok) {
          throw new Error(String(json?.error ?? "Update failed"));
        }
        router.push(`/drama/${encodeURIComponent(initialDrama.slug)}`);
      } else {
        const { res, json } = await postJson("/api/admin/dramas", payload);
        if (!res.ok || !json?.ok || !json?.data?.drama?.slug) {
          throw new Error(String(json?.error ?? "Create failed"));
        }
        const slug = String(json.data.drama.slug);
        router.push(`/drama/${encodeURIComponent(slug)}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setLoading(false);
    }
  }, [payload, loading, router, isEdit, initialDrama?.slug]);

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Dev admin</div>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {isEdit ? "Edit drama" : "New drama"}
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/drama">Back</Link>
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 좌측: YouTube ID + 미리보기 (sticky) */}
          <div className="lg:order-1 space-y-6">
            {/* YouTube video ID 입력 */}
            {payload ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <label className="block text-sm font-semibold mb-2">
                  YouTube video ID
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  영상 URL의 v= 뒤 값 또는 영상 ID (예: H2HQWHKDREI)
                </p>
                <input
                  type="text"
                  placeholder="H2HQWHKDREI"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background font-mono text-sm placeholder:text-muted-foreground"
                  value={
                    payload.source?.provider === "youtube"
                      ? String(payload.source.videoId ?? "").trim()
                      : ""
                  }
                  onChange={(e) => setSourceVideoId(e.target.value)}
                />
              </section>
            ) : null}

            {/* 썸네일 */}
            {payload ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="text-sm font-semibold mb-2">썸네일</div>
                <p className="text-xs text-muted-foreground mb-3">
                  드라마 목록·상세에 표시되는 이미지. URL 입력 또는 파일 업로드.
                </p>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      placeholder="썸네일 URL"
                      className="flex-1 min-w-[180px] px-3 py-2 rounded-md border border-border bg-background text-sm"
                      value={payload.images?.thumb ?? ""}
                      onChange={(e) =>
                        setDramaImages({
                          ...payload.images,
                          thumb: e.target.value.trim() || undefined,
                        })
                      }
                    />
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setThumbUploading(true);
                        e.target.value = "";
                        try {
                          const processed = await processImageForThumbnail(file);
                          const url = await uploadImageToR2(processed);
                          setDramaImages({
                            thumb: url,
                            large: payload.images?.large ?? url,
                          });
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "업로드 실패");
                        } finally {
                          setThumbUploading(false);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={thumbUploading}
                      onClick={() => thumbInputRef.current?.click()}
                    >
                      {thumbUploading ? "업로드 중…" : "이미지 업로드"}
                    </Button>
                  </div>
                  {(payload.images?.thumb ?? payload.images?.large) && (
                    <div className="rounded-lg border border-border overflow-hidden bg-muted/20 w-32 aspect-video relative">
                      <Image
                        src={payload.images?.thumb || payload.images?.large || ""}
                        alt="썸네일 미리보기"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {/* YouTube 미리보기 (Lexicon 타이밍 연동) - sticky */}
            {videoId ? (
              <section className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-sm font-semibold">
                    YouTube 미리보기
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewWide((w) => !w)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:bg-muted/30 transition-colors"
                  >
                    {previewWide ? "좁게" : "넓게"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  재생 구간을 edit에서 지정하면 드라마 페이지에서 해당 구간 재생 버튼으로 이동·재생됩니다.
                </p>
                <div
                  key={videoId}
                  ref={ytContainerRef}
                  className={`aspect-video w-full rounded-lg overflow-hidden bg-black ${previewWide ? "max-w-full" : "max-w-md"}`}
                />
              </section>
            ) : null}
          </div>

          {/* 우측: JSON + Preview 등 */}
          <div className="lg:order-2 space-y-6">
            {/* JSON Editor */}
            <div>
              <div className="text-xs text-muted-foreground mb-1.5 font-medium">
                JSON (edit to apply)
              </div>
              <textarea
                className="w-full min-h-[500px] rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
              />
              {parseError ? (
                <p className="mt-2 text-sm text-rose-600">{parseError}</p>
              ) : null}
            </div>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-4">Preview</div>
              {payload ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">
                      {payload.title || "(empty)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Series / Artist:</span>{" "}
                    <span>{payload.artist || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level:</span>{" "}
                    <span>{payload.level}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>{" "}
                    <span className="font-mono text-xs">
                      {payload.source?.provider === "youtube"
                        ? payload.source.videoId || "(none)"
                        : payload.source?.provider === "spotify"
                          ? payload.source.trackId || "(none)"
                          : payload.source?.provider === "custom"
                            ? payload.source.url || "(none)"
                            : "(none)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chunks:</span>{" "}
                    <span>
                      {payload.chunks && payload.chunks.length} sections
                    </span>
                  </div>
                  {payload.chunks && payload.chunks.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Script preview:
                      </div>
                      <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
                        {payload.chunks.slice(0, 5).map((chunk, i) => {
                          const raw = chunk as {
                            lines?: string[];
                            text?: string;
                            aid?: { blocks?: AidBlock[] };
                          };
                          const lines =
                            Array.isArray(raw.lines) && raw.lines.length > 0
                              ? raw.lines
                              : [raw.text ?? ""].filter(Boolean);
                          const translation =
                            raw.aid?.blocks?.find(
                              (b): b is { type: "translation"; text: string } =>
                                b.type === "translation",
                            )?.text ??
                            (chunk as { aid?: { translation?: string } }).aid
                              ?.translation ??
                            "";
                          return (
                            <div
                              key={i}
                              className="border-l-2 border-border pl-3"
                            >
                              <div className="whitespace-pre-line">
                                {lines.join("\n") || "(empty)"}
                              </div>
                              {translation ? (
                                <div className="text-xs text-muted-foreground mt-1">
                                  → {translation.slice(0, 60)}...
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                        {payload.chunks?.length &&
                          payload.chunks.length > 5 ? (
                            <div className="text-muted-foreground">
                              ... and {payload.chunks.length - 5} more
                            </div>
                          ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Fix JSON errors to see preview
                </p>
              )}
            </section>

            {/* 청크 재생 구간: 유튜브에서 해당 구간 재생 후 자동 정지 */}
            {payload?.chunks && payload.chunks.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="text-sm font-semibold mb-2">재생 구간 (유튜브)</div>
                <p className="text-xs text-muted-foreground mb-3">
                  각 대사 구간의 시작(초)·끝(초)을 넣으면 드라마 페이지에서 해당 구간만 재생 후 자동 정지됩니다.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payload.chunks.map((chunk, i) => {
                    const raw = chunk as { lines?: string[]; range?: { startMs?: number; endMs?: number } };
                    const startSec = raw.range?.startMs != null ? raw.range.startMs / 1000 : undefined;
                    const endSec = raw.range?.endMs != null ? raw.range.endMs / 1000 : undefined;
                    const firstLine = Array.isArray(raw.lines) && raw.lines[0] ? raw.lines[0].slice(0, 30) : `#${i + 1}`;
                    return (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-2 py-1.5 border-b border-border last:border-0 text-sm"
                      >
                        <span className="w-28 truncate text-muted-foreground" title={firstLine}>
                          {firstLine}
                          {firstLine.length >= 30 ? "…" : ""}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          placeholder="시작(초)"
                          className="w-20 px-1.5 py-0.5 rounded border border-border bg-background text-xs font-mono"
                          value={startSec !== undefined ? startSec : ""}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            const s = v === "" ? undefined : Number(v);
                            setChunkRange(i, Number.isFinite(s) ? s : undefined, endSec);
                          }}
                        />
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          placeholder="끝(초)"
                          className="w-20 px-1.5 py-0.5 rounded border border-border bg-background text-xs font-mono"
                          value={endSec !== undefined ? endSec : ""}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            const s = v === "" ? undefined : Number(v);
                            setChunkRange(i, startSec, Number.isFinite(s) ? s : undefined);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Lexicon: 발음 생성 */}
            {payload?.lexicon && payload.lexicon.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-semibold">Lexicon (발음)</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      ttsBatchInProgress ||
                      ttsLexId !== null ||
                      !(payload.lexicon as Lexeme[]).some(
                        (lex) => lex.form.trim() && !lex.audioUrl,
                      )
                    }
                    onClick={async () => {
                      const list = (payload.lexicon as Lexeme[]).filter(
                        (lex) => lex.form.trim() && !lex.audioUrl,
                      );
                      if (list.length === 0) {
                        alert("오디오가 비어 있는 항목이 없습니다.");
                        return;
                      }
                      setTtsBatchInProgress(true);
                      const updates: Record<string, string> = {};
                      try {
                        for (const lex of list) {
                          const res = await fetch("/api/admin/tts/word", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: lex.form.trim() }),
                          });
                          const j = await res.json().catch(() => null);
                          if (res.ok && j?.ok && j?.url) {
                            updates[lex.id] = String(j.url);
                          }
                        }
                        setLexemeAudioUrls(updates);
                        if (Object.keys(updates).length < list.length) {
                          alert(
                            `발음 ${Object.keys(updates).length}/${list.length}건 생성됨. 일부 실패.`,
                          );
                        } else {
                          alert(
                            `발음 ${Object.keys(updates).length}건 생성 완료.`,
                          );
                        }
                      } finally {
                        setTtsBatchInProgress(false);
                      }
                    }}
                  >
                    {ttsBatchInProgress ? "생성 중…" : "🎤 일괄 생성"}
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(payload.lexicon as Lexeme[]).map((lex) => (
                    <div
                      key={lex.id}
                      className="flex flex-wrap items-center gap-2 py-1.5 border-b border-border last:border-0 text-sm"
                    >
                      <span className="font-medium min-w-[80px]">
                        {lex.form}
                      </span>
                      <span
                        className="text-muted-foreground text-xs truncate max-w-[100px]"
                        title={lex.audioUrl || ""}
                      >
                        {lex.audioUrl ? "✓" : "—"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          !lex.form.trim() ||
                          ttsLexId !== null ||
                          ttsBatchInProgress
                        }
                        onClick={async () => {
                          const t = lex.form.trim();
                          if (!t) return;
                          setTtsLexId(lex.id);
                          try {
                            const res = await fetch("/api/admin/tts/word", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text: t }),
                            });
                            const j = await res.json().catch(() => null);
                            if (res.ok && j?.ok && j?.url) {
                              setLexemeAudioUrl(lex.id, String(j.url));
                            } else {
                              alert(j?.error ?? "발음 생성 실패");
                            }
                          } finally {
                            setTtsLexId(null);
                          }
                        }}
                      >
                        {ttsLexId === lex.id ? "…" : "발음"}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3">JSON Format</div>
              <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                {`{
  "title": "Episode 1 Scene",
  "artist": "Reply 1988",
  "slug": "reply-1988-ep1",
  "level": "B1",
  "source": { "provider": "youtube", "videoId": "VIDEO_ID" },
  "chunks": [
    {
      "id": "chunk_0",
      "index": 0,
      "lines": ["대사 내용"],
      "aid": {
        "blocks": [
          { "type": "translation", "text": "Translation" },
          { "type": "explanation", "text": "..." },
          { "type": "vocab", "lexemeIds": ["lex-1"] }
        ]
      }
    }
  ],
  "lexicon": [
    { "id": "lex-1", "form": "단어", "phonetic": "...", "senses": [{ "meaning": "meaning" }] }
  ]
}`}
              </pre>
            </section>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={
                  loading || !payload?.title.trim() || Boolean(parseError)
                }
                onClick={() => void save()}
              >
                {loading
                  ? isEdit
                    ? "Updating…"
                    : "Creating…"
                  : isEdit
                    ? "Update"
                    : "Create drama"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
