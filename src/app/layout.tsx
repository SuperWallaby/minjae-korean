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

export const metadata: Metadata = {
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
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/brand/og.png"],
  },
  other: {
    "p:domain_verify": "7a6bc7a84bb2c6c634bf33f0618b07d7",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const isGlobalSite = h.get("x-kaja-site") === "global";

  if (isGlobalSite) {
    return (
      <html lang="en">
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
