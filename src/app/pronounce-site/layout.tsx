import type { Metadata } from "next";
import "../global-site/global.css";
import "../sound-site/sound.css";
import "@/styles/affiliate-device.css";
import {
  PRONOUNCE_SITE_DESCRIPTION,
  PRONOUNCE_SITE_NAME,
  pronounceSiteHomeTitle,
  pronounceSiteOrigin,
  pronounceSiteTitleTemplate,
} from "@/lib/pronounceSite/brand";
import { PronouncePlaybackProvider } from "@/components/pronounce-site/PronouncePlayback";
import { PronounceSiteHeader } from "@/components/pronounce-site/PronounceSiteHeader";
import { PronounceSiteFooter } from "@/components/pronounce-site/PronounceSiteFooter";
import { AtlasScrollToTop } from "@/components/global-site/AtlasScrollToTop";

export const preferredRegion = "hnd1";
export const revalidate = 3600;

const origin = pronounceSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: pronounceSiteHomeTitle(),
    template: pronounceSiteTitleTemplate(),
  },
  description: PRONOUNCE_SITE_DESCRIPTION,
  keywords: [
    "Chinese pronunciation",
    "Mandarin pinyin",
    "how to say in Chinese",
    "language vocabulary charts",
  ],
  applicationName: PRONOUNCE_SITE_NAME,
  openGraph: {
    type: "website",
    siteName: PRONOUNCE_SITE_NAME,
    title: pronounceSiteHomeTitle(),
    description: PRONOUNCE_SITE_DESCRIPTION,
    url: origin,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  themeColor: "#b91c1c",
};

export default function PronounceSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="global-root sound-root" lang="en">
      <AtlasScrollToTop />
      <PronounceSiteHeader />
      <PronouncePlaybackProvider>
        <main className="global-shell global-main">{children}</main>
      </PronouncePlaybackProvider>
      <PronounceSiteFooter />
    </div>
  );
}
