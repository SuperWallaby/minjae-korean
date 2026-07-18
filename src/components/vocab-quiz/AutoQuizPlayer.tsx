"use client";

import * as React from "react";

import { correctLabelFromPrepared } from "@/lib/koreanQuiz/preparedDisplay";
import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import {
  AUTO_TIMING,
  VOCAB_QUIZ_HEADER_AUDIO,
  VOCAB_QUIZ_SFX,
} from "@/lib/vocabQuiz/constants";
import { postConsume } from "@/hooks/useVocabQuizQueue";
import type { VocabQuizAdvanceOptions } from "@/hooks/useVocabQuizQueue";

import styles from "./vocab-quiz.module.css";
import { VocabQuizHeader, VocabQuizImage } from "./VocabQuizShared";
import { Volume2 } from "lucide-react";

type Phase = "idle" | "header" | "countdown" | "reveal" | "done";

export type AutoQuizPlayerHandle = {
  skipToNext: () => void;
};

type Props = {
  quiz: KoreanQuizPrepared;
  deviceId: string;
  audio: VocabQuizAudio;
  frozen: boolean;
  paused: boolean;
  onDone: (opts?: VocabQuizAdvanceOptions) => void;
};

export const AutoQuizPlayer = React.forwardRef<AutoQuizPlayerHandle, Props>(
  function AutoQuizPlayer({ quiz, deviceId, audio, frozen, paused, onDone }, ref) {
    const [phase, setPhase] = React.useState<Phase>("idle");
    const [countdown, setCountdown] = React.useState<number | null>(null);
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [slowHighlight, setSlowHighlight] = React.useState(false);
    const runIdRef = React.useRef(0);
    const onDoneRef = React.useRef(onDone);
    const skipRef = React.useRef(false);
    onDoneRef.current = onDone;

    const answerLabel = correctLabelFromPrepared(quiz);

    React.useImperativeHandle(ref, () => ({
      skipToNext: () => {
        skipRef.current = true;
        audio.skipPending();
      },
    }));

    React.useEffect(() => {
      if (quiz.imageUrl) audio.prefetch(quiz.imageUrl);
      if (quiz.answerTtsUrl) audio.prefetch(quiz.answerTtsUrl);
      if (quiz.answerTtsSlowUrl) audio.prefetch(quiz.answerTtsSlowUrl);
      audio.prefetch(VOCAB_QUIZ_HEADER_AUDIO);
    }, [audio, quiz.id, quiz.imageUrl, quiz.answerTtsUrl, quiz.answerTtsSlowUrl]);

    const wasPausedRef = React.useRef(false);
    React.useEffect(() => {
      if (paused) {
        wasPausedRef.current = true;
        audio.pauseAll();
        return;
      }
      if (wasPausedRef.current) {
        audio.resumeAll();
      }
    }, [audio, paused]);

    React.useEffect(() => {
      if (frozen) {
        void audio.stopAll();
        return;
      }

      const runId = ++runIdRef.current;
      const abort = new AbortController();
      skipRef.current = false;

      setPhase("idle");
      setCountdown(null);
      setShowAnswer(false);
      setSlowHighlight(false);

      const isActive = () => runIdRef.current === runId && !abort.signal.aborted;
      const shouldSkip = () => skipRef.current;
      let finished = false;

      const finishQuiz = async () => {
        if (!isActive() || finished) return;
        finished = true;
        setPhase("done");
        void postConsume({ deviceId, quizId: quiz.id }).catch(() => undefined);
        onDoneRef.current({ serverAlreadyConsumed: true });
      };

      const revealAnswer = async () => {
        setPhase("reveal");
        setShowAnswer(true);
        setCountdown(null);
        if (shouldSkip() || !isActive()) return;

        if (quiz.answerTtsUrl) {
          await audio.playUrl(quiz.answerTtsUrl);
          if (!isActive() || shouldSkip()) return;
          await audio.delay(AUTO_TIMING.koSlowGapSec * 1000, abort.signal);
          if (!isActive() || shouldSkip()) return;
          setSlowHighlight(true);
          if (quiz.answerTtsSlowUrl) {
            await audio.playUrl(quiz.answerTtsSlowUrl);
          } else {
            await audio.playUrl(quiz.answerTtsUrl, {
              playbackRate: AUTO_TIMING.koSlowPlaybackRate,
            });
          }
          setSlowHighlight(false);
        }
      };

      void (async () => {
        try {
          if (shouldSkip()) {
            await finishQuiz();
            return;
          }

          setPhase("header");
          await audio.playUrl(VOCAB_QUIZ_HEADER_AUDIO);
          if (!isActive()) return;
          if (shouldSkip()) {
            await finishQuiz();
            return;
          }

          await audio.delay(AUTO_TIMING.headerGapSec * 1000, abort.signal);
          if (!isActive()) return;
          if (shouldSkip()) {
            await finishQuiz();
            return;
          }

          setPhase("countdown");
          for (let step = 0; step < 3; step += 1) {
            if (!isActive()) return;
            if (shouldSkip()) {
              await finishQuiz();
              return;
            }
            setCountdown(3 - step);
            await audio.playSfx(VOCAB_QUIZ_SFX.countdown[step]);
            if (shouldSkip()) {
              await finishQuiz();
              return;
            }
            await audio.delay(1000 - 220, abort.signal);
            if (step === 2) {
              await audio.delay(
                AUTO_TIMING.countdownAfterOneSec * 1000,
                abort.signal,
              );
            }
            if (shouldSkip()) {
              await finishQuiz();
              return;
            }
          }
          if (!isActive()) return;
          if (shouldSkip()) {
            await finishQuiz();
            return;
          }

          await revealAnswer();
          if (!isActive()) return;
          if (shouldSkip()) {
            await finishQuiz();
            return;
          }

          await audio.delay(AUTO_TIMING.tailSec * 1000, abort.signal);
          await finishQuiz();
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      })();

      return () => {
        abort.abort();
        void audio.stopAll();
      };
    }, [audio, deviceId, frozen, quiz.id]);

    const replayAnswerTts = React.useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!quiz.answerTtsUrl) return;
        void audio.stopAll();
        void audio.playUrl(quiz.answerTtsUrl);
      },
      [audio, quiz.answerTtsUrl],
    );

    const handleStageTap = React.useCallback(() => {
      skipRef.current = true;
      audio.skipPending();
    }, [audio]);

    return (
      <button
        type="button"
        className={`${styles.stage} ${styles.autoStage}`}
        onClick={handleStageTap}
        style={{
          border: "none",
          background: "transparent",
          width: "100%",
          cursor: "pointer",
        }}
        aria-label="Tap to continue"
      >
        <VocabQuizHeader difficulty={quiz.difficulty} />
        {quiz.sentenceStem ? (
          <p className={styles.sentenceStem}>{quiz.sentenceStem}</p>
        ) : null}
        <div className={styles.imageStage}>
          <div className={styles.imageVisual}>
            <VocabQuizImage
              imageUrl={quiz.imageUrl}
              alt="Quiz illustration"
              illustrationEnglish={quiz.illustrationEnglish}
            />
          </div>
          <div className={styles.imageOverlay}>
            {phase === "countdown" && countdown !== null ? (
              <div
                className={`${styles.countdownBubble} ${countdown === 1 ? styles.countdownBubbleOne : ""}`}
                key={countdown}
              >
                {countdown}
              </div>
            ) : null}
            {showAnswer ? (
              <div className={styles.answerBlock}>
                <div className={styles.answerBlockRow}>
                  <div
                    className={`${styles.answerKorean} ${slowHighlight ? styles.answerKoreanSlow : ""}`}
                  >
                    {answerLabel}
                  </div>
                  {quiz.answerTtsUrl ? (
                    <span
                      role="button"
                      tabIndex={0}
                      className={styles.answerSpeakBtn}
                      aria-label="Listen again"
                      onClick={replayAnswerTts}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          replayAnswerTts(e as unknown as React.MouseEvent);
                        }
                      }}
                    >
                      <Volume2 size={22} strokeWidth={2.25} aria-hidden />
                    </span>
                  ) : null}
                </div>
                {quiz.romanization ? (
                  <div className={styles.answerRomanization}>{quiz.romanization}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </button>
    );
  },
);
