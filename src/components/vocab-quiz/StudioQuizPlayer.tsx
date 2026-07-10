"use client";

import * as React from "react";

import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";
import { shuffle } from "@/lib/koreanQuiz/shuffle";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import { VOCAB_QUIZ_SFX } from "@/lib/vocabQuiz/constants";
import { postAttempt } from "@/hooks/useVocabQuizQueue";
import type { VocabQuizAdvanceOptions } from "@/hooks/useVocabQuizQueue";

import homeStyles from "@/components/site/vocab-quiz-home.module.css";
import styles from "./vocab-quiz.module.css";
import { ChoiceLabelWithEnglish } from "./ChoiceLabelWithEnglish";

const EXIT_MS = 400;
const THROW_MS = 340;
const TAP_SLOP_PX = 10;
const THROW_DISTANCE_PX = 64;
const THROW_VELOCITY_PX_MS = 0.42;

type ChoiceFeedback = "none" | "correct" | "wrong";

type DragOffset = {
  x: number;
  y: number;
  rot: number;
};

export type StudioQuizPlayerHandle = {
  skipToNext: () => void;
};

type Props = {
  quiz: KoreanQuizPrepared;
  upcoming: KoreanQuizPrepared[];
  deviceId: string;
  audio: VocabQuizAudio;
  frozen: boolean;
  paused: boolean;
  onDone: (opts?: VocabQuizAdvanceOptions) => void;
};

function correctLabel(quiz: KoreanQuizPrepared): string {
  return quiz.choices.find((c) => c.id === quiz.correctChoiceId)?.label ?? "";
}

function StudioCardFront({ quiz }: { quiz: KoreanQuizPrepared }) {
  return (
    <div className={styles.studioCardFace}>
      <div className={homeStyles.cardVisual}>
        {quiz.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.studioCardImage}
            src={quiz.imageUrl}
            alt=""
            loading="eager"
            decoding="async"
          />
        ) : null}
      </div>
    </div>
  );
}

function StudioCardBack({ quiz }: { quiz: KoreanQuizPrepared }) {
  const label = correctLabel(quiz);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const answerRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const answer = answerRef.current;
    if (!wrap || !answer || !label) return;

    const fit = () => {
      const maxPx = Math.min(80, Math.floor(wrap.clientWidth * 0.22));
      const minPx = 22;
      let low = minPx;
      let high = Math.max(minPx, maxPx);
      let best = minPx;

      answer.style.whiteSpace = "nowrap";
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        answer.style.fontSize = `${mid}px`;
        if (answer.scrollWidth <= wrap.clientWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      answer.style.fontSize = `${best}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [label]);

  return (
    <div className={styles.studioCardBack}>
      <div ref={wrapRef} className={styles.studioCardBackAnswerWrap}>
        <span ref={answerRef} className={styles.studioCardBackAnswer}>
          {label}
        </span>
      </div>
      {quiz.romanization ? (
        <span className={styles.studioCardBackRoman}>{quiz.romanization}</span>
      ) : null}
    </div>
  );
}

function FlipCard({
  quiz,
  flipped,
  flipping,
}: {
  quiz: KoreanQuizPrepared;
  flipped: boolean;
  flipping: boolean;
}) {
  return (
    <div className={styles.studioFlipScene}>
      <div
        className={[
          styles.studioFlipInner,
          flipped ? styles.studioFlipInnerFlipped : "",
          flipping ? styles.studioFlipInnerAnimating : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.studioFlipFront}>
          <StudioCardFront quiz={quiz} />
        </div>
        <div className={styles.studioFlipBack}>
          <StudioCardBack quiz={quiz} />
        </div>
      </div>
    </div>
  );
}

export const StudioQuizPlayer = React.forwardRef<StudioQuizPlayerHandle, Props>(
  function StudioQuizPlayer(
    { quiz, upcoming, deviceId, audio, frozen, paused, onDone },
    ref,
  ) {
    const [flipped, setFlipped] = React.useState(false);
    const [flipping, setFlipping] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [choices, setChoices] = React.useState(quiz.choices);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [feedback, setFeedback] = React.useState<Record<string, ChoiceFeedback>>(
      {},
    );
    const [exitingQuiz, setExitingQuiz] = React.useState<KoreanQuizPrepared | null>(
      null,
    );
    const [exitingFlipped, setExitingFlipped] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState<DragOffset>({
      x: 0,
      y: 0,
      rot: 0,
    });
    const [throwing, setThrowing] = React.useState(false);
    const [throwTargetId, setThrowTargetId] = React.useState<string | null>(null);
    const [throwVars, setThrowVars] = React.useState({ x: 0, y: 0, r: 0 });

    const advancingRef = React.useRef(false);
    const shownAtRef = React.useRef(Date.now());
    const quizRef = React.useRef(quiz);
    const stackRef = React.useRef<HTMLDivElement>(null);
    const pointerRef = React.useRef<{
      id: number;
      x: number;
      y: number;
      t: number;
      lastX: number;
      lastY: number;
      lastT: number;
      dragged: boolean;
    } | null>(null);

    quizRef.current = quiz;

    const mid = upcoming[0] ?? null;
    const bot = upcoming[1] ?? null;
    const promoting = exitingQuiz !== null;
    const activeThrow = throwing && throwTargetId === quiz.id;
    const revealing = Boolean(selectedId);
    const interactionLocked =
      promoting || frozen || paused || showOptions || revealing || throwing || flipping;
    const english = quiz.illustrationEnglish?.trim();

    React.useEffect(() => {
      setFlipped(false);
      setFlipping(false);
      setShowOptions(false);
      setChoices(shuffle(quiz.choices));
      setSelectedId(null);
      setFeedback({});
      setExitingQuiz(null);
      setExitingFlipped(false);
      setDragOffset({ x: 0, y: 0, rot: 0 });
      setThrowing(false);
      setThrowTargetId(null);
      advancingRef.current = false;
      shownAtRef.current = Date.now();
      if (quiz.imageUrl) audio.prefetch(quiz.imageUrl);
      if (quiz.answerTtsUrl) audio.prefetch(quiz.answerTtsUrl);
    }, [audio, quiz]);

    React.useEffect(() => {
      if (paused) audio.pauseAll();
      else audio.resumeAll();
    }, [audio, paused]);

    const advance = React.useCallback(
      async (opts?: { skipExit?: boolean; serverAlreadyConsumed?: boolean }) => {
        if (advancingRef.current || frozen || promoting) return;
        advancingRef.current = true;
        await audio.stopAll();
        if (!opts?.skipExit) {
          void audio.playSfx(VOCAB_QUIZ_SFX.next);
          setExitingFlipped(flipped);
          setExitingQuiz(quizRef.current);
        }
        const delay = opts?.skipExit ? 0 : EXIT_MS;
        window.setTimeout(() => {
          onDone({ serverAlreadyConsumed: opts?.serverAlreadyConsumed });
        }, delay);
      },
      [audio, flipped, frozen, onDone, promoting],
    );

    const flipCard = React.useCallback(async () => {
      if (flipped || flipping || showOptions || promoting || frozen || paused) return;
      if (!audio.isUnlocked()) await audio.unlock();
      void audio.playSfx(VOCAB_QUIZ_SFX.click);
      setFlipping(true);
      setFlipped(true);
      window.setTimeout(() => setFlipping(false), 400);
      if (quiz.answerTtsUrl) {
        void audio.playUrl(quiz.answerTtsUrl);
      }
    }, [
      audio,
      flipped,
      flipping,
      frozen,
      paused,
      promoting,
      quiz.answerTtsUrl,
      showOptions,
    ]);

    const handleTap = React.useCallback(() => {
      if (interactionLocked) return;
      if (!flipped) {
        void flipCard();
        return;
      }
      void advance();
    }, [advance, flipCard, flipped, interactionLocked]);

    const throwAway = React.useCallback(
      (dx: number, dy: number, velocity: number) => {
        if (interactionLocked || advancingRef.current) return;
        const mag = Math.hypot(dx, dy) || 1;
        const nx = dx / mag;
        const ny = dy / mag;
        const power = Math.min(1.35, 0.75 + velocity * 0.35);
        const throwX = nx * 180 * power;
        const throwY = ny * 120 * power - 18;
        const throwR = nx * 22 + ny * 8;

        setThrowVars({ x: throwX, y: throwY, r: throwR });
        setThrowTargetId(quizRef.current.id);
        setThrowing(true);
        void audio.playSfx(VOCAB_QUIZ_SFX.next, { volume: 0.45 });

        window.setTimeout(() => {
          void advance({ skipExit: true });
        }, THROW_MS);
      },
      [advance, audio, interactionLocked],
    );

    const handleSkip = React.useCallback(() => {
      if (interactionLocked) return;
      throwAway(1, -0.2, 0.5);
    }, [interactionLocked, throwAway]);

    const revealChoice = React.useCallback(
      async (choiceId: string) => {
        if (selectedId || paused || frozen || promoting) return;
        if (!audio.isUnlocked()) await audio.unlock();
        setSelectedId(choiceId);
        const correct = choiceId === quiz.correctChoiceId;
        const nextFeedback: Record<string, ChoiceFeedback> = {
          [choiceId]: correct ? "correct" : "wrong",
        };
        if (!correct) {
          nextFeedback[quiz.correctChoiceId] = "correct";
        }
        setFeedback(nextFeedback);

        void audio.playSfx(VOCAB_QUIZ_SFX.click);
        const feedbackSfx = correct ? VOCAB_QUIZ_SFX.correct : VOCAB_QUIZ_SFX.wrong;
        const feedbackOpts = correct
          ? { volume: 0.58, playbackRate: 1.48 }
          : undefined;
        if (quiz.answerTtsUrl) {
          audio.playSfxThenUrl(feedbackSfx, quiz.answerTtsUrl, {
            sfx: feedbackOpts,
            overlapMs: 150,
          });
        } else {
          void audio.playSfx(feedbackSfx, feedbackOpts);
        }

        const elapsedMs = Date.now() - shownAtRef.current;
        void postAttempt({
          deviceId,
          quizId: quiz.id,
          choiceId,
          elapsedMs,
        }).catch(() => undefined);

        window.setTimeout(() => {
          void advance({ serverAlreadyConsumed: true });
        }, 900);
      },
      [advance, audio, deviceId, frozen, paused, promoting, quiz, selectedId],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        skipToNext: () => {
          handleSkip();
        },
      }),
      [handleSkip],
    );

    React.useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (frozen || paused || promoting) return;
        const key = event.key.toLowerCase();
        if (key === "0" || key === "o" || event.code === "Digit0" || event.code === "Numpad0") {
          event.preventDefault();
          if (revealing) return;
          setShowOptions((value) => !value);
          return;
        }
        if (key === "escape" && showOptions) {
          event.preventDefault();
          if (!revealing) setShowOptions(false);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [frozen, paused, promoting, revealing, showOptions]);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (interactionLocked) return;
      pointerRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        t: event.timeStamp,
        lastX: event.clientX,
        lastY: event.clientY,
        lastT: event.timeStamp,
        dragged: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId || interactionLocked) return;

      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (Math.abs(dx) > TAP_SLOP_PX || Math.abs(dy) > TAP_SLOP_PX) {
        pointer.dragged = true;
      }
      if (!pointer.dragged) return;

      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastT = event.timeStamp;

      setDragOffset({
        x: dx,
        y: dy,
        rot: dx * 0.055 + dy * 0.02,
      });
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      pointerRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const dt = Math.max(1, event.timeStamp - pointer.lastT);
      const vx = (event.clientX - pointer.lastX) / dt;
      const vy = (event.clientY - pointer.lastY) / dt;
      const velocity = Math.hypot(vx, vy);
      const distance = Math.hypot(dx, dy);

      if (!pointer.dragged) {
        handleTap();
        return;
      }

      if (
        distance >= THROW_DISTANCE_PX ||
        velocity >= THROW_VELOCITY_PX_MS
      ) {
        throwAway(dx, dy, velocity);
        return;
      }

      setDragOffset({ x: 0, y: 0, rot: 0 });
    };

    const onPointerCancel = () => {
      pointerRef.current = null;
      if (!throwing) setDragOffset({ x: 0, y: 0, rot: 0 });
    };

    const stackClass = [
      homeStyles.cardStack,
      promoting ? homeStyles.cardStackPromoting : "",
    ]
      .filter(Boolean)
      .join(" ");

    const topMotionStyle = activeThrow
      ? ({
          "--throw-x": `${throwVars.x}px`,
          "--throw-y": `${throwVars.y}px`,
          "--throw-r": `${throwVars.r}deg`,
        } as React.CSSProperties)
      : ({
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.rot}deg)`,
        } as React.CSSProperties);

    return (
      <div className={styles.studioStage}>
        <header className={styles.studioHeader}>
          <h1 className={styles.studioTitle}>
            What is this in <span className={styles.studioTitleAccent}>Korean</span>?
          </h1>
        </header>

        <div className={styles.studioStackWrap}>
          <div
            ref={stackRef}
            className={styles.studioStackButton}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleTap();
              }
            }}
            aria-label={
              flipped ? "Continue to next card" : "Flip card to see Korean answer"
            }
          >
            <div className={stackClass}>
              {bot ? (
                <div
                  className={homeStyles.cardStackItem}
                  data-depth={2}
                  data-layer="bot"
                >
                  <StudioCardFront quiz={bot} />
                </div>
              ) : null}

              {mid ? (
                <div
                  className={homeStyles.cardStackItem}
                  data-depth={1}
                  data-layer="mid"
                >
                  <StudioCardFront quiz={mid} />
                </div>
              ) : null}

              {!promoting ? (
                <div
                  key={quiz.id}
                  className={[
                    homeStyles.cardStackItem,
                    homeStyles.cardTop,
                    styles.studioTopCard,
                    activeThrow ? styles.studioTopCardThrowing : "",
                    dragOffset.x !== 0 || dragOffset.y !== 0
                      ? styles.studioTopCardDragging
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={topMotionStyle}
                  data-depth={0}
                  data-layer="top"
                >
                  <FlipCard quiz={quiz} flipped={flipped} flipping={flipping} />
                </div>
              ) : null}

              {exitingQuiz ? (
                <div
                  className={`${homeStyles.cardStackItem} ${homeStyles.cardTop} ${homeStyles.cardStackItemExiting}`}
                  data-layer="exit"
                  aria-hidden
                >
                  {exitingFlipped ? (
                    <StudioCardBack quiz={exitingQuiz} />
                  ) : (
                    <StudioCardFront quiz={exitingQuiz} />
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {english ? (
            <p className={styles.studioEnglishLabel}>{english}</p>
          ) : null}
        </div>

        {showOptions ? (
          <div className={styles.studioChoicesWrap}>
            <div className={styles.choicesGrid}>
              {choices.map((choice) => {
                const state = feedback[choice.id] ?? "none";
                const className = [
                  styles.choiceBtn,
                  state === "correct" ? styles.choiceCorrect : "",
                  state === "wrong" ? styles.choiceWrong : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={className}
                    disabled={Boolean(selectedId)}
                    onClick={() => void revealChoice(choice.id)}
                  >
                    <ChoiceLabelWithEnglish
                      label={choice.label}
                      english={revealing ? choice.english : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
