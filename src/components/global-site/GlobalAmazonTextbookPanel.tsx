"use client";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  pickGlobalTextbooks,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";
import { TextbookCarousel } from "@/components/site/TextbookCarousel";

type Props = {
  lang: string;
  langName: string;
  placement?: string;
  pinId?: string;
};

export function GlobalAmazonTextbookPanel({
  lang,
  langName,
  placement = "global_textbook_panel",
  pinId,
}: Props) {
  const books = pickGlobalTextbooks(lang);
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
        <p className="global-textbook-kicker">Study next</p>
        <h2>Textbooks for {langName}</h2>
      </div>
      <p className="global-textbook-lede">Swipe to browse beginner picks on Amazon.</p>
      <TextbookCarousel
        books={books}
        onBookClick={onBookClick}
        theme="global"
        ariaLabel={`${langName} textbook recommendations`}
      />
      <p className="global-textbook-disclosure">{AMAZON_ASSOCIATE_DISCLOSURE}</p>
    </aside>
  );
}
