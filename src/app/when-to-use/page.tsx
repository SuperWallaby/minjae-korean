import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** When-to-use hub consolidates into /vocab/detail (How to say…). */
export default function WhenToUseIndexRedirectPage() {
  permanentRedirect("/vocab/detail");
}
