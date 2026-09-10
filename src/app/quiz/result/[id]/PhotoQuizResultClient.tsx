"use client";

import * as React from "react";
import Link from "next/link";

import type { PhotoQuizResult } from "@/lib/photoQuizCatalog";
import styles from "./photo-quiz-result.module.css";

type Props = {
  quiz: PhotoQuizResult;
};

export function PhotoQuizResultClient({ quiz }: Props) {
  const [picked, setPicked] = React.useState<number | null>(null);
  const revealed = picked != null;
  const correctIdx = quiz.correct ?? 0;
  const isCorrect = picked === correctIdx;

  return (
    <div className={styles.quizCard}>
      <p className={styles.eyebrow}>
        Korean quiz · Level {quiz.level ?? quiz.difficulty ?? "—"}
      </p>
      <h1 className={styles.title}>Fill in the blank</h1>
      <p className={styles.sentence}>{quiz.sentence}</p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.cover}
        src={quiz.imageUrl}
        alt=""
        width={720}
        height={960}
        loading="eager"
        decoding="async"
      />

      <div className={styles.choices} role="group" aria-label="Answer choices">
        {(quiz.choices ?? []).map((choice, i) => {
          const selected = picked === i;
          const showCorrect = revealed && i === correctIdx;
          const showWrong = revealed && selected && i !== correctIdx;
          return (
            <button
              key={`${quiz.id}-${i}`}
              type="button"
              className={[
                styles.choice,
                selected ? styles.choiceSelected : "",
                showCorrect ? styles.choiceCorrect : "",
                showWrong ? styles.choiceWrong : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={revealed}
              onClick={() => setPicked(i)}
            >
              <span className={styles.choiceNum}>{i + 1}</span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className={styles.reveal} role="status">
          <p className={styles.revealVerdict}>
            {isCorrect ? "Nice — that’s it." : "Not that one."}
          </p>
          <p className={styles.revealAnswer}>
            Answer: <strong>{quiz.choices?.[correctIdx]}</strong>
            {quiz.korean && quiz.korean !== quiz.choices?.[correctIdx]
              ? ` (${quiz.korean})`
              : ""}
          </p>
          {quiz.sceneMeaning ? (
            <p className={styles.revealHint}>{quiz.sceneMeaning}</p>
          ) : null}
          <div className={styles.revealActions}>
            <Link className={styles.primaryCta} href="/vocab-quiz">
              More quizzes
            </Link>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={() => setPicked(null)}
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.hint}>Tap an answer — no account needed.</p>
      )}
    </div>
  );
}
