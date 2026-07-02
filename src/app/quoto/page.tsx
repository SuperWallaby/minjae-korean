import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";

import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { getRandomQuote } from "@/lib/quotesRepo";

import { QuotoPageClient } from "./QuotoPageClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quoto",
});

export const metadata: Metadata = {
  title: "Quoto",
  description: "매일 다른 한글 명언. 언어와 배움에 대한 짧은 영감.",
  openGraph: {
    title: "Quoto | Kaja",
    description: "매일 다른 한글 명언. 언어와 배움에 대한 짧은 영감.",
    url: `${SITE_URL}/quoto`,
    siteName: "Kaja",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quoto | Kaja",
    description: "매일 다른 한글 명언. 언어와 배움에 대한 짧은 영감.",
  },
  alternates: { canonical: `${SITE_URL}/quoto` },
};

export default async function QuotoPage() {
  const initialQuote = await getRandomQuote();
  return (
    <MarketingPage
      containerClassName="max-w-3xl"
      className={`${gowunBatang.variable} ${gowunBatang.className} flex min-h-[calc(100dvh-4rem)] flex-col`}
    >
      <MarketingShell className="flex flex-1 flex-col">
        <MarketingShellBody className="flex flex-1 flex-col">
          <QuotoPageClient initialQuote={initialQuote} />
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
