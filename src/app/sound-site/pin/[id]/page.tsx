import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSoundPin,
  listSoundPins,
  soundPinPageImagePath,
} from "@/lib/soundSite/catalog";
import { buildSoundPinMetadata, soundPinJsonLd } from "@/lib/soundSite/seo";
import {
  SoundAccentToggle,
  SoundPlayAllButton,
  SoundSlowNormalButton,
  SoundSpeedControl,
  SoundVoiceToggle,
} from "@/components/sound-site/SoundPlayback";
import { SoundTtsButton } from "@/components/sound-site/SoundTtsButton";
import { SoundTutorPair } from "@/components/sound-site/SoundTutorPair";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return listSoundPins().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getSoundPin(id);
  if (!pin) return { title: "Chart" };
  return buildSoundPinMetadata(pin);
}

export default async function SoundPinPage({ params }: Props) {
  const { id } = await params;
  const pin = getSoundPin(id);
  if (!pin) notFound();

  const examples = pin.examples || [];
  const jsonLd = soundPinJsonLd(pin);
  const image = soundPinPageImagePath(pin.imagePath);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Charts</Link>
        <span aria-hidden> / </span>
        <span>{pin.titleEn}</span>
      </nav>

      <article className="sound-pin-layout">
        <div className="sound-pin-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`${pin.titleEn} — English pronunciation chart`}
            width={1000}
            height={1500}
          />
        </div>

        <div className="sound-pin-copy">
          <h1>{pin.titleEn}</h1>
          {pin.description ? (
            <p className="sound-pin-lede">{pin.description}</p>
          ) : (
            <p className="sound-pin-lede">
              Listen first. Pick accent and voice, set the speed, then speak
              along.
            </p>
          )}

          <aside className="sound-listen-banner" aria-label="Listening controls">
            <p className="sound-listen-kicker">Sound desk</p>
            <div className="sound-hero-controls">
              <SoundAccentToggle />
              <SoundVoiceToggle />
              <SoundSpeedControl />
              <SoundPlayAllButton items={pin.words} />
            </div>
          </aside>

          <h2 className="global-subhead">Words</h2>
          <ul className="global-word-list">
            {pin.words.map((w, i) => (
              <li key={`${w.english}-${i}`}>
                <span className="global-word-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="global-word-main">
                  <span className="global-word-target" lang="en">
                    {w.english}
                  </span>
                  {w.ipa ? (
                    <span className="global-word-roma">/{w.ipa}/</span>
                  ) : null}
                </div>
                {w.gloss ? (
                  <span className="global-word-en">{w.gloss}</span>
                ) : (
                  <span className="global-word-en" />
                )}
                <span className="sound-word-actions">
                  <SoundTtsButton item={w} label={w.english} />
                  <SoundSlowNormalButton item={w} />
                </span>
              </li>
            ))}
          </ul>

          {examples.length > 0 ? (
            <section className="global-examples" aria-labelledby="ex-heading">
              <h2 id="ex-heading" className="global-subhead">
                Examples
              </h2>
              <ol className="global-example-list">
                {examples.map((ex, i) => (
                  <li key={`${ex.english}-${i}`}>
                    <div className="global-example-target-row">
                      <p className="global-example-target" lang="en">
                        {ex.english}
                      </p>
                      <span className="sound-word-actions">
                        <SoundTtsButton
                          item={ex}
                          label={`Example ${i + 1}`}
                        />
                        <SoundSlowNormalButton item={ex} />
                      </span>
                    </div>
                    {ex.gloss ? (
                      <p className="global-example-en">{ex.gloss}</p>
                    ) : null}
                    {ex.ipa ? (
                      <p className="global-example-en" lang="en">
                        /{ex.ipa}/
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <SoundTutorPair pinId={pin.id} />
        </div>
      </article>
    </>
  );
}
