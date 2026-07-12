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
import {
  useVocabQuizKeyboard,
  VocabQuizControls,
} from "@/components/vocab-quiz/VocabQuizControls";
import { AppStoreBadges } from "@/components/site/AppStoreBadges";
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

  const [mode, setMode] = React.useState<VocabQuizMode>("studio");
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
  const [wordExplainOpen, setWordExplainOpen] = React.useState(false);

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

  const { count: flaggedCount, isFlagged, toggleFlag } = useQuizReviewFlags(deviceId);
  const [flagBusy, setFlagBusy] = React.useState(false);

  advanceRef.current = (opts) => {
    void advance(opts);
  };
  goBackRef.current = goBack;

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
    setMode(readModeFromUrl() ?? readStoredMode());
    setSoundOn(true);
    audio.setEnabled(true);
  }, [audio]);

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

  useVocabQuizKeyboard(controlsVisible, {
    onPause: togglePause,
    onBack: handleBack,
    onNext: handleNext,
  });

  const setModePersist = (next: VocabQuizMode) => {
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

  const handleStart = async () => {
    audio.setEnabled(true);
    setSoundOn(true);
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, "1");
    } catch {
      // ignore
    }
    await audio.unlock();
    setUserPaused(false);
    setStarted(true);
  };

  const handleReshuffle = React.useCallback(async () => {
    if (reshuffling || studioShuffleAnim) return;
    void audio.stopAll();
    setUserPaused(false);

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
      // flip (~0.3s) + riffle (~1.55s)
      const minMs = 1850;
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
    studioShuffleAnim,
  ]);

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
        <div className={`${styles.toolbarGroup} ${studioFocus ? styles.toolbarGroupHidden : ""}`}>
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
          {flaggedCount > 0 ? (
            <Link href="/vocab-quiz/review" className={styles.reviewLink}>
              Review ({flaggedCount})
            </Link>
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
          <div className={styles.startOverlay}>
            <div className={styles.startTitle}>Vocab Quiz</div>
            <p className={styles.startHint}>
              Tap to start. Manual picks an answer, Auto plays the countdown, and
              Studio uses flip cards like the home deck.
            </p>
            <button type="button" className={styles.startBtn} onClick={() => void handleStart()}>
              Tap to start
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
            onShowOptionsChange={setStudioOptionsOn}
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
          />
        )}
      </div>

      <VocabQuizControls
        visible={controlsVisible && mode !== "studio"}
        paused={paused}
        canGoBack={canGoBack}
        onCommand={handleCommand}
      />
      </div>

      {!studioFocus ? (
      <footer className={styles.storeFooter}>
        <p className={styles.storeFooterLabel}>Get the app</p>
        <AppStoreBadges size="md" theme="light" />
      </footer>
      ) : null}

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
