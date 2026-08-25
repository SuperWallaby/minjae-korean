import type { Metadata } from "next";
import {
  SOUND_SITE_DESCRIPTION,
  SOUND_SITE_NAME,
  soundSiteHomeTitle,
} from "@/lib/soundSite/brand";
import { listSoundPins, soundSiteBase } from "@/lib/soundSite/catalog";
import { SoundTutorPair } from "@/components/sound-site/SoundTutorPair";
import {
  SoundAccentToggle,
  SoundSpeedControl,
  SoundVoiceToggle,
} from "@/components/sound-site/SoundPlayback";

const HOME_TITLE = soundSiteHomeTitle();
const HOME_DESC = SOUND_SITE_DESCRIPTION;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: `${soundSiteBase()}/` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    url: `${soundSiteBase()}/`,
    siteName: SOUND_SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default function SoundHomePage() {
  const pins = listSoundPins();
  const base = soundSiteBase();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SOUND_SITE_NAME,
    inLanguage: "en",
    url: base,
    description: HOME_DESC,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="sound-hero">
        <div className="sound-hero-copy">
          <p className="global-kicker">English · sound-first</p>
          <h1>
            Learn English
            <br />
            by listening.
          </h1>
          <p className="sound-hero-lede">
            Vocabulary charts for English speakers — every word is meant to be
            heard. Switch US / UK / AU, pick a voice, play slow then normal,
            then say it back.
          </p>
          <ul className="sound-hero-chips">
            <li>EN → EN</li>
            <li>US · UK · AU</li>
            <li>Play all · Slow → Normal</li>
          </ul>
          <div
            className="sound-hero-controls"
            aria-label="Listening preferences"
          >
            <SoundAccentToggle />
            <SoundVoiceToggle />
            <SoundSpeedControl />
          </div>
          <div className="global-cta-row">
            <a className="global-btn global-btn-stamp" href="#charts">
              Browse charts
            </a>
            <a className="global-btn global-btn-secondary" href="#tutors">
              Book a tutor
            </a>
          </div>
        </div>
        <div className="sound-hero-panel" aria-hidden>
          <div className="sound-wave">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="sound-hero-panel-label">Press play on any word</p>
        </div>
      </section>

      <SoundTutorPair />

      <div className="global-section-head" id="charts">
        <h2 className="global-section-title">Pronunciation charts</h2>
        <p>
          {pins.length > 0
            ? `${pins.length} charts · audio on every word`
            : "Charts are on the way — EN→EN sound pins aren’t published yet."}
        </p>
      </div>

      {pins.length > 0 ? (
        <div className="global-pin-grid">
          {pins.map((pin) => (
            <a
              key={pin.id}
              className="sound-pin-card"
              href={`/pin/${encodeURIComponent(pin.id)}`}
            >
              <strong>{pin.titleEn}</strong>
              <span>{pin.words?.length || 0} words</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="sound-empty" role="status">
          <p className="sound-empty-title">No charts yet</p>
          <p>
            This site is live and ready. The first English-in-English sound
            charts will appear here once they&apos;re generated and published.
          </p>
          <p className="sound-empty-meta">
            Sibling site for Japanese speakers:{" "}
            <a href="https://eigopin.com">eigopin.com</a>
          </p>
        </div>
      )}
    </>
  );
}
