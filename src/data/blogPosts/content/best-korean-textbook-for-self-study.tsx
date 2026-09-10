/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import { amazonAffiliateUrl } from "@/lib/affiliateAmazon";
import type { BlogPost } from "../types";

/** Draft — add slug to BLOG_LISTED_SLUGS in listed.ts to publish. */
export const post: BlogPost = {
  slug: "best-korean-textbook-for-self-study",
  title: "I stopped collecting Korean textbooks. One was enough.",
  description:
    "I've watched people treat Amazon as the method. The best Korean textbook for self study is the one you finish.",
  keywords: [
    "best korean textbook for self study",
    "best korean textbook",
    "ttmik book",
    "korean made simple",
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-05T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The shelf is not a plan",
      content: (
        <>
          I have watched people treat Amazon as the method.
          <Gap />
          Integrated Korean. Grammar in Use. A TTMIK book. Billy Go. A
          workbook they will start on Monday. The box arrives. Motivation
          leaves in the packing paper.
          <Gap />
          The best Korean textbook for self study is the one that is allowed
          to be your only book for three months.
        </>
      ),
    },
    {
      subtitle: "What self-study actually needs",
      content: (
        <>
          A classroom book assumes a teacher will talk. A self-study book has
          to explain. Then let you check yourself. Audio helps. Exercises
          help. A cute cover does not.
          <Gap />
          <Quoter>
            One path. Audio. Exercises you can mark wrong. That is the
            checklist.
          </Quoter>
          <Gap />
          If a book is only explanations, you will nod and not speak. If it is
          only drills with no voice, you will invent pronunciation.
        </>
      ),
    },
    {
      subtitle: "How I sort the usual suspects",
      content: (
        <>
          I'm not saying there is a scientific winner. There isn't. This is
          just how I sort them.
          <Gap />
          If you want a friendly self-study voice,{" "}
          <ContentLink
            href={amazonAffiliateUrl("1497445825")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Korean Made Simple
          </ContentLink>{" "}
          (Billy Go) or{" "}
          <ContentLink
            href={amazonAffiliateUrl("B01FKU7Z9S")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Korean From Zero! 1
          </ContentLink>{" "}
          are built for people at the kitchen table. Hangul is in the book.
          You are not abandoned after the alphabet.
          <Gap />
          If you like a lesson plus workbook, a{" "}
          <ContentLink
            href={amazonAffiliateUrl("B01LP9MBS8")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            TTMIK Level 1 book
          </ContentLink>{" "}
          is a clear track. Search the book. Not the giant brand name. Finish
          the level you bought.
          <Gap />
          If you want school structure,{" "}
          <ContentLink
            href={amazonAffiliateUrl("0824876199")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Integrated Korean Beginning 1
          </ContentLink>{" "}
          or{" "}
          <ContentLink
            href={amazonAffiliateUrl("0804844984")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Elementary Korean
          </ContentLink>{" "}
          will feel like a course. They work. They are denser. Pair them with
          speaking or they stay homework forever.
          <Gap />
          <ContentLink
            href={amazonAffiliateUrl("8959951986")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Korean Grammar in Use
          </ContentLink>{" "}
          is a workbook I like later. It is not a first textbook. It is how
          you clean grammar once a main book exists.
        </>
      ),
    },
    {
      subtitle: "Reading is a different object",
      content: (
        <>
          A textbook teaches patterns. A reader teaches stamina. Don't make
          one book do both jobs on day one.
          <Gap />
          When you can handle short passages, use{" "}
          <ContentLink href="/blog/article/easy-korean-reading">
            easy Korean reading
          </ContentLink>
          . That's where a graded reader earns its keep.
        </>
      ),
    },
    {
      subtitle: "Put the book inside a week",
      content: (
        <>
          A textbook without a{" "}
          <ContentLink href="/blog/article/korean-study-plans-realistic-flexible-goals">
            study plan
          </ContentLink>{" "}
          becomes a guilt object.
          <Gap />
          Open the same chapter until you can say three lines from it. Then
          talk. Book, then mouth. If you need a person, that is{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            conversation practice
          </ContentLink>
          . Not another ASIN.
          <Gap />
          My own book lives on{" "}
          <ContentLink href="/book/korean-beyond-translation">
            this page
          </ContentLink>
          . Use it if the translation habit is the thing you want to break. It
          is not a substitute for a beginner series if you cannot read Hangul
          yet.
          <Gap />
          As an Amazon Associate, Kaja Korean earns from qualifying purchases.
        </>
      ),
    },
    {
      subtitle: "Buy less",
      content: (
        <>
          If you already own three beginner books, pick the one with audio.
          Hide the others for 90 days.
          <Gap />
          <strong>
            Finishing a simple book will teach more Korean than shopping for a
            perfect one.
          </strong>
          <Gap />
          So i don't cover a ranking table here. You may love collecting
          books. If you don't agree with me, you're absolutely right.
        </>
      ),
    },
  ],
};
