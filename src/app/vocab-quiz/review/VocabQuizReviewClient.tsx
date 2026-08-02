"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft } from "lucide-react";

import styles from "@/components/vocab-quiz/vocab-quiz.module.css";
import type { KoreanQuizHistoryItem } from "@/lib/koreanQuiz/types";
import { getOrCreateDeviceId } from "@/lib/vocabQuiz/device";

async function fetchHistory(deviceId: string): Promise<KoreanQuizHistoryItem[]> {
  const res = await fetch("/api/vocab-quiz/history?limit=40", {
    headers: { "X-Device-Id": deviceId },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json
        ? String((json as { error?: unknown }).error ?? "")
        : `HTTP ${res.status}`;
    throw new Error(msg || "Failed to load history");
  }
  const items = (json as { items?: KoreanQuizHistoryItem[] }).items;
  return Array.isArray(items) ? items : [];
}

export function VocabQuizReviewClient() {
  const deviceIdRef = React.useRef<string | null>(null);
  if (!deviceIdRef.current) deviceIdRef.current = getOrCreateDeviceId();
  const deviceId = deviceIdRef.current;

  const [items, setItems] = React.useState<KoreanQuizHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchHistory(deviceId));
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "Couldn’t load history.");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className={styles.vocabQuizRoot}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarScroll}>
          <div className={styles.toolbarGroup}>
            <Link href="/" className={styles.reviewBackLink}>
              Home
            </Link>
            <Link href="/vocab-quiz" className={styles.reviewBackLink}>
              <ArrowLeft size={16} aria-hidden />
              Back to quiz
            </Link>
          </div>
          <button
            type="button"
            className={styles.modeBtn}
            onClick={() => void refresh()}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.reviewPage}>
        <h1 className={styles.reviewTitle}>Your quizzes</h1>
        <p className={styles.reviewHint}>
          Words you’ve practiced in Vocab Quiz on this device. Tap a card to
          remember the answer.
        </p>

        {loading ? (
          <p className={styles.emptyState}>Loading…</p>
        ) : error ? (
          <p className={styles.errorState}>{error}</p>
        ) : items.length === 0 ? (
          <p className={styles.emptyState}>
            No solved quizzes yet. Play a few cards, then come back here.
          </p>
        ) : (
          <ul className={styles.reviewList}>
            {items.map((item) => (
              <li key={`${item.id}-${item.attemptedAt}`} className={styles.reviewCard}>
                <div className={styles.reviewThumb}>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" />
                  ) : (
                    <div className={styles.reviewThumbEmpty}>No image</div>
                  )}
                </div>
                <div className={styles.reviewCardBody}>
                  <p className={styles.reviewAnswer}>{item.correctLabel}</p>
                  {item.correctEnglish ? (
                    <p className={styles.reviewEnglish}>{item.correctEnglish}</p>
                  ) : null}
                  <p className={styles.reviewMeta}>
                    <span
                      className={
                        item.correct
                          ? styles.reviewOutcomeOk
                          : styles.reviewOutcomeBad
                      }
                    >
                      {item.correct ? "Correct" : "Missed"}
                    </span>
                    {item.topic ? ` · ${item.topic}` : ""}
                    {" · "}
                    {new Date(item.attemptedAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
