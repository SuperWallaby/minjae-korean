import { SITE_DESCRIPTION, SITE_HOME_TITLE, SITE_NAME } from "@/lib/siteBrand";
import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Jua,
  Nanum_Gothic,
  Noto_Sans_KR,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { GoogleAnalytics } from "@/components/site/GoogleAnalytics";
import { KajaMainLayoutChrome } from "@/components/site/KajaMainLayoutChrome";
import { MockSessionProvider } from "@/lib/mock/MockSessionProvider";
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
  isSoundSiteDeployment,
  soundSiteHomeTitle,
  soundSiteOrigin,
  soundSiteTitleTemplate,
} from "@/lib/soundSite/brand";
import {
  PRONOUNCE_SITE_DESCRIPTION,
  PRONOUNCE_SITE_NAME,
  pronounceSiteHomeTitle,
  pronounceSiteOrigin,
  pronounceSiteTitleTemplate,
  isPronounceSiteDeployment,
} from "@/lib/pronounceSite/brand";
import {
  WORKSHEET_SITE_DESCRIPTION,
  WORKSHEET_SITE_NAME,
  isWorksheetSiteDeployment,
  worksheetSiteHomeTitle,
  worksheetSiteOrigin,
  worksheetSiteTitleTemplate,
} from "@/lib/worksheetSite/brand";
import { SITE_ORIGIN } from "@/lib/siteUrl";

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

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum-gothic",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const GLOBAL_PINTEREST_VERIFY = "86705510fceea49d9e5298e3a6f4df6d";
const MAIN_PINTEREST_VERIFY = "7a6bc7a84bb2c6c634bf33f0618b07d7";
const GLOBAL_IMPACT_VERIFY = "ad7f601e-1ef9-4800-b4ef-d477c480e7f4";
const JA_IMPACT_VERIFY = "561a4f75-1aa2-4877-871f-52b98f10778a";
const SOUND_IMPACT_VERIFY = "a87ceafc-d968-4565-862d-10234de628b1";
const PRONOUNCE_IMPACT_VERIFY = "b424624e-7600-4de6-99df-310c5c41e237";

function requestHost(h: Headers): string {
  return (h.get("host") || "").toLowerCase().split(":")[0];
}

function isPronounceSiteRequest(h: Headers): boolean {
  if (h.get("x-kaja-site") === "pronounce") return true;
  if (isPronounceSiteDeployment()) return true;
  const host = requestHost(h);
  return host === "getpronounce.net" || host.startsWith("getpronounce.");
}

function isSoundSiteRequest(h: Headers): boolean {
  if (isPronounceSiteRequest(h)) return false;
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
  if (isPronounceSiteRequest(h)) return false;
  if (isWorksheetSiteRequest(h)) return false;
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

function isWorksheetSiteRequest(h: Headers): boolean {
  if (isWorksheetSiteDeployment()) return true;
  if (h.get("x-kaja-site") === "worksheet") return true;
  const host = requestHost(h);
  return host === "worksheet.kajakorean.com" || host.startsWith("worksheet.");
}

type AtlasFlags = {
  isGlobalSite: boolean;
  isSoundSite: boolean;
  isPronounceSite: boolean;
  isJaSite: boolean;
  isWorksheetSite: boolean;
};

/**
 * Dedicated Vercel projects already know the site from env. Calling
 * `headers()` here makes on-demand SSG throw DYNAMIC_SERVER_USAGE (500)
 * for atlas pin paths that were not prerendered at build.
 */
function atlasFlagsFromDedicatedEnv(): AtlasFlags | null {
  if (isPronounceSiteDeployment()) {
    return {
      isGlobalSite: false,
      isSoundSite: false,
      isPronounceSite: true,
      isJaSite: false,
      isWorksheetSite: false,
    };
  }
  if (isSoundSiteDeployment()) {
    return {
      isGlobalSite: false,
      isSoundSite: true,
      isPronounceSite: false,
      isJaSite: false,
      isWorksheetSite: false,
    };
  }
  if (isJaSiteDeployment()) {
    return {
      isGlobalSite: false,
      isSoundSite: false,
      isPronounceSite: false,
      isJaSite: true,
      isWorksheetSite: false,
    };
  }
  if (isWorksheetSiteDeployment()) {
    return {
      isGlobalSite: false,
      isSoundSite: false,
      isPronounceSite: false,
      isJaSite: false,
      isWorksheetSite: true,
    };
  }
  return null;
}

async function resolveAtlasFlags(): Promise<AtlasFlags> {
  const dedicated = atlasFlagsFromDedicatedEnv();
  if (dedicated) return dedicated;
  const h = await headers();
  return {
    isGlobalSite: isGlobalSiteRequest(h),
    isSoundSite: isSoundSiteRequest(h),
    isPronounceSite: isPronounceSiteRequest(h),
    isJaSite: isJaSiteRequest(h),
    isWorksheetSite: isWorksheetSiteRequest(h),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const {
    isGlobalSite,
    isSoundSite,
    isPronounceSite,
    isJaSite,
    isWorksheetSite,
  } = await resolveAtlasFlags();

  if (isPronounceSite) {
    const origin = pronounceSiteOrigin();
    return {
      metadataBase: new URL(origin),
      title: {
        default: pronounceSiteHomeTitle(),
        template: pronounceSiteTitleTemplate(),
      },
      description: PRONOUNCE_SITE_DESCRIPTION,
      applicationName: PRONOUNCE_SITE_NAME,
      themeColor: "#b91c1c",
      icons: {
        icon: [
          { url: "/getpronounce/mark.svg", type: "image/svg+xml" },
        ],
        shortcut: [{ url: "/getpronounce/mark.svg", type: "image/svg+xml" }],
        apple: [{ url: "/getpronounce/mark.svg", type: "image/svg+xml" }],
      },
    };
  }

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

  if (isWorksheetSite) {
    const origin = worksheetSiteOrigin();
    return {
      metadataBase: new URL(origin),
      title: {
        default: worksheetSiteHomeTitle(),
        template: worksheetSiteTitleTemplate(),
      },
      description: WORKSHEET_SITE_DESCRIPTION,
      applicationName: WORKSHEET_SITE_NAME,
      themeColor: "#0071e3",
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
        "Save-worthy vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, Japanese, and Chinese — with pronunciation audio, examples, and tutor offers.",
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
      default: SITE_HOME_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    // SEO focus moved to eigopin / sound.eigopin / getpronounce — stop indexing Kaja apex.
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
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
      title: SITE_HOME_TITLE,
      description: SITE_DESCRIPTION,
      images: [
        { url: "/brand/og.png", width: 1200, height: 630, alt: SITE_HOME_TITLE },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_HOME_TITLE,
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
  const {
    isGlobalSite,
    isSoundSite,
    isPronounceSite,
    isJaSite,
    isWorksheetSite,
  } = await resolveAtlasFlags();

  if (isGlobalSite || isJaSite || isSoundSite || isPronounceSite || isWorksheetSite) {
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
          {isPronounceSite ? (
            <>
              <meta
                name="impact-site-verification"
                {...{ value: PRONOUNCE_IMPACT_VERIFY }}
              />
              <meta
                name="partnerboostverifycode"
                content="32dc01246faccb7f5b3cad5016dd5033"
              />
            </>
          ) : null}
        </head>
        <body
          className={
            isWorksheetSite
              ? `${plusJakarta.variable} ${bricolage.variable} ${notoSansKr.variable} ${jua.variable} ${nanumGothic.variable}`
              : `${plusJakarta.variable} ${bricolage.variable}`
          }
        >
          <GoogleAnalytics />
          <MockSessionProvider>{children}</MockSessionProvider>
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
        <GoogleAnalytics />
        <KajaMainLayoutChrome>{children}</KajaMainLayoutChrome>
      </body>
    </html>
  );
}
