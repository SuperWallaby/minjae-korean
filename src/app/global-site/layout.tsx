import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
import "./global.css";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-global-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-global-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://global.kajakorean.com"),
  title: {
    default: "Kaja Global · Learn languages with clear vocab charts",
    template: "%s · Kaja Global",
  },
  description:
    "Save-worthy vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, and Japanese — with pronunciation audio, examples, and tutor offers.",
  applicationName: "Kaja Global",
  openGraph: {
    type: "website",
    siteName: "Kaja Global",
    title: "Kaja Global · Vocabulary charts that stick",
    description:
      "Free language charts from Pinterest — clear words, audio, examples, and tutor booking.",
    url: "https://global.kajakorean.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaja Global · Vocabulary charts that stick",
    description:
      "Free language charts with audio and examples for English speakers.",
  },
  robots: { index: true, follow: true },
};

export default function GlobalSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`global-root ${dm.variable} ${display.variable}`}>
      <header className="global-header">
        <Link className="global-brand" href="/">
          <span className="global-brand-mark">Kaja</span>
          <span className="global-brand-sub">Global</span>
        </Link>
        <nav className="global-nav" aria-label="Languages">
          <Link href="/lang/es">Spanish</Link>
          <Link href="/lang/fr">French</Link>
          <Link href="/lang/de">German</Link>
          <Link href="/lang/it">Italian</Link>
          <Link href="/lang/ar">Arabic</Link>
          <Link href="/lang/ja">Japanese</Link>
        </nav>
      </header>
      <main className="global-main">{children}</main>
      <footer className="global-footer">
        <p>
          Charts for English speakers learning a new language. Tutor offers via{" "}
          Preply &amp; italki.
        </p>
        <p className="global-footer-meta">
          A <a href="https://kajakorean.com">kajakorean.com</a> product ·{" "}
          <a href="/go/preply">Book a tutor (50% off)</a>
        </p>
      </footer>
    </div>
  );
}
