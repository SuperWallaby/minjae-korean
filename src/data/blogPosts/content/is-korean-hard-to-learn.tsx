/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { FsiClassroomHoursChart } from "@/components/article/FsiClassroomHoursChart";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

/**
 * Published — listed in BLOG_LISTED_SLUGS.
 * Markdown: scripts/data/draft-is-korean-hard-to-learn.md
 * Chart: FSI classroom hours (state.gov).
 */
export const post: BlogPost = {
  slug: "is-korean-hard-to-learn",
  title: "Is Korean hard to learn? Hangul isn't the hard part.",
  description:
    "People ask me if Korean is hard. Hangul is friendly. Verb endings are where most learners get stuck. Here is what I actually hear.",
  keywords: [
    "is korean hard to learn",
    "is korean hard",
    "how long does it take to learn korean",
  ],
  level: 3,
  createdAt: "2026-09-11T00:00:00.000Z",
  updatedAt: "2026-09-11T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The wrong kind of hard",
      content: (
        <>
          A lot of people ask if Korean is hard like they need permission before
          they even begin.
          <Gap />
          Compared with Spanish or French, yes. English speakers usually have to
          work more. Different word order. Particles. Speech levels. Fine.
          <Gap />
          Compared with the myth that Korean is some locked temple, no.
        </>
      ),
    },
    {
      subtitle: "Hangul is the easy part",
      content: (
        <>
          I still like seeing the moment Hangul clicks. Fourteen basic
          consonants. Ten vowels. Blocks that match sound more honestly than
          English spelling does.
          <Gap />
          You can go from zero to reading cafe menus badly in a week. Badly is
          allowed. The writing system was built to be taught.
          <Gap />
          A fast student can learn the letters in a morning. A slow student in
          ten days. That's the alphabet. Not the language.
          <Gap />
          If Hangul still looks like a texture to you, you have not failed. You
          just have not written enough syllables yet. 가 나 다. By hand. Not
          just taps.
        </>
      ),
    },
    {
      subtitle: "The endings are the real fight",
      content: (
        <>
          I've met more than a thousand Korean learners. Different countries.
          Different apps. Different teachers.
          <Gap />
          The thing I hear most is not "Hangul is impossible." It's verb
          endings. Which ending. When. How polite. How soft. How finished the
          sentence is supposed to sound.
          <Gap />
          That pile is also one of the good parts of Korean. Meaning rides on
          the ending. Tone rides on the ending. Relationship rides on the
          ending.
          <Gap />
          So yes. It's a lot. And yes. That density is part of why Korean can
          say so much in one short verb.
          <Gap />
          Particles like 은/는 and 이/가 still trip people up. Word order still
          trips people up. Honorifics still feel heavy if you treat them like a
          test. But if I had to name one pain that shows up again and again in
          real conversations with learners, it would be ending choice.
          <Gap />I keep a{" "}
          <ContentLink href="/blog/article/korean-verb-endings">
            reference table of common endings
          </ContentLink>{" "}
          for exactly that reason. Not to scare you. Just to make the pile look
          more like a list and less like fog.
          <Gap />
        </>
      ),
    },
    {
      subtitle: "I've also seen the easy path",
      content: (
        <>
          I want to say this carefully.
          <Gap />
          I've also seen learners who barely did what people call "hard study."
          No grammar book. Almost no Hangul drills. Mostly drama for years. One
          recent case had been doing that for about three years. When we talked,
          the speech sounded natural. When I checked reading and writing, it
          held up. I asked how this happend. She said she did a lot of
          shadowing. And practiced with HelloTalk friend.
          <Gap />
          I do not have a clean study proving this is the right method. I do not
          have a paper that says "skip grammar, watch drama." Input-heavy paths
          help a lot of people. I still can't tell you that drama alone is
          enough for everyone.
          <Gap />
          If you really want to avoid that hard-study feeling, a long stretch of
          easy listening and watching can be a usable path. Not a guarantee. A
          path I have seen work for some people.
          <Gap />
          Most learners I meet still need a person waiting for their answer.
          Understanding a scene and finishing your own sentence are different
          jobs. I wrote about that side here:{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            conversation practice
          </ContentLink>
          .
        </>
      ),
    },
    {
      subtitle: "It feels harder overnight",
      content: (
        <>
          Beginner Korean feels like progress every day. Then suddenly you
          understand a textbook and still miss a real reply. It feels like
          Korean got harder overnight.
          <Gap />
          It didn't. You just left the greenhouse.
          <Gap />
          This is where people decide they are bad at languages. Usually they're
          just under-practiced at talking, or stuck trying to pick endings under
          time pressure.
        </>
      ),
    },
    {
      subtitle: "Hard vs long",
      content: (
        <>
          Hard is not the same as long. Long is a separate question. I answered
          that here:{" "}
          <ContentLink href="/blog/article/how-long-does-it-take-to-learn-korean">
            how long it actually takes
          </ContentLink>
          .
          <Gap />
          The US State Department's language school puts Korean with Arabic,
          Chinese, and Japanese. About 2,200 classroom hours if you want job
          Korean. Spanish or French sit closer to 600 to 700 hours for the same
          professional finish line. That is not the same finish line as ordering
          ramyeon. Daily conversation sits lower than that. So don't panic at
          the government number.
          <Gap />
          <FsiClassroomHoursChart />
          <Gap />
          Here's the awkward pair of facts. The alphabet was built so ordinary
          people could learn it. The Foreign Service still budgets years of
          class for the language that alphabet writes. Those two facts are not
          fighting each other.
          <Gap />
          Korean is long if your only method is apps and hope. It is still
          learnable if you read a little, speak a little, and stop translating
          every word in{" "}
          <ContentLink href="/blog/article/easy-korean-reading">
            easy reading
          </ContentLink>
          .
          <Gap />
          You don't need to be gifted. You need a{" "}
          <ContentLink href="/blog/article/korean-study-plans-realistic-flexible-goals">
            study plan you will still follow
          </ContentLink>{" "}
          after the novelty wears off.
        </>
      ),
    },
    {
      subtitle: "So is it hard",
      content: (
        <>
          It's easier than the comment section. Hangul helps. A weekly
          conversation partner helps more than another theory about why Korean
          is impossible. Check how to find a conversation partner here:{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            conversation practice
          </ContentLink>
          <Gap />
          <strong>
            If you can stand being awkward for a few months, Korean is
            available.
          </strong>
          <Gap />
        </>
      ),
    },
  ],
};
