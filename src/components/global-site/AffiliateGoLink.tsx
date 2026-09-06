"use client";

import * as React from "react";

import { pickAffiliateTutorPartner } from "@/lib/affiliateTutor";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";
import { trackAffiliateClick } from "@/lib/ga";

type Props = {
  lang?: string;
  className?: string;
  placement?: string;
  /** Shown before partner is picked (SSR / first paint). */
  children?: React.ReactNode;
};

/** Header/footer tutor CTA — session-stable 50/50 Preply ↔ italki. */
export function AffiliateGoLink({
  lang,
  className,
  placement = "header_tutor",
  children,
}: Props) {
  const [partner, setPartner] = React.useState<AffiliatePartner | null>(null);

  React.useEffect(() => {
    setPartner(pickAffiliateTutorPartner());
  }, []);

  const resolved: AffiliatePartner = partner || "preply";
  const href = globalGoPath(resolved, lang ? { lang } : undefined);
  const label =
    children ??
    (resolved === "italki" ? (
      <>
        Book a tutor <span>($10 off)</span>
      </>
    ) : (
      <>
        Book a tutor <span>(50% off)</span>
      </>
    ));

  return (
    <a
      className={className}
      href={href}
      data-affiliate={resolved}
      onClick={() =>
        trackAffiliateClick({
          partner: resolved,
          placement,
          lang,
        })
      }
    >
      {label}
    </a>
  );
}
