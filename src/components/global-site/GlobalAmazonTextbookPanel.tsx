"use client";

import * as React from "react";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  amazonAffiliateUrl,
  pickGlobalTextbooks,
  textbookCoverSrc,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";

const COVER_FALLBACK = "/brand/textbooks/book-placeholder.svg";

type Props = {
  lang: string;
  langName: string;
  placement?: string;
  pinId?: string;
};

function TextbookLink({
  book,
  lang,
  placement,
  pinId,
}: {
  book: AmazonTextbook;
  lang: string;
  placement: string;
  pinId?: string;
}) {
  const [coverSrc, setCoverSrc] = React.useState(textbookCoverSrc(book));

  return (
    <a
      className="global-textbook-link"
      href={amazonAffiliateUrl(book.asin)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      title={`${book.title} — ${book.subtitle}`}
      onClick={() =>
        trackAffiliateClick({
          partner: "amazon",
          placement,
          lang,
          pinId,
          asin: book.asin,
        })
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverSrc}
        alt=""
        width={28}
        height={42}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (coverSrc !== COVER_FALLBACK) setCoverSrc(COVER_FALLBACK);
        }}
      />
      <span>
        <strong>{book.title}</strong>
      </span>
    </a>
  );
}

export function GlobalAmazonTextbookPanel({
  lang,
  langName,
  placement = "global_textbook_panel",
  pinId,
}: Props) {
  const books = pickGlobalTextbooks(lang);
  if (books.length === 0) return null;

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
      <ul className="global-textbook-list">
        {books.map((book) => (
          <li key={book.asin}>
            <TextbookLink
              book={book}
              lang={lang}
              placement={placement}
              pinId={pinId}
            />
          </li>
        ))}
      </ul>
      <p className="global-textbook-disclosure">{AMAZON_ASSOCIATE_DISCLOSURE}</p>
    </aside>
  );
}
