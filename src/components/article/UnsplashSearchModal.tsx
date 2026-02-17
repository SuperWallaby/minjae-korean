"use client";

import * as React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type UnsplashResult = { id: string; url: string; thumb: string };

export function UnsplashSearchModal({
  open,
  onClose,
  defaultQuery = "",
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  defaultQuery?: string;
  onSelect: (url: string) => void;
}) {
  const [query, setQuery] = React.useState(defaultQuery);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<UnsplashResult[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setQuery(defaultQuery);
  }, [open, defaultQuery]);

  const search = React.useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/unsplash/search?q=${encodeURIComponent(q)}`,
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Search failed");
        setResults([]);
        return;
      }
      setResults(json.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search Unsplash"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b border-border p-4">
          <h3 className="font-semibold">Search Unsplash</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex gap-2 p-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search query (e.g. word)"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={search}
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
        {error ? (
          <div className="px-4 pb-4 text-sm text-destructive">{error}</div>
        ) : null}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/20 outline-none transition hover:ring-2 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => handleSelect(r.url)}
              >
                <Image
                  src={r.thumb || r.url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="160px"
                />
              </button>
            ))}
          </div>
          {!loading && results.length === 0 && query.trim() ? (
            <p className="text-sm text-muted-foreground">
              No results. Try another query.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
