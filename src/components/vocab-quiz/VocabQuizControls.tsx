"use client";

import * as React from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

import {
  formatShortcutKeys,
  VOCAB_QUIZ_SHORTCUTS,
  type VocabQuizCommandId,
} from "@/lib/vocabQuiz/playbackCommands";

import styles from "./vocab-quiz.module.css";

type Props = {
  visible: boolean;
  paused: boolean;
  canGoBack: boolean;
  onCommand: (id: VocabQuizCommandId) => void;
};

const ICON_SIZE = 18;

function ControlIcon({
  id,
  paused,
}: {
  id: VocabQuizCommandId;
  paused: boolean;
}) {
  const iconProps = {
    size: ICON_SIZE,
    strokeWidth: 2,
    className: styles.controlTouchIcon,
    "aria-hidden": true as const,
  };

  if (id === "pause") {
    return paused ? <Play {...iconProps} /> : <Pause {...iconProps} />;
  }
  if (id === "back") return <SkipBack {...iconProps} />;
  return <SkipForward {...iconProps} />;
}

export function VocabQuizControls({
  visible,
  paused,
  canGoBack,
  onCommand,
}: Props) {
  if (!visible) return null;

  return (
    <div className={styles.controlsBar}>
      <div className={styles.controlsTouchRow}>
        {VOCAB_QUIZ_SHORTCUTS.map((cmd) => {
          const disabled = cmd.id === "back" && !canGoBack;
          const label =
            cmd.id === "pause" && paused ? "Resume" : cmd.mobileLabel;
          const isPauseActive = cmd.id === "pause" && paused;
          return (
            <button
              key={cmd.id}
              type="button"
              className={`${styles.controlTouchBtn} ${isPauseActive ? styles.controlTouchBtnPaused : ""}`}
              disabled={disabled}
              onClick={() => onCommand(cmd.id)}
              aria-label={label}
              aria-pressed={isPauseActive ? true : undefined}
            >
              <ControlIcon id={cmd.id} paused={paused} />
            </button>
          );
        })}
      </div>
      <div className={styles.controlsShortcutRow}>
        {VOCAB_QUIZ_SHORTCUTS.map((cmd) => {
          const label = cmd.id === "pause" && paused ? "Resume" : cmd.label;
          const keys =
            cmd.id === "pause" && paused ? ["Space", "K"] : cmd.keys;
          return (
            <div key={cmd.id} className={styles.controlShortcutItem}>
              <span className={styles.controlShortcutLabel}>{label}</span>
              <kbd className={styles.controlShortcutKbd}>
                {formatShortcutKeys(keys)}
              </kbd>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useVocabQuizKeyboard(
  enabled: boolean,
  handlers: {
    onPause: () => void;
    onBack: () => void;
    onNext: () => void;
  },
) {
  const handlersRef = React.useRef(handlers);
  handlersRef.current = handlers;

  React.useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        handlersRef.current.onPause();
        return;
      }
      if (key === "k" || key === "K") {
        e.preventDefault();
        handlersRef.current.onPause();
        return;
      }
      if (key === "ArrowLeft" || key === "b" || key === "B") {
        e.preventDefault();
        handlersRef.current.onBack();
        return;
      }
      if (key === "ArrowRight" || key === "n" || key === "N") {
        e.preventDefault();
        handlersRef.current.onNext();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
