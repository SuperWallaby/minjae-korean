/* eslint-disable react/no-unescaped-entities */
/**
 * 문단별 오디오: 각 멤버 문단(RM, Jin, SUGA, j-hope, Jimin, V, Jung Kook)에
 * audio: "https://공개URL" 넣으면 해당 문단 위에 "Listen" 재생기가 표시됩니다.
 */
import React from "react";
import { Describe } from "@/components/article/Describe";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "bts-7-letters-far-future-korean-phrases",
  title: '"Describe BTS in the far future in 7 characters" BTS Answers ',
  level: 2,
  createdAt: "2026-02-24T00:00:00.000Z",
  updatedAt: "2026-02-24T00:00:00.000Z",
  paragraphs: [
    {
      youtube: "https://www.youtube.com/watch?v=29ZlFKsc_ps",
      subtitle: "One question. Seven answers.",
      content: (
        <div className="my-8">
          <b> If you describe BTS in the far future in 7 Korean characters?</b>
        </div>
      ),
    },
    {
      subtitle: "What each member said",
      content: (
        <span>
          RM: <Describe>꽤나 멋진 30대</Describe>
          <br />
          Jin: <Describe>방탄중년노년단</Describe>
          <br />
          SUGA: <Describe>무엇이든 괜찮아.</Describe>
          <br />
          j-hope: <Describe>가자 달려라 방탄.</Describe>
          <br />
          Jimin: <Describe>걱정하지 말아요.</Describe>
          <br />
          V: <Describe>늙어도 우린 청춘</Describe>
          <br />
          Jung Kook: <Describe>모먼 이즈 옛투컴</Describe>
        </span>
      ),
    },
    {
      subtitle: "RM — 꽤나 멋진 30대",
      audio: "/audio/bts-7/rm.mp3",
      content: (
        <span>
          <Describe>꽤나 멋진 30대</Describe>
          <br />
          <br />
          <b>"A pretty cool group in our 30s."</b>
          <br />
          <br />
          The key word is <Describe>꽤나</Describe>.
          <br />
          It's not "very". It's more like:
          <br />
          <b>"quite / pretty / more than you'd expect."</b>
          <br />
          <br />
          Try these
          <br />
          <Describe>꽤나 괜찮은데?</Describe> = "That's pretty good."
          <br />
          <Describe>꽤나 멋있다.</Describe> = "That's kinda cool."
        </span>
      ),
    },
    {
      subtitle: "Jin — 방탄중년노년단",
      audio: "/audio/bts-7/jin.mp3",
      content: (
        <span>
          <Describe>방탄중년노년단</Describe>
          <br />
          <br />
          <b>"Bangtan Middle-aged & Elderly Squad."</b>
          <br />
          <br />
          This is Korean humor
          <br />
          Take a serious-looking label and twist it.
          <br />
          <br />
          Pieces
          <br />
          <Describe>중년</Describe> = middle age
          <br />
          <Describe>노년</Describe> = old age / elderly
          <br />
          <Describe>-단</Describe> = group / crew / squad
          <br />
          <br />
          You can copy the pattern:
          <br />
          <Describe>우리 ○○단 하자.</Describe> = "Let's be the ○○ squad."
        </span>
      ),
    },
    {
      subtitle: "SUGA — 무엇이든 괜찮아.",
      audio: "/audio/bts-7/suga.mp3",
      content: (
        <span>
          <Describe>무엇이든 괜찮아.</Describe>
          <br />
          <br />
          <b>"Anything is fine."</b>
          <br />
          (Sometimes: "Whatever happens, it'll be okay.")
          <br />
          <br />
          Why it's useful
          <br />
          It removes pressure. It opens space.
          <br />
          <br />
          Tone switches
          <br />
          <Describe>괜찮아.</Describe> = casual, close
          <br />
          <Describe>괜찮아요.</Describe> = polite, gentle
          <br />
          <Describe>괜찮습니다.</Describe> = formal, official
        </span>
      ),
    },
    {
      subtitle: "j-hope — 가자 달려라 방탄.",
      audio: "/audio/bts-7/jhope.mp3",
      content: (
        <span>
          <Describe>가자 달려라 방탄.</Describe>
          <br />
          <br />
          <b>"Let's go. Run, Bangtan."</b>
          <br />
          <br />
          Two commands, two energies
          <br />
          <Describe>가자</Describe> = "Let's go." (fast, strong, casual)
          <br />
          <Describe>달려라</Describe> = "Run!" / "Keep going!" (cheering
          command)
          <br />
          <br />
          Real-life use
          <br />
          <Describe>가자!</Describe> = "Let's go!"
          <br />
          <Describe>달려!</Describe> = "Go go!" / "Push!"
        </span>
      ),
    },
    {
      subtitle: "Jimin — 걱정하지 말아요.",
      audio: "/audio/bts-7/jimin.mp3",
      content: (
        <span>
          <Describe>걱정하지 말아요.</Describe>
          <br />
          <br />
          <b>"Don't worry."</b> (soft + caring)
          <br />
          <br />
          The softness comes from the ending.
          <br />
          <Describe>-지 말아요</Describe> feels gentler than a sharp command.
          <br />
          <br />
          Variations by distance
          <br />
          <Describe>걱정하지 마.</Describe> = close, casual
          <br />
          <Describe>걱정하지 마요.</Describe> = polite, still warm
          <br />
          <Describe>걱정하지 마세요.</Describe> = polite + "please" 느낌 (more
          formal)
        </span>
      ),
    },
    {
      subtitle: "V — 늙어도 우린 청춘",
      audio: "/audio/bts-7/v.mp3",
      content: (
        <span>
          <Describe>늙어도 우린 청춘</Describe>
          <br />
          <br />
          <b>"Even if we get old, we're still youth."</b>
          <br />
          <br />
          This is a classic Korean structure
          <br />
          <Describe>~어도</Describe> = "even if / even though"
          <br />
          <br />
          More examples
          <br />
          <Describe>늦어도 갈게요.</Describe> = "Even if I'm late, I'll go."
          <br />
          <Describe>비 와도 괜찮아.</Describe> = "Even if it rains, it's fine."
        </span>
      ),
    },
    {
      subtitle: "Jung Kook — 모먼 이즈 옛투컴",
      audio: "/audio/bts-7/jungkook.mp3",
      content: (
        <span>
          <Describe>모먼 이즈 옛투컴</Describe>
          <br />
          <br />
          This is Korean "sound spelling" of English
          <br />
          <b>"Moment is yet to come."</b>
          <br />
          <br />
          Why this matters for Korean learners
          <br />
          Koreans often write English phrases like Korean sounds for fun /
          style.
          <br />
          It's a real part of modern tone.
          <br />
          <br />
          You'll see this in comments, captions, and casual writing
          <br />
          It's not "correct English."
          <br />
          It's <b>Korean internet tone</b>.
        </span>
      ),
    },
  ],
};
