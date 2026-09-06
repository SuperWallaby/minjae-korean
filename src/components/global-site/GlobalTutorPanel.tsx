"use client";

import * as React from "react";

import { pickAffiliateTutorPartner } from "@/lib/affiliateTutor";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";
import { trackAffiliateClick } from "@/lib/ga";

type Props = {
  lang: string;
  langName: string;
  pinId: string;
};

/**
 * Pin-page tutor promo. Session-stable 50/50 Preply ↔ italki
 * (catalog default was Preply-only — bad for mobile Pinterest traffic mix).
 */
export function GlobalTutorPanel({ lang, langName, pinId }: Props) {
  const [partner, setPartner] = React.useState<AffiliatePartner | null>(null);

  React.useEffect(() => {
    setPartner(pickAffiliateTutorPartner());
  }, []);

  if (!partner) {
    return (
      <aside className="global-tutor-panel" aria-hidden>
        <div className="global-tutor-preply">
          <div className="global-tutor-preply-copy">
            <div className="global-tutor-kicker">&nbsp;</div>
            <h2>Practice with a {langName} tutor</h2>
            <p>&nbsp;</p>
          </div>
        </div>
      </aside>
    );
  }

  const goHref = globalGoPath(partner, { lang, pin: pinId });
  const isPreply = partner === "preply";
  const offer = isPreply
    ? "50% off your first lesson"
    : "$10 off your first lesson";
  const cta = isPreply
    ? "Get 50% Off Your First Lesson →"
    : "Continue · italki · $10 off";
  const placement = "global_pin_tutor_panel";
  const onClick = () =>
    trackAffiliateClick({ partner, placement, pinId, lang });

  return (
    <aside className="global-tutor-panel">
      <div className="global-tutor-preply">
        <div className="global-tutor-preply-copy">
          <p className="global-tutor-kicker">{offer}</p>
          <h2>Practice with a {langName} tutor</h2>
          <p>Use them lightly after study in a real conversation.</p>
          <a className="global-btn" href={goHref} onClick={onClick}>
            {cta}
          </a>
        </div>
        <a
          className="global-tutor-ad"
          href={goHref}
          aria-label={
            isPreply
              ? "Preply — 50% off your first lesson"
              : "italki — $10 off your first lesson"
          }
          onClick={onClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isPreply
                ? "/brand/affiliate/preply-300x250.webp"
                : "/brand/affiliate/italki-square.webp"
            }
            alt={
              isPreply
                ? "Preply — learn with a live tutor, 50% off"
                : "italki — learn with a live tutor, $10 off"
            }
            width={300}
            height={isPreply ? 250 : 270}
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </aside>
  );
}
