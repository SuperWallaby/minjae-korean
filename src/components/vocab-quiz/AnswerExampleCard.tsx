"use client";

import * as React from "react";
import { BookOpen, Volume2 } from "lucide-react";

import type { KoreanQuizPreparedExample } from "@/lib/koreanQuiz/types";
import type { VocabQuizAudio } from "@/lib/vocabQuiz/audio";

import styles from "./vocab-quiz.module.css";

type Props = {
  quizId: string;
  examples: KoreanQuizPreparedExample[];
  audio: VocabQuizAudio;
  onSeeDetails?: () => void;
};

export function AnswerExampleCard({
  quizId,
  examples,
  audio,
  onSeeDetails,
}: Props) {
  const [loadingIndex, setLoadingIndex] = React.useState<number | null>(null);
  const [ttsUrls, setTtsUrls] = React.useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    for (const example of examples) {
      if (example.ttsUrl) initial[example.index] = example.ttsUrl;
    }
    return initial;
  });

  React.useEffect(() => {
    const next: Record<number, string> = {};
    for (const example of examples) {
      if (example.ttsUrl) next[example.index] = example.ttsUrl;
    }
    setTtsUrls(next);
    setLoadingIndex(null);
  }, [examples, quizId]);

  const playExampleTts = React.useCallback(
    async (event: React.MouseEvent, example: KoreanQuizPreparedExample) => {
      event.stopPropagation();
      if (loadingIndex !== null) return;

      const play = async (url: string) => {
        await audio.playSpeechUrl(url);
      };

      const cached = ttsUrls[example.index];
      if (cached && /quiz-media\.kajakorean\.com/i.test(cached)) {
        void play(cached);
        return;
      }

      setLoadingIndex(example.index);
      try {
        const res = await fetch(
          `/api/vocab-quiz/word-explanation/tts?quizId=${encodeURIComponent(quizId)}&index=${example.index}`,
        );
        const json = (await res.json().catch(() => null)) as
          | { url?: string; error?: string }
          | null;
        if (!res.ok || !json?.url) {
          throw new Error(json?.error || "Could not play example audio.");
        }
        setTtsUrls((prev) => ({ ...prev, [example.index]: json.url! }));
        await play(json.url);
      } catch {
        // Soft-fail — card still useful without audio.
      } finally {
        setLoadingIndex(null);
      }
    },
    [audio, loadingIndex, quizId, ttsUrls],
  );

  if (examples.length === 0) return null;

  return (
    <div
      className={styles.answerExampleCard}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {examples.map((example, i) => {
        const ttsBusy = loadingIndex === example.index;
        return (
          <div
            key={`${example.index}-${example.korean}`}
            className={
              i > 0
                ? `${styles.answerExampleMain} ${styles.answerExampleRowSpaced}`
                : styles.answerExampleMain
            }
          >
            <div className={styles.answerExampleText}>
              <p className={styles.answerExampleKorean}>{example.korean}</p>
              <p className={styles.answerExampleEnglish}>{example.english}</p>
            </div>
            <button
              type="button"
              className={styles.answerExampleSpeakBtn}
              aria-label="Listen to example"
              disabled={ttsBusy}
              onClick={(e) => void playExampleTts(e, example)}
            >
              <Volume2 size={22} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        );
      })}
      {onSeeDetails ? (
        <button
          type="button"
          className={styles.answerExampleDetailsBtn}
          onClick={(e) => {
            e.stopPropagation();
            onSeeDetails();
          }}
        >
          <BookOpen size={16} strokeWidth={2.25} aria-hidden />
          See details
        </button>
      ) : null}
    </div>
  );
}
