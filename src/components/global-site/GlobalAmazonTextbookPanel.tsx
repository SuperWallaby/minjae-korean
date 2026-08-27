"use client";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  pickGlobalTextbooks,
  pickJaEnglishTextbooks,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";
import { TextbookCarousel } from "@/components/site/TextbookCarousel";

type Props = {
  lang: string;
  langName: string;
  placement?: string;
  pinId?: string;
  heading?: string;
  lede?: string;
  kicker?: string;
  disclosure?: string;
  books?: AmazonTextbook[];
};

export function GlobalAmazonTextbookPanel({
  lang,
  langName,
  placement = "global_textbook_panel",
  pinId,
  heading,
  lede,
  kicker = "Study next",
  disclosure = AMAZON_ASSOCIATE_DISCLOSURE,
  books: booksProp,
}: Props) {
  const books =
    booksProp ??
    (lang === "en-ja" ? pickJaEnglishTextbooks() : pickGlobalTextbooks(lang));
  if (books.length === 0) return null;

  const onBookClick = (book: AmazonTextbook) => {
    trackAffiliateClick({
      partner: "amazon",
      placement,
      lang,
      pinId,
      asin: book.asin,
    });
  };

  return (
    <aside
      className="global-textbook-panel"
      aria-label={`Recommended ${langName} textbooks — Amazon affiliate`}
      data-affiliate="amazon"
      data-lang={lang}
    >
      <div className="global-textbook-head">
        <p className="global-textbook-kicker">{kicker}</p>
        <h2>{heading || `Textbooks for ${langName}`}</h2>
      </div>
      <p className="global-textbook-lede">
        {lede || "Swipe to browse beginner picks on Amazon."}
      </p>
      <TextbookCarousel
        books={books}
        onBookClick={onBookClick}
        theme="global"
        ariaLabel={`${langName} textbook recommendations`}
      />
      <p className="global-textbook-disclosure">{disclosure}</p>
    </aside>
  );
}
