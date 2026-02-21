"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_VISITED = "fundamental-visited-ids";
const STORAGE_PROGRESS = "fundamental-progress";
const STORAGE_LAST = "fundamental-last-visited-id";

function getStored<T>(key: string, parse: (raw: string) => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getVisitedIds(): string[] {
  return getStored(STORAGE_VISITED, (raw) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x: unknown) => typeof x === "string") : [];
  }, []);
}

function getProgressMap(): Record<string, number> {
  return getStored(STORAGE_PROGRESS, (raw) => {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  }, {});
}

function getLastVisitedId(): string | null {
  return getStored(STORAGE_LAST, (raw) => raw || null, null);
}

export function useFundamentalProgress() {
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [lastVisitedId, setLastVisitedId] = useState<string | null>(null);

  useEffect(() => {
    setVisitedIds(getVisitedIds());
    setProgressMap(getProgressMap());
    setLastVisitedId(getLastVisitedId());
  }, []);

  const markVisited = useCallback((id: string, progressPercent = 100) => {
    setVisitedIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem(STORAGE_VISITED, JSON.stringify(next));
        localStorage.setItem(STORAGE_LAST, id);
      } catch {}
      return next;
    });
    setProgressMap((prev) => {
      const next = { ...prev, [id]: Math.min(100, Math.max(0, progressPercent)) };
      try {
        localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(next));
      } catch {}
      return next;
    });
    setLastVisitedId(id);
  }, []);

  const isVisited = useCallback(
    (id: string) => visitedIds.includes(id),
    [visitedIds],
  );

  const getProgress = useCallback(
    (id: string) => progressMap[id] ?? 0,
    [progressMap],
  );

  const progressInSection = useCallback(
    (chapterIds: string[]) => {
      if (chapterIds.length === 0) return 0;
      const total = chapterIds.reduce((sum, id) => sum + (progressMap[id] ?? 0), 0);
      return Math.round(total / chapterIds.length);
    },
    [progressMap],
  );

  return {
    visitedIds,
    progressMap,
    lastVisitedId,
    markVisited,
    isVisited,
    getProgress,
    progressInSection,
  };
}
