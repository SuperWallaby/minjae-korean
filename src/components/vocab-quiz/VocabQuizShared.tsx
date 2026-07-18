import { VOCAB_QUIZ_HEADER_LINES } from "@/lib/vocabQuiz/constants";
import type { DifficultyTier } from "@/lib/koreanQuiz/types";

import styles from "./vocab-quiz.module.css";

export function DifficultyBadge({
  difficulty,
}: {
  difficulty?: DifficultyTier | string | null;
}) {
  const tier = String(difficulty || "").trim().toUpperCase();
  if (tier !== "A" && tier !== "B" && tier !== "C") return null;
  const level = tier === "A" ? "1" : tier === "B" ? "2" : "3";
  return (
    <span
      className={[
        styles.difficultyBadge,
        tier === "A"
          ? styles.difficultyBadgeA
          : tier === "B"
            ? styles.difficultyBadgeB
            : styles.difficultyBadgeC,
      ].join(" ")}
      aria-label={`Difficulty level ${level}`}
    >
      Level {level}
    </span>
  );
}

export function VocabQuizHeader({
  difficulty,
}: {
  difficulty?: DifficultyTier | string | null;
} = {}) {
  return (
    <div className={styles.headerBlock}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.headerLogo}
        src="/brand/logo.webp"
        alt=""
        width={44}
        height={44}
        decoding="async"
      />
      <div className={styles.headerLines}>
        <div className={styles.headerPrimary}>{VOCAB_QUIZ_HEADER_LINES[0]}</div>
        <div className={styles.headerSecondary}>{VOCAB_QUIZ_HEADER_LINES[1]}</div>
      </div>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
}

export function VocabQuizImage({
  imageUrl,
  alt,
  illustrationEnglish,
}: {
  imageUrl?: string;
  alt: string;
  illustrationEnglish?: string;
}) {
  if (!imageUrl) return null;
  const english = illustrationEnglish?.trim();
  return (
    <div className={styles.imageFrame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.image} src={imageUrl} alt={alt} />
      {english ? (
        <p className={styles.illustrationEnglishInFrame}>{english}</p>
      ) : null}
    </div>
  );
}

/** @deprecated Use illustrationEnglish on VocabQuizImage */
export function VocabQuizIllustrationEnglish({
  text,
}: {
  text?: string;
}) {
  if (!text) return null;
  return <p className={styles.illustrationEnglishInFrame}>{text}</p>;
}
