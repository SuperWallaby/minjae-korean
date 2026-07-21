/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "human-made-korean-quizzes-vs-ai";

export const post: BlogPost = {
  slug: SLUG,
  title: "Why Human-Made Korean Quizzes Beat AI Word Dumps",
  description:
    "AI can spit out word lists. Human-made Korean picture quizzes choose clear images, natural answers, and trustworthy distractors — the difference you feel in a 2-minute session.",
  keywords: [
    "human made Korean quizzes",
    "AI generated Korean vocabulary",
    "Korean picture quiz quality",
    VOCAB_QUIZ_APP_NAME,
    "learn Korean words",
  ],
  faq: [
    {
      question: "Are AI-generated Korean quizzes bad?",
      answer:
        "They can be useful for drafts, but bulk AI lists often include odd distractors, unclear images, or textbook-odd wording. Human curation keeps short sessions trustworthy.",
    },
    {
      question: `Does ${VOCAB_QUIZ_APP_NAME} use AI to make quizzes?`,
      answer: `No. ${VOCAB_QUIZ_APP_NAME} uses human-made picture quizzes so each card is clear enough for a quick, confident answer.`,
    },
    {
      question: "Why does quiz quality matter for short study?",
      answer:
        "In a 2-minute session you can’t afford confusing cards. Clarity compounds; noise burns trust.",
    },
    {
      question: "Can AI still help Korean learning?",
      answer:
        "Yes — for explanations, practice sentences, or tutoring chat. For core vocab recognition cards, human selection still wins.",
    },
  ],
  level: 3,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-human-made-korean-quizzes-vs-ai-1784604788572_hsy4rf.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-human-made-korean-quizzes-vs-ai-1784604788572_hsy4rf.webp",
  createdAt: "2026-07-12T09:10:00.000Z",
  updatedAt: "2026-07-12T09:10:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            AI can generate endless Korean word lists; it still struggles to
            make every picture quiz feel fair and natural.
          </strong>
          {" "}
          Human-made quizzes pick images you instantly recognize, answers
          natives actually say, and wrong choices that teach — not confuse.{" "}
          {VOCAB_QUIZ_APP_NAME} is built on that standard so a one-minute round
          still feels solid.
        </>
      ),
    },
    {
      subtitle: "Where AI word dumps break down",
      content: (
        <>
          {"Auto-generated sets often mix rare jargon with beginner words, use "}
          {"ambiguous photos, or invent near-duplicate options. In a full "}
          {"study session you might forgive that. "}
          <strong>
            {"In an elevator quiz, one confusing card is enough to close the app."}
          </strong>
        </>
      ),
    },
    {
      subtitle: "What human curation actually does",
      content: (
        <>
          {"A person asks: Would a learner see this picture and think of one "}
          {"clear Korean word? Is the audio clean? Do wrong answers teach a "}
          {"real mix-up (옷 vs 모자) instead of nonsense? That judgment is the "}
          {"product."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Short sessions need high trust per card."}
          <br />
          {"• Human-made quizzes optimize clarity, not volume."}
          <br />
          {"• Use AI as a tutor; use curated quizzes for recognition reps."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Equating “more cards” with “better learning.” Ignoring weird "}
          {"distractors. Skipping audio because the English gloss felt enough."}
        </>
      ),
    },
    {
      subtitle: "Related guides",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-app">
            What is the app?
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/picture-audio-vs-text-korean-memorization">
            Picture + audio vs text
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-practice-without-ads">
            Without ad overload
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
          <strong>{"Are AI-generated Korean quizzes bad?"}</strong>
          <br />
          {"Drafts can help; bulk dumps often feel unfair in short sessions."}
          <Gap />
          <strong>{`Does ${VOCAB_QUIZ_APP_NAME} use AI to make quizzes?`}</strong>
          <br />
          {"No — human-made picture quizzes."}
          <Gap />
          <strong>{"Why does quiz quality matter for short study?"}</strong>
          <br />
          {"You only have a few cards — each one must earn trust."}
          <Gap />
          <strong>{"Can AI still help Korean learning?"}</strong>
          <br />
          {"Yes for explanations; curated quizzes win for recognition reps."}
        </>
      ),
    },
  ],
};
