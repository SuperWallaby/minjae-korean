"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Flag, Volume2, VolumeX } from "lucide-react";

import {
  AutoQuizPlayer,
  type AutoQuizPlayerHandle,
} from "@/components/vocab-quiz/AutoQuizPlayer";
import {
  ManualQuizPlayer,
  type ManualQuizPlayerHandle,
} from "@/components/vocab-quiz/ManualQuizPlayer";
import {
  useVocabQuizKeyboard,
  VocabQuizControls,
} from "@/components/vocab-quiz/VocabQuizControls";
import { AppStoreBadges } from "@/components/site/AppStoreBadges";
import styles from "@/components/vocab-quiz/vocab-quiz.module.css";
import { useVocabQuizQueue } from "@/hooks/useVocabQuizQueue";
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
  if (mode === "auto" || mode === "manual") return mode;
  return null;
}

function readStoredMode(): VocabQuizMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "auto" || v === "manual") return v;
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
  const advanceRef = React.useRef<() => void>(() => undefined);
  const goBackRef = React.useRef<() => void>(() => undefined);

  const {
    current,
    bootstrapping,
    error,
    advance,
    goBack,
    history,
    resync,
    deviceId,
  } = useVocabQuizQueue();

  const { count: flaggedCount, isFlagged, toggleFlag } = useQuizReviewFlags(deviceId);
  const [flagBusy, setFlagBusy] = React.useState(false);

  advanceRef.current = advance;
  goBackRef.current = goBack;

  const [mode, setMode] = React.useState<VocabQuizMode>("manual");
  const [soundOn, setSoundOn] = React.useState(true);
  const [hiddenPaused, setHiddenPaused] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [audioReady, setAudioReady] = React.useState(false);

  const paused = hiddenPaused || userPaused;
  const canGoBack = history.length > 0;
  const controlsVisible = Boolean(current) && !bootstrapping && !error;

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

  React.useEffect(() => {
    if (bootstrapping || error || !current) {
      setAudioReady(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      audio.setEnabled(true);
      setSoundOn(true);
      try {
        localStorage.setItem(SOUND_ENABLED_KEY, "1");
      } catch {
        // ignore
      }
      await audio.unlock();
      if (!cancelled) setAudioReady(true);
    })();

    return () => {
      cancelled = true;
      setAudioReady(false);
    };
  }, [audio, bootstrapping, error, current?.id]);

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

  const handleToggleFlag = async () => {
    if (!current || flagBusy) return;
    setFlagBusy(true);
    await toggleFlag(current.id);
    setFlagBusy(false);
  };

  const currentFlagged = current ? isFlagged(current.id) : false;

  return (
    <div className={styles.vocabQuizRoot}>
      <div className={styles.vocabQuizPageHeader}>
        <Link href="/" className={styles.reviewBackLink}>
          <ArrowLeft size={16} aria-hidden />
          Home
        </Link>
      </div>

      <div className={styles.vocabQuizGameShell}>
        <div className={styles.toolbar}>
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
          </div>
        <div className={styles.toolbarGroup}>
          {current ? (
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

      <div className={styles.vocabQuizMain}>
        {bootstrapping ? (
          <div className={styles.emptyState}>Loading quizzes…</div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button type="button" className={styles.modeBtn} onClick={() => void resync()}>
              Retry
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
          audioReady ? (
            <AutoQuizPlayer
              ref={autoRef}
              key={current.id}
              quiz={current}
              deviceId={deviceId}
              audio={audio}
              frozen={hiddenPaused}
              paused={userPaused}
              onDone={() => advanceRef.current()}
            />
          ) : (
            <div className={styles.emptyState}>Starting…</div>
          )
        ) : (
          <ManualQuizPlayer
            ref={manualRef}
            key={current.id}
            quiz={current}
            deviceId={deviceId}
            audio={audio}
            frozen={hiddenPaused}
            paused={userPaused}
            onDone={() => advanceRef.current()}
          />
        )}
      </div>

      <VocabQuizControls
        visible={controlsVisible}
        paused={paused}
        canGoBack={canGoBack}
        onCommand={handleCommand}
      />
      </div>

      <footer className={styles.storeFooter}>
        <p className={styles.storeFooterLabel}>Get the app</p>
        <AppStoreBadges size="md" theme="light" />
      </footer>
    </div>
  );
}
