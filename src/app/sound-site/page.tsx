import type { Metadata } from "next";
import {
  SOUND_SITE_DESCRIPTION,
  SOUND_SITE_NAME,
  soundSiteHomeTitle,
} from "@/lib/soundSite/brand";
import { listSoundPins, soundPinForCard, soundSiteBase } from "@/lib/soundSite/catalog";
import { SoundPinCard } from "@/components/sound-site/SoundPinCard";
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

export const revalidate = 60;

export default async function SoundHomePage() {
  const pins = (await listSoundPins()).map(soundPinForCard);
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
          <p className="global-kicker">Slang words in English</p>
          <h1>
            Other ways
            <br />
            to say it.
          </h1>
          <p className="sound-hero-lede">
            Other ways to say thank you, sorry, and I agree — plus slang words
            in English. Listen American vs British pronunciation, or an
            Australian accent, then say it back.
          </p>
          <ul className="sound-hero-chips">
            <li>Other ways to say</li>
            <li>Slang words in English</li>
            <li>American vs British</li>
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
        <h2 className="global-section-title">Other ways to say it</h2>
        <p>
          {pins.length > 0
            ? `${pins.length} charts · slang words in English too`
            : "Charts are on the way."}
        </p>
      </div>

      {pins.length > 0 ? (
        <div className="global-pin-grid">
          {pins.map((pin) => (
            <SoundPinCard key={pin.id} pin={pin} heading="h2" />
          ))}
        </div>
      ) : null}
    </>
  );
}
