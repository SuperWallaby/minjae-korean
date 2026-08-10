/**
 * Hanja hub / radial compound pins — English glosses.
 * Merged into ALL_VOCAB_BUNDLES from bundle-catalog.ts.
 *
 * Hard rule: every satellite must be a real Sino-Korean compound of the hub Hanja.
 * Prefer dictionary-true everyday words people actually say — not pad-coinages.
 * Fewer high-quality compounds beat filling the ring. Empty slots OK (3–8 max).
 */
import type { VocabInfographicFormatId } from "./formats";
import {
  auditHanjaHub,
  HANJA_SAT_MIN,
  HANJA_SAT_MAX,
} from "./hanjaHubAudit";

type BundlePriority = "high" | "medium" | "low";

type HanjaSatellite = {
  hangul: string;
  romanization: string;
  english: string;
  icon: string;
};

type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
  hanjaHub?: {
    syllable: string;
    hanja: string;
    english: string;
    /** Hangul readings of this Hanja that may appear in compounds (e.g. 車 → 차|거). */
    readings: string[];
    satellites: HanjaSatellite[];
  };
};

const S = (
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): HanjaSatellite => ({ hangul, romanization, english, icon });

function hub(
  slug: string,
  title: string,
  syllable: string,
  hanja: string,
  english: string,
  satellites: HanjaSatellite[],
  tags: string[],
  priority: BundlePriority = "high",
  /** Extra Hangul readings of the same Hanja (default: [syllable]). */
  extraReadings: string[] = [],
): VocabBundle {
  const readings = Array.from(new Set([syllable, ...extraReadings].filter(Boolean)));
  if (satellites.length < HANJA_SAT_MIN || satellites.length > HANJA_SAT_MAX) {
    throw new Error(
      `hanja-${slug}: use ${HANJA_SAT_MIN}–${HANJA_SAT_MAX} useful compounds only (got ${satellites.length}). ` +
        `Do not pad — fewer solid words is better.`,
    );
  }
  const id = `hanja-${slug}`;
  const issues = auditHanjaHub(
    id,
    { syllable, hanja, english, readings, satellites },
    { allowlistStrict: true },
  );
  if (issues.length) {
    throw new Error(issues.map((i) => i.message).join("\n"));
  }
  return {
    id,
    format: "hanja_hub",
    title,
    count: satellites.length,
    fit:
      "Radial Hanja hub — LOCKED pre-audited compounds of hub Hanja only; 3–8 high-usage words (gaps OK, never pad); " +
      "IG List doodle style; props first; blue-hat 찌바라 only when rolled; no otter; no bottom lecture caption",
    priority,
    tags: ["hanja", "hub", "radial", "compounds", ...tags],
    preview: satellites.map((s) => s.english),
    hanjaHub: {
      syllable,
      hanja,
      english,
      readings,
      satellites,
    },
  };
}

export const HANJA_HUB_WAVE_BUNDLES: VocabBundle[] = [
  hub(
    "ji-paper",
    "지 (紙) — everyday words with this character",
    "지",
    "紙",
    "paper",
    [
      // Real Sino-Korean compounds only — never “something+지” inventions
      S("휴지", "hyuji", "tissue", "tissue box"),
      S("편지", "pyeonji", "letter", "envelope"),
      S("지폐", "jipye", "banknote", "won bills"),
      S("벽지", "byeokji", "wallpaper", "wallpaper roll"),
      S("용지", "yongji", "paper (sheets)", "stack of printer paper"),
      S("백지", "baekji", "blank paper", "blank white stack"),
    ],
    ["paper", "noun"],
  ),
  hub(
    "hak-study",
    "학 (學) — study words in Korean",
    "학",
    "學",
    "study / learn",
    [
      S("학교", "hakgyo", "school", "school building"),
      S("학생", "haksaeng", "student", "student with backpack"),
      S("학습", "hakseup", "learning", "open book + lightbulb"),
      S("대학", "daehak", "university", "graduation cap"),
      S("유학", "yuhak", "study abroad", "passport + plane"),
      S("학원", "hagwon", "cram school", "evening classroom desk"),
      S("과학", "gwahak", "science", "flask doodle"),
      S("문학", "munhak", "literature", "stack of novels"),
    ],
    ["study", "school"],
  ),
  hub(
    "sik-food",
    "식 (食) — food words in Korean",
    "식",
    "食",
    "eat / food",
    [
      S("식사", "siksa", "meal", "rice bowl + chopsticks"),
      S("음식", "eumsik", "food", "bento box"),
      S("식당", "sikdang", "restaurant", "storefront bowl sign"),
      S("간식", "gansik", "snack", "cookie + juice"),
      S("외식", "oesik", "eating out", "table for two"),
      S("급식", "geupsik", "school lunch", "cafeteria tray"),
      S("채식", "chaesik", "vegetarian diet", "salad bowl"),
    ],
    ["food", "daily"],
  ),
  hub(
    "su-water",
    "수 (水) — water words in Korean",
    "수",
    "水",
    "water",
    [
      S("수영", "suyeong", "swimming", "swimmer in pool"),
      S("생수", "saengsu", "bottled water", "water bottle"),
      S("호수", "hosu", "lake", "calm lake + trees"),
      S("수분", "subun", "moisture", "water drop on leaf"),
      S("분수", "bunsu", "fountain", "park fountain"),
      S("수돗물", "sudotmul", "tap water", "glass under tap"),
      S("강수", "gangsu", "rainfall", "rain cloud with drops"),
    ],
    ["water", "noun"],
  ),
  hub(
    "cha-vehicle",
    "차 (車) — vehicle words in Korean",
    "차",
    "車",
    "vehicle / car",
    [
      S("자동차", "jadongcha", "car", "sedan car"),
      S("기차", "gicha", "train", "train locomotive"),
      S("주차장", "juchajang", "parking lot", "P parking sign"),
      S("자전거", "jajeongeo", "bicycle", "bicycle side view"),
      S("승차", "seungcha", "boarding", "person boarding bus"),
      S("하차", "hacha", "getting off", "person exiting door"),
      S("차량", "charyang", "vehicle", "row of cars"),
    ],
    ["transport", "noun"],
    "high",
    // 車 often reads 거 in compounds like 자전거 (自轉車)
    ["거"],
  ),
  hub(
    "mun-writing",
    "문 (文) — writing words in Korean",
    "문",
    "文",
    "writing / text",
    [
      S("문화", "munhwa", "culture", "palette sticker"),
      S("문자", "munja", "letter / text", "phone text bubble"),
      S("문서", "munseo", "document", "lined paper"),
      S("문학", "munhak", "literature", "open book"),
      S("문구", "mungu", "stationery", "pen + sticky notes"),
      S("논문", "nonmun", "thesis", "thick bound stack"),
      S("영문", "yeongmun", "English writing", "ABC on paper"),
    ],
    ["writing", "study"],
  ),
  hub(
    "il-day",
    "일 (日) — day words in Korean",
    "일",
    "日",
    "day / sun",
    [
      S("일요일", "iryoil", "Sunday", "sun calendar page"),
      S("생일", "saengil", "birthday", "cake + candle"),
      S("일기", "ilgi", "diary", "open diary + pen"),
      S("휴일", "hyuil", "holiday", "hammock rest day"),
      S("내일", "naeil", "tomorrow", "calendar next day"),
      S("매일", "maeil", "every day", "repeating calendar dots"),
      S("평일", "pyeongil", "weekday", "workweek calendar"),
    ],
    ["time", "calendar"],
  ),
  hub(
    "guk-country",
    "국 (國) — country words in Korean",
    "국",
    "國",
    "country",
    [
      S("한국", "hanguk", "Korea", "soft taegeuk sticker"),
      S("외국", "oeguk", "foreign country", "globe + pin"),
      S("미국", "miguk", "America / USA", "star badge"),
      S("중국", "jungguk", "China", "simple lantern doodle"),
      S("국가", "gukga", "nation", "capitol doodle"),
      S("국민", "gungmin", "citizen", "people icons"),
      S("국제", "gukje", "international", "linked globes"),
      S("귀국", "gwiguk", "return home (country)", "plane landing home"),
    ],
    ["country", "noun"],
  ),
  hub(
    "si-time",
    "시 (時) — time words in Korean",
    "시",
    "時",
    "time",
    [
      S("시간", "sigan", "time / hour", "analog clock"),
      S("시계", "sigye", "watch / clock", "wristwatch"),
      S("당시", "dangsi", "at that time", "old photo frame"),
      S("즉시", "jeuksi", "immediately", "lightning clock"),
      S("동시", "dongsi", "at the same time", "two clocks"),
      S("시대", "sidae", "era / age", "timeline arrow"),
      S("임시", "imsi", "temporary", "sticky note TEMP"),
    ],
    ["time", "abstract"],
  ),
  hub(
    "jeon-electric",
    "전 (電) — electricity words in Korean",
    "전",
    "電",
    "electricity",
    [
      S("전화", "jeonhwa", "phone / call", "phone handset"),
      S("전기", "jeongi", "electricity", "lightning bolt plug"),
      S("전자", "jeonja", "electronics", "circuit chip"),
      S("전지", "jeonji", "battery", "AA battery"),
      S("전등", "jeondeung", "electric light", "hanging bulb"),
      S("충전", "chungjeon", "charging", "phone + charge bolt"),
      S("전원", "jeonwon", "power (on/off)", "power button"),
    ],
    ["tech", "daily"],
  ),
  hub(
    "san-mountain",
    "산 (山) — mountain words in Korean",
    "산",
    "山",
    "mountain",
    [
      S("등산", "deungsan", "hiking", "hiker with backpack"),
      S("산길", "sangil", "mountain path", "winding trail"),
      S("산장", "sanjang", "mountain lodge", "cabin on mountain"),
      S("명산", "myeongsan", "famous mountain", "iconic peak"),
      S("산불", "sanbul", "wildfire", "mountain with soft flame"),
      S("화산", "hwasan", "volcano", "volcano soft puff"),
      S("산림", "sallim", "forest", "pine tree cluster"),
    ],
    ["nature", "noun"],
  ),
  hub(
    "in-person",
    "인 (人) — person words in Korean",
    "인",
    "人",
    "person",
    [
      S("인간", "ingan", "human being", "person silhouette"),
      S("인구", "ingu", "population", "crowd dots"),
      S("인사", "insa", "greeting", "person bowing wave"),
      S("개인", "gaein", "individual", "one person highlight"),
      S("성인", "seongin", "adult", "grown-up figure"),
      S("인기", "ingi", "popularity", "star + hearts"),
      S("외국인", "oegugin", "foreigner", "passport person"),
      S("한국인", "hangugin", "Korean person", "friendly person"),
    ],
    ["people", "noun"],
  ),
];
