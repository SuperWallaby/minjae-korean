"use client";

import * as React from "react";

import type { KoreanQuizFlaggedItem } from "@/lib/koreanQuiz/types";

async function fetchFlags(deviceId: string): Promise<KoreanQuizFlaggedItem[]> {
  const res = await fetch("/api/vocab-quiz/flags", {
    headers: { "X-Device-Id": deviceId },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json
        ? String((json as { error?: unknown }).error ?? "")
        : `HTTP ${res.status}`;
    throw new Error(msg || "Failed to load flags");
  }
  const items = (json as { items?: KoreanQuizFlaggedItem[] }).items;
  return Array.isArray(items) ? items : [];
}

export function useQuizReviewFlags(deviceId: string) {
  const [flaggedIds, setFlaggedIds] = React.useState<Set<string>>(() => new Set());
  const [items, setItems] = React.useState<KoreanQuizFlaggedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchFlags(deviceId);
      setItems(next);
      setFlaggedIds(new Set(next.map((item) => item.id)));
    } catch {
      setItems([]);
      setFlaggedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const setFlag = React.useCallback(
    async (quizId: string, flagged: boolean) => {
      const res = await fetch("/api/vocab-quiz/flags", {
        method: flagged ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify({ quizId, flagged }),
      });
      if (!res.ok) return false;
      setFlaggedIds((prev) => {
        const next = new Set(prev);
        if (flagged) next.add(quizId);
        else next.delete(quizId);
        return next;
      });
      void refresh();
      return true;
    },
    [deviceId, refresh],
  );

  const toggleFlag = React.useCallback(
    async (quizId: string) => {
      const flagged = !flaggedIds.has(quizId);
      return setFlag(quizId, flagged);
    },
    [flaggedIds, setFlag],
  );

  return {
    flaggedIds,
    items,
    loading,
    count: flaggedIds.size,
    refresh,
    setFlag,
    toggleFlag,
    isFlagged: (quizId: string) => flaggedIds.has(quizId),
  };
}
