"use client";

import * as React from "react";
import Image from "next/image";

import {
  getAffiliateTutorCreative,
  ITALKI_AFFILIATE_URL,
  pickAffiliateTutorPartner,
  PREPLY_AFFILIATE_URL,
  type AffiliateTutorPartner,
} from "@/lib/affiliateTutor";
import { trackAffiliateClick } from "@/lib/ga";

export { ITALKI_AFFILIATE_URL, PREPLY_AFFILIATE_URL };

export type AffiliateTutorBannerVariant = "wide" | "square";

type Props = {
  variant?: AffiliateTutorBannerVariant;
  className?: string;
  /** Force a partner (tests). Default: session 50/50. */
  partner?: AffiliateTutorPartner;
  /** GA placement label. Defaults from variant. */
  placement?: string;
};

export function AffiliateTutorBanner({
  variant = "wide",
  className = "",
  partner: partnerProp,
  placement: placementProp,
}: Props) {
  const [partner, setPartner] = React.useState<AffiliateTutorPartner | null>(
    partnerProp ?? null,
  );

  React.useEffect(() => {
    if (partnerProp) {
      setPartner(partnerProp);
      return;
    }
    setPartner(pickAffiliateTutorPartner());
  }, [partnerProp]);

  if (!partner) {
    return (
      <aside
        className={`mx-auto w-full ${variant === "square" ? "max-w-sm" : "max-w-xl"} ${className}`.trim()}
        aria-hidden
      >
        <div
          className={`rounded-2xl bg-muted/30 ${variant === "square" ? "aspect-square" : "aspect-[3/2]"}`}
        />
      </aside>
    );
  }

  const creative = getAffiliateTutorCreative(partner);
  // Preply has square art only — keep layout compact when that partner wins.
  const useSquareLayout = variant === "square" || partner === "preply";
  const asset = useSquareLayout ? creative.square : creative.wide;
  const placement =
    placementProp ||
    (useSquareLayout ? "banner_square" : "banner_wide");

  return (
    <aside
      className={`mx-auto w-full ${useSquareLayout ? "max-w-sm" : "max-w-xl"} ${className}`.trim()}
      aria-label="Find a Korean tutor — affiliate offer"
      data-affiliate={partner}
    >
      <a
        href={creative.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          trackAffiliateClick({ partner, placement })
        }
        className="group block overflow-hidden rounded-2xl border border-black/8 bg-muted/20 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--quiz-primary,#2A7FFC)]"
      >
        <Image
          src={asset.src}
          alt={creative.alt}
          width={asset.width}
          height={asset.height}
          className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.01]"
          sizes={
            useSquareLayout
              ? "(max-width: 384px) 100vw, 384px"
              : "(max-width: 576px) 100vw, 576px"
          }
        />
      </a>
    </aside>
  );
}

/** @deprecated Prefer AffiliateTutorBanner — kept for existing imports. */
export const ItalkiTutorBanner = AffiliateTutorBanner;
export type ItalkiTutorBannerVariant = AffiliateTutorBannerVariant;
