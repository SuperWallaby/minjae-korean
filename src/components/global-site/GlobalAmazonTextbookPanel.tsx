"use client";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  amazonAffiliateUrl,
  amazonCoverImageUrl,
  pickGlobalTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";

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
  const book = pickGlobalTextbook(lang);
  if (!book) return null;

  const href = amazonAffiliateUrl(book.asin);

  return (
    <aside
      className="global-textbook-panel"
      aria-label={`Recommended ${langName} textbook — Amazon affiliate`}
      data-affiliate="amazon"
      data-lang={lang}
    >
      <p className="global-textbook-kicker">Study next</p>
      <h2>Textbook for {langName}</h2>
      <p>
        Save this chart, then work through a structured course so the words
        stick.
      </p>
      <a
        className="global-textbook-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
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
          src={amazonCoverImageUrl(book.asin, 140)}
          alt=""
          width={56}
          height={84}
          loading="lazy"
          decoding="async"
        />
        <span>
          <strong>{book.title}</strong>
          <small>{book.subtitle}</small>
          <em>View on Amazon →</em>
        </span>
      </a>
      <p className="global-textbook-disclosure">{AMAZON_ASSOCIATE_DISCLOSURE}</p>
    </aside>
  );
}
