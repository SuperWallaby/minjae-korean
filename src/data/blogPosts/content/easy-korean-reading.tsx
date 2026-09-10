/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import { amazonAffiliateUrl } from "@/lib/affiliateAmazon";
import type { BlogPost } from "../types";

/** Draft — add slug to BLOG_LISTED_SLUGS in listed.ts to publish. */
export const post: BlogPost = {
  slug: "easy-korean-reading",
  title: "I stopped translating every sentence. That's when reading started.",
  description:
    "Someone always buys a thick Korean novel too early. It becomes furniture. Easy reading is a level, not a personality.",
  keywords: [
    "easy korean reading",
    "korean graded reader",
    "korean graded readers",
    "easy korean stories",
    "korean short stories for beginners",
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-05T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The novel that sat on the desk",
      content: (
        <>
          Someone always buys a thick Korean book too early. It looks like
          commitment. It becomes furniture.
          <Gap />
          Easy Korean reading is not a personality. It is a level. If you
          cannot finish a page without stopping, the page is the wrong page.
          <Gap />
          I used to praise ambition. Now I praise finishing.
          <Gap />
          You get better at reading by reading. Not by translating a novel
          into a second novel in your notebook.
        </>
      ),
    },
    {
      subtitle: "What graded actually means",
      content: (
        <>
          A Korean graded reader is a book that agreed to stay in a box.
          Limited vocabulary. Shorter sentences. Sometimes audio.
          <Gap />
          That sounds childish until you remember how you learned to read in
          your first language. Nobody handed you a newspaper in week two.
          <Gap />
          <Quoter>
            If you know most of the words, you are in the right book. If you
            know almost none, you are studying vocabulary with extra steps.
          </Quoter>
          <Gap />
          Easy Korean stories and short stories for beginners are the same
          family. I don't care about the cover. I care whether you turn the
          page.
        </>
      ),
    },
    {
      subtitle: "How I tell people to read",
      content: (
        <>
          First pass: no dictionary. Guess. Keep moving. Mark one or two spots
          that blocked the meaning. Not every unknown adjective.
          <Gap />
          Second pass, later: look up those marks. Read the paragraph again
          out loud. That is enough.
          <Gap />
          If you translate every sentence into English, you are practicing
          English. Reading Korean has to stay in Korean long enough for the
          rhythm to show up.
        </>
      ),
    },
    {
      subtitle: "A book I actually point to",
      content: (
        <>
          For a lot of beginners,{" "}
          <ContentLink
            href={amazonAffiliateUrl("B07J35QFLB")}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Easy Korean Reading For Beginners
          </ContentLink>{" "}
          (TTMIK) is the right kind of boring. Short passages. Audio. You can
          finish a unit on a weeknight.
          <Gap />
          That's one option. Not the only one. If your level is higher, move
          up. If you drown, move down. Pride is a terrible reading coach.
          <Gap />
          I also keep a small catalog on the{" "}
          <ContentLink href="/book/korean-beyond-translation">
            book page
          </ContentLink>
          , including my own reader if you want something that is not a
          translation drill.
          <Gap />
          As an Amazon Associate, Kaja Korean earns from qualifying purchases.
        </>
      ),
    },
    {
      subtitle: "Where reading sits in the week",
      content: (
        <>
          Reading is input. It does not replace{" "}
          <ContentLink href="/blog/article/korean-conversation-practice">
            conversation
          </ContentLink>
          . It makes conversation less empty because you have seen the words
          alive.
          <Gap />
          Put it in the{" "}
          <ContentLink href="/blog/article/korean-study-plans-realistic-flexible-goals">
            study plan
          </ContentLink>{" "}
          as a short daily slot. Ten pages you finish beat forty pages you
          photograph for Instagram.
        </>
      ),
    },
    {
      subtitle: "If you only remember one rule",
      content: (
        <>
          Drop the level until it feels almost too easy. Then stay there long
          enough to get bored in Korean.
          <Gap />
          <strong>
            Boredom in a book you understand is fluency practice. Struggle in
            a book you worship is a stall.
          </strong>
          <Gap />
          This is how I actually tell people to read. You may like hard books.
          If you don't agree with me, you're absolutely right.
        </>
      ),
    },
  ],
};
