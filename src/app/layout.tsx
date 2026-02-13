import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
// NOTE: LiveKit removed (pure WebRTC implementation). Keep this file free of LiveKit imports.
import { MockSessionProvider } from "@/lib/mock/MockSessionProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";

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
  "A place to use Korean from real context: read a prompt, talk it through, and keep a simple habit going.";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Let’s Talk in Korean`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/brand/site.webmanifest",
  icons: {
    icon: [{ url: "/brand/icon.png", type: "image/png" }],
    apple: [{ url: "/brand/icon.png" }],
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
          <div className="min-h-dvh bg-background">
            <SiteNavbar />
            <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
            <SiteFooter />
            <SupportChatWidget />
          </div>
        </MockSessionProvider>
      </body>
    </html>
  );
}
