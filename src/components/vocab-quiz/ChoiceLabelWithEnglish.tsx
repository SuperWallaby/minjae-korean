"use client";

import * as React from "react";

import styles from "./vocab-quiz.module.css";

type Props = {
  label: string;
  english?: string;
};

/** Korean stays centered; English trails to the right without shifting layout (app-style). */
export function ChoiceLabelWithEnglish({ label, english }: Props) {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [englishLeft, setEnglishLeft] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const gloss = english?.trim();
    const labelEl = labelRef.current;
    if (!gloss || !labelEl) {
      setEnglishLeft(null);
      return;
    }
    const container = labelEl.parentElement;
    if (!container) return;
    const centerX = container.clientWidth / 2;
    const labelWidth = labelEl.offsetWidth;
    setEnglishLeft(centerX + labelWidth / 2 + 8);
  }, [label, english]);

  const gloss = english?.trim();

  return (
    <div className={styles.choiceContentMeasure}>
      <span ref={labelRef} className={styles.choiceLabel}>
        {label}
      </span>
      {gloss && englishLeft != null ? (
        <span className={styles.choiceEnglishTrail} style={{ left: englishLeft }}>
          {gloss}
        </span>
      ) : null}
    </div>
  );
}
