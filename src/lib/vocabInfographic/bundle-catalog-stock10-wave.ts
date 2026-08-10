/**
 * Uniform stock restock — fresh bundles so every format can grow ~+10 PNGs.
 * Merged into ALL_VOCAB_BUNDLES.
 */
import type { VocabInfographicFormatId } from "./formats";
import { auditHanjaHub, HANJA_SAT_MIN, HANJA_SAT_MAX } from "./hanjaHubAudit";

type BundlePriority = "high" | "medium" | "low";
type PhraseLine = { hangul: string; romanization: string; english: string };
type ConceptRow = {
  english: string;
  hangul: string;
  romanization: string;
  visual: string;
};
type TopikRow = {
  english: string;
  topikI: { hangul: string; romanization: string };
  topikII: { hangul: string; romanization: string };
};
type SimilarPair = {
  leftEnglish: string;
  rightEnglish: string;
  leftHangul: string;
  rightHangul: string;
  leftRom: string;
  rightRom: string;
  leftNuance: string;
  rightNuance: string;
};
type QuizOption = { hangul: string; romanization: string };
type CuteCell = {
  hangul: string;
  romanization: string;
  english: string;
  pose: string;
};
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
  phraseLines?: PhraseLine[];
  conceptRows?: ConceptRow[];
  topikRows?: TopikRow[];
  similarPair?: SimilarPair;
  quiz?: {
    badge?: string;
    direction?: string;
    question: string;
    options: [QuizOption, QuizOption, QuizOption, QuizOption];
    correctIndex: 1 | 2 | 3 | 4;
  };
  cuteCast?: "capybara" | "otter";
  cuteCells?: CuteCell[];
  hanjaHub?: {
    syllable: string;
    hanja: string;
    english: string;
    readings: string[];
    satellites: HanjaSatellite[];
  };
};

const L = (hangul: string, romanization: string, english: string): PhraseLine => ({
  hangul,
  romanization,
  english,
});
const C = (
  english: string,
  hangul: string,
  romanization: string,
  visual: string,
): ConceptRow => ({ english, hangul, romanization, visual });
const T = (
  english: string,
  iH: string,
  iR: string,
  iiH: string,
  iiR: string,
): TopikRow => ({
  english,
  topikI: { hangul: iH, romanization: iR },
  topikII: { hangul: iiH, romanization: iiR },
});
const Cell = (
  hangul: string,
  romanization: string,
  english: string,
  pose: string,
): CuteCell => ({ hangul, romanization, english, pose });
const S = (
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): HanjaSatellite => ({ hangul, romanization, english, icon });

function ant(slug: string, left: string, right: string, theme: string): VocabBundle {
  return {
    id: `ant-${slug}`,
    format: "antonym_split",
    title: `${left} vs ${right}`,
    count: 2,
    fit: `Antonym pair — ${theme}`,
    priority: "high",
    tags: ["antonym", theme, "stock10"],
  };
}
function list(
  slug: string,
  title: string,
  count: number,
  orderKey: string,
  tags: string[],
): VocabBundle {
  return {
    id: `list-${slug}`,
    format: "super_list",
    title,
    count,
    fit: `Ordered list — ${orderKey}`,
    priority: "high",
    tags: [...tags, "stock10"],
  };
}
function phrase(
  slug: string,
  title: string,
  lines: PhraseLine[],
  tags: string[],
): VocabBundle {
  return {
    id: `phrase-${slug}`,
    format: "phrase_stack",
    title,
    count: lines.length,
    fit: `Polished ${lines.length}-phrase stack — spoken Korean`,
    priority: "high",
    tags: ["phrase", "spoken", ...tags, "stock10"],
    phraseLines: lines,
    preview: lines.map((l) => l.english),
  };
}
function concept(
  slug: string,
  title: string,
  rows: ConceptRow[],
  tags: string[],
): VocabBundle {
  return {
    id: `concept-${slug}`,
    format: "concept_rows",
    title,
    count: rows.length,
    fit: "Concept diagram panels — situation beats",
    priority: "high",
    tags: ["concept", "grammar", ...tags, "stock10"],
    conceptRows: rows,
    preview: rows.map((r) => r.english),
  };
}
function topik(
  slug: string,
  title: string,
  rows: TopikRow[],
  tags: string[],
): VocabBundle {
  return {
    id: `topik-${slug}`,
    format: "topik_upgrade",
    title,
    count: rows.length,
    fit: `TOPIK I→II upgrade — ${rows.length} pairs`,
    priority: "high",
    tags: ["topik", "upgrade", ...tags, "stock10"],
    topikRows: rows,
    preview: rows.map((r) => r.english),
  };
}
function similar(
  slug: string,
  leftEnglish: string,
  rightEnglish: string,
  leftHangul: string,
  rightHangul: string,
  leftRom: string,
  rightRom: string,
  leftNuance: string,
  rightNuance: string,
  theme: string,
): VocabBundle {
  return {
    id: `sim-${slug}`,
    format: "similar_split",
    title: `${leftEnglish} vs ${rightEnglish}`,
    count: 2,
    fit: `Near-synonyms — ${theme}: ${leftNuance} / ${rightNuance}`,
    priority: "high",
    tags: ["similar", theme, "stock10"],
    similarPair: {
      leftEnglish,
      rightEnglish,
      leftHangul,
      rightHangul,
      leftRom,
      rightRom,
      leftNuance,
      rightNuance,
    },
    preview: [leftEnglish, rightEnglish],
  };
}
function quiz(
  slug: string,
  title: string,
  question: string,
  options: [QuizOption, QuizOption, QuizOption, QuizOption],
  correctIndex: 1 | 2 | 3 | 4,
  tags: string[],
  fit: string,
): VocabBundle {
  return {
    id: `quiz-${slug}`,
    format: "quiz_comment",
    title,
    count: 4,
    fit,
    priority: "high",
    tags: ["quiz", ...tags, "stock10"],
    quiz: {
      badge: "KOREAN WORD QUIZ",
      direction: "English → Korean",
      question,
      options,
      correctIndex,
    },
    preview: options.map((o) => o.hangul),
  };
}
function cute(
  slug: string,
  title: string,
  cast: "capybara" | "otter",
  cells: CuteCell[],
  tags: string[],
): VocabBundle {
  if (cells.length !== 9) throw new Error(`cute-${slug} needs 9`);
  return {
    id: `cute-${slug}`,
    format: "cute_cast",
    title,
    count: 9,
    fit:
      cast === "otter"
        ? "Cute 3×3 sticker grid — ALL pink otter (no capybara)"
        : "Cute 3×3 sticker grid — ALL blue-hat sidekick capybara (no otter)",
    priority: "high",
    tags: ["cute", "mascot", "spoken", cast, ...tags, "stock10"],
    cuteCast: cast,
    cuteCells: cells,
    preview: cells.map((c) => c.english),
  };
}
function hub(
  slug: string,
  title: string,
  syllable: string,
  hanja: string,
  english: string,
  satellites: HanjaSatellite[],
  tags: string[],
  extraReadings: string[] = [],
): VocabBundle {
  const readings = Array.from(new Set([syllable, ...extraReadings].filter(Boolean)));
  if (satellites.length < HANJA_SAT_MIN || satellites.length > HANJA_SAT_MAX) {
    throw new Error(`hanja-${slug}: need ${HANJA_SAT_MIN}–${HANJA_SAT_MAX} useful satellites`);
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
    fit: "Radial Hanja hub — LOCKED pre-audited compounds only; blue-hat 찌바라 only when rolled",
    priority: "high",
    tags: ["hanja", "hub", ...tags, "stock10"],
    preview: satellites.map((s) => s.english),
    hanjaHub: { syllable, hanja, english, readings, satellites },
  };
}

export const STOCK10_ANT: VocabBundle[] = [
  ant("upstream-downstream", "Upstream", "Downstream", "river"),
  ant("on-time-late", "On time", "Late", "punctuality"),
  ant("stock-public-private", "Public", "Private", "space"),
  ant("stock-online-offline", "Online", "Offline", "digital"),
  ant("stock-push-pull", "Push", "Pull", "motion"),
  ant("stock-enter-exit", "Enter", "Exit", "door"),
  ant("save-spend", "Save", "Spend", "money"),
  ant("build-demolish", "Build", "Demolish", "construction"),
  ant("charge-discharge", "Charge", "Discharge", "battery"),
  ant("freeze-thaw", "Freeze", "Thaw", "temperature"),
];

export const STOCK10_LIST: VocabBundle[] = [
  list("subway-commute", "Subway commute steps in Korean", 10, "enter→exit", ["transit"]),
  list("clinic-checkup", "Clinic checkup flow in Korean", 10, "wait→result", ["health"]),
  list("online-order", "Online order steps in Korean", 10, "cart→delivery", ["shopping"]),
  list("house-party", "House party prep in Korean", 9, "invite→cleanup", ["social"]),
  list("visa-run", "Visa run checklist in Korean", 10, "docs→stamp", ["travel"]),
  list("desk-reset", "Desk reset checklist in Korean", 9, "clear→reopen", ["work"]),
  list("rainy-day", "Rainy day kit list in Korean", 9, "umbrella→boots", ["weather"]),
  list("movie-night", "Movie night prep in Korean", 9, "pick→credits", ["hobby"]),
  list("pet-vet", "Pet vet visit steps in Korean", 10, "arrive→meds", ["pets"]),
  list("tax-season", "Tax season checklist in Korean", 10, "gather→file", ["money"]),
];

export const STOCK10_PHRASE: VocabBundle[] = [
  phrase("delivery-door", "Delivery door phrases in Korean", [
    L("문 앞에 놔 주세요", "mun ape nwa juseyo", "Leave it at the door"),
    L("벨 눌러 주세요", "bel nulleo juseyo", "Please ring the bell"),
    L("부재중이에요", "bujaejungieyo", "I'm not home"),
    L("경비실에 맡겨 주세요", "gyeongbisire matgyeo juseyo", "Leave it with the guard"),
    L("곧 내려갈게요", "got naeryeogalgeyo", "I'll come down soon"),
    L("사진 찍어 주세요", "sajin jjigeo juseyo", "Please take a photo"),
    L("다시 와 주세요", "dasi wa juseyo", "Please come again"),
    L("수령했어요", "suryeonghaesseoyo", "I received it"),
  ], ["daily"]),
  phrase("wifi-cafe", "Wi‑Fi café phrases in Korean", [
    L("와이파이 비밀번호 뭐예요?", "waipai bimilbeonho mwoyeyo?", "What's the Wi‑Fi password?"),
    L("콘센트 있어요?", "konsenteu isseoyo?", "Is there an outlet?"),
    L("자리 맡아 주세요", "jari matta juseyo", "Please save my seat"),
    L("테이크아웃이요", "teikeuausiyo", "For takeout"),
    L("여기서 일해도 돼요?", "yeogiseo ilhaedo dwaeyo?", "Can I work here?"),
    L("조용한 자리 있어요?", "joyonghan jari isseoyo?", "Is there a quiet seat?"),
    L("충전해도 돼요?", "chungjeonhaedo dwaeyo?", "Can I charge here?"),
    L("계산할게요", "gyesanhalkgeyo", "I'll pay"),
  ], ["cafe"]),
  phrase("roommate-chat", "Roommate chat phrases in Korean", [
    L("쓰레기 내가 뺄게", "sseuregi naega ppaelge", "I'll take out the trash"),
    L("설거지 남았어", "seolgeojji namasseo", "Dishes are left"),
    L("세탁기 써도 돼?", "setakgi sseodo dwae?", "Can I use the washer?"),
    L("문 잠글게", "mun jamgeulge", "I'll lock the door"),
    L("택배 왔어", "taekbae wasseo", "A package came"),
    L("청소 당번이야", "cheongso dangbeoniya", "It's your cleaning turn"),
    L("조용히 해 줘", "joyonghi hae jwo", "Please keep it down"),
    L("공용 물품 사왔어", "gongyong mulpum sawasseo", "I bought shared stuff"),
  ], ["home"]),
  phrase("clinic-wait", "Clinic waiting phrases in Korean", [
    L("접수했어요", "jeopsuhaesseoyo", "I checked in"),
    L("대기표 받았어요", "daegipyo badasseoyo", "I got a number ticket"),
    L("이름이 호출되면요", "ireumi hochuldwaemyeonyo", "When they call my name"),
    L("보험증 있어요", "boheomjeung isseoyo", "I have my insurance card"),
    L("증상 적어 왔어요", "jeungsang jeogeo wasseoyo", "I wrote my symptoms"),
    L("약 처방 주세요", "yak cheobang juseyo", "Please prescribe medicine"),
    L("다음 예약할게요", "daeum yeyakhalgeyo", "I'll book the next visit"),
    L("약국은 어디예요?", "yakgugeun eodiyeyo?", "Where is the pharmacy?"),
  ], ["health"]),
  phrase("subway-delay", "Subway delay phrases in Korean", [
    L("지연이래요", "jiyeoniraeyo", "There's a delay"),
    L("대체 버스 있어요?", "daeche beoseu isseoyo?", "Is there a shuttle bus?"),
    L("환승 어떻게 해요?", "hwanseung eotteoke haeyo?", "How do I transfer?"),
    L("막차예요?", "makchayeyo?", "Is this the last train?"),
    L("내릴 역 맞아요?", "naeril yeok majayo?", "Is this my stop?"),
    L("사람이 너무 많아요", "sarami neomu manayo", "It's too crowded"),
    L("문 쪽에 서 주세요", "mun jjoge seo juseyo", "Please stand by the door"),
    L("다음 차로 탈게요", "daeum charo talgeyo", "I'll take the next one"),
  ], ["transit"]),
  phrase("group-project", "Group project phrases in Korean", [
    L("역할 나눌까요?", "yeonghal nanulkkayo?", "Shall we split roles?"),
    L("오늘까지 초안이요", "oneulkkaji choaniyo", "Draft by today"),
    L("피드백 반영했어요", "pideubaek banyeonghaesseoyo", "I applied the feedback"),
    L("발표 순서는요", "balpyo sunseoneunyo", "About presentation order"),
    L("자료 공유할게요", "jaryo gongyuhalgeyo", "I'll share the files"),
    L("미팅 잡아요", "miting jabayo", "Let's set a meeting"),
    L("마감이 촉박해요", "magami chokbakhaeyo", "The deadline is tight"),
    L("수고 많았어요", "sugo manasseoyo", "Thanks for the hard work"),
  ], ["school"]),
  phrase("battery-low", "Low battery phrases in Korean", [
    L("배터리 거의 없어요", "baeteori geoui eopseoyo", "Battery is almost dead"),
    L("충전기 빌려도 돼요?", "chungjigi billyeodo dwaeyo?", "Can I borrow a charger?"),
    L("보조배터리 있어요?", "bojobaeteori isseoyo?", "Do you have a power bank?"),
    L("절전 모드로 할게요", "jeoljeon modeuro halkgeyo", "I'll switch to power save"),
    L("곧 꺼질 것 같아요", "got kkeojil geot gatayo", "It might turn off soon"),
    L("와이파이만 켤게요", "waipaiman kyeolgeyo", "I'll keep Wi‑Fi only"),
    L("전화 대신 문자요", "jeonhwa daesin munjayo", "Text instead of calling"),
    L("충전 중이에요", "chungjeon jungieyo", "It's charging"),
  ], ["tech"]),
  phrase("stock-rain-check", "Rain check phrases in Korean", [
    L("비 와서 미룰까요?", "bi waseo mirulkkayo?", "Rain — shall we postpone?"),
    L("실내로 바꿀까요?", "sillnaero bakkulkkayo?", "Shall we move indoors?"),
    L("우산 가져갈게요", "usan gajyeogalgeyo", "I'll bring an umbrella"),
    L("날씨 보고 결정해요", "nalssi bogo gyeoljeonghaeyo", "Let's decide by the weather"),
    L("다음에 다시 해요", "daeume dasi haeyo", "Let's do it next time"),
    L("비 그치면 출발해요", "bi geuchimyeon chulbalhaeyo", "Leave when rain stops"),
    L("비 옷 입을게요", "bi ot ibeulgeyo", "I'll wear a raincoat"),
    L("미끄러우니 조심해요", "mikkeureouni josimhaeyo", "It's slippery — be careful"),
  ], ["weather"]),
  phrase("kiosk-order", "Kiosk order phrases in Korean", [
    L("키오스크로 주문해요", "kioseukeuro jumunhaeyo", "I'll order on the kiosk"),
    L("카드 결제요", "kadeu gyeoljeyo", "Card payment"),
    L("영수증 주세요", "yeongsujeung juseyo", "Please give a receipt"),
    L("포장으로요", "pojang-euroyo", "For takeout packing"),
    L("매운맛으로요", "maeunmaseuroyo", "Make it spicy"),
    L("옵션 추가할게요", "opsyeon chugahalgeyo", "I'll add an option"),
    L("번호표 나왔어요", "beonhopyo nawasseoyo", "My number came up"),
    L("잘못 눌렀어요", "jalmot nulleosseoyo", "I tapped wrong"),
  ], ["food"]),
  phrase("quiet-hours", "Quiet hours phrases in Korean", [
    L("밤엔 조용히 해요", "bamen joyonghi haeyo", "Please keep quiet at night"),
    L("층간소음이 들려요", "cheunggansoeumi deullyeoyo", "I can hear floor noise"),
    L("발소리 조심해 주세요", "balsori josimhae juseyo", "Please watch your footsteps"),
    L("음악 줄여 주세요", "eumak juryeo juseyo", "Please turn the music down"),
    L("새벽엔 세탁 안 해요", "saebyeogen setak an haeyo", "No laundry at dawn"),
    L("문 살살 닫아 주세요", "mun salsal dada juseyo", "Please close the door gently"),
    L("아이 자고 있어요", "ai jago isseoyo", "The baby is sleeping"),
    L("이해해 주셔서 감사해요", "ihaehae jusyeoseo gamsahaeyo", "Thanks for understanding"),
  ], ["home"]),
];

export const STOCK10_CONCEPT: VocabBundle[] = [
  concept("stock-already-yet-still", "Already / yet / still in Korean", [
    C("Already", "이미", "imi", "clock past the mark"),
    C("Not yet", "아직", "ajik", "waiting hourglass"),
    C("Still", "여전히", "yeojeonhi", "same pose continuing"),
    C("Just now", "방금", "banggeum", "sparkle just happened"),
  ], ["time"]),
  concept("must-should-may", "Must / should / may in Korean", [
    C("Must", "해야 해요", "haeya haeyo", "red required stamp"),
    C("Should", "하는 게 좋아요", "haneun ge jotayo", "gentle advice nod"),
    C("May / allowed", "해도 돼요", "haedo dwaeyo", "green OK check"),
    C("Must not", "하면 안 돼요", "hamyeon an dwaeyo", "red X ban"),
  ], ["modality"]),
  concept("more-less-enough", "More / less / enough in Korean", [
    C("More", "더", "deo", "bigger pile"),
    C("Less", "덜", "deol", "smaller pile"),
    C("Enough", "충분해요", "chungbunhaeyo", "full cup"),
    C("Too much", "너무 많아요", "neomu manayo", "overflowing box"),
  ], ["amount"]),
  concept("before-after-during", "Before / after / during in Korean", [
    C("Before", "전에", "jeone", "left of timeline"),
    C("During", "중에", "jung-e", "middle of timeline"),
    C("After", "후에", "hue", "right of timeline"),
    C("While", "면서", "myeonseo", "two actions together"),
  ], ["time"]),
  concept("same-different-similar", "Same / different / similar in Korean", [
    C("Same", "같아요", "gatayo", "two identical shapes"),
    C("Different", "달라요", "dallayo", "two mismatched shapes"),
    C("Similar", "비슷해요", "biseuthaeyo", "almost matching shapes"),
    C("Opposite", "반대예요", "bandaeyeyo", "arrows opposite ways"),
  ], ["compare"]),
  concept("stock-start-stop-continue", "Start / stop / continue in Korean", [
    C("Start", "시작해요", "sijakhaeyo", "play button"),
    C("Stop", "멈춰요", "meomchwoyo", "stop hand"),
    C("Continue", "계속해요", "gyesokhaeyo", "forward arrows"),
    C("Pause", "잠깐만요", "jamkkanmanyo", "pause bars"),
  ], ["action"]),
  concept("borrow-lend-return", "Borrow / lend / return in Korean", [
    C("Borrow", "빌려요", "billyeoyo", "receive item"),
    C("Lend", "빌려줘요", "billyeojwoyo", "give item out"),
    C("Return", "돌려줘요", "dollyeojwoyo", "hand back"),
    C("Keep", "가져요", "gajyeoyo", "hold to chest"),
  ], ["verbs"]),
  concept("invite-refuse-accept", "Invite / refuse / accept in Korean", [
    C("Invite", "초대해요", "chodaehaeyo", "open door welcome"),
    C("Accept", "좋아요 / 갈게요", "joayo / galgeyo", "thumbs up go"),
    C("Refuse soft", "이번엔 어려워요", "ibeonen eoryeowoyo", "polite decline bow"),
    C("Reschedule", "다음에 해요", "daeume haeyo", "calendar shift"),
  ], ["social"]),
];

export const STOCK10_TOPIK: VocabBundle[] = [
  topik("meeting-words", "Meeting words — TOPIK upgrade", [
    T("meeting", "미팅", "miting", "회의", "hoeui"),
    T("agenda", "할 일 목록", "hal il mongnok", "안건", "angeon"),
    T("decide", "정하다", "jeonghada", "결정하다", "gyeoljeonghada"),
    T("discuss", "이야기하다", "iyagihada", "논의하다", "nonuihada"),
    T("summary", "정리", "jeongri", "요약", "yoyak"),
    T("deadline", "마감", "magam", "기한", "gihan"),
  ], ["work"]),
  topik("stock-health-words", "Health words — TOPIK upgrade", [
    T("sick", "아프다", "apeuda", "질환이 있다", "jilhwani itda"),
    T("medicine", "약", "yak", "처방약", "cheobangyak"),
    T("hospital", "병원", "byeongwon", "의료기관", "uiryogigwan"),
    T("rest", "쉬다", "swida", "요양하다", "yoyanghada"),
    T("symptom", "아픈 곳", "apeun got", "증상", "jeungsang"),
    T("recover", "낫다", "natda", "회복하다", "hoebokhada"),
  ], ["health"]),
  topik("travel-words2", "Travel words — TOPIK upgrade", [
    T("trip", "여행", "yeohaeng", "출장/여행", "chuljang/yeohaeng"),
    T("ticket", "표", "pyo", "승차권", "seungchagwon"),
    T("luggage", "짐", "jim", "수하물", "suhamul"),
    T("book", "예약하다", "yeyakhada", "예매하다", "yemaehada"),
    T("delay", "늦다", "neutda", "지연되다", "jiyeondweda"),
    T("passport", "여권", "yeogwon", "여행증명서", "yeohaengjeungmyeongseo"),
  ], ["travel"]),
  topik("study-words2", "Study words — TOPIK upgrade", [
    T("study", "공부하다", "gongbuhada", "학습하다", "hakseuphada"),
    T("exam", "시험", "siheom", "평가", "pyeongga"),
    T("homework", "숙제", "sukje", "과제", "gwaje"),
    T("pass", "합격하다", "hapgyeokhada", "통과하다", "tonggwahada"),
    T("fail", "떨어지다", "tteoreojida", "불합격하다", "bulhapgyeokhada"),
    T("review", "복습하다", "bokseuphada", "재검토하다", "jaegeomtohada"),
  ], ["school"]),
  topik("money-words2", "Money words — TOPIK upgrade", [
    T("money", "돈", "don", "현금/자금", "hyeongeum/jageum"),
    T("price", "가격", "gagyeok", "요금", "yogeum"),
    T("pay", "내다", "naeda", "지불하다", "jibulhada"),
    T("save", "모으다", "moeuda", "저축하다", "jeochukhada"),
    T("spend", "쓰다", "sseuda", "지출하다", "jichulhada"),
    T("cheap", "싸다", "ssada", "저렴하다", "jeoryeomhada"),
  ], ["money"]),
  topik("emotion-words2", "Emotion words — TOPIK upgrade", [
    T("happy", "기쁘다", "gippeuda", "행복하다", "haengbokhada"),
    T("sad", "슬프다", "seulpeuda", "우울하다", "uulhada"),
    T("angry", "화나다", "hwanada", "분노하다", "bunnohada"),
    T("worried", "걱정되다", "geokjeongdweda", "우려하다", "uryeohada"),
    T("surprised", "놀라다", "nollada", "깜짝 놀라다", "kkamjjak nollada"),
    T("bored", "심심하다", "simsimhada", "지루하다", "jiruhada"),
  ], ["emotion"]),
  topik("home-words2", "Home words — TOPIK upgrade", [
    T("house", "집", "jip", "주택", "jutaek"),
    T("rent", "월세", "wolse", "임대료", "imdaeryo"),
    T("move", "이사하다", "isahada", "이주하다", "ijuhada"),
    T("neighbor", "이웃", "iut", "이웃 주민", "iut jumin"),
    T("clean", "청소하다", "cheongsohada", "청결을 유지하다", "cheonggyeoreul yujihada"),
    T("furniture", "가구", "gagu", "집기", "jipgi"),
  ], ["home"]),
  topik("food-words2", "Food words — TOPIK upgrade", [
    T("eat", "먹다", "meokda", "섭취하다", "seopchwihada"),
    T("cook", "요리하다", "yorihada", "조리하다", "jorihada"),
    T("delicious", "맛있다", "masitda", "풍미가 있다", "pungmiga itda"),
    T("spicy", "맵다", "maepda", "자극적이다", "jageukjeogida"),
    T("ingredient", "재료", "jaeryo", "식재료", "sikjaeryo"),
    T("recipe", "레시피", "resipi", "조리법", "joribeop"),
  ], ["food"]),
  topik("weather-words2", "Weather words — TOPIK upgrade", [
    T("weather", "날씨", "nalssi", "기상", "gisang"),
    T("rain", "비", "bi", "강우", "gang-u"),
    T("snow", "눈", "nun", "강설", "gangseol"),
    T("hot", "덥다", "deopda", "무덥다", "mudeopda"),
    T("cold", "춥다", "chupda", "한랭하다", "hallaenghada"),
    T("forecast", "일기예보", "ilgiyebo", "기상예보", "gisangyebo"),
  ], ["weather"]),
  topik("digital-words", "Digital words — TOPIK upgrade", [
    T("phone", "휴대폰", "hyudaepon", "모바일 기기", "mobail gigi"),
    T("app", "앱", "aep", "애플리케이션", "aepeullikeisyeon"),
    T("password", "비밀번호", "bimilbeonho", "암호", "ammo"),
    T("download", "받다", "batda", "다운로드하다", "daunrodeuhada"),
    T("upload", "올리다", "ollida", "업로드하다", "eoprodeuhada"),
    T("account", "계정", "gyejeong", "사용자 계정", "sayongja gyejeong"),
  ], ["tech"]),
];

export const STOCK10_SIM: VocabBundle[] = [
  similar(
    "ask-묻다-여쭙다",
    "Ask",
    "Ask politely",
    "묻다",
    "여쭙다",
    "mutda",
    "yeojjupda",
    "neutral ask",
    "honorific ask",
    "speech",
  ),
  similar(
    "see-보다-뵙다",
    "See",
    "Meet (humble)",
    "보다",
    "뵙다",
    "boda",
    "boepda",
    "see / watch",
    "humble meet someone",
    "speech",
  ),
];

export const STOCK10_QUIZ: VocabBundle[] = [
  quiz(
    "upload-vs-download",
    "Upload vs download quiz",
    'Which Korean word means "to upload"?',
    [
      { hangul: "다운로드하다", romanization: "daunrodeuhada" },
      { hangul: "업로드하다", romanization: "eoprodeuhada" },
      { hangul: "삭제하다", romanization: "sakjehada" },
      { hangul: "저장하다", romanization: "jeojanghada" },
    ],
    2,
    ["tech"],
    "Download vs upload vs delete vs save",
  ),
  quiz(
    "borrow-vs-lend",
    "Borrow vs lend quiz",
    'Which Korean phrase means "to lend (to someone)"?',
    [
      { hangul: "빌리다", romanization: "billida" },
      { hangul: "빌려주다", romanization: "billyeojuda" },
      { hangul: "갚다", romanization: "gapda" },
      { hangul: "훔치다", romanization: "humchida" },
    ],
    2,
    ["verbs"],
    "Borrow vs lend vs repay vs steal",
  ),
  quiz(
    "schedule-vs-cancel",
    "Schedule vs cancel quiz",
    'Which Korean word means "to cancel"?',
    [
      { hangul: "예약하다", romanization: "yeyakhada" },
      { hangul: "취소하다", romanization: "chwisohada" },
      { hangul: "변경하다", romanization: "byeongyeonghada" },
      { hangul: "확인하다", romanization: "hwaginhada" },
    ],
    2,
    ["daily"],
    "Reserve vs cancel vs change vs confirm",
  ),
  quiz(
    "spicy-vs-salty",
    "Spicy vs salty quiz",
    'Which Korean word means "spicy"?',
    [
      { hangul: "짜다", romanization: "jjada" },
      { hangul: "맵다", romanization: "maepda" },
      { hangul: "달다", romanization: "dalda" },
      { hangul: "쓰다", romanization: "sseuda" },
    ],
    2,
    ["food"],
    "Salty vs spicy vs sweet vs bitter",
  ),
  quiz(
    "rent-vs-buy",
    "Rent vs buy quiz",
    'Which Korean word means "to rent (a place)"?',
    [
      { hangul: "사다", romanization: "sada" },
      { hangul: "임대하다", romanization: "imdaehada" },
      { hangul: "팔다", romanization: "palda" },
      { hangul: "빌리다", romanization: "billida" },
    ],
    2,
    ["home"],
    "Buy vs rent vs sell vs borrow",
  ),
  quiz(
    "arrive-vs-depart",
    "Arrive vs depart quiz",
    'Which Korean word means "to depart / leave"?',
    [
      { hangul: "도착하다", romanization: "dochakhada" },
      { hangul: "출발하다", romanization: "chulbalhada" },
      { hangul: "도착 예정", romanization: "dochak yejeong" },
      { hangul: "환승하다", romanization: "hwanseunghada" },
    ],
    2,
    ["travel"],
    "Arrive vs depart vs ETA vs transfer",
  ),
  quiz(
    "password-vs-id",
    "Password vs ID quiz",
    'Which Korean word means "password"?',
    [
      { hangul: "아이디", romanization: "aidi" },
      { hangul: "비밀번호", romanization: "bimilbeonho" },
      { hangul: "닉네임", romanization: "nikneim" },
      { hangul: "인증번호", romanization: "injeungbeonho" },
    ],
    2,
    ["tech"],
    "ID vs password vs nickname vs verification code",
  ),
  quiz(
    "stock-refund-vs-exchange",
    "Refund vs exchange quiz",
    'Which Korean word means "refund"?',
    [
      { hangul: "교환", romanization: "gyohwan" },
      { hangul: "환불", romanization: "hwanbul" },
      { hangul: "할인", romanization: "harin" },
      { hangul: "적립", romanization: "jeongnip" },
    ],
    2,
    ["shopping"],
    "Exchange vs refund vs discount vs points",
  ),
  quiz(
    "subscribe-vs-unsubscribe",
    "Subscribe quiz",
    'Which Korean word means "to subscribe"?',
    [
      { hangul: "구독 취소하다", romanization: "gudok chwisohada" },
      { hangul: "구독하다", romanization: "gudokhada" },
      { hangul: "공유하다", romanization: "gongyuhada" },
      { hangul: "차단하다", romanization: "chadanhada" },
    ],
    2,
    ["tech"],
    "Unsubscribe vs subscribe vs share vs block",
  ),
];

export const STOCK10_CUTE: VocabBundle[] = [
  cute("desk-stretch", "Desk stretch words in Korean", "otter", [
    Cell("스트레칭", "seuteureching", "Stretch", "arm stretch"),
    Cell("허리 펴", "heori pyeo", "Sit up straight", "spine straighten"),
    Cell("눈 쉬어", "nun swieo", "Rest eyes", "close eyes"),
    Cell("물 마셔", "mul masyeo", "Drink water", "sip bottle"),
    Cell("잠깐 걷자", "jamkkan geotja", "Walk a bit", "short walk"),
    Cell("목 돌리기", "mok dolligi", "Neck rolls", "neck circle"),
    Cell("어깨 풀기", "eokkae pulgi", "Shoulder roll", "shoulder roll"),
    Cell("심호흡", "simhoheup", "Deep breath", "breathe in"),
    Cell("다시 집중", "dasi jipjung", "Focus again", "ready pose"),
  ], ["work"]),
  cute("snack-break", "Snack break words in Korean", "capybara", [
    Cell("간식 타임", "gansik taim", "Snack time", "open snack"),
    Cell("달달해", "daldalhae", "Sweet", "happy bite"),
    Cell("바삭해", "basakhae", "Crunchy", "crunch pose"),
    Cell("조금만", "jogeumman", "Just a little", "tiny pinch"),
    Cell("나눠 먹자", "nanwo meokja", "Let's share", "offer snack"),
    Cell("배불러", "baebulleo", "I'm full", "pat belly"),
    Cell("커피랑", "keopirang", "With coffee", "cup + snack"),
    Cell("냉장고에", "naengjanggoe", "In the fridge", "fridge point"),
    Cell("설탕 주의", "seoltang juui", "Watch sugar", "warn finger"),
  ], ["food"]),
];

export const STOCK10_HANJA: VocabBundle[] = [
  hub("mun-gate", "門 (문) gate compounds", "문", "門", "gate / door", [
    S("정문", "jeongmun", "main gate", "front gate"),
    S("후문", "humun", "back gate", "rear gate"),
    S("교문", "gyomun", "school gate", "school entrance"),
    S("출입문", "churimmun", "entrance door", "doorway"),
    S("창문", "changmun", "window", "window"),
    S("대문", "daemun", "front door (house)", "house gate"),
  ], ["place"]),
  hub("stock-su-water", "水 (수) water compounds", "수", "水", "water", [
    S("수도", "sudo", "water supply", "faucet"),
    S("수영", "suyeong", "swimming", "swim"),
    S("생수", "saengsu", "bottled water", "water bottle"),
    S("온수", "onsu", "hot water", "hot tap"),
    S("냉수", "naengsu", "cold water", "cold glass"),
    S("수분", "subun", "moisture", "water drop"),
  ], ["nature"]),
  hub("hwa-fire", "火 (화) fire compounds", "화", "火", "fire", [
    S("화재", "hwajae", "fire (disaster)", "flames"),
    S("화요일", "hwayoil", "Tuesday", "calendar Tue"),
    S("화산", "hwasan", "volcano", "volcano"),
    S("소화기", "sohwagi", "fire extinguisher", "extinguisher"),
    S("화력", "hwaryeok", "firepower / heat", "strong flame"),
    S("화염", "hwayeom", "blaze", "big fire"),
  ], ["nature"]),
  hub("cha-car", "車 (차) vehicle compounds", "차", "車", "vehicle", [
    S("자동차", "jadongcha", "car", "car"),
    S("주차", "jucha", "parking", "parking lot"),
    S("기차", "gicha", "train", "train"),
    S("승차", "seungcha", "boarding", "get on"),
    S("하차", "hacha", "getting off", "get off"),
    S("자전거", "jajeongeo", "bicycle", "bike"),
  ], ["transit"], ["거"]),
  hub("stock-jeon-electric", "電 (전) electric compounds", "전", "電", "electricity", [
    S("전화", "jeonhwa", "phone", "phone"),
    S("전기", "jeongi", "electricity", "plug"),
    S("전자", "jeonja", "electronic", "circuit"),
    S("전원", "jeonwon", "power source", "power button"),
    S("충전기", "chungjigi", "charger", "charger"),
    S("전선", "jeonseon", "electric wire", "cable"),
  ], ["tech"]),
  hub("stock-sik-food", "食 (식) food compounds", "식", "食", "food / eat", [
    S("식사", "siksa", "meal", "meal tray"),
    S("음식", "eumsik", "food", "food bowl"),
    S("식당", "sikdang", "restaurant", "restaurant"),
    S("식품", "sikpum", "food product", "grocery"),
    S("외식", "oesik", "eating out", "dining out"),
    S("간식", "gansik", "snack", "snack pack"),
  ], ["food"]),
  hub("stock-hak-study", "學 (학) study compounds", "학", "學", "study", [
    S("학교", "hakgyo", "school", "school"),
    S("학생", "haksaeng", "student", "student"),
    S("학습", "hakseup", "learning", "notebook"),
    S("유학", "yuhak", "study abroad", "passport + book"),
    S("학년", "hangnyeon", "grade / year", "grade badge"),
    S("학원", "hagwon", "cram school", "academy"),
  ], ["school"]),
  hub("jeom-shop", "店 (점) shop compounds", "점", "店", "shop", [
    S("상점", "sangjeom", "store", "shop front"),
    S("서점", "seojeom", "bookstore", "bookstore"),
    S("편의점", "pyeonuijeom", "convenience store", "CVS"),
    S("매점", "maejeom", "canteen / stall", "snack stall"),
    S("점원", "jeomwon", "shop clerk", "clerk"),
    S("백화점", "baekhwajeom", "department store", "dept store"),
  ], ["shopping"]),
  hub("gi-energy", "氣 (기) energy / mood compounds", "기", "氣", "energy / air", [
    S("공기", "gonggi", "air", "air breeze"),
    S("기분", "gibun", "mood", "mood face"),
    S("기온", "gion", "temperature", "thermometer"),
    S("기후", "gihu", "climate", "globe weather"),
    S("인기", "ingi", "popularity", "star sparkle"),
    S("분위기", "bunwigi", "atmosphere", "cafe vibe"),
  ], ["nature"]),
  hub("sil-room", "室 (실) room compounds", "실", "室", "room", [
    S("교실", "gyosil", "classroom", "classroom"),
    S("사무실", "samusil", "office", "office desk"),
    S("화장실", "hwajangsil", "restroom", "restroom door"),
    S("실험실", "silheomsil", "lab", "lab beaker"),
    S("거실", "geosil", "living room", "sofa room"),
    S("욕실", "yoksil", "bathroom", "bathtub"),
  ], ["home"]),
];

export const STOCK10_WAVE_BUNDLES: VocabBundle[] = [
  ...STOCK10_ANT,
  ...STOCK10_LIST,
  ...STOCK10_PHRASE,
  ...STOCK10_CONCEPT,
  ...STOCK10_TOPIK,
  ...STOCK10_SIM,
  ...STOCK10_QUIZ,
  ...STOCK10_CUTE,
  ...STOCK10_HANJA,
];
