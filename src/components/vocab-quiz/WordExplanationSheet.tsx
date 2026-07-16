"use client";

import * as React from "react";
import { Lightbulb, Volume2, X } from "lucide-react";

import type { VocabQuizAudio } from "@/lib/vocabQuiz/audio";

import styles from "./vocab-quiz.module.css";

export type WordExplanationExample = {
  korean: string;
  english: string;
  ttsUrl?: string;
};

export type WordExplanationData = {
  quizId: string;
  korean: string;
  english: string;
  explanation: string;
  examples: WordExplanationExample[];
  cached: boolean;
};

type Props = {
  open: boolean;
  quizId: string;
  korean: string;
  english?: string;
  audio: VocabQuizAudio;
  onClose: () => void;
};

const LOADING_MESSAGES = [
  "Hang tight — writing your explanation…",
  "Thinking about this word…",
  "Cooking up some examples…",
  "Almost there…",
];

export function WordExplanationSheet({
  open,
  quizId,
  korean,
  english,
  audio,
  onClose,
}: Props) {
  const [data, setData] = React.useState<WordExplanationData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingTtsIndex, setLoadingTtsIndex] = React.useState<number | null>(
    null,
  );
  const [exampleTtsUrls, setExampleTtsUrls] = React.useState<
    Record<number, string>
  >({});
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [ttsError, setTtsError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vocab-quiz/word-explanation?quizId=${encodeURIComponent(quizId)}`,
      );
      const json = (await res.json().catch(() => null)) as
        | WordExplanationData
        | { error?: string }
        | null;
      if (requestId !== requestIdRef.current) return;
      if (!res.ok || !json || !("explanation" in json)) {
        throw new Error(
          json && "error" in json && json.error
            ? json.error
            : "Could not load explanation.",
        );
      }
      setData(json);
      setLoading(false);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Could not load explanation.");
      setLoading(false);
    }
  }, [quizId]);

  React.useEffect(() => {
    if (!open) return;
    setData(null);
    setExampleTtsUrls({});
    setLoadingTtsIndex(null);
    setTtsError(null);
    setMessageIndex(0);
    void load();
  }, [open, quizId, load]);

  React.useEffect(() => {
    if (!open || !loading) return;
    const timer = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [open, loading]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const playExampleTts = async (
    index: number,
    example: WordExplanationExample,
  ) => {
    setTtsError(null);
    const cachedUrl = (exampleTtsUrls[index] ?? example.ttsUrl)?.trim() || "";
    // Ignore stale URLs from the wrong CDN (site R2 ≠ quiz-media).
    const usableCache =
      cachedUrl &&
      (/quiz-media\.kajakorean\.com/i.test(cachedUrl) ||
        cachedUrl.startsWith("/"))
        ? cachedUrl
        : "";

    if (usableCache) {
      try {
        await audio.playSpeechUrl(usableCache);
      } catch (err) {
        setTtsError(
          err instanceof Error ? err.message : "Could not play example audio.",
        );
      }
      return;
    }

    setLoadingTtsIndex(index);
    try {
      const res = await fetch(
        `/api/vocab-quiz/word-explanation/tts?quizId=${encodeURIComponent(quizId)}&index=${index}`,
      );
      const json = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !json?.url) {
        throw new Error(json?.error || "Could not play example audio.");
      }
      setExampleTtsUrls((prev) => ({ ...prev, [index]: json.url! }));
      setLoadingTtsIndex(null);
      await audio.playSpeechUrl(json.url);
    } catch (err) {
      setLoadingTtsIndex(null);
      setTtsError(
        err instanceof Error ? err.message : "Could not play example audio.",
      );
    }
  };

  if (!open) return null;

  const gloss = (data?.english ?? english ?? "").trim();

  return (
    <div className={styles.wordExplainOverlay} role="presentation">
      <button
        type="button"
        className={styles.wordExplainBackdrop}
        aria-label="Close explanation"
        onClick={onClose}
      />
      <div
        className={styles.wordExplainSheet}
        role="dialog"
        aria-modal="true"
        aria-label={`Explanation for ${korean}`}
      >
        <div className={styles.wordExplainHandle} aria-hidden />
        <div className={styles.wordExplainHeader}>
          <Lightbulb
            size={22}
            strokeWidth={2}
            className={styles.wordExplainHeaderIcon}
            aria-hidden
          />
          <div className={styles.wordExplainTitles}>
            <div className={styles.wordExplainKorean}>{korean}</div>
            {gloss ? <div className={styles.wordExplainEnglish}>{gloss}</div> : null}
          </div>
          <button
            type="button"
            className={styles.wordExplainClose}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className={styles.wordExplainBody}>
          {loading ? (
            <div className={styles.wordExplainLoading}>
              <div className={styles.wordExplainLoadingBulb} aria-hidden>
                <Lightbulb size={40} strokeWidth={2} />
              </div>
              <div className={styles.wordExplainLoadingDots} aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <p className={styles.wordExplainLoadingMsg}>
                {LOADING_MESSAGES[messageIndex]}
              </p>
            </div>
          ) : error ? (
            <div className={styles.wordExplainError}>
              <p>{error}</p>
              <button
                type="button"
                className={styles.modeBtn}
                onClick={() => void load()}
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <>
              <p className={styles.wordExplainText}>{data.explanation}</p>
              {data.examples.length > 0 ? (
                <div className={styles.wordExplainExamples}>
                  <div className={styles.wordExplainExamplesLabel}>Examples</div>
                  {ttsError ? (
                    <p className={styles.wordExplainExampleWait}>{ttsError}</p>
                  ) : null}
                  {data.examples.map((example, index) => {
                    const ttsBusy = loadingTtsIndex === index;
                    return (
                      <div key={`${example.korean}-${index}`} className={styles.wordExplainExample}>
                        <div className={styles.wordExplainExampleText}>
                          <div className={styles.wordExplainExampleKo}>
                            {example.korean}
                          </div>
                          <div className={styles.wordExplainExampleEn}>
                            {example.english}
                          </div>
                          {ttsBusy ? (
                            <div className={styles.wordExplainExampleWait}>
                              Please wait a moment…
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className={styles.wordExplainTtsBtn}
                          disabled={ttsBusy}
                          onClick={() => void playExampleTts(index, example)}
                          aria-label="Listen to example"
                          title="Listen"
                        >
                          <Volume2 size={20} strokeWidth={2} aria-hidden />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
