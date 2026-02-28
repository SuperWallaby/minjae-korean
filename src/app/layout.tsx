import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
// NOTE: LiveKit removed (pure WebRTC implementation). Keep this file free of LiveKit imports.
import { MockSessionProvider } from "@/lib/mock/MockSessionProvider";
import { EducationModeProvider } from "@/lib/EducationModeProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";
import { TeachingSpotlight } from "@/components/site/TeachingSpotlight";
import { QuickNote } from "@/components/QuickNote";
import { ScrollToTop } from "@/components/ScrollToTop";
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

const SITE_NAME = "Kaja";
const SITE_DESCRIPTION =
  "A friendly place to practice Korean through 1:1 conversation and build real confidence.";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const METADATA_BASE = new URL(SITE_URL);

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    default: `${SITE_NAME} | Let’s Talk in Korean`,
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
    title: `${SITE_NAME} | Let’s Talk in Korean`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/brand/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Let’s Talk in Korean`,
    description: SITE_DESCRIPTION,
    images: ["/brand/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${bricolage.variable} min-h-dvh font-sans`}
        cz-shortcut-listen="true"
      >
        <MockSessionProvider>
          <EducationModeProvider>
            <div className="min-h-dvh bg-background">
              <NextTopLoader
                color="#ef4444"
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
              <SupportChatWidget />
              <QuickNote />
            </div>
          </EducationModeProvider>
        </MockSessionProvider>
      </body>
    </html>
  );
}
