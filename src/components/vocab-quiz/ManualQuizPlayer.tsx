"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";

import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";
import { shuffle } from "@/lib/koreanQuiz/shuffle";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import {
  TAP_CONTINUE_HINT_KEY,
  VOCAB_QUIZ_SFX,
} from "@/lib/vocabQuiz/constants";
import { postAttempt } from "@/hooks/useVocabQuizQueue";
import type { VocabQuizAdvanceOptions } from "@/hooks/useVocabQuizQueue";

import styles from "./vocab-quiz.module.css";
import { VocabQuizHeader, VocabQuizImage } from "./VocabQuizShared";
import { ChoiceLabelWithEnglish } from "./ChoiceLabelWithEnglish";
import { AnswerExampleCard } from "./AnswerExampleCard";

type ChoiceFeedback = "none" | "correct" | "wrong";

export type ManualQuizPlayerHandle = {
  skipToNext: () => void;
};

type Props = {
  quiz: KoreanQuizPrepared;
  deviceId: string;
  audio: VocabQuizAudio;
  frozen: boolean;
  paused: boolean;
  onDone: (opts?: VocabQuizAdvanceOptions) => void;
  onAnswered?: (correct: boolean) => void;
  onSeeDetails?: () => void;
  /** Mobile: never show English gloss inside choice pills. */
  hideChoiceEnglish?: boolean;
};

export const ManualQuizPlayer = React.forwardRef<ManualQuizPlayerHandle, Props>(
  function ManualQuizPlayer(
    {
      quiz,
      deviceId,
      audio,
      frozen,
      paused,
      onDone,
      onAnswered,
      onSeeDetails,
      hideChoiceEnglish = false,
    },
    ref,
  ) {
    const [choices, setChoices] = React.useState(quiz.choices);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [feedback, setFeedback] = React.useState<Record<string, ChoiceFeedback>>({});
    const [revealing, setRevealing] = React.useState(false);
    const [showTapHint, setShowTapHint] = React.useState(false);
    const shownAtRef = React.useRef<number>(Date.now());
    const revealingRef = React.useRef(false);
    revealingRef.current = revealing;

    React.useEffect(() => {
      try {
        setShowTapHint(localStorage.getItem(TAP_CONTINUE_HINT_KEY) !== "1");
      } catch {
        setShowTapHint(true);
      }
    }, []);

    React.useEffect(() => {
      setChoices(shuffle(quiz.choices));
      setSelectedId(null);
      setFeedback({});
      setRevealing(false);
      shownAtRef.current = Date.now();
      if (quiz.imageUrl) audio.prefetch(quiz.imageUrl);
      if (quiz.answerTtsUrl) audio.prefetch(quiz.answerTtsUrl);
    }, [audio, quiz]);

    const dismissTapHint = React.useCallback(() => {
      setShowTapHint((prev) => {
        if (!prev) return prev;
        try {
          localStorage.setItem(TAP_CONTINUE_HINT_KEY, "1");
        } catch {
          // ignore
        }
        return false;
      });
    }, []);

    const replayAnswerTts = React.useCallback(
      (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (!quiz.answerTtsUrl) return;
        void audio.stopAll();
        void audio.playUrl(quiz.answerTtsUrl);
      },
      [audio, quiz.answerTtsUrl],
    );

    const revealChoice = React.useCallback(
      async (choiceId: string) => {
        if (selectedId || paused || frozen) return;
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
        setRevealing(true);
        onAnswered?.(correct);

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
        } else if (correct) {
          void audio.playSfx(feedbackSfx, feedbackOpts);
        } else {
          void audio.playSfx(feedbackSfx);
        }

        const elapsedMs = Date.now() - shownAtRef.current;
        void postAttempt({
          deviceId,
          quizId: quiz.id,
          choiceId,
          elapsedMs,
        }).catch(() => undefined);
      },
      [audio, deviceId, frozen, onAnswered, paused, quiz, selectedId],
    );

    const handleAdvance = React.useCallback(async () => {
      if (!revealingRef.current || frozen) return;
      dismissTapHint();
      await audio.stopAll();
      void audio.playSfx(VOCAB_QUIZ_SFX.next);
      onDone({ serverAlreadyConsumed: true });
    }, [audio, dismissTapHint, frozen, onDone]);

    React.useImperativeHandle(
      ref,
      () => ({
        skipToNext: () => {
          if (revealingRef.current) {
            void handleAdvance();
            return;
          }
          void audio.stopAll();
          onDone();
        },
      }),
      [handleAdvance, onDone, audio],
    );

    React.useEffect(() => {
      if (paused) audio.pauseAll();
      else audio.resumeAll();
    }, [audio, paused]);

    const stageClass = [
      styles.stage,
      styles.manualStage,
      revealing ? styles.manualStageRevealing : "",
    ]
      .filter(Boolean)
      .join(" ");

    // After reveal: keep the pick + correct answer (app parity); hide other distractors.
    const visibleChoices = revealing
      ? choices.filter((choice) => {
          if (choice.id === quiz.correctChoiceId) return true;
          if (
            selectedId &&
            choice.id === selectedId &&
            selectedId !== quiz.correctChoiceId
          ) {
            return true;
          }
          return false;
        })
      : choices;

    return (
      <button
        type="button"
        className={stageClass}
        onClick={() => void handleAdvance()}
        style={{
          border: "none",
          background: "transparent",
          cursor: revealing ? "pointer" : "default",
          width: "100%",
        }}
      >
        <div className={styles.manualStageBody}>
          <VocabQuizHeader />
          {quiz.sentenceStem ? (
            <p className={styles.sentenceStem}>{quiz.sentenceStem}</p>
          ) : null}
          <div className={styles.imageStageNoOverlay}>
            <VocabQuizImage
              imageUrl={quiz.imageUrl}
              alt="Quiz illustration"
              illustrationEnglish={quiz.illustrationEnglish}
            />
          </div>

          <div
            className={styles.choicesGrid}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {visibleChoices.map((choice) => {
              const state = feedback[choice.id] ?? "none";
              const className = [
                styles.choiceBtn,
                state === "correct" ? styles.choiceCorrect : "",
                state === "wrong" ? styles.choiceWrong : "",
              ]
                .filter(Boolean)
                .join(" ");

              // App: gloss only on the wrong pick (never on the correct row).
              // Mobile: no gloss in choice pills.
              const showEnglish =
                !hideChoiceEnglish &&
                revealing &&
                selectedId != null &&
                choice.id === selectedId &&
                choice.id !== quiz.correctChoiceId;

              const showSpeak =
                revealing &&
                choice.id === quiz.correctChoiceId &&
                Boolean(quiz.answerTtsUrl);

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
                    english={showEnglish ? choice.english : undefined}
                  />
                  {showSpeak ? (
                    <span
                      role="button"
                      tabIndex={0}
                      className={styles.choiceSpeakBtn}
                      aria-label="Listen again"
                      onClick={replayAnswerTts}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          replayAnswerTts(e as unknown as React.MouseEvent);
                        }
                      }}
                    >
                      <Volume2 size={20} strokeWidth={2.25} aria-hidden />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {revealing && quiz.examples && quiz.examples.length > 0 ? (
            <AnswerExampleCard
              quizId={quiz.id}
              examples={quiz.examples}
              audio={audio}
              onSeeDetails={onSeeDetails}
            />
          ) : null}

          {revealing ? (
            <div className={styles.manualRevealFooter} aria-hidden>
              {quiz.romanization ? (
                <p className={styles.manualRevealRomanization}>{quiz.romanization}</p>
              ) : null}
              {showTapHint ? (
                <div className={styles.tapContinueBadge}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 10.5V6.75a2.25 2.25 0 0 1 4.5 0V14a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5.66-4.05L5.2 12.4A1.75 1.75 0 0 1 7.5 10.1l1.5.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Tap Anywhere
                </div>
              ) : (
                <p className={styles.manualRevealHint}>Tap anywhere to continue</p>
              )}
            </div>
          ) : null}
        </div>
      </button>
    );
  },
);
