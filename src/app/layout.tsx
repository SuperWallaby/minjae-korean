import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/siteBrand";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
// NOTE: LiveKit removed (pure WebRTC implementation). Keep this file free of LiveKit imports.
import { MockSessionProvider } from "@/lib/mock/MockSessionProvider";
import { EducationModeProvider } from "@/lib/EducationModeProvider";
import { GoogleAnalytics } from "@/components/site/GoogleAnalytics";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { TeachingSpotlight } from "@/components/site/TeachingSpotlight";
import { QuickNote } from "@/components/QuickNote";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ItalkiTutorStickyRail } from "@/components/site/ItalkiTutorStickyRail";
import { SeoMiniQuizWidget } from "@/components/site/SeoMiniQuizWidget";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import {
  EIGOCHART_DESCRIPTION,
  EIGOCHART_NAME,
  eigoChartHomeTitle,
  eigoChartOrigin,
  eigoChartTitleTemplate,
  isJaSiteDeployment,
} from "@/lib/jaSite/brand";
import {
  SOUND_SITE_DESCRIPTION,
  SOUND_SITE_NAME,
  soundSiteHomeTitle,
  soundSiteOrigin,
  soundSiteTitleTemplate,
} from "@/lib/soundSite/brand";
import NextTopLoader from "nextjs-toploader";
import { TeachingCmdDraw } from "@/components/site/MouseDraw";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const GLOBAL_PINTEREST_VERIFY = "86705510fceea49d9e5298e3a6f4df6d";
const MAIN_PINTEREST_VERIFY = "7a6bc7a84bb2c6c634bf33f0618b07d7";
const GLOBAL_IMPACT_VERIFY = "ad7f601e-1ef9-4800-b4ef-d477c480e7f4";
const JA_IMPACT_VERIFY = "a87ceafc-d968-4565-862d-10234de628b1";
const SOUND_IMPACT_VERIFY = "a87ceafc-d968-4565-862d-10234de628b1";

function requestHost(h: Headers): string {
  return (h.get("host") || "").toLowerCase().split(":")[0];
}

function isSoundSiteRequest(h: Headers): boolean {
  if (h.get("x-kaja-site") === "sound") return true;
  const host = requestHost(h);
  return (
    host === "sound.eigopin.com" ||
    host === "www.sound.eigopin.com" ||
    host === "sound.eigopin.localhost"
  );
}

/** Middleware sets x-kaja-site; also match Host for SSR/metadata on Vercel. */
function isGlobalSiteRequest(h: Headers): boolean {
  if (h.get("x-kaja-site") === "global") return true;
  const host = (h.get("host") || "").toLowerCase();
  return host.startsWith("global.");
}

function isJaSiteRequest(h: Headers): boolean {
  if (isSoundSiteRequest(h)) return false;
  if (isJaSiteDeployment()) return true;
  if (h.get("x-kaja-site") === "ja") return true;
  const host = requestHost(h);
  return (
    host === "eigopin.com" ||
    host === "www.eigopin.com" ||
    (host.startsWith("eigopin.") && !host.startsWith("sound.")) ||
    host === "eigochart.com" ||
    host.endsWith(".eigochart.com") ||
    host === "eigopin.vercel.app" ||
    host.startsWith("eigochart.") ||
    host === "ja.localhost"
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const isGlobalSite = isGlobalSiteRequest(h);
  const isSoundSite = isSoundSiteRequest(h);
  const isJaSite = isJaSiteRequest(h);

  if (isSoundSite) {
    const origin = soundSiteOrigin();
    return {
      metadataBase: new URL(origin),
      title: {
        default: soundSiteHomeTitle(),
        template: soundSiteTitleTemplate(),
      },
      description: SOUND_SITE_DESCRIPTION,
      applicationName: SOUND_SITE_NAME,
      themeColor: "#1d4ed8",
      openGraph: {
        type: "website",
        siteName: SOUND_SITE_NAME,
        title: soundSiteHomeTitle(),
        description: SOUND_SITE_DESCRIPTION,
      },
      twitter: {
        card: "summary_large_image",
        title: soundSiteHomeTitle(),
        description: SOUND_SITE_DESCRIPTION,
      },
    };
  }

  if (isJaSite) {
    const origin = eigoChartOrigin();
    return {
      metadataBase: new URL(origin),
      title: {
        default: `${EIGOCHART_NAME} · 日本人のための英単語チャート`,
        template: eigoChartTitleTemplate(),
      },
      description: EIGOCHART_DESCRIPTION,
      applicationName: EIGOCHART_NAME,
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
        shortcut: [{ url: "/eigochart/favicon.ico", type: "image/x-icon" }],
        apple: [
          {
            url: "/eigochart/apple-touch-icon.png",
            type: "image/png",
            sizes: "180x180",
          },
        ],
      },
      openGraph: {
        type: "website",
        siteName: EIGOCHART_NAME,
        title: eigoChartHomeTitle(),
        description:
          "Pinterestから保存できる英単語チャート。音声・例文・教材・講師予約。",
        images: [{ url: "/eigochart/og.png", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: eigoChartHomeTitle(),
        description: "日本人向けの英単語チャート。発音と例文つき。",
        images: ["/eigochart/og.png"],
      },
    };
  }

  if (isGlobalSite) {
    return {
      metadataBase: new URL("https://global.kajakorean.com"),
      title: {
        default: "Kaja Global · Learn languages with clear vocab charts",
        template: "%s · Kaja Global",
      },
      description:
        "Save-worthy vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, and Japanese — with pronunciation audio, examples, and tutor offers.",
      applicationName: "Kaja Global",
      manifest: "/brand/site.webmanifest",
      icons: {
        icon: [
          { url: "/brand/favicon.ico", type: "image/x-icon" },
          {
            url: "/brand/favicon-32x32.png",
            type: "image/png",
            sizes: "32x32",
          },
          {
            url: "/brand/favicon-16x16.png",
            type: "image/png",
            sizes: "16x16",
          },
          { url: "/brand/icon.png", type: "image/png", sizes: "512x512" },
        ],
        shortcut: [{ url: "/brand/favicon.ico", type: "image/x-icon" }],
        apple: [
          {
            url: "/brand/apple-touch-icon.png",
            type: "image/png",
            sizes: "180x180",
          },
        ],
      },
      openGraph: {
        type: "website",
        siteName: "Kaja Global",
        title: "Kaja Global · Vocabulary charts that stick",
        description:
          "Free language charts from Pinterest — clear words, audio, examples, and tutor booking.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Kaja Global · Vocabulary charts that stick",
        description:
          "Free language charts with audio and examples for English speakers.",
      },
      other: {
        "p:domain_verify": GLOBAL_PINTEREST_VERIFY,
      },
    };
  }

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    manifest: "/brand/site.webmanifest",
    icons: {
      icon: [
        { url: "/brand/favicon.ico", type: "image/x-icon" },
        {
          url: "/brand/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          url: "/brand/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
        { url: "/brand/icon.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: [{ url: "/brand/favicon.ico", type: "image/x-icon" }],
      apple: [
        {
          url: "/brand/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        { url: "/brand/og.png", width: 1200, height: 630, alt: SITE_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: ["/brand/og.png"],
    },
    other: {
      // Main kajakorean.com vs global.kajakorean.com need different tokens.
      "p:domain_verify": isGlobalSite
        ? GLOBAL_PINTEREST_VERIFY
        : MAIN_PINTEREST_VERIFY,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const isGlobalSite = isGlobalSiteRequest(h);
  const isSoundSite = isSoundSiteRequest(h);
  const isJaSite = isJaSiteRequest(h);

  if (isGlobalSite || isJaSite || isSoundSite) {
    return (
      <html lang={isJaSite ? "ja" : "en"}>
        <head>
          {isGlobalSite ? (
            <>
              <meta
                name="p:domain_verify"
                content={GLOBAL_PINTEREST_VERIFY}
              />
              <meta
                name="impact-site-verification"
                {...{ value: GLOBAL_IMPACT_VERIFY }}
              />
            </>
          ) : null}
          {isSoundSite ? (
            <meta
              name="impact-site-verification"
              {...{ value: SOUND_IMPACT_VERIFY }}
            />
          ) : null}
          {isJaSite ? (
            <meta
              name="impact-site-verification"
              {...{ value: JA_IMPACT_VERIFY }}
            />
          ) : null}
        </head>
        <body className={`${plusJakarta.variable} ${bricolage.variable}`}>
          <GoogleAnalytics />
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        {/* Impact.com: exact name + value only (no content), once in <head>. */}
        <meta
          name="impact-site-verification"
          {...{ value: "3f86dcd5-109f-474f-bb4d-6e29ec5a2682" }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${bricolage.variable} min-h-dvh font-sans`}
        cz-shortcut-listen="true"
      >
        <MockSessionProvider>
          <GoogleAnalytics />
          <EducationModeProvider>
            <div className="min-h-dvh bg-background">
              <NextTopLoader
                color="#0071e3"
                height={3}
                showSpinner={false}
                crawlSpeed={200}
                speed={200}
              />
              <ScrollToTop />
              <TeachingSpotlight />
              <TeachingCmdDraw />
              <SiteNavbar />
              <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
              <SiteFooter />
              <SeoMiniQuizWidget />
              <ItalkiTutorStickyRail />
              <QuickNote />
            </div>
          </EducationModeProvider>
        </MockSessionProvider>
      </body>
    </html>
  );
}
