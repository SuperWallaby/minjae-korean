/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "picture-audio-vs-text-korean-memorization";

export const post: BlogPost = {
  slug: SLUG,
  title: "Picture + Audio vs Text-Only Korean Memorization",
  description:
    "Text lists are easy to make and easy to forget. Picture + audio Korean vocab ties meaning and sound together — the loop behind What is this called in Korean.",
  keywords: [
    "picture Korean vocabulary",
    "audio Korean vocab practice",
    "text only memorization Korean",
    VOCAB_QUIZ_APP_NAME,
  ],
  faq: [
    {
      question: "Is picture learning better than word lists?",
      answer:
        "For recognition of concrete words, pictures often create stronger meaning links than English–Korean text pairs alone. Abstract grammar still needs explanation.",
    },
    {
      question: "Why add audio?",
      answer:
        "You need the sound of the word, not only the spelling. Audio turns a visual quiz into listening practice in the same second.",
    },
    {
      question: `Does ${VOCAB_QUIZ_APP_NAME} use pictures and audio?`,
      answer: `Yes — each round is built around an image, Korean choices, and pronunciation audio.`,
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-picture-audio-vs-text-korean-memorization-1784604282287_tr8955.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-picture-audio-vs-text-korean-memorization-1784604282287_tr8955.webp",
  createdAt: "2026-07-12T10:20:00.000Z",
  updatedAt: "2026-07-12T10:20:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Text-only Korean word lists are easy to skim and easy to forget;
            picture + audio forces meaning and sound in the same moment.
          </strong>
          {" "}
          That’s why {VOCAB_QUIZ_APP_NAME} centers every card on an image and
          spoken Korean — not a spreadsheet.
        </>
      ),
    },
    {
      subtitle: "What text-only misses",
      content: (
        <>
          {"You can “know” a translation without recognizing the thing in real "}
          {"life, and without hearing the word. Short quizzes with pictures "}
          {"close that gap faster for everyday nouns and actions."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Meaning first (picture), then form (Hangul), then sound (audio)."}
          <br />
          {"• Lists are fine drafts; quizzes make contact."}
          <br />
          {"• Keep text notes — don’t study only inside notes."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Mute forever. Only reading romanization. Memorizing English glosses "}
          {"without looking at the picture."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/human-made-korean-quizzes-vs-ai">
            Human-made quizzes
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-quiz-vs-flashcards">
            Quiz vs flashcards
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try it",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{"Is picture learning better than word lists?"}</strong>
          <br />
          {"Often for concrete recognition — lists still help as drafts."}
          <Gap />
          <strong>{"Why add audio?"}</strong>
          <br />
          {"You need sound, not only spelling."}
          <Gap />
          <strong>{`Does ${VOCAB_QUIZ_APP_NAME} use pictures and audio?`}</strong>
          <br />
          {"Yes — every round."}
        </>
      ),
    },
  ],
};
