"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { LayoutGrid, Layers } from "lucide-react";

import { VocabQuizInteractiveStack } from "@/components/site/VocabQuizInteractiveStack";
import type { KoreanQuizHomeCard } from "@/lib/koreanQuiz/store";

import styles from "./flashcard-gallery.module.css";

type ViewMode = "grid" | "deck";

type Props = {
  cards: KoreanQuizHomeCard[];
  columns?: 3 | 4 | 5;
  title?: string;
};

function FlashcardTile({
  card,
  revealed,
  index,
  onToggle,
}: {
  card: KoreanQuizHomeCard;
  revealed: boolean;
  index: number;
  onToggle: () => void;
}) {
  const english = card.illustrationEnglish?.trim();
  const tilt = index % 3 === 0 ? -1.2 : index % 3 === 1 ? 0.6 : -0.4;

  return (
    <button
      type="button"
      className={styles.cardButton}
      onClick={onToggle}
      aria-label={revealed ? "Hide answer" : "Reveal Korean word"}
      aria-pressed={revealed}
    >
      <article
        className={styles.card}
        style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      >
        <div className={`${styles.cardInner} ${revealed ? styles.cardRevealed : ""}`}>
          <div className={styles.visual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.image}
              src={card.imageUrl}
              alt=""
              loading="eager"
              decoding="async"
            />
            {english ? <p className={styles.english}>{english}</p> : null}
          </div>
          {revealed ? (
            <div className={styles.answer}>
              <span className={styles.korean}>{card.label}</span>
              {card.romanization ? (
                <span className={styles.romanization}>{card.romanization}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </button>
  );
}

export function FlashcardsClient({
  cards,
  columns = 4,
  title,
}: Props) {
  const [view, setView] = React.useState<ViewMode>("grid");
  const [revealedIds, setRevealedIds] = React.useState<Set<string>>(() => new Set());

  const toggleReveal = React.useCallback((id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (cards.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No flashcards available yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        {title ? <h1 className={styles.titleInline}>{title}</h1> : <span />}
        <div className={styles.toolbarActions}>
          {view === "grid" ? (
            <button
              type="button"
              className={styles.viewButton}
              onClick={() => setView("deck")}
            >
              <Layers className={styles.viewButtonIcon} aria-hidden />
              덱으로 보기
            </button>
          ) : (
            <button
              type="button"
              className={styles.viewButton}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className={styles.viewButtonIcon} aria-hidden />
              그리드로 보기
            </button>
          )}
        </div>
      </header>

      {view === "deck" ? (
        <div className={styles.deckWrap}>
          <VocabQuizInteractiveStack cards={cards} />
        </div>
      ) : (
        <div className={styles.shell} data-cols={columns}>
          <div className={styles.grid}>
            {cards.map((card, index) => (
              <FlashcardTile
                key={card.id}
                card={card}
                index={index}
                revealed={revealedIds.has(card.id)}
                onToggle={() => toggleReveal(card.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
