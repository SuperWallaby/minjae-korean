/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Describe } from "@/components/article/Describe";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "why-eun-neun-and-i-ga-feel-so-different",
  title: "Why 은/는 이/가 Is So Difficult for English Users",
  level: 2,
  createdAt: "2026-02-22T00:00:00.000Z",
  updatedAt: "2026-02-22T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The Why",
      content: (
        <span>
          If you speak English, Korean particles like <Describe>은/는</Describe>{" "}
          and <Describe>이/가</Describe> can feel strange.
          <br />
          English doesn't have these "little tags." But your brain tries to
          translate them into one English word.
          <br />
          <br />
          <b>Do not translate!</b>
          <br />
          For now, empty your brain a bit.
          <br />
          <Quoter>
            These particles are not words. <br /> They are tags that guide the
            listener.
          </Quoter>
        </span>
      ),
    },
    {
      subtitle: "Same meaning, Different focus",
      content: (
        <span>
          Korean can move parts around more freely because nouns wear “tags.”
          <br />
          The tags keep the meaning clear—even when the order changes.
          <br />
          <br />
          These two can both look like “I am a student” in English:
          <br />
          <br />
          <Describe>저는 학생이에요.</Describe>
          <br />
          <Describe>제가 학생이에요.</Describe>
          <br />
          <br />
          But the feeling is different.
          <br />
          <Describe>저는 학생이에요</Describe> = I am student
          <br />
          <Describe>제가 학생이에요.</Describe> = I’m the student, not someone
          else.
        </span>
      ),
    },
    {
      subtitle: "The simplest map",
      content: (
        <span>
          Start with only this
          <br />
          <br />
          <Describe>은/는</Describe> = topic (what we are talking about)
          <br />
          <Describe>이/가</Describe> = subject (the one that does it / is it)
          <br />
          <br />
          That's enough for beginners.
        </span>
      ),
    },
    {
      subtitle: "은/는 'About X…'",
      content: (
        <span>
          Use <Describe>은/는</Describe> when you introduce the topic or switch
          the topic.
          <br />
          It often feels like "About X…" in English.
          <br />
          <br />
          <Describe>저는 민재예요.</Describe> (About me: I'm Minjae.)
          <br />
          <Describe>이거는 커피예요.</Describe> (About this: it's coffee.)
          <br />
          <Describe>한국은 겨울이 추워요.</Describe> (About Korea: winters are
          cold.)
        </span>
      ),
    },
    {
      subtitle: "이/가 'This one'",
      content: (
        <span>
          Use <Describe>이/가</Describe> when you answer "who?" or "what?"
          <br />
          It points to the exact subject.
          <br />
          <br />
          <Describe>누가 왔어요? → 민재가 왔어요.</Describe>
          <br />
          <Describe>뭐가 좋아요? → 이게 좋아요.</Describe>
          <br />
          <Describe>누가 학생이에요? → 민재가 학생이에요.</Describe>
        </span>
      ),
    },
    {
      subtitle: "Minjae Says 💊",
      content: (
        <span>
          I’ve heard this question so many times while teaching students.
          <br />
          <br />
          Most important thing is
          <br />
          <u className="underline-offset-2">Try to feel the difference.</u>
          <br />
          <br />
          Listen a lot.
          <br />
          If you keep hearing it in real sentences, your “sense” will grow.
        </span>
      ),
    },
  ],
};
