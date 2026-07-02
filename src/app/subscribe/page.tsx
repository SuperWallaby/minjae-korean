import type { Metadata } from "next";
import { Suspense } from "react";

import { SubscribeClient } from "@/app/subscribe/SubscribeClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Get Free Book | Subscribe to Kaja",
  description:
    "Subscribe to Kaja Korean and get a free Korean learning PDF, plus quizzes and challenges by email.",
  openGraph: {
    title: "Get Free Book | Subscribe to Kaja",
    description:
      "Subscribe to Kaja Korean and get a free Korean learning PDF, plus quizzes and challenges by email.",
    url: `${SITE_URL.replace(/\/$/, "")}/subscribe`,
    siteName: "Kaja",
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Kaja" }],
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
