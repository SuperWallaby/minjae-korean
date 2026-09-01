import type { Metadata } from "next";
import Link from "next/link";
import "../global-site/global.css";
import "./sound.css";
import "@/styles/affiliate-device.css";
import {
  SOUND_SITE_DESCRIPTION,
  SOUND_SITE_NAME,
  SOUND_SITE_TAGLINE,
  soundSiteHomeTitle,
  soundSiteOrigin,
  soundSiteTitleTemplate,
} from "@/lib/soundSite/brand";
import { SoundPlaybackProvider } from "@/components/sound-site/SoundPlayback";
import { AtlasScrollToTop } from "@/components/global-site/AtlasScrollToTop";

const origin = soundSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: soundSiteHomeTitle(),
    template: soundSiteTitleTemplate(),
  },
  description: SOUND_SITE_DESCRIPTION,
  applicationName: SOUND_SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SOUND_SITE_NAME,
    title: soundSiteHomeTitle(),
    description: SOUND_SITE_DESCRIPTION,
    url: origin,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: soundSiteHomeTitle(),
    description: SOUND_SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  themeColor: "#1d4ed8",
};

export default function SoundSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="global-root sound-root" lang="en">
      <AtlasScrollToTop />
      <header className="global-header sound-header">
        <div className="global-shell global-header-inner">
          <div className="global-header-top">
            <Link className="global-brand" href="/">
              <span className="sound-brand-mark" aria-hidden>
                ◈
              </span>
              <span className="global-brand-mark">{SOUND_SITE_NAME}</span>
            </Link>
            <a className="global-header-tutor" href="#tutors">
              1:1 tutor <span>(deal)</span>
            </a>
          </div>
        </div>
      </header>
      <SoundPlaybackProvider>
        <main className="global-shell global-main">{children}</main>
      </SoundPlaybackProvider>
      <footer className="global-footer">
        <div className="global-shell">
          <p>{SOUND_SITE_NAME} — other ways to say it.</p>
          <p className="global-footer-meta">
            Slang words in English ·{" "}
            <a href="/go/preply">Preply 50% off</a>
            {" · "}
            <a href="https://eigopin.com">EigoPin (日本語)</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
