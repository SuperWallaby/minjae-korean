/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-vs-duolingo";

export const post: BlogPost = {
  slug: SLUG,
  title: `${VOCAB_QUIZ_APP_NAME} vs Duolingo: Which Fits Korean Vocab?`,
  description: `Duolingo is stronger for a full structured path. ${VOCAB_QUIZ_APP_NAME} is built for short, picture-based Korean vocab sessions with almost no ads. Here’s when to use each.`,
  keywords: [
    `${VOCAB_QUIZ_APP_NAME} vs Duolingo`,
    "Duolingo alternative Korean vocabulary",
    "Duolingo vs Korean vocab quiz",
    "best app for Korean words",
    "picture Korean quiz",
  ],
  faq: [
    {
      question: `Is ${VOCAB_QUIZ_APP_NAME} better than Duolingo?`,
      answer: `Not overall — different jobs. Duolingo fits structured daily lessons; ${VOCAB_QUIZ_APP_NAME} fits 1–5 minute picture vocab reps with almost no ads.`,
    },
    {
      question: "Can I use both Duolingo and a vocab quiz app?",
      answer:
        "Yes. Many learners keep Duolingo for path/streak structure and add a picture quiz for pure word recognition on short breaks.",
    },
    {
      question: "Which is better for commute study?",
      answer: `${VOCAB_QUIZ_APP_NAME} usually fits better — open, quiz a few pictures, done. Duolingo lessons can feel heavy between subway stops.`,
    },
    {
      question: "Does Duolingo teach Korean vocabulary well?",
      answer:
        "It teaches words inside lessons, but the product is a full course experience. If you only want vocab pictures, a focused quiz is clearer.",
    },
  ],
  level: 2,
  createdAt: "2026-07-12T09:20:00.000Z",
  updatedAt: "2026-07-12T09:20:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Duolingo is stronger for a full structured Korean path;{" "}
            {VOCAB_QUIZ_APP_NAME} is built for short, picture-based Korean vocab
            sessions with almost no ads.
          </strong>
          {" "}
          Pick by job: course roadmap vs micro word recognition — not by which
          logo is louder.
        </>
      ),
    },
    {
      subtitle: "Quick comparison",
      content: (
        <>
          <strong>{"Job"}</strong>
          {" → Duolingo: lessons & path · "}
          {VOCAB_QUIZ_APP_NAME}
          {": 30s–5min word quizzes"}
          <Gap />
          <strong>{"Ads / pressure"}</strong>
          {" → Duolingo: free tier ads & streak energy · ours: almost none"}
          <Gap />
          <strong>{"Pictures for words"}</strong>
          {" → Duolingo: sometimes · ours: every card"}
          <Gap />
          <strong>{"Grammar roadmap"}</strong>
          {" → Duolingo: strong · ours: intentionally light (vocab only)"}
          <Gap />
          <strong>{"Live quiz together"}</strong>
          {" → Duolingo: no · ours: yes"}
        </>
      ),
    },
    {
      subtitle: "Who should use Duolingo",
      content: (
        <>
          {"You want a guided path, mixed skills, and a familiar gamified "}
          {"habit. You’re fine investing in a longer lesson when you sit down."}
        </>
      ),
    },
    {
      subtitle: `Who should use ${VOCAB_QUIZ_APP_NAME}`,
      content: (
        <>
          {"You want "}
          <strong>{"word-only picture reps"}</strong>
          {" in noisy, short pockets of time — commute, elevator, coffee line. "}
          {"You prefer calm UI and human-made cards over streak theater."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Duolingo = structured course energy."}
          <br />
          {"• Picture quiz app = micro vocab recognition."}
          <br />
          {"• Many people use both without conflict."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"App-hopping every week. Expecting one app to teach all of Korean. "}
          {"Judging a vocab quiz by whether it has a full tree like Duolingo."}
        </>
      ),
    },
    {
      subtitle: "Related comparisons",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-anki">
            vs Anki
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-quiz-vs-flashcards">
            Quiz vs flashcards
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/best-korean-vocabulary-apps-for-beginners">
            Beginner roundup
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try the picture quiz",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{`Is ${VOCAB_QUIZ_APP_NAME} better than Duolingo?`}</strong>
          <br />
          {"Different jobs — course path vs micro picture vocab."}
          <Gap />
          <strong>{"Can I use both?"}</strong>
          <br />
          {"Yes — structure from Duolingo, short word reps from the quiz."}
          <Gap />
          <strong>{"Which is better for commute study?"}</strong>
          <br />
          {`${VOCAB_QUIZ_APP_NAME} usually fits short rides better.`}
          <Gap />
          <strong>{"Does Duolingo teach Korean vocabulary well?"}</strong>
          <br />
          {"Inside lessons yes — but it’s a full course product, not word-only."}
        </>
      ),
    },
  ],
};
