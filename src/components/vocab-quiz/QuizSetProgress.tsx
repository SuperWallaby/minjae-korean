import styles from "./vocab-quiz.module.css";

type Props = {
  current: number;
  total?: number;
};

/** App-style 7-question set progress (linear bar + N/7). */
export function QuizSetProgress({ current, total = 7 }: Props) {
  const safeTotal = total > 0 ? total : 7;
  const safeCurrent = Math.min(safeTotal, Math.max(1, current));
  const pct = (safeCurrent / safeTotal) * 100;

  return (
    <div
      className={styles.setProgress}
      aria-label={`Question ${safeCurrent} of ${safeTotal}`}
    >
      <div className={styles.setProgressTrack}>
        <div
          className={styles.setProgressFill}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.setProgressLabel}>
        {safeCurrent}/{safeTotal}
      </span>
    </div>
  );
}
