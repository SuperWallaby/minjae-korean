"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Flag, FlagOff } from "lucide-react";

import styles from "@/components/vocab-quiz/vocab-quiz.module.css";
import { useQuizReviewFlags } from "@/hooks/useQuizReviewFlags";
import { getOrCreateDeviceId } from "@/lib/vocabQuiz/device";

const ADMIN_URL =
  process.env.NEXT_PUBLIC_KOREAN_QUIZ_ADMIN_URL?.trim() ||
  "http://localhost:3000/admin/korean-quiz";

export function VocabQuizReviewClient() {
  const deviceIdRef = React.useRef<string | null>(null);
  if (!deviceIdRef.current) deviceIdRef.current = getOrCreateDeviceId();
  const deviceId = deviceIdRef.current;

  const { items, loading, setFlag, refresh } = useQuizReviewFlags(deviceId);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const unflag = async (quizId: string) => {
    setBusyId(quizId);
    await setFlag(quizId, false);
    setBusyId(null);
  };

  return (
    <div className={styles.vocabQuizRoot}>
      <div className={styles.toolbar}>
        <Link href="/vocab-quiz" className={styles.reviewBackLink}>
          <ArrowLeft size={16} aria-hidden />
          Back to quiz
        </Link>
        <button
          type="button"
          className={styles.modeBtn}
          onClick={() => void refresh()}
        >
          Refresh
        </button>
      </div>

      <div className={styles.reviewPage}>
        <h1 className={styles.reviewTitle}>Flagged for review</h1>
        <p className={styles.reviewHint}>
          Marked while playing Vocab Quiz. Edit content in{" "}
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewAdminLink}
          >
            korean-quiz admin
          </a>
          — same MongoDB, so changes show up here right away.
        </p>

        {loading ? (
          <p className={styles.emptyState}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.emptyState}>
            No flagged quizzes yet. Use the flag button while playing.
          </p>
        ) : (
          <ul className={styles.reviewList}>
            {items.map((item) => (
              <li key={item.id} className={styles.reviewCard}>
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
                    {item.topic ? `${item.topic} · ` : ""}
                    {new Date(item.flaggedAt).toLocaleString()}
                  </p>
                  <p className={styles.reviewId}>
                    <code>{item.id}</code>
                  </p>
                  <div className={styles.reviewCardActions}>
                    <button
                      type="button"
                      className={styles.modeBtn}
                      disabled={busyId === item.id}
                      onClick={() => void unflag(item.id)}
                    >
                      <FlagOff size={14} aria-hidden />
                      Unflag
                    </button>
                    <a
                      href={ADMIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.modeBtn}
                    >
                      Open admin
                    </a>
                  </div>
                </div>
                <Flag
                  size={18}
                  className={styles.reviewCardFlagIcon}
                  aria-hidden
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
