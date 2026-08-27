"use client";

import { useEffect } from "react";

import { trackAffiliateClick } from "@/lib/ga";

type Props = {
  partner: "italki" | "preply";
  destination: string;
  lang?: string;
  pinId?: string;
  hopText?: string;
};

/**
 * Thin hop so browser GA can fire before leaving to the affiliate URL.
 * Replaces the previous server-only 302 on /go/{partner}.
 */
export function GlobalAffiliateGoClient({
  partner,
  destination,
  lang,
  pinId,
  hopText,
}: Props) {
  useEffect(() => {
    trackAffiliateClick({
      partner,
      placement: "global_go",
      lang,
      pinId,
    });
    const t = window.setTimeout(() => {
      window.location.replace(destination);
    }, 80);
    return () => window.clearTimeout(t);
  }, [partner, destination, lang, pinId]);

  return (
    <div className="global-go-hop">
      <p>
        {hopText ||
          `Taking you to ${partner === "italki" ? "italki" : "Preply"}…`}
      </p>
      <p>
        <a href={destination}>Continue</a>
      </p>
    </div>
  );
}
