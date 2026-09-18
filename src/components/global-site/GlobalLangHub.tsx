import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartBrowseBar } from "@/components/global-site/ChartBrowseBar";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import { GlobalHubPager } from "@/components/global-site/GlobalHubPager";
import { getGlobalLang, globalLangMeta } from "@/lib/globalSite/langMeta";
import {
  listGlobalListings,
  listGlobalPins,
  listingCardMeta,
  paginateGlobalHub,
} from "@/lib/globalSite/catalog";
import {
  atlasLangPath,
} from "@/lib/atlasRoutes";
import { globalGoPath } from "@/lib/globalSite/affiliate";
import { atlasLangHubH1 } from "@/lib/seo/variedCopy";
import { AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE } from "@/lib/affiliateAmazon";
import { isPronounceSiteDeployment } from "@/lib/pronounceSite/brand";
import { freeKoreanClassPath } from "@/lib/trial/localhostOnly";
import {
  atlasChartBrowsePath,
  countChartCategories,
  filterChartListings,
  parseChartCategory,
  parseChartQuery,
  type AtlasRouting,
  type ChartCategoryId,
} from "@/lib/globalSite/chartCategories";

type Props = {
  code: string;
  page?: number;
  browse?: "hub" | "charts";
  cat?: string;
  q?: string;
  routing?: AtlasRouting;
};

const LEGACY_LANG_NAV = ["es", "fr", "de", "it", "ar", "ja", "ko"] as const;

export async function GlobalLangHub({
  code,
  page = 1,
  browse = "hub",
  cat: rawCat,
  q: rawQ,
  routing,
}: Props) {
  const lang = getGlobalLang(code);
  if (!lang) return null;
  const listings = await listGlobalListings({ lang: code });
  const cat: ChartCategoryId = parseChartCategory(rawCat);
  const q = parseChartQuery(rawQ);
  const hasFilter = cat !== "all" || Boolean(q);
  const source = q ? await listGlobalPins({ lang: code }) : listings;
  const filtered = filterChartListings(source, cat, q);
  const paged = paginateGlobalHub(filtered, page);
  if (paged.outOfRange && !hasFilter) notFound();
  const meta = globalLangMeta(code);
  const otherLangs = LEGACY_LANG_NAV.filter((c) => c !== code);
  const h1 = atlasLangHubH1(lang.name);
  const counts = countChartCategories(listings);
  const page1 = browse === "charts" ? "charts" : "hub";
  const emptyFiltered = hasFilter && paged.items.length === 0;

  return (
    <div data-lang={code}>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href={atlasLangPath(code)}>Home</Link>
        <span aria-hidden> / </span>
        <span lang={code} dir={meta.dir}>
          {meta.native}
        </span>
        {browse === "charts" ? (
          <>
            <span aria-hidden> / </span>
            <Link
              href={atlasChartBrowsePath(code, 1, undefined, {
                page1: "charts",
                routing,
              })}
            >
              Charts
            </Link>
          </>
        ) : null}
      </nav>
      <section className="global-hero global-hero-text-only">
        <div>
          <p className="global-kicker">
            <span lang={code} dir={meta.dir}>
              {meta.native}
            </span>
            {" · "}
            {hasFilter
              ? `${filtered.length} of ${listings.length} charts`
              : `${listings.length} charts`}
          </p>
          <h1>{h1}</h1>
          <p className="global-hero-lede">
            Vocabulary charts with audio and example sentences.
          </p>
          <div className="global-cta-row">
            {isPronounceSiteDeployment() && code === "ko" ? (
              <Link
                className="global-btn global-btn-stamp"
                href={freeKoreanClassPath("pronounce")}
              >
                Free 1:1 trial
              </Link>
            ) : (
              <a
                className="global-btn global-btn-stamp"
                href={globalGoPath("preply", { lang: code })}
              >
                Book a {lang.name} tutor · 50% off
              </a>
            )}
          </div>
        </div>
      </section>

      <GlobalAmazonTextbookPanel
        lang={code}
        langName={lang.name}
        placement="global_lang_textbooks"
        kicker="Books"
        lede={`Graded readers, conversation, and workbooks for ${lang.name}.`}
        disclosure={
          isPronounceSiteDeployment()
            ? AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE
            : undefined
        }
      />

      {listings.length === 0 ? (
        <p className="global-pin-lede">More charts coming soon.</p>
      ) : (
        <>
          <ChartBrowseBar
            lang={code}
            cat={cat}
            q={q}
            counts={counts}
            page1={page1}
            routing={routing}
            page={paged.page}
          />
          {emptyFiltered ? (
            <p className="global-pin-lede">
              No charts match
              {q ? ` “${q}”` : ""}
              {cat !== "all"
                ? ` in ${cat === "comparisons" ? "comparisons" : cat}`
                : ""}
              . Try another tab or search.
            </p>
          ) : (
            <div className="global-pin-grid">
              {paged.items.map((pin, i) => (
                <GlobalPinCard
                  key={pin.id}
                  pin={pin}
                  priority={i === 0}
                  meta={listingCardMeta(pin)}
                />
              ))}
            </div>
          )}
          <GlobalHubPager
            lang={code}
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            cat={cat}
            q={q}
            page1={page1}
            routing={routing}
          />
        </>
      )}

      <section className="global-related">
        <p className="global-related-lede">Other languages</p>
        <ul className="global-related-links">
          <li>
            <Link href="/" lang="zh" prefetch={false}>
              中文
            </Link>
          </li>
          {otherLangs.map((c) => {
            const l = getGlobalLang(c);
            const m = globalLangMeta(c);
            if (!l) return null;
            return (
              <li key={c}>
                <Link href={atlasLangPath(c)} lang={c} dir={m.dir} prefetch={false}>
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
