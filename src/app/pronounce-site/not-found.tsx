import type { Metadata } from "next";
import Link from "next/link";

import { PRONOUNCE_SITE_NAME } from "@/lib/pronounceSite/brand";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function PronounceNotFoundPage() {
  return (
    <div className="global-pin-intro">
      <p className="global-eyebrow">404</p>
      <h1 className="global-pin-title">Page not found</h1>
      <p className="global-pin-lede">
        This chart may not be published yet, or the link may be out of date.
      </p>
      <p className="mt-6">
        <Link href="/" className="global-text-link">
          Back to {PRONOUNCE_SITE_NAME}
        </Link>
      </p>
    </div>
  );
}
