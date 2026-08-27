import type { Metadata } from "next";
import Link from "next/link";
import { listGlobalPins } from "@/lib/globalSite/catalog";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";

export const metadata: Metadata = {
  title: "Pinyin hub · Mandarin pronunciation",
  description:
    "Mandarin pinyin with tone marks — how GetPronounce charts spell Chinese for English speakers, plus links to live vocabulary plates.",
  alternates: { canonical: `${pronounceSiteOrigin()}/pinyin/` },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

const TONE_ROWS = [
  { mark: "ā", name: "1st · high level", tip: "Stay high and flat" },
  { mark: "á", name: "2nd · rising", tip: "Like asking a question" },
  { mark: "ǎ", name: "3rd · dip", tip: "Low dip, then slight rise" },
  { mark: "à", name: "4th · falling", tip: "Sharp fall" },
  { mark: "a", name: "Neutral", tip: "Light, unstressed" },
] as const;

export default function PinyinHubPage() {
  const zhPins = listGlobalPins({ lang: "zh" }).slice(0, 8);

  return (
    <>
      <section className="global-hero">
        <div>
          <p className="global-kicker">Pinyin · 拼音</p>
          <h1>Mandarin sounds, spelled out.</h1>
          <p>
            Tone-mark pinyin on every chart — the same spelling the audio uses.
          </p>
          <div className="global-cta-row">
            <Link className="global-btn global-btn-secondary" href="/">
              Chinese charts
            </Link>
            <Link
              className="global-btn global-btn-secondary"
              href="/words/ni-hao/"
            >
              你好 · listen
            </Link>
          </div>
        </div>
      </section>

      <section className="global-section">
        <h2 className="global-section-title">Tone marks (quick map)</h2>
        <ul className="global-word-list">
          {TONE_ROWS.map((row) => (
            <li key={row.name}>
              <span className="global-word-index" lang="zh">
                {row.mark}
              </span>
              <div className="global-word-main">
                <span className="global-word-target">{row.name}</span>
                <span className="global-word-roma">{row.tip}</span>
              </div>
              <span className="global-word-en">on vowel a</span>
            </li>
          ))}
        </ul>
      </section>

      {zhPins.length ? (
        <section className="global-section">
          <h2 className="global-section-title">Practice on live charts</h2>
          <p className="global-related-lede">
            Open a plate and tap audio — Mainland Mandarin is the default voice.
          </p>
          <ul className="global-related-links">
            {zhPins.map((p) => (
              <li key={p.id}>
                <Link href={`/pin/${p.id}/`}>{p.titleEn}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
