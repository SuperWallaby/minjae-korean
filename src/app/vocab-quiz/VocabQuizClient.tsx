"use client";

import Link from "next/link";
import * as React from "react";
import { Flag, Grid2X2, Heart, Lightbulb, Shuffle, Volume2, VolumeX } from "lucide-react";

import {
  AutoQuizPlayer,
  type AutoQuizPlayerHandle,
} from "@/components/vocab-quiz/AutoQuizPlayer";
import {
  ManualQuizPlayer,
  type ManualQuizPlayerHandle,
} from "@/components/vocab-quiz/ManualQuizPlayer";
import {
  StudioQuizPlayer,
  type StudioQuizPlayerHandle,
} from "@/components/vocab-quiz/StudioQuizPlayer";
import { StudioShuffleOverlay } from "@/components/vocab-quiz/StudioShuffleOverlay";
import { WordExplanationSheet } from "@/components/vocab-quiz/WordExplanationSheet";
import { QuizSetProgress } from "@/components/vocab-quiz/QuizSetProgress";
import {
  useVocabQuizKeyboard,
  VocabQuizControls,
} from "@/components/vocab-quiz/VocabQuizControls";
import { AppStoreBadges } from "@/components/site/AppStoreBadges";
import { ChosungHintIcon } from "@/components/vocab-quiz/ChosungHintIcon";
import styles from "@/components/vocab-quiz/vocab-quiz.module.css";
import { useVocabQuizQueue, type VocabQuizAdvanceOptions } from "@/hooks/useVocabQuizQueue";
import { useQuizReviewFlags } from "@/hooks/useQuizReviewFlags";
import {
  correctEnglishFromPrepared,
  correctLabelFromPrepared,
} from "@/lib/koreanQuiz/preparedDisplay";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import type { VocabQuizCommandId } from "@/lib/vocabQuiz/playbackCommands";
import {
  MODE_KEY,
  QUIZ_SET_SIZE,
  SOUND_ENABLED_KEY,
  VOCAB_QUIZ_SFX,
  type VocabQuizMode,
} from "@/lib/vocabQuiz/constants";

function readModeFromUrl(): VocabQuizMode | null {
  if (typeof window === "undefined") return null;
  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "auto" || mode === "manual" || mode === "studio") return mode;
  return null;
}

function readStoredMode(): VocabQuizMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "auto" || v === "manual" || v === "studio") return v;
  } catch {
    // ignore
  }
  return "studio";
}

export function VocabQuizClient() {
  const audioRef = React.useRef<VocabQuizAudio | null>(null);
  if (!audioRef.current) audioRef.current = new VocabQuizAudio();

  const audio = audioRef.current;
  const autoRef = React.useRef<AutoQuizPlayerHandle>(null);
  const manualRef = React.useRef<ManualQuizPlayerHandle>(null);
  const studioRef = React.useRef<StudioQuizPlayerHandle>(null);
  const advanceRef = React.useRef<(opts?: VocabQuizAdvanceOptions) => void>(() => undefined);
  const goBackRef = React.useRef<() => void>(() => undefined);

  const [mode, setMode] = React.useState<VocabQuizMode>("manual");
  const [isMobile, setIsMobile] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);
  const [hiddenPaused, setHiddenPaused] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [studioShuffleImages, setStudioShuffleImages] = React.useState<string[]>(
    [],
  );
  const [studioShuffleTopImage, setStudioShuffleTopImage] = React.useState<
    string | undefined
  >(undefined);
  const [studioShuffleAnim, setStudioShuffleAnim] = React.useState(false);
  const [studioOptionsOn, setStudioOptionsOn] = React.useState(false);
  const [studioChosungOn, setStudioChosungOn] = React.useState(false);
  const [wordExplainOpen, setWordExplainOpen] = React.useState(false);
  const [setAnswered, setSetAnswered] = React.useState(0);
  const [setCorrect, setSetCorrect] = React.useState(0);
  const [cardAnswered, setCardAnswered] = React.useState(false);
  const [setComplete, setSetComplete] = React.useState(false);
  const setAnsweredRef = React.useRef(0);
  const cardAnsweredRef = React.useRef(false);
  const setCompleteRef = React.useRef(false);

  const {
    current,
    queue,
    bootstrapping,
    reshuffling,
    error,
    advance,
    goBack,
    history,
    reshuffle,
    resync,
    deviceId,
  } = useVocabQuizQueue(mode);

  const { isFlagged, toggleFlag } = useQuizReviewFlags(deviceId);
  const [flagBusy, setFlagBusy] = React.useState(false);

  const resetQuizSet = React.useCallback(() => {
    setAnsweredRef.current = 0;
    cardAnsweredRef.current = false;
    setCompleteRef.current = false;
    setSetAnswered(0);
    setSetCorrect(0);
    setCardAnswered(false);
    setSetComplete(false);
  }, []);

  const recordSetAnswer = React.useCallback((correct?: boolean) => {
    if (cardAnsweredRef.current || setCompleteRef.current) return;
    cardAnsweredRef.current = true;
    setCardAnswered(true);
    setAnsweredRef.current = Math.min(
      QUIZ_SET_SIZE,
      setAnsweredRef.current + 1,
    );
    setSetAnswered(setAnsweredRef.current);
    if (correct === true) {
      setSetCorrect((n) => Math.min(QUIZ_SET_SIZE, n + 1));
    }
  }, []);

  const handlePlayerDone = React.useCallback(
    async (opts?: VocabQuizAdvanceOptions) => {
      // Count skips / auto completes if the player didn't report an answer.
      recordSetAnswer();
      const answered = setAnsweredRef.current;
      if (answered >= QUIZ_SET_SIZE) {
        setCompleteRef.current = true;
        setSetComplete(true);
        await advance(opts);
        return;
      }
      cardAnsweredRef.current = false;
      setCardAnswered(false);
      await advance(opts);
    },
    [advance, recordSetAnswer],
  );

  advanceRef.current = (opts) => {
    void handlePlayerDone(opts);
  };
  goBackRef.current = goBack;

  const setCurrentQuestion = cardAnswered
    ? Math.max(1, setAnswered)
    : Math.min(QUIZ_SET_SIZE, setAnswered + 1);

  const paused = hiddenPaused || userPaused || wordExplainOpen;
  const canGoBack = history.length > 0;
  const controlsVisible =
    started &&
    Boolean(current) &&
    !bootstrapping &&
    !reshuffling &&
    !studioShuffleAnim &&
    !error;

  React.useEffect(() => {
    setSoundOn(true);
    audio.setEnabled(true);
  }, [audio]);

  // Mobile: Manual only (no Studio card-drag / mode chips). Desktop keeps modes.
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) {
        setMode("manual");
      } else {
        setMode(readModeFromUrl() ?? readStoredMode());
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  React.useEffect(() => {
    const onVisibility = () => {
      const hidden = document.visibilityState !== "visible";
      setHiddenPaused(hidden);
      if (hidden) void audio.stopAll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [audio]);

  const togglePause = React.useCallback(() => {
    setUserPaused((v) => {
      const next = !v;
      if (next) audio.pauseAll();
      else audio.resumeAll();
      return next;
    });
  }, [audio]);

  const handleNext = React.useCallback(() => {
    setUserPaused(false);
    audio.resumeAll();
    if (mode === "auto") {
      autoRef.current?.skipToNext();
      return;
    }
    if (mode === "studio") {
      studioRef.current?.skipToNext();
      return;
    }
    manualRef.current?.skipToNext();
  }, [audio, mode]);

  const handleBack = React.useCallback(() => {
    if (!canGoBack) return;
    void audio.stopAll();
    setUserPaused(false);
    goBackRef.current();
  }, [audio, canGoBack]);

  const handleCommand = React.useCallback(
    (id: VocabQuizCommandId) => {
      switch (id) {
        case "pause":
          togglePause();
          break;
        case "back":
          handleBack();
          break;
        case "next":
          handleNext();
          break;
        default:
          break;
      }
    },
    [handleBack, handleNext, togglePause],
  );

  useVocabQuizKeyboard(controlsVisible && !isMobile, {
    onPause: togglePause,
    onBack: handleBack,
    onNext: handleNext,
  });

  const setModePersist = (next: VocabQuizMode) => {
    if (isMobile) return;
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // ignore
    }
    setUserPaused(false);
    void audio.stopAll();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audio.setEnabled(next);
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const handleStart = () => {
    if (started) return;
    audio.setEnabled(true);
    setSoundOn(true);
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, "1");
    } catch {
      // ignore
    }
    setUserPaused(false);
    // Start immediately — never gate UI on audio unlock (mobile Safari hangs).
    setStarted(true);
    void audio.unlock();
  };

  const handleReshuffle = React.useCallback(async () => {
    if (reshuffling || studioShuffleAnim) return;
    void audio.stopAll();
    setUserPaused(false);
    resetQuizSet();

    const isStudio = mode === "studio";
    if (isStudio) {
      const imgs = [current, ...queue.slice(1, 6)]
        .map((q) => q?.imageUrl?.trim())
        .filter((url): url is string => Boolean(url));
      setStudioShuffleTopImage(current?.imageUrl?.trim() || imgs[0]);
      setStudioShuffleImages(imgs);
      setStudioShuffleAnim(true);
      void audio.unlock().then(() => {
        void audio.playSfx(VOCAB_QUIZ_SFX.shuffle, { volume: 0.62 });
      });
    }

    const startedAt = Date.now();
    await reshuffle();

    if (isStudio) {
      // flip (~0.34s) + riffle (~1.55s)
      const minMs = 1950;
      const wait = Math.max(0, minMs - (Date.now() - startedAt));
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      setStudioShuffleAnim(false);
      setStudioShuffleImages([]);
      setStudioShuffleTopImage(undefined);
    }
  }, [
    audio,
    current,
    mode,
    queue,
    reshuffle,
    reshuffling,
    resetQuizSet,
    studioShuffleAnim,
  ]);

  const startNextQuizSet = React.useCallback(() => {
    void audio.stopAll();
    resetQuizSet();
    setUserPaused(false);
    void audio.playSfx(VOCAB_QUIZ_SFX.next, { volume: 0.7 });
  }, [audio, resetQuizSet]);

  const handleToggleFlag = async () => {
    if (!current || flagBusy) return;
    setFlagBusy(true);
    await toggleFlag(current.id);
    setFlagBusy(false);
  };

  const openWordExplain = React.useCallback(() => {
    void audio.unlock();
    setWordExplainOpen(true);
  }, [audio]);

  const currentFlagged = current ? isFlagged(current.id) : false;
  const studioFocus = mode === "studio" && started;
  const showStudioShuffle = studioFocus && (reshuffling || studioShuffleAnim);
  const explainKorean = current ? correctLabelFromPrepared(current) : "";
  const explainEnglish = current ? correctEnglishFromPrepared(current) : "";

  React.useEffect(() => {
    setWordExplainOpen(false);
    setStudioChosungOn(false);
  }, [current?.id]);

  return (
    <div
      className={[
        styles.vocabQuizRoot,
        studioFocus ? styles.vocabQuizRootStudio : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.topBrandBar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.topBrandLogo}
          src="/brand/logo.webp"
          alt=""
          width={44}
          height={44}
          decoding="async"
        />
      </div>

      <div
        className={[
          styles.vocabQuizGameShell,
          studioFocus ? styles.vocabQuizGameShellStudio : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            styles.toolbar,
            studioFocus ? styles.toolbarStudio : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.toolbarScroll}>
            <Link href="/" className={styles.homeLink} aria-label="Home">
              Home
            </Link>
            {!isMobile ? (
              <div className={styles.toolbarGroup}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${mode === "manual" ? styles.modeBtnActive : ""}`}
                  onClick={() => setModePersist("manual")}
                >
                  Manual
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${mode === "auto" ? styles.modeBtnActive : ""}`}
                  onClick={() => setModePersist("auto")}
                >
                  Auto
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${mode === "studio" ? styles.modeBtnActive : ""}`}
                  onClick={() => setModePersist("studio")}
                >
                  Studio
                </button>
              </div>
            ) : null}
            <Link href="/vocab-quiz/review" className={styles.reviewLink}>
              Review
            </Link>
            <div
              className={`${styles.toolbarGroup} ${studioFocus ? styles.toolbarGroupHidden : ""}`}
            >
              {started && current && explainKorean ? (
                <button
                  type="button"
                  className={styles.iconBtn}
                  disabled={bootstrapping || reshuffling || studioShuffleAnim}
                  onClick={openWordExplain}
                  aria-label="Word explanation"
                  title="Word explanation"
                >
                  <Lightbulb size={16} strokeWidth={2} aria-hidden />
                </button>
              ) : null}
              {started ? (
                <button
                  type="button"
                  className={styles.iconBtn}
                  disabled={bootstrapping || reshuffling || studioShuffleAnim}
                  onClick={() => void handleReshuffle()}
                  aria-label="Shuffle deck — get a new random quiz list"
                  title="New deck"
                >
                  <Shuffle
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                    className={
                      reshuffling || studioShuffleAnim
                        ? styles.shuffleIconSpin
                        : undefined
                    }
                  />
                </button>
              ) : null}
              {started ? (
                <button
                  type="button"
                  className={`${styles.iconBtn} ${currentFlagged ? styles.iconBtnFlagged : ""}`}
                  disabled={!current || flagBusy}
                  onClick={() => void handleToggleFlag()}
                  aria-label={currentFlagged ? "Unflag quiz" : "Flag for review"}
                  aria-pressed={currentFlagged}
                >
                  <Flag size={16} strokeWidth={2} aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleSound}
                aria-label={soundOn ? "Sound on" : "Sound off"}
              >
                {soundOn ? (
                  <Volume2 size={16} strokeWidth={2} aria-hidden />
                ) : (
                  <VolumeX size={16} strokeWidth={2} aria-hidden />
                )}
                <span>{soundOn ? "On" : "Off"}</span>
              </button>
            </div>
          </div>
        </div>

      {studioFocus && started && !showStudioShuffle ? (
        <div className={styles.studioTopActions}>
          {current && explainKorean ? (
            <button
              type="button"
              className={styles.studioActionBtn}
              disabled={bootstrapping || reshuffling || studioShuffleAnim}
              onClick={openWordExplain}
              aria-label="Word explanation"
              title="Word explanation"
            >
              <Lightbulb size={20} strokeWidth={2} aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            className={[
              styles.studioActionBtn,
              studioChosungOn ? styles.studioHintBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={!current || bootstrapping || reshuffling || studioShuffleAnim}
            onClick={() => studioRef.current?.toggleChosungHint()}
            aria-label={
              studioChosungOn
                ? "Hide initial consonant hint"
                : "Show initial consonant hint"
            }
            aria-pressed={studioChosungOn}
            title="초성 hint (H)"
          >
            <span className={styles.studioChosungIcon} aria-hidden>
              <ChosungHintIcon size={20} />
            </span>
          </button>
          <button
            type="button"
            className={[
              styles.studioActionBtn,
              studioOptionsOn ? styles.studioHintBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={!current || bootstrapping || reshuffling || studioShuffleAnim}
            onClick={() => studioRef.current?.toggleOptions()}
            aria-label={
              studioOptionsOn ? "Hide answer options" : "Show answer options"
            }
            aria-pressed={studioOptionsOn}
            title="Options hint"
          >
            <Grid2X2 size={20} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.studioActionBtn}
            disabled={bootstrapping || reshuffling || studioShuffleAnim}
            onClick={() => void handleReshuffle()}
            aria-label="Shuffle deck — get a new random quiz list"
            title="New deck"
          >
            <Shuffle
              size={20}
              strokeWidth={2}
              aria-hidden
              className={
                reshuffling || studioShuffleAnim
                  ? styles.shuffleIconSpin
                  : undefined
              }
            />
          </button>
          {current ? (
            <button
              type="button"
              className={[
                styles.studioActionBtn,
                styles.studioHeartBtn,
                currentFlagged ? styles.studioHeartBtnActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={flagBusy}
              onClick={() => void handleToggleFlag()}
              aria-label={
                currentFlagged ? "Remove from review" : "Save for review"
              }
              aria-pressed={currentFlagged}
            >
              <Heart
                size={20}
                strokeWidth={2}
                fill={currentFlagged ? "currentColor" : "none"}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      ) : null}

      {started && !bootstrapping && !error ? (
        <QuizSetProgress
          current={setComplete ? QUIZ_SET_SIZE : setCurrentQuestion}
          total={QUIZ_SET_SIZE}
        />
      ) : null}

      <div
        className={[
          styles.vocabQuizMain,
          studioFocus ? styles.vocabQuizMainStudio : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showStudioShuffle ? (
          <StudioShuffleOverlay
            topImage={studioShuffleTopImage}
            images={studioShuffleImages}
          />
        ) : bootstrapping || reshuffling ? (
          <div className={styles.emptyState}>
            {reshuffling ? "Shuffling a new deck…" : "Loading quizzes…"}
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button type="button" className={styles.modeBtn} onClick={() => void resync()}>
              Retry
            </button>
          </div>
        ) : !started ? (
          <div
            className={styles.startOverlay}
            role="button"
            tabIndex={0}
            onClick={handleStart}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStart();
              }
            }}
          >
            <div className={styles.startTitle}>Vocab Quiz</div>
            <p className={styles.startHint}>
              {isMobile
                ? "Tap to start. See a picture, pick the Korean word, then tap anywhere to continue."
                : "Tap to start. Manual picks an answer, Auto plays the countdown, and Studio uses flip cards like the home deck."}
            </p>
            <button
              type="button"
              className={styles.startBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
            >
              Tap to start
            </button>
          </div>
        ) : setComplete ? (
          <div className={styles.setCompleteState}>
            <p className={styles.setCompleteTitle}>Set complete!</p>
            <p className={styles.setCompleteScore}>
              {setCorrect} / {QUIZ_SET_SIZE} correct
            </p>
            <button
              type="button"
              className={styles.setCompleteBtn}
              onClick={startNextQuizSet}
            >
              Next 7
            </button>
          </div>
        ) : !current ? (
          <div className={styles.emptyState}>
            <p>No quizzes in queue.</p>
            <button type="button" className={styles.modeBtn} onClick={() => void handleReshuffle()}>
              New deck
            </button>
          </div>
        ) : mode === "auto" ? (
          <AutoQuizPlayer
            ref={autoRef}
            key={current.id}
            quiz={current}
            deviceId={deviceId}
            audio={audio}
            frozen={hiddenPaused}
            paused={userPaused || wordExplainOpen}
            onDone={(opts) => advanceRef.current(opts)}
            onAnswered={recordSetAnswer}
          />
        ) : mode === "studio" ? (
          <StudioQuizPlayer
            ref={studioRef}
            key={current.id}
            quiz={current}
            upcoming={queue.slice(1, 3)}
            deviceId={deviceId}
            audio={audio}
            frozen={hiddenPaused}
            paused={userPaused || wordExplainOpen}
            onDone={(opts) => advanceRef.current(opts)}
            onAnswered={recordSetAnswer}
            onShowOptionsChange={setStudioOptionsOn}
            chosungHintOn={studioChosungOn}
            onShowChosungHintChange={setStudioChosungOn}
            onSeeDetails={openWordExplain}
          />
        ) : (
          <ManualQuizPlayer
            ref={manualRef}
            key={current.id}
            quiz={current}
            deviceId={deviceId}
            audio={audio}
            frozen={hiddenPaused}
            paused={userPaused || wordExplainOpen}
            onDone={(opts) => advanceRef.current(opts)}
            onAnswered={recordSetAnswer}
            onSeeDetails={openWordExplain}
          />
        )}
      </div>

      <VocabQuizControls
        visible={controlsVisible && mode !== "studio" && !isMobile}
        paused={paused}
        canGoBack={canGoBack}
        onCommand={handleCommand}
      />
      </div>

      <footer className={styles.storeFooter}>
        <p className={styles.storeFooterLabel}>Get the app</p>
        <AppStoreBadges size="md" theme="light" utmSource="vocab-quiz" utmContent="player-footer" />
      </footer>

      {current && explainKorean ? (
        <WordExplanationSheet
          open={wordExplainOpen}
          quizId={current.id}
          korean={explainKorean}
          english={explainEnglish || undefined}
          audio={audio}
          onClose={() => setWordExplainOpen(false)}
        />
      ) : null}
    </div>
  );
}
