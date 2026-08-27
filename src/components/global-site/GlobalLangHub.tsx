import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import {
  getGlobalLang,
  globalLangMeta,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { atlasLangPath } from "@/lib/atlasRoutes";
import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = { code: string };

const LEGACY_LANG_NAV = ["es", "fr", "de", "it", "ar", "ja"] as const;

export function GlobalLangHub({ code }: Props) {
  const lang = getGlobalLang(code);
  if (!lang) return null;
  const pins = listGlobalPins({ lang: code });
  const meta = globalLangMeta(code);
  const otherLangs = LEGACY_LANG_NAV.filter((c) => c !== code);

  return (
    <div data-lang={code}>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden> / </span>
        <span lang={code} dir={meta.dir}>
          {meta.native}
        </span>
      </nav>
      <section className="global-hero">
        <div>
          <p className="global-kicker">
            {lang.name} · {pins.length} charts
          </p>
          <h1 className="global-lang-hero-native" lang={code} dir={meta.dir}>
            {meta.native}
          </h1>
          <p>
            Vocabulary charts with audio and example sentences.
          </p>
          <div className="global-cta-row">
            <a
              className="global-btn global-btn-stamp"
              href={globalGoPath("preply", { lang: code })}
            >
              Book a {lang.name} tutor · 50% off
            </a>
          </div>
        </div>
      </section>

      {pins.length === 0 ? (
        <p className="global-pin-lede">More charts coming soon.</p>
      ) : (
        <div className="global-pin-grid">
          {pins.map((pin, i) => (
            <GlobalPinCard
              key={pin.id}
              pin={pin}
              priority={i === 0}
              meta={`${pin.words.length} words${
                pin.examples?.length ? " · examples" : ""
              }${pin.words.some((w) => w.ttsUrl) ? " · audio" : ""}`}
            />
          ))}
        </div>
      )}

      <section className="global-related">
        <p className="global-related-lede">Other languages</p>
        <ul className="global-related-links">
          <li>
            <Link href="/" lang="zh">
              中文
            </Link>
          </li>
          {otherLangs.map((c) => {
            const l = getGlobalLang(c);
            const m = globalLangMeta(c);
            if (!l) return null;
            return (
              <li key={c}>
                <Link href={atlasLangPath(c)} lang={c} dir={m.dir}>
                  {m.native}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

