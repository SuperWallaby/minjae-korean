import Link from "next/link";
import {
  atlasChartBrowsePath,
  type AtlasRouting,
  type ChartCategoryId,
  visibleChartCategories,
} from "@/lib/globalSite/chartCategories";

type Props = {
  lang: string;
  cat: ChartCategoryId;
  q: string;
  counts: Record<ChartCategoryId, number>;
  page1?: "hub" | "charts";
  routing?: AtlasRouting;
  page?: number;
};

export function ChartBrowseBar({
  lang,
  cat,
  q,
  counts,
  page1 = "charts",
  routing,
  page = 1,
}: Props) {
  const tabs = visibleChartCategories(counts);
  const pathOpts = { page1, routing };
  const action = atlasChartBrowsePath(lang, 1, undefined, pathOpts);
  const filtered = cat !== "all" || Boolean(q);
  const browseHref = (nextCat: ChartCategoryId, nextQ = q) => {
    const abs = atlasChartBrowsePath(
      lang,
      1,
      { cat: nextCat, q: nextQ },
      pathOpts,
    );
    if (page > 1) return abs;
    const i = abs.indexOf("?");
    return i >= 0 ? abs.slice(i) : "?";
  };

  return (
    <div className="global-chart-browse" id="charts">
      {tabs.length > 0 ? (
        <nav className="global-chart-tabs" aria-label="Chart type">
          {tabs.map((tab) => {
            const href = browseHref(tab.id);
            const active = tab.id === cat;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`global-chart-tab${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                prefetch={false}
              >
                {tab.label}
                <span className="global-chart-tab-count">{tab.count}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}

      <form
        className="global-chart-search"
        action={page > 1 ? action : undefined}
        method="get"
      >
        {cat !== "all" ? <input type="hidden" name="cat" value={cat} /> : null}
        <label className="sr-only" htmlFor="chart-q">
          Search charts
        </label>
        <input
          id="chart-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search charts — food, goshiwon, 얼마예요…"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit" className="global-btn global-btn-secondary">
          Search
        </button>
        {filtered ? (
          <Link
            className="global-chart-search-clear"
            href={browseHref("all", "")}
            prefetch={false}
          >
            Clear
          </Link>
        ) : null}
      </form>
    </div>
  );
}
