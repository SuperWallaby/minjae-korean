import type { Metadata } from "next";
import Link from "next/link";
import {
  GLOBAL_LANG_META,
  globalLangMeta,
} from "@/lib/globalSite/catalog";
import "./global.css";

const LANG_NAV = ["es", "fr", "de", "it", "ar", "ja"] as const;

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
  other: {
    "p:domain_verify": "86705510fceea49d9e5298e3a6f4df6d",
  },
};

export default function GlobalSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="global-root">
      <header className="global-header">
        <div className="global-shell global-header-inner">
          <div className="global-header-top">
            <Link className="global-brand" href="/">
              <span className="global-brand-mark">Kaja</span>
              <span className="global-brand-sub">Global</span>
            </Link>
            <a className="global-header-tutor" href="/go/preply">
              1:1 tutor
            </a>
          </div>
          <nav className="global-nav" aria-label="Languages">
            {LANG_NAV.map((code) => {
              const meta = globalLangMeta(code);
              return (
                <Link
                  key={code}
                  href={`/lang/${code}`}
                  data-lang={code}
                  lang={code}
                  dir={meta.dir}
                >
                  {GLOBAL_LANG_META[code]?.native ?? code}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="global-shell global-main">{children}</main>
      <footer className="global-footer">
        <div className="global-shell">
          <p>
            A word atlas for English speakers. Tutor offers via Preply &amp;
            italki.
          </p>
          <p className="global-footer-meta">
            A <a href="https://kajakorean.com">kajakorean.com</a> product ·{" "}
            <a href="/go/preply">Book a tutor (50% off)</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
