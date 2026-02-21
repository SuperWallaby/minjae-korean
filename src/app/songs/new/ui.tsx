"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";

type VocabItem = {
  word: string;
  meaning: string;
  note?: string;
};

type ChunkAid = {
  translation: string;
  explanation: string;
  vocab: VocabItem[];
};

type SongChunk = {
  id: string;
  index: number;
  text: string;
  aid: ChunkAid;
};

type SongSource = {
  provider: string;
  videoId: string;
};

type SongPayload = {
  title: string;
  artist: string;
  slug?: string;
  level: string;
  language?: string;
  tags?: string[];
  source?: SongSource;
  imageThumb?: string;
  imageLarge?: string;
  chunks: SongChunk[];
  createdAt?: string;
};

const DEFAULT_PAYLOAD: SongPayload = {
  title: "Song Title",
  artist: "Artist Name",
  slug: "song-title-artist",
  level: "B1",
  language: "ko",
  tags: ["emotion"],
  source: { provider: "youtube", videoId: "" },
  chunks: [
    {
      id: "chunk_0",
      index: 0,
      text: "가사 첫줄",
      aid: {
        translation: "First line translation",
        explanation: "Explanation of the lyrics",
        vocab: [
          { word: "가사", meaning: "lyrics", note: "noun" }
        ]
      }
    }
  ],
};

function normalizePayload(parsed: unknown): SongPayload | null {
  const o = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  if (!o.title) return null;
  
  return {
    title: typeof o.title === "string" ? o.title : "",
    artist: typeof o.artist === "string" ? o.artist : "",
    slug: typeof o.slug === "string" ? o.slug : undefined,
    level: typeof o.level === "string" ? o.level : "A1",
    language: typeof o.language === "string" ? o.language : undefined,
    tags: Array.isArray(o.tags) ? o.tags.map(String) : undefined,
    source: o.source && typeof o.source === "object" ? o.source as SongSource : undefined,
    imageThumb: typeof o.imageThumb === "string" ? o.imageThumb : undefined,
    imageLarge: typeof o.imageLarge === "string" ? o.imageLarge : undefined,
    chunks: Array.isArray(o.chunks) ? o.chunks as SongChunk[] : [],
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

export function SongNewClient() {
  const router = useRouter();
  const [text, setText] = React.useState(() => JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [error, setError] = React.useState<string | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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

  const create = React.useCallback(async () => {
    if (!payload || !payload.title.trim()) {
      setError("Title is required");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const { res, json } = await postJson("/api/admin/songs", payload);
      if (!res.ok || !json?.ok || !json?.data?.song?.slug) {
        throw new Error(String(json?.error ?? "Create failed"));
      }
      const slug = String(json.data.song.slug);
      router.push(`/songs/${encodeURIComponent(slug)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setLoading(false);
    }
  }, [payload, loading, router]);

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Dev admin</div>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              New song
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/songs">Back</Link>
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
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

          {/* Preview */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-4">Preview</div>
              {payload ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{payload.title || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Artist:</span>{" "}
                    <span>{payload.artist || "(empty)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level:</span>{" "}
                    <span>{payload.level}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Video ID:</span>{" "}
                    <span className="font-mono text-xs">{payload.source?.videoId || "(none)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chunks:</span>{" "}
                    <span>{payload.chunks.length} sections</span>
                  </div>
                  {payload.chunks.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="text-xs text-muted-foreground mb-2">Lyrics preview:</div>
                      <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
                        {payload.chunks.slice(0, 5).map((chunk, i) => (
                          <div key={i} className="border-l-2 border-border pl-3">
                            <div className="whitespace-pre-line">{chunk.text}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              → {chunk.aid?.translation?.slice(0, 60)}...
                            </div>
                          </div>
                        ))}
                        {payload.chunks.length > 5 && (
                          <div className="text-muted-foreground">
                            ... and {payload.chunks.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Fix JSON errors to see preview</p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold mb-3">JSON Format</div>
              <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-3 overflow-x-auto whitespace-pre-wrap">
{`{
  "title": "Spring Day",
  "artist": "BTS",
  "slug": "bts-spring-day",
  "level": "B1",
  "source": { "provider": "youtube", "videoId": "H2HQWHKDREI" },
  "chunks": [
    {
      "id": "chunk_0",
      "index": 0,
      "text": "보고 싶다",
      "aid": {
        "translation": "I miss you",
        "explanation": "...",
        "vocab": [
          { "word": "보고 싶다", "meaning": "to miss" }
        ]
      }
    }
  ]
}`}
              </pre>
            </section>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={loading || !payload?.title.trim() || Boolean(parseError)}
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
