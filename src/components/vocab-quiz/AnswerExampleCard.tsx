"use client";

import * as React from "react";
import { BookOpen, Volume2 } from "lucide-react";

import type { KoreanQuizPreparedExample } from "@/lib/koreanQuiz/types";
import type { VocabQuizAudio } from "@/lib/vocabQuiz/audio";

import styles from "./vocab-quiz.module.css";

type Props = {
  quizId: string;
  example: KoreanQuizPreparedExample;
  audio: VocabQuizAudio;
  onSeeDetails: () => void;
};

export function AnswerExampleCard({
  quizId,
  example,
  audio,
  onSeeDetails,
}: Props) {
  const [loadingTts, setLoadingTts] = React.useState(false);
  const [ttsUrl, setTtsUrl] = React.useState(example.ttsUrl);

  React.useEffect(() => {
    setTtsUrl(example.ttsUrl);
    setLoadingTts(false);
  }, [example.ttsUrl, example.index, quizId]);

  const playExampleTts = React.useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (loadingTts) return;

      const play = async (url: string) => {
        await audio.stopAll();
        await audio.playUrl(url);
      };

      if (ttsUrl) {
        void play(ttsUrl);
        return;
      }

      setLoadingTts(true);
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
        setTtsUrl(json.url);
        await play(json.url);
      } catch {
        // Soft-fail — card still useful without audio.
      } finally {
        setLoadingTts(false);
      }
    },
    [audio, example.index, loadingTts, quizId, ttsUrl],
  );

  return (
    <div
      className={styles.answerExampleCard}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className={styles.answerExampleMain}>
        <div className={styles.answerExampleText}>
          <p className={styles.answerExampleKorean}>{example.korean}</p>
          <p className={styles.answerExampleEnglish}>{example.english}</p>
        </div>
        <button
          type="button"
          className={styles.answerExampleSpeakBtn}
          aria-label="Listen to example"
          disabled={loadingTts}
          onClick={(e) => void playExampleTts(e)}
        >
          <Volume2 size={22} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
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
    </div>
  );
}
