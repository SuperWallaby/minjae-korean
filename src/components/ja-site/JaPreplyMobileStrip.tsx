"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { globalGoPath } from "@/lib/globalSite/affiliate";
import { trackAffiliateClick } from "@/lib/ga";

const SKIP = new Set(["/go/preply", "/go/italki"]);

/** IAB 300×50 leader — only when the 300×600 rail has no room. */
export function JaPreplyMobileStrip() {
  const pathname = usePathname();
  if (SKIP.has(pathname)) return null;

  const href = globalGoPath("preply", { lang: "en-ja" });

  return (
    <aside className="ja-preply-strip" aria-label="Preply 初回 50% OFF">
      <a
        href={href}
        className="ja-preply-strip-link"
        data-affiliate="preply"
        data-placement="ja_mobile_300x50"
        onClick={() =>
          trackAffiliateClick({ partner: "preply", placement: "mobile_strip" })
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/affiliate/preply-300x50.webp"
          alt="Preply — Ready to learn a language for real? 初回 50% OFF"
          width={300}
          height={50}
        />
      </a>
    </aside>
  );
}
