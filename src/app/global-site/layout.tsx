import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
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
    "Save-worthy vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, and Japanese. Book a tutor with our partner offers.",
  applicationName: "Kaja Global",
  openGraph: {
    type: "website",
    siteName: "Kaja Global",
    title: "Kaja Global · Vocabulary charts that stick",
    description:
      "Free language charts from Pinterest — with clear words, pronunciation, and tutor booking offers.",
  },
};

export default function GlobalSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`global-root ${dm.variable} ${display.variable}`}>
      <header className="global-header">
        <a className="global-brand" href="/">
          <span className="global-brand-mark">Kaja</span>
          <span className="global-brand-sub">Global</span>
        </a>
        <nav className="global-nav" aria-label="Languages">
          <a href="/lang/es">Spanish</a>
          <a href="/lang/fr">French</a>
          <a href="/lang/de">German</a>
          <a href="/lang/it">Italian</a>
          <a href="/lang/ar">Arabic</a>
          <a href="/lang/ja">Japanese</a>
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
