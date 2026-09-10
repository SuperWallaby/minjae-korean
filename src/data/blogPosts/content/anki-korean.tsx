/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Describe } from "@/components/article/Describe";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

/** Draft — add slug to BLOG_LISTED_SLUGS in listed.ts to publish. */
export const post: BlogPost = {
  slug: "anki-korean",
  title: "Anki won't save your Korean if the deck is the whole plan",
  description:
    "Somebody always has an Anki Korean deck with a number that sounds like a personality. SRS remembers. It does not converse.",
  keywords: [
    "anki korean",
    "anki korean deck",
    "korean flashcards",
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-05T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The 8,000-card graveyard",
      content: (
        <>
          Somebody always has an Anki Korean deck with a number that sounds
          like a personality.
          <Gap />
          Eight thousand cards. Due: 412. They look tired. They have not
          spoken Korean this week.
          <Gap />
          SRS is a good machine. It is a terrible teacher if you let it run
          the whole show.
          <Gap />
          Anki remembers. It does not converse.
        </>
      ),
    },
    {
      subtitle: "What I use it for",
      content: (
        <>
          Words that already appeared in a chapter. A sentence I failed in
          conversation. A particle I keep mixing up.
          <Gap />
          That is a closed set. It came from life or from a book. The card is
          a reminder. Not a first meeting.
          <Gap />
          <Quoter>
            If you cannot remember where you saw the word, it probably should
            not be a card yet.
          </Quoter>
        </>
      ),
    },
    {
      subtitle: "Shared decks",
      content: (
        <>
          Shared Anki Korean decks are tempting. Someone else did the work.
          Frequency lists look scientific.
          <Gap />
          Then you learn <Describe>냉장고</Describe> before you can say I am
          tired. The order is not your order.
          <Gap />
          If you insist on a shared deck, choke the new-card count. Ten a day
          is plenty. Reviews should stay under the time you would actually
          spend reading.
          <Gap />
          Audio on the card helps. English-only backs turn Korean into a
          matching game.
        </>
      ),
    },
    {
      subtitle: "Where the minutes should go instead",
      content: (
        <>
          After reviews, open the book those cards came from. Or speak.
          <Gap />
          A{" "}
          <ContentLink href="/blog/article/best-korean-textbook-for-self-study">
            textbook you finish
          </ContentLink>{" "}
          gives Anki something honest to remember.{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            Conversation practice
          </ContentLink>{" "}
          tells you which cards were theater.
          <Gap />
          Easy{" "}
          <ContentLink href="/blog/article/easy-korean-reading">
            reading
          </ContentLink>{" "}
          puts the same words in a paragraph. Closer to language than a flash
          side.
          <Gap />
          If pronunciation is the hole, listen on the site. Not only in the
          deck. Cards do not teach mouth shape.
        </>
      ),
    },
    {
      subtitle: "A sane Anki Korean routine",
      content: (
        <>
          Cap new cards. Clear reviews or you cut new cards until you catch
          up. Never let Anki eat the speaking slot on your{" "}
          <ContentLink href="/blog/article/korean-study-plans-realistic-flexible-goals">
            study plan
          </ContentLink>
          .
          <Gap />
          Make cards from yesterday's Korean. Not from a stranger's 10,000
          list.
          <Gap />
          <strong>
            A small deck you finish is a tool. A huge deck you fear is a
            second job.
          </strong>
          <Gap />
          Ummm Anki is useful. I use it. Just don't let it run the week. You
          may love giant decks. If you don't agree with me, you're absolutely
          right.
        </>
      ),
    },
  ],
};
