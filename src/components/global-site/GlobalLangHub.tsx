import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import { getGlobalLang, globalLangMeta } from "@/lib/globalSite/langMeta";
import { listGlobalPins } from "@/lib/globalSite/catalog";
import { atlasLangPath } from "@/lib/atlasRoutes";
import { globalGoPath } from "@/lib/globalSite/affiliate";
import { atlasLangHubH1 } from "@/lib/seo/variedCopy";

type Props = { code: string };

const LEGACY_LANG_NAV = ["es", "fr", "de", "it", "ar", "ja", "ko"] as const;

export async function GlobalLangHub({ code }: Props) {
  const lang = getGlobalLang(code);
  if (!lang) return null;
  const pins = await listGlobalPins({ lang: code });
  const meta = globalLangMeta(code);
  const otherLangs = LEGACY_LANG_NAV.filter((c) => c !== code);
  const h1 = atlasLangHubH1(lang.name);

  return (
    <div data-lang={code}>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href={atlasLangPath(code)}>Home</Link>
        <span aria-hidden> / </span>
        <span lang={code} dir={meta.dir}>
          {meta.native}
        </span>
      </nav>
      <section className="global-hero global-hero-text-only">
        <div>
          <p className="global-kicker">
            <span lang={code} dir={meta.dir}>
              {meta.native}
            </span>
            {" · "}
            {pins.length} charts
          </p>
          <h1>{h1}</h1>
          <p className="global-hero-lede">
            Vocabulary charts with audio and example sentences.
          </p>
          <div className="global-cta-row">
            <a
              className="global-btn global-btn-stamp affiliate-preply-desktop-only"
              href={globalGoPath("preply", { lang: code })}
            >
              Book a {lang.name} tutor · 50% off
            </a>
            <a
              className="global-btn global-btn-stamp affiliate-italki-mobile-only"
              href={globalGoPath("italki", { lang: code })}
            >
              Book a {lang.name} tutor · $10 off
            </a>
          </div>
        </div>
      </section>

      <GlobalAmazonTextbookPanel
        lang={code}
        langName={lang.name}
        placement="global_lang_textbooks"
        kicker="Books"
        lede={`Graded readers, conversation, and workbooks for ${lang.name}.`}
      />

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

