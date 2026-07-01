"use client";

import * as React from "react";

import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";
import { getOrCreateDeviceId } from "@/lib/vocabQuiz/device";

const REFILL_THRESHOLD = 8;

async function fetchQueue(deviceId: string): Promise<KoreanQuizPrepared[]> {
  const res = await fetch("/api/vocab-quiz/queue", {
    headers: { "X-Device-Id": deviceId },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json
        ? String((json as { error?: unknown }).error ?? "")
        : `HTTP ${res.status}`;
    throw new Error(msg || "Failed to load queue");
  }
  const quizzes = (json as { quizzes?: KoreanQuizPrepared[] }).quizzes;
  return Array.isArray(quizzes) ? quizzes : [];
}

export function useVocabQuizQueue() {
  const deviceIdRef = React.useRef<string | null>(null);
  const [queue, setQueue] = React.useState<KoreanQuizPrepared[]>([]);
  const [current, setCurrent] = React.useState<KoreanQuizPrepared | null>(null);
  const [history, setHistory] = React.useState<KoreanQuizPrepared[]>([]);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const HISTORY_CAP = 30;

  const deviceId = React.useMemo(() => {
    if (deviceIdRef.current) return deviceIdRef.current;
    const id = getOrCreateDeviceId();
    deviceIdRef.current = id;
    return id;
  }, []);

  const applyQueue = React.useCallback((quizzes: KoreanQuizPrepared[]) => {
    setQueue(quizzes);
    setCurrent(quizzes[0] ?? null);
  }, []);

  const syncQueue = React.useCallback(
    async (showBlocking: boolean) => {
      if (showBlocking) {
        setBootstrapping(true);
        setError(null);
      }
      try {
        const quizzes = await fetchQueue(deviceId);
        if (quizzes.length > 0) applyQueue(quizzes);
        else if (showBlocking) setError("No approved quizzes available yet.");
      } catch (e) {
        if (showBlocking) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (showBlocking) setBootstrapping(false);
      }
    },
    [applyQueue, deviceId],
  );

  const topOffQueue = React.useCallback(async () => {
    try {
      const quizzes = await fetchQueue(deviceId);
      if (quizzes.length === 0) return;
      setQueue((prev) => {
        const known = new Set(prev.map((q) => q.id));
        const additions = quizzes.filter((q) => !known.has(q.id));
        if (additions.length === 0) return prev;
        return [...prev, ...additions];
      });
    } catch {
      // keep local queue
    }
  }, [deviceId]);

  React.useEffect(() => {
    void syncQueue(true);
  }, [syncQueue]);

  const advance = React.useCallback(() => {
    setQueue((prev) => {
      const [head, ...rest] = prev;
      if (head) {
        setHistory((h) => [...h, head].slice(-HISTORY_CAP));
      }
      setCurrent(rest[0] ?? null);
      if (rest.length < REFILL_THRESHOLD) void topOffQueue();
      if (rest.length === 0) void syncQueue(false);
      return rest;
    });
  }, [syncQueue, topOffQueue]);

  const goBack = React.useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const prev = prevHistory[prevHistory.length - 1];
      setQueue((q) => {
        const currentHead = q[0] ?? null;
        const rest = q.slice(1);
        const merged: KoreanQuizPrepared[] = [prev];
        if (currentHead && currentHead.id !== prev.id) {
          merged.push(currentHead);
        }
        for (const item of rest) {
          if (
            item.id !== prev.id &&
            !merged.some((row) => row.id === item.id)
          ) {
            merged.push(item);
          }
        }
        setCurrent(prev);
        return merged;
      });
      return prevHistory.slice(0, -1);
    });
  }, []);

  const prefetchAssets = React.useCallback((quizzes: KoreanQuizPrepared[]) => {
    for (const quiz of quizzes.slice(0, 6)) {
      if (quiz.imageUrl) {
        const img = new Image();
        img.src = quiz.imageUrl;
      }
    }
  }, []);

  React.useEffect(() => {
    if (queue.length > 0) prefetchAssets(queue);
  }, [queue, prefetchAssets]);

  return {
    deviceId,
    queue,
    current,
    history,
    bootstrapping,
    error,
    advance,
    goBack,
    resync: () => syncQueue(true),
  };
}

export async function postAttempt(args: {
  deviceId: string;
  quizId: string;
  choiceId: string;
  elapsedMs: number;
}) {
  await fetch("/api/vocab-quiz/attempt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": args.deviceId,
    },
    body: JSON.stringify({
      quizId: args.quizId,
      choiceId: args.choiceId,
      elapsedMs: args.elapsedMs,
    }),
  });
}

export async function postConsume(args: { deviceId: string; quizId: string }) {
  await fetch("/api/vocab-quiz/consume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": args.deviceId,
    },
    body: JSON.stringify({ quizId: args.quizId }),
  });
}
