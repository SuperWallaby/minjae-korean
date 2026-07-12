/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "best-korean-vocabulary-apps-for-beginners";

export const post: BlogPost = {
  slug: SLUG,
  title: "Best Korean Vocabulary Apps for Beginners (2026 Criteria)",
  description: `A fair beginner roundup using clear criteria — short sessions, ad load, pictures/audio, human curation. See where ${VOCAB_QUIZ_APP_NAME} fits beside Duolingo, Anki, Drops, and more.`,
  keywords: [
    "best Korean vocabulary apps for beginners",
    "best Korean vocab apps 2026",
    "Korean word learning apps",
    VOCAB_QUIZ_APP_NAME,
    "Duolingo Anki Drops Korean",
  ],
  faq: [
    {
      question: "What is the best Korean vocab app for beginners?",
      answer: `It depends on your job. For short picture quizzes with almost no ads, ${VOCAB_QUIZ_APP_NAME} fits well. For a full course path, Duolingo or LingoDeer may fit better. For custom SRS, Anki.`,
    },
    {
      question: "Should beginners start with Anki?",
      answer:
        "Only if you enjoy setup. Many beginners stick longer with a ready-made quiz first.",
    },
    {
      question: "How should I judge “best”?",
      answer:
        "Score apps on session length, ad pressure, audio, visuals, and whether you’ll open them daily — not on feature count alone.",
    },
  ],
  level: 2,
  createdAt: "2026-07-12T10:15:00.000Z",
  updatedAt: "2026-07-12T10:15:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            There is no single best Korean vocab app — only best fit for the
            job you need this month.
          </strong>
          {" "}
          Below we score common options with beginner-friendly criteria.{" "}
          {VOCAB_QUIZ_APP_NAME} ranks high when you want 1–5 minute picture
          quizzes, human-made cards, and almost no ads.
        </>
      ),
    },
    {
      subtitle: "Our scoring criteria (not vibes)",
      content: (
        <>
          {"1) Starts in under 10 seconds"}
          <br />
          {"2) Works in a 5-minute pocket"}
          <br />
          {"3) Low ad / anxiety pressure"}
          <br />
          {"4) Clear audio + Hangul"}
          <br />
          {"5) Pictures that make meaning obvious"}
          <br />
          {"6) You’ll still open it next week"}
        </>
      ),
    },
    {
      subtitle: "How popular apps map to the criteria",
      content: (
        <>
          <strong>{"Duolingo"}</strong>
          {" — great path energy; heavier than a pure vocab snack."}
          <Gap />
          <strong>{"Anki"}</strong>
          {" — unbeatable control; setup tax for many beginners."}
          <Gap />
          <strong>{"Drops / Memrise"}</strong>
          {" — visual vocab strengths; compare session feel and pressure."}
          <Gap />
          <strong>{"LingoDeer"}</strong>
          {" — structured lessons; not a micro quiz."}
          <Gap />
          <strong>{VOCAB_QUIZ_APP_NAME}</strong>
          {" — picture quiz, human-made, micro sessions, almost no ads, live option."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Publish your criteria before crowning a winner."}
          <br />
          {"• Beginners often need low friction more than max features."}
          <br />
          {"• One calm daily habit beats three abandoned installs."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Downloading five “best app” list picks in one night. Chasing "}
          {"streaks instead of words. Ignoring whether the app has audio."}
        </>
      ),
    },
    {
      subtitle: "Deep dives",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-anki">
            vs Anki
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-drops">
            vs Drops
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-practice-without-ads">
            Without ads
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try our pick for micro sessions",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{"What is the best Korean vocab app for beginners?"}</strong>
          <br />
          {"Best fit by job — micro quiz vs course vs SRS."}
          <Gap />
          <strong>{"Should beginners start with Anki?"}</strong>
          <br />
          {"Only if you like setup; ready quizzes are easier to keep."}
          <Gap />
          <strong>{"How should I judge “best”?"}</strong>
          <br />
          {"Session length, ads, audio, visuals, and daily open rate."}
        </>
      ),
    },
  ],
};
