/**
 * 챕터별 본문 — slug로 해당 챕터만 동적 로드 (일괄 로드 방지).
 */

import type { GrammarChapterContent } from "../grammarTypes";

const SLUG_LIST = [
  "introduction",
  "eun-neun",
  "i-ga",
  "eul-reul",
  "eh-vs-ehseo",
  "ehge-hante-kke",
  "wa-gwa-hago-rang",
  "do",
  "man-bakke",
  "buteo-kkaji",
  "euro-ro",
  "boda",
  "i-na-irado",
  "geurigo-geuraeseo-hajiman",
  "neunde-jiman",
  "eumyeon",
  "a-eoseo",
  "eunikka",
  "geona-na",
  "itda-eopda",
  "present-tense",
  "past-tense",
  "future-tense",
  "go-itda",
  "a-eo-itda",
  "a-eo-bon-jeok-itda",
  "jondaenmal-vs-banmal",
  "haeyoche",
  "hapnida-che",
  "haeche",
  "seyo-ju-seyo",
  "psida-lkkayo",
  "ji-maseyo-myeon-andwaeyo",
  "l-su-itda",
  "a-eoya-hada",
  "l-geot-gata",
  "getda",
  "dago-hada",
  "eurago-hada-jago-hada",
  "juche-nopim",
  "gaekche-nopim",
] as const;

if(process.env.NODE_ENV === "development") {
  console.log(SLUG_LIST);
}
type Slug = (typeof SLUG_LIST)[number];

/** slug에 해당하는 챕터 본문만 로드 (다른 챕터는 번들에 포함되지 않음) */
const loaders: Record<Slug, () => Promise<{ content: GrammarChapterContent }>> = {
  introduction: () => import("./content/introduction"),
  "eun-neun": () => import("./content/eun-neun"),
  "i-ga": () => import("./content/i-ga"),
  "eul-reul": () => import("./content/eul-reul"),
  "eh-vs-ehseo": () => import("./content/eh-vs-ehseo"),
  "ehge-hante-kke": () => import("./content/ehge-hante-kke"),
  "wa-gwa-hago-rang": () => import("./content/wa-gwa-hago-rang"),
  do: () => import("./content/do"),
  "man-bakke": () => import("./content/man-bakke"),
  "buteo-kkaji": () => import("./content/buteo-kkaji"),
  "euro-ro": () => import("./content/euro-ro"),
  boda: () => import("./content/boda"),
  "i-na-irado": () => import("./content/i-na-irado"),
  "geurigo-geuraeseo-hajiman": () => import("./content/geurigo-geuraeseo-hajiman"),
  "neunde-jiman": () => import("./content/neunde-jiman"),
  eumyeon: () => import("./content/eumyeon"),
  "a-eoseo": () => import("./content/a-eoseo"),
  eunikka: () => import("./content/eunikka"),
  "geona-na": () => import("./content/geona-na"),
  "itda-eopda": () => import("./content/itda-eopda"),
  "present-tense": () => import("./content/present-tense"),
  "past-tense": () => import("./content/past-tense"),
  "future-tense": () => import("./content/future-tense"),
  "go-itda": () => import("./content/go-itda"),
  "a-eo-itda": () => import("./content/a-eo-itda"),
  "a-eo-bon-jeok-itda": () => import("./content/a-eo-bon-jeok-itda"),
  "jondaenmal-vs-banmal": () => import("./content/jondaenmal-vs-banmal"),
  haeyoche: () => import("./content/haeyoche"),
  "hapnida-che": () => import("./content/hapnida-che"),
  haeche: () => import("./content/haeche"),
  "seyo-ju-seyo": () => import("./content/seyo-ju-seyo"),
  "psida-lkkayo": () => import("./content/psida-lkkayo"),
  "ji-maseyo-myeon-andwaeyo": () => import("./content/ji-maseyo-myeon-andwaeyo"),
  "l-su-itda": () => import("./content/l-su-itda"),
  "a-eoya-hada": () => import("./content/a-eoya-hada"),
  "l-geot-gata": () => import("./content/l-geot-gata"),
  getda: () => import("./content/getda"),
  "dago-hada": () => import("./content/dago-hada"),
  "eurago-hada-jago-hada": () => import("./content/eurago-hada-jago-hada"),
  "juche-nopim": () => import("./content/juche-nopim"),
  "gaekche-nopim": () => import("./content/gaekche-nopim"),
};

export async function getChapterContent(
  slug: string,
): Promise<GrammarChapterContent | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  return m.content ?? null;
}
