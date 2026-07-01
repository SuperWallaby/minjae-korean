import styles from "./vocab-quiz.module.css";
import { VOCAB_QUIZ_HEADER_LINES } from "@/lib/vocabQuiz/constants";

export function VocabQuizHeader() {
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
