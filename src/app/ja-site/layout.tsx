import type { Metadata } from "next";
import Link from "next/link";

import { AtlasScrollToTop } from "@/components/global-site/AtlasScrollToTop";
import { JaPlaybackProvider } from "@/components/ja-site/JaPlayback";
import { JaPreplyStickyRail } from "@/components/ja-site/JaPreplyStickyRail";
import {
  EIGOCHART_DESCRIPTION,
  EIGOCHART_NAME,
  EIGOCHART_NAME_JA,
  EIGOCHART_TAGLINE,
  eigoChartHomeTitle,
  eigoChartOrigin,
  eigoChartTitleTemplate,
} from "@/lib/jaSite/brand";

import "../global-site/global.css";
import "./ja.css";
import "@/styles/affiliate-device.css";

export const preferredRegion = "hnd1";
export const revalidate = 3600;

const origin = eigoChartOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: `${EIGOCHART_NAME} · 英語発音チャート（アメリカ・イギリス・オーストラリア）`,
    template: eigoChartTitleTemplate(),
  },
  description: EIGOCHART_DESCRIPTION,
  applicationName: EIGOCHART_NAME,
  openGraph: {
    type: "website",
    siteName: EIGOCHART_NAME,
    title: eigoChartHomeTitle(),
    description:
      "アメリカ・イギリス・オーストラリアの英語発音をチャートで聞き比べ。",
    url: origin,
    locale: "ja_JP",
    images: [{ url: "/eigochart/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: eigoChartHomeTitle(),
    description: "アメリカ・イギリス・オーストラリアの英語発音を聞き比べるチャート。",
    images: ["/eigochart/og.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/eigochart/site.webmanifest",
  themeColor: "#c7524c",
  icons: {
    icon: [
      { url: "/eigochart/favicon.ico", type: "image/x-icon" },
      { url: "/eigochart/favicon.svg", type: "image/svg+xml" },
      {
        url: "/eigochart/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/eigochart/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      { url: "/eigochart/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/eigochart/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function JaSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JaPlaybackProvider>
    <div className="global-root ja-root" lang="ja">
      <AtlasScrollToTop />
      <JaPreplyStickyRail />
      <header className="global-header">
        <div className="global-shell global-header-inner">
          <div className="global-header-top">
            <Link className="global-brand" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="ja-brand-icon"
                src="/eigochart/favicon-32x32.png"
                alt=""
                width={28}
                height={28}
              />
              <span className="global-brand-text">
                <span className="global-brand-mark">{EIGOCHART_NAME}</span>
                <span className="global-brand-sub">{EIGOCHART_NAME_JA}</span>
              </span>
            </Link>
            <a className="global-header-tutor" href="#tutors">
              1対1の講師 <span>(割引)</span>
            </a>
          </div>
        </div>
      </header>
      <main className="global-shell global-main">{children}</main>
      <footer className="global-footer">
        <div className="global-shell">
          <p>{EIGOCHART_NAME_JA} — アメリカ・イギリス・オーストラリアの英語発音チャート。</p>
          <p className="global-footer-meta">
            {EIGOCHART_TAGLINE} ·{" "}
            <a href="/go/preply">Preply 50% OFF</a>
          </p>
        </div>
      </footer>
    </div>
    </JaPlaybackProvider>
  );
}
