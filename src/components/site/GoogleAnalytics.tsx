"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import {
  applyGaOptOutFromUrl,
  disableGaMeasurement,
  shouldExcludeFromGa,
} from "@/lib/gaExclusion";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-9D5H1C2BSP";

export function GoogleAnalytics() {
  const { ready, state } = useMockSession();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined") return;

    applyGaOptOutFromUrl(window.location.search);

    const excluded = shouldExcludeFromGa({
      email: state.user?.email,
      hostname: window.location.hostname,
    });

    if (excluded) {
      disableGaMeasurement(GA_ID);
      setEnabled(false);
      return;
    }

    setEnabled(true);
  }, [ready, state.user?.email]);

  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
