import Link from "next/link";
import { atlasChartBrowsePath, type AtlasRouting } from "@/lib/globalSite/chartCategories";

type Props = {
  lang: string;
  page: number;
  totalPages: number;
  total: number;
  cat?: string;
  q?: string;
  page1?: "hub" | "charts";
  routing?: AtlasRouting;
};

export function GlobalHubPager({
  lang,
  page,
  totalPages,
  total,
  cat,
  q,
  page1 = "hub",
  routing,
}: Props) {
  if (totalPages <= 1) return null;
  const query = { cat, q };
  const pathOpts = { page1, routing };
  return (
    <nav className="global-hub-pager" aria-label="Chart pages">
      {page > 1 ? (
        <Link href={atlasChartBrowsePath(lang, page - 1, query, pathOpts)}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {totalPages} ({total} charts)
      </span>
      {page < totalPages ? (
        <Link href={atlasChartBrowsePath(lang, page + 1, query, pathOpts)}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
