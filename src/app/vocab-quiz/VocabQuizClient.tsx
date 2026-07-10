"use client";

import Link from "next/link";
import * as React from "react";
import { Flag, Heart, Volume2, VolumeX } from "lucide-react";

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
import {
  useVocabQuizKeyboard,
  VocabQuizControls,
} from "@/components/vocab-quiz/VocabQuizControls";
import { AppStoreBadges } from "@/components/site/AppStoreBadges";
import styles from "@/components/vocab-quiz/vocab-quiz.module.css";
import { useVocabQuizQueue, type VocabQuizAdvanceOptions } from "@/hooks/useVocabQuizQueue";
import { useQuizReviewFlags } from "@/hooks/useQuizReviewFlags";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import type { VocabQuizCommandId } from "@/lib/vocabQuiz/playbackCommands";
import {
  MODE_KEY,
  SOUND_ENABLED_KEY,
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
  return "manual";
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
  const [soundOn, setSoundOn] = React.useState(true);
  const [hiddenPaused, setHiddenPaused] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const {
    current,
    queue,
    bootstrapping,
    error,
    advance,
    goBack,
    history,
    resync,
    deviceId,
  } = useVocabQuizQueue(mode);

  const { count: flaggedCount, isFlagged, toggleFlag } = useQuizReviewFlags(deviceId);
  const [flagBusy, setFlagBusy] = React.useState(false);

  advanceRef.current = (opts) => {
    void advance(opts);
  };
  goBackRef.current = goBack;

  const paused = hiddenPaused || userPaused;
  const canGoBack = history.length > 0;
  const controlsVisible = started && Boolean(current) && !bootstrapping && !error;

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

  const handleToggleFlag = async () => {
    if (!current || flagBusy) return;
    setFlagBusy(true);
    await toggleFlag(current.id);
    setFlagBusy(false);
  };

  const currentFlagged = current ? isFlagged(current.id) : false;
  const studioFocus = mode === "studio" && started;

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

      {studioFocus && started && current ? (
        <button
          type="button"
          className={[
            styles.studioHeartBtn,
            currentFlagged ? styles.studioHeartBtnActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={flagBusy}
          onClick={() => void handleToggleFlag()}
          aria-label={currentFlagged ? "Remove from review" : "Save for review"}
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

      <div
        className={[
          styles.vocabQuizMain,
          studioFocus ? styles.vocabQuizMainStudio : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {bootstrapping ? (
          <div className={styles.emptyState}>Loading quizzes…</div>
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
            <button type="button" className={styles.modeBtn} onClick={() => void resync()}>
              Reload
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
            paused={userPaused}
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
            paused={userPaused}
            onDone={(opts) => advanceRef.current(opts)}
          />
        ) : (
          <ManualQuizPlayer
            ref={manualRef}
            key={current.id}
            quiz={current}
            deviceId={deviceId}
            audio={audio}
            frozen={hiddenPaused}
            paused={userPaused}
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
    </div>
  );
}
