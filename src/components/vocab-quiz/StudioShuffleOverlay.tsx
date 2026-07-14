"use client";

import * as React from "react";

import styles from "./vocab-quiz.module.css";

const CARD_COUNT = 7;
const FLIP_MS = 340;
const SHUFFLE_START_MS = 380;

type Props = {
  /** Top card image shown before the flip. */
  topImage?: string;
  /** Extra face images used after the deck turns over. */
  images?: string[];
};

function PatternBack() {
  return <div className={styles.studioShufflePatternBack} aria-hidden />;
}

export function StudioShuffleOverlay({ topImage, images = [] }: Props) {
  const [phase, setPhase] = React.useState<"flip" | "shuffle">("flip");

  React.useEffect(() => {
    const flipTimer = window.setTimeout(() => setPhase("shuffle"), SHUFFLE_START_MS);
    return () => window.clearTimeout(flipTimer);
  }, []);

  const cards = React.useMemo(() => {
    const list: Array<{ key: string; src?: string }> = [];
    const pool = images.filter(Boolean);
    for (let i = 0; i < CARD_COUNT; i++) {
      list.push({
        key: `shuffle-${i}`,
        src: pool.length > 0 ? pool[i % pool.length] : undefined,
      });
    }
    return list;
  }, [images]);

  return (
    <div
      className={styles.studioShuffleStage}
      aria-live="polite"
      aria-busy="true"
      data-phase={phase}
    >
      <div className={styles.studioShuffleGlow} aria-hidden />
      <header className={styles.studioHeader}>
        <h1 className={styles.studioTitle}>
          What is this in <span className={styles.studioTitleAccent}>Korean</span>?
        </h1>
      </header>

      <div className={styles.studioShuffleArena} aria-hidden>
        {phase === "flip" ? (
          <div
            className={styles.studioShuffleFlipScene}
            style={{ "--flip-ms": `${FLIP_MS}ms` } as React.CSSProperties}
          >
            <div className={styles.studioShuffleFlipInner}>
              <div className={`${styles.studioShuffleFlipFace} ${styles.studioShuffleFlipFront}`}>
                {topImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.studioShuffleCardImage}
                    src={topImage}
                    alt=""
                    draggable={false}
                  />
                ) : (
                  <div className={styles.studioShuffleCardBlank} />
                )}
              </div>
              <div className={`${styles.studioShuffleFlipFace} ${styles.studioShuffleFlipBack}`}>
                <PatternBack />
              </div>
            </div>
          </div>
        ) : (
          cards.map((card, index) => (
            <div
              key={card.key}
              className={styles.studioShuffleCard}
              style={
                {
                  "--shuffle-i": index,
                  "--shuffle-n": CARD_COUNT,
                } as React.CSSProperties
              }
            >
              <div className={styles.studioShuffleCardInner}>
                <PatternBack />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
