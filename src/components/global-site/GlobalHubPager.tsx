import Link from "next/link";
import { atlasLangChartsPath } from "@/lib/atlasRoutes";

type Props = {
  lang: string;
  page: number;
  totalPages: number;
  total: number;
};

export function GlobalHubPager({ lang, page, totalPages, total }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="global-hub-pager" aria-label="Chart pages">
      {page > 1 ? (
        <Link href={atlasLangChartsPath(lang, page - 1)}>← Previous</Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {totalPages} ({total} charts)
      </span>
      {page < totalPages ? (
        <Link href={atlasLangChartsPath(lang, page + 1)}>Next →</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
