/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

/** Draft — add slug to BLOG_LISTED_SLUGS in listed.ts to publish. */
export const post: BlogPost = {
  slug: "is-duolingo-good-for-korean",
  title: "Is Duolingo good for Korean? It starts the habit. It doesn't finish the job.",
  description:
    "People want me to hate Duolingo or bless it. I will not do either. It is good at making you open an app. It is bad at making you answer a human.",
  keywords: [
    "is duolingo good for korean",
    "duolingo korean review",
    "duolingo korean",
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-05T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The honest Duolingo Korean review",
      content: (
        <>
          People want me to hate it or bless it.
          <Gap />
          I will not do either. Is Duolingo good for Korean? It is good at
          making you open an app. It is bad at making you answer a human.
          <Gap />
          Those are different products. Duolingo sells the first one with
          Korean skins.
          <Gap />
          If Duolingo is your only plan, you are practicing Duolingo.
        </>
      ),
    },
    {
      subtitle: "What it actually does well",
      content: (
        <>
          Streaks work on brains. I have seen total beginners learn to
          recognize Hangul blocks because the owl nagged them. That is not
          nothing.
          <Gap />
          Short sessions fit a commute. Guilt is a crude teacher. But it is a
          teacher.
          <Gap />
          For a complete beginner who will otherwise do zero, I would rather
          they tap Korean than scroll. Fine. Call it a warm-up.
        </>
      ),
    },
    {
      subtitle: "Where it quietly stops",
      content: (
        <>
          The sentences are tidy. Real Korean is not.
          <Gap />
          You can complete a unit and still freeze when someone says something
          off-script. The app will wait. A cashier will not.
          <Gap />
          <Quoter>
            Duolingo can start the habit. It cannot be the conversation, the
            textbook, and the teacher.
          </Quoter>
          <Gap />
          I meet learners with long streaks and small mouths. They are not
          lazy. They optimized the wrong score.
          <Gap />
          I'm not covering a big university study here. The ones that exist
          measured reading and listening in other languages. Nobody published
          “this owl taught people to answer a cashier.” That gap is the
          review.
        </>
      ),
    },
    {
      subtitle: "What I would pair it with",
      content: (
        <>
          Keep the streak if you like it. Steal 20 minutes for a real{" "}
          <ContentLink href="/blog/article/best-korean-textbook-for-self-study">
            self-study textbook
          </ContentLink>
          . Steal 20 minutes a week for{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            conversation
          </ContentLink>
          .
          <Gap />
          If you need a person,{" "}
          <ContentLink href="/go/preply">Preply</ContentLink> is a cleaner
          hour than another Duolingo unit you will forget by Friday.
          <Gap />
          Put both inside a{" "}
          <ContentLink href="/blog/article/korean-study-plans-realistic-flexible-goals">
            study plan
          </ContentLink>
          . The owl is a calendar reminder. It is not the plan.
        </>
      ),
    },
    {
      subtitle: "When I would drop it",
      content: (
        <>
          Drop it when it is the thing you hide in so you can avoid speaking.
          You know the feeling. The lesson is easy. The call is scary. So you
          do another lesson.
          <Gap />
          Also drop it if Hangul is done and you are still on baby sentences
          you could have left months ago.
          <Gap />
          <strong>
            A tool that keeps you comfortable for a year is not a Korean
            course. It is a comfort object.
          </strong>
          <Gap />
          Laid-back learners often stay on the app and don't practice with
          someone. I already said that in the timeline post. Same thing here.
        </>
      ),
    },
  ],
};
