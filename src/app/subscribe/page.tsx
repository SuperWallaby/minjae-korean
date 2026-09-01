import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { SITE_NAME } from "@/lib/siteBrand";
import { Suspense } from "react";

import { SubscribeClient } from "@/app/subscribe/SubscribeClient";

const SITE_URL = SITE_ORIGIN;

export const metadata: Metadata = {
  title: { absolute: `Free study PDF | How to study Korean | ${SITE_NAME}` },
  description:
    "Get a free Korean study PDF and notes on how to study Korean — methods and weekly practice from Minjae.",
  alternates: { canonical: `${SITE_URL}/subscribe` },
  openGraph: {
    title: `Free study PDF | How to study Korean | ${SITE_NAME}`,
    description:
      "Get a free Korean study PDF and notes on how to study Korean — methods and weekly practice from Minjae.",
    url: `${SITE_URL.replace(/\/$/, "")}/subscribe`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
};

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <SubscribeClient />
    </Suspense>
  );
}
