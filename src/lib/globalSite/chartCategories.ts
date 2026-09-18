import type { GlobalPinExample, GlobalPinPage } from "@/lib/globalSite/catalog";
import {
  isPronounceAtlasRouting,
  normalizeAtlasLangCode,
} from "@/lib/atlasRoutes";

export const CHART_CATEGORY_IDS = [
  "all",
  "words",
  "comparisons",
  "phrases",
  "grammar",
  "reading",
  "hanja",
] as const;

export type ChartCategoryId = (typeof CHART_CATEGORY_IDS)[number];

export type ChartKind = Exclude<ChartCategoryId, "all">;

export const CHART_CATEGORIES: { id: ChartCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "words", label: "Words" },
  { id: "comparisons", label: "Comparisons" },
  { id: "phrases", label: "Phrases" },
  { id: "grammar", label: "Grammar" },
  { id: "reading", label: "Reading" },
  { id: "hanja", label: "Hanja" },
];

const FORMAT_RE =
  /__(grid_cluster|antonym_split|similar_split|super_list|phrase_stack|phrase_square|cute_cast|quiz_comment|concept_rows|topik_upgrade|grammar_spotlight|match_worksheet)(?:__|$)/i;

type ChartRef = {
  id?: string;
  titleEn?: string;
  topicSlug?: string;
  slug?: string;
};

export function parseChartCategory(raw: string | null | undefined): ChartCategoryId {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  return (CHART_CATEGORY_IDS as readonly string[]).includes(v)
    ? (v as ChartCategoryId)
    : "all";
}

export function parseChartQuery(raw: string | null | undefined): string {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function chartKindForListing(pin: ChartRef): ChartKind {
  const id = String(pin.id || "").toLowerCase();
  const title = String(pin.titleEn || "");
  const titleLc = title.toLowerCase();
  const topic = String(pin.topicSlug || "").toLowerCase();
  const format = id.match(FORMAT_RE)?.[1]?.toLowerCase() || "";

  if (
    id.startsWith("rd_") ||
    id.includes("reading_monologue") ||
    id.includes("reading_dialogue")
  ) {
    return "reading";
  }
  if (id.includes("hanja") || topic.includes("hanja")) return "hanja";
  if (
    id.includes("2panel") ||
    id.includes("3panel") ||
    id.includes("jjibara") ||
    id.includes("capy")
  ) {
    return "words";
  }

  if (
    format === "antonym_split" ||
    format === "similar_split" ||
    id.includes("vk_sim-") ||
    /(^|[-_])sim-/.test(id) ||
    /\bvs\.?\b/.test(titleLc)
  ) {
    return "comparisons";
  }

  if (
    format === "phrase_stack" ||
    format === "phrase_square" ||
    id.includes("vk_psq-") ||
    id.includes("vk_phrase-") ||
    id.includes("vk_concept-e3") ||
    id.includes("phrase-") ||
    id.startsWith("psq-")
  ) {
    return "phrases";
  }

  if (
    format === "concept_rows" ||
    format === "topik_upgrade" ||
    format === "grammar_spotlight" ||
    id.includes("vk_gram-") ||
    id.includes("vk_concept-") ||
    id.includes("vk_topik-") ||
    id.includes("gram-") ||
    id.includes("topik") ||
    /^\s*-/.test(title) ||
    /^[가-힣].{0,24}—/.test(title)
  ) {
    return "grammar";
  }

  if (
    !id.startsWith("rd_") &&
    /^(how to|how to say)\b/i.test(titleLc)
  ) {
    return "phrases";
  }

  return "words";
}

export function countChartCategories(
  listings: ChartRef[],
): Record<ChartCategoryId, number> {
  const counts = Object.fromEntries(
    CHART_CATEGORY_IDS.map((id) => [id, 0]),
  ) as Record<ChartCategoryId, number>;
  counts.all = listings.length;
  for (const pin of listings) {
    counts[chartKindForListing(pin)] += 1;
  }
  return counts;
}

export function visibleChartCategories(
  counts: Record<ChartCategoryId, number>,
): { id: ChartCategoryId; label: string; count: number }[] {
  const rows = CHART_CATEGORIES.map((row) => ({
    ...row,
    count: counts[row.id] || 0,
  }));
  const real = rows.filter((r) => r.id !== "all" && r.count > 0);
  if (real.length < 2) return [];
  return rows.filter((r) => r.id === "all" || r.count > 0);
}

function searchHaystack(
  pin: ChartRef & {
    words?: GlobalPinPage["words"];
    examples?: GlobalPinExample[];
    reading?: GlobalPinPage["reading"];
  },
): string {
  const bits = [
    pin.titleEn,
    pin.topicSlug,
    pin.slug,
    String(pin.id || "").replace(/__[a-z]{2,8}$/i, ""),
  ];
  for (const w of pin.words || []) {
    bits.push(w.english, w.target, w.romanization);
  }
  for (const e of pin.examples || []) {
    bits.push(e.english, e.target);
  }
  for (const line of pin.reading?.lines || []) {
    bits.push(line.en, line.ko);
  }
  return bits.filter(Boolean).join("\n").toLowerCase();
}

export function chartMatchesQuery(
  pin: ChartRef & {
    words?: GlobalPinPage["words"];
    examples?: GlobalPinExample[];
    reading?: GlobalPinPage["reading"];
  },
  q: string,
): boolean {
  const query = parseChartQuery(q);
  if (!query) return true;
  const hay = searchHaystack(pin);
  const tokens = query.toLowerCase().split(" ").filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

export function filterChartListings<
  T extends ChartRef & {
    words?: GlobalPinPage["words"];
    examples?: GlobalPinExample[];
    reading?: GlobalPinPage["reading"];
  },
>(listings: T[], cat: ChartCategoryId, q: string): T[] {
  const kind = cat === "all" ? null : cat;
  const query = parseChartQuery(q);
  return listings.filter((pin) => {
    if (kind && chartKindForListing(pin) !== kind) return false;
    if (query && !chartMatchesQuery(pin, query)) return false;
    return true;
  });
}

export type AtlasRouting = "pronounce" | "global";

function usePronounceRouting(routing?: AtlasRouting): boolean {
  if (routing === "pronounce") return true;
  if (routing === "global") return false;
  return isPronounceAtlasRouting();
}

export function atlasChartBrowsePath(
  lang: string,
  page = 1,
  query?: { cat?: string; q?: string },
  opts?: { page1?: "hub" | "charts"; routing?: AtlasRouting },
): string {
  const code = normalizeAtlasLangCode(lang);
  const n = Math.max(1, Math.floor(Number(page)) || 1);
  const page1 = opts?.page1 || "charts";
  const pronounce = usePronounceRouting(opts?.routing);

  let base: string;
  if (n <= 1) {
    if (page1 === "hub") {
      base = pronounce
        ? code === "zh"
          ? "/"
          : `/${code}/`
        : `/lang/${encodeURIComponent(code)}`;
    } else {
      base = pronounce
        ? code === "zh"
          ? "/charts/"
          : `/${code}/charts/`
        : `/lang/${encodeURIComponent(code)}/charts`;
    }
  } else if (pronounce) {
    base = code === "zh" ? `/charts/${n}/` : `/${code}/charts/${n}/`;
  } else {
    base = `/lang/${encodeURIComponent(code)}/charts/${n}`;
  }

  const sp = new URLSearchParams();
  const cat = parseChartCategory(query?.cat);
  const q = parseChartQuery(query?.q);
  if (cat !== "all") sp.set("cat", cat);
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
