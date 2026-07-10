import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
import { Suspense } from "react";

import { SubscribeClient } from "@/app/subscribe/SubscribeClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Get Free Book | Subscribe to What is this in Korean",
  description:
    "Subscribe to What is this in Korean and get a free Korean learning PDF, plus quizzes and challenges every week!",
  openGraph: {
    title: "Get Free Book | Subscribe to What is this in Korean",
    description:
      "Subscribe to What is this in Korean and get a free Korean learning PDF, plus quizzes and challenges every week!",
    url: `${SITE_URL.replace(/\/$/, "")}/subscribe`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "What is this in Korean" }],
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
