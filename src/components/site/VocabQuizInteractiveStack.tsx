"use client";

import * as React from "react";

import type { KoreanQuizHomeCard } from "@/lib/koreanQuiz/store";
import { VOCAB_QUIZ_SFX } from "@/lib/vocabQuiz/constants";

import styles from "./vocab-quiz-home.module.css";

const REVEAL_ANIM_MS = 420;
const REVEAL_HOLD_MS = 1100;
const EXIT_MS = 400;

type Phase = "idle" | "revealed" | "exiting";

type Props = {
  cards: KoreanQuizHomeCard[];
  hero?: boolean;
};

const FALLBACK: KoreanQuizHomeCard[] = [
  {
    id: "fallback",
    imageUrl: "/vocab-quiz/home-sample.webp",
    label: "사과",
    illustrationEnglish: "apple",
    romanization: "[ sa-gwa ]",
  },
];

const TTS_AFTER_CLICK_MS = 120;

function playSfx(url: string, volume = 0.55) {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    void audio.play().catch(() => undefined);
  } catch {
    // ignore
  }
}

function prefetchAudio(url: string) {
  try {
    const audio = new Audio(url);
    audio.preload = "auto";
  } catch {
    // ignore
  }
}

function CardFace({
  card,
  revealed,
}: {
  card: KoreanQuizHomeCard;
  revealed?: boolean;
}) {
  const english = card.illustrationEnglish?.trim();
  return (
    <div className={`${styles.cardInner} ${revealed ? styles.cardInnerRevealed : ""}`}>
      <div className={styles.cardMain}>
        <div className={styles.cardVisual}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.cardStackImage}
            src={card.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {english ? (
            <p className={styles.cardIllustrationEnglish}>{english}</p>
          ) : null}
        </div>
      </div>
      <div className={styles.cardAnswerPanel} aria-hidden={!revealed}>
        <span className={styles.cardAnswer}>{card.label}</span>
        {card.romanization ? (
          <span className={styles.cardRomanization}>{card.romanization}</span>
        ) : null}
      </div>
    </div>
  );
}

export function VocabQuizInteractiveStack({ cards, hero = false }: Props) {
  const deck = cards.length > 0 ? cards : FALLBACK;
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  /** Frozen top card while it flies away — keeps DOM/image from swapping mid-animation. */
  const [exitingCard, setExitingCard] = React.useState<KoreanQuizHomeCard | null>(
    null,
  );
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const advancingRef = React.useRef(false);

  const top = deck[index % deck.length];
  const mid = deck[(index + 1) % deck.length];
  const bot = deck[(index + 2) % deck.length];
  const topRef = React.useRef(top);
  topRef.current = top;

  const stopWordTts = React.useCallback(() => {
    if (ttsTimerRef.current) {
      clearTimeout(ttsTimerRef.current);
      ttsTimerRef.current = null;
    }
    const audio = wordAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      wordAudioRef.current = null;
    }
  }, []);

  const playWordTts = React.useCallback((url: string) => {
    stopWordTts();
    try {
      const audio = new Audio(url);
      audio.volume = 0.92;
      wordAudioRef.current = audio;
      void audio.play().catch(() => undefined);
    } catch {
      // ignore
    }
  }, [stopWordTts]);

  const promoting = exitingCard !== null;

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = React.useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    clearTimer();
    stopWordTts();
    playSfx(VOCAB_QUIZ_SFX.next, 0.5);
    setExitingCard(topRef.current);
    setPhase("exiting");
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % deck.length);
      setExitingCard(null);
      setPhase("idle");
      advancingRef.current = false;
    }, EXIT_MS);
  }, [clearTimer, deck.length, stopWordTts]);

  const handleTap = () => {
    if (phase === "exiting") return;
    if (phase === "idle") {
      playSfx(VOCAB_QUIZ_SFX.click, 0.45);
      const ttsUrl = topRef.current.answerTtsUrl;
      if (ttsUrl) {
        ttsTimerRef.current = setTimeout(() => {
          playWordTts(ttsUrl);
          ttsTimerRef.current = null;
        }, TTS_AFTER_CLICK_MS);
      }
      setPhase("revealed");
      timerRef.current = setTimeout(
        advance,
        REVEAL_ANIM_MS + REVEAL_HOLD_MS,
      );
      return;
    }
    advance();
  };

  React.useEffect(() => {
    for (const card of [top, mid, bot]) {
      if (card.answerTtsUrl) prefetchAudio(card.answerTtsUrl);
    }
  }, [top, mid, bot]);

  React.useEffect(
    () => () => {
      clearTimer();
      stopWordTts();
    },
    [clearTimer, stopWordTts],
  );

  const hint =
    phase === "idle" && !promoting
      ? "Tap the card"
      : phase === "revealed"
        ? "Tap again to continue"
        : "";

  const stackClass = [
    styles.cardStack,
    promoting ? styles.cardStackPromoting : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[
        styles.stackInteractiveWrap,
        hero ? styles.stackInteractiveWrapHero : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={styles.cardStackButton}
        onClick={handleTap}
        disabled={promoting}
        aria-label={
          phase === "idle"
            ? "Tap to reveal the Korean word"
            : "Continue to next card"
        }
      >
        <div className={stackClass}>
          <div
            className={styles.cardStackItem}
            data-depth={2}
            data-layer="bot"
          >
            <CardFace card={bot} />
          </div>

          <div
            className={styles.cardStackItem}
            data-depth={1}
            data-layer="mid"
          >
            <CardFace card={mid} />
          </div>

          {!promoting ? (
            <div
              className={[
                styles.cardStackItem,
                styles.cardTop,
                phase === "revealed" ? styles.cardTopRevealed : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-depth={0}
              data-layer="top"
            >
              <CardFace card={top} revealed={phase === "revealed"} />
            </div>
          ) : null}

          {exitingCard ? (
            <div
              className={`${styles.cardStackItem} ${styles.cardTop} ${styles.cardTopRevealed} ${styles.cardStackItemExiting}`}
              data-layer="exit"
              aria-hidden
            >
              <CardFace card={exitingCard} revealed />
            </div>
          ) : null}
        </div>
      </button>
      <p
        className={
          hero
            ? `${styles.stackTapHint} ${styles.stackTapHintHero}`
            : styles.stackTapHint
        }
        aria-live="polite"
      >
        {hint}
      </p>
    </div>
  );
}
