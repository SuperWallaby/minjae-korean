import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const runtime = "nodejs";
export const revalidate = 3600;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/** Compare hub consolidates into /vocab/detail (Difference between…). */
export default function VocabCompareIndexRedirectPage() {
  permanentRedirect("/vocab/detail");
}
