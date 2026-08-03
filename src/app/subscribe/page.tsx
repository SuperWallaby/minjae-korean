import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { SITE_NAME } from "@/lib/siteBrand";
import { Suspense } from "react";

import { SubscribeClient } from "@/app/subscribe/SubscribeClient";

const SITE_URL = SITE_ORIGIN;

export const metadata: Metadata = {
  title: { absolute: "Get Free Book | Subscribe to Kaja Korean" },
  description:
    "Subscribe to Kaja Korean and get a free Korean learning PDF, plus quizzes and challenges every week!",
  alternates: { canonical: `${SITE_URL}/subscribe` },
  openGraph: {
    title: "Get Free Book | Subscribe to Kaja Korean",
    description:
      "Subscribe to Kaja Korean and get a free Korean learning PDF, plus quizzes and challenges every week!",
    url: `${SITE_URL.replace(/\/$/, "")}/subscribe`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Kaja Korean" }],
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
