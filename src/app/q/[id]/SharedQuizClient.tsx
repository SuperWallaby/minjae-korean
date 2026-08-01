"use client";

import * as React from "react";
import Link from "next/link";

import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";
import { getKoreanQuizAppStoreLinks } from "@/lib/koreanQuizAppLinks";
import { VocabQuizAudio } from "@/lib/vocabQuiz/audio";
import { getOrCreateDeviceId } from "@/lib/vocabQuiz/device";
import { withVocabQuizUtm } from "@/lib/vocabQuizAeoLinks";
import { ManualQuizPlayer } from "@/components/vocab-quiz/ManualQuizPlayer";
import { WordExplanationSheet } from "@/components/vocab-quiz/WordExplanationSheet";
import quizStyles from "@/components/vocab-quiz/vocab-quiz.module.css";

type Props = {
  quiz: KoreanQuizPrepared;
};

export function SharedQuizClient({ quiz }: Props) {
  const audioRef = React.useRef<VocabQuizAudio | null>(null);
  if (!audioRef.current) audioRef.current = new VocabQuizAudio();
  const audio = audioRef.current;

  const deviceId = React.useMemo(() => getOrCreateDeviceId(), []);
  const [finished, setFinished] = React.useState(false);
  const [wordExplainOpen, setWordExplainOpen] = React.useState(false);
  const stores = getKoreanQuizAppStoreLinks();
  const moreQuizzesHref = withVocabQuizUtm("/vocab-quiz", {
    source: "share",
    content: `q:${quiz.id}`,
  });

  React.useEffect(() => {
    return () => {
      void audio.stopAll();
    };
  }, [audio]);

  if (finished) {
    return (
      <div className={quizStyles.shareDone}>
        <p className={quizStyles.shareDoneEyebrow}>Nice work</p>
        <h2 className={quizStyles.shareDoneTitle}>Want more?</h2>
        <p className={quizStyles.shareDoneBody}>
          Keep practicing free in the browser, or get the Kaja Korean app.
        </p>
        <div className={quizStyles.shareDoneActions}>
          <Link className={quizStyles.sharePrimaryCta} href={moreQuizzesHref}>
            More quizzes
          </Link>
          <a
            className={quizStyles.shareSecondaryCta}
            href={stores.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the app
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ManualQuizPlayer
        quiz={quiz}
        deviceId={deviceId}
        audio={audio}
        frozen={false}
        paused={wordExplainOpen}
        onDone={() => setFinished(true)}
        onSeeDetails={() => setWordExplainOpen(true)}
      />
      <WordExplanationSheet
        open={wordExplainOpen}
        quizId={quiz.id}
        korean={
          quiz.choices.find((choice) => choice.id === quiz.correctChoiceId)
            ?.label ?? ""
        }
        english={
          quiz.choices.find((choice) => choice.id === quiz.correctChoiceId)
            ?.english || quiz.illustrationEnglish
        }
        audio={audio}
        onClose={() => setWordExplainOpen(false)}
      />
    </>
  );
}
