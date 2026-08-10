/**
 * Pin-balance restock — lift depleted pin buckets toward ~30 ready each.
 * No new grids (catalog already heavy). Merged into ALL_VOCAB_BUNDLES.
 */
import type { VocabInfographicFormatId } from "./formats";
import { auditHanjaHub, HANJA_SAT_MIN, HANJA_SAT_MAX } from "./hanjaHubAudit";

type BundlePriority = "high" | "medium" | "low";
type TopikRow = {
  english: string;
  topikI: { hangul: string; romanization: string };
  topikII: { hangul: string; romanization: string };
};
type QuizOption = { hangul: string; romanization: string };
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
  topikRows?: TopikRow[];
  quiz?: {
    badge?: string;
    level?: string;
    direction?: string;
    question: string;
    options: [QuizOption, QuizOption, QuizOption, QuizOption];
    correctIndex: 1 | 2 | 3 | 4;
  };
  hanjaHub?: {
    syllable: string;
    hanja: string;
    english: string;
    readings: string[];
    satellites: HanjaSatellite[];
  };
};

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
const S = (
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): HanjaSatellite => ({ hangul, romanization, english, icon });

function list(
  slug: string,
  title: string,
  count: number,
  orderKey: string,
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `list-${slug}`,
    format: "super_list",
    title,
    count,
    fit: `Ordered list — ${orderKey}`,
    priority,
    tags,
  };
}

function ant(
  slug: string,
  left: string,
  right: string,
  theme: string,
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `ant-${slug}`,
    format: "antonym_split",
    title: `${left} vs ${right}`,
    count: 2,
    fit: `Antonym pair — ${theme}`,
    priority,
    tags: ["antonym", theme],
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
    tags: ["quiz", ...tags],
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

function topik(
  slug: string,
  title: string,
  rows: TopikRow[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `topik-${slug}`,
    format: "topik_upgrade",
    title,
    count: rows.length,
    fit: `TOPIK I→II upgrade — ${rows.length} pairs`,
    priority,
    tags: ["topik", "upgrade", ...tags],
    topikRows: rows,
    preview: rows.map((r) => r.english),
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
    throw new Error(
      `hanja-${slug}: need ${HANJA_SAT_MIN}–${HANJA_SAT_MAX} useful satellites (got ${satellites.length})`,
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
    priority: "high",
    tags: ["hanja", "hub", "radial", "compounds", ...tags],
    preview: satellites.map((s) => s.english),
    hanjaHub: { syllable, hanja, english, readings, satellites },
  };
}

export const PIN_BALANCE_ANT: VocabBundle[] = [
  ant("empty-full", "Empty", "Full", "amount"),
  ant("soft-hard", "Soft", "Hard", "texture"),
  ant("light-heavy", "Light", "Heavy", "weight"),
  ant("broad-slim", "Broad", "Slim", "shape"),
  ant("thick-thin-cut", "Thick", "Thin", "cut"),
  ant("noisy-silent", "Noisy", "Silent", "sound"),
  ant("bright-dark", "Bright", "Dark", "light"),
  ant("warm-cool", "Warm", "Cool", "temperature"),
  ant("simple-complex", "Simple", "Complex", "difficulty"),
  ant("shared-personal", "Shared", "Personal", "space"),
  ant("indoor-outdoor", "Indoor", "Outdoor", "place"),
  ant("land-takeoff", "Land", "Take off", "travel"),
  ant("step-in-step-out", "Step in", "Step out", "door"),
  ant("attach-detach", "Attach", "Detach", "objects"),
  ant("raise-lower", "Raise", "Lower", "motion"),
  ant("tighten-loosen", "Tighten", "Loosen", "adjust"),
  ant("approve-deny", "Approve", "Deny", "decision"),
  ant("expand-shrink", "Expand", "Shrink", "size"),
];

export const PIN_BALANCE_LIST: VocabBundle[] = [
  list("morning-routine", "Morning routine steps in Korean", 10, "wake→leave", ["daily"]),
  list("airport-flow", "Airport flow words in Korean", 12, "check-in→gate", ["travel"]),
  list("hospital-visit", "Hospital visit steps in Korean", 10, "arrive→pharmacy", ["health"]),
  list("job-interview", "Job interview flow in Korean", 10, "prep→follow-up", ["work"]),
  list("dating-first", "First date flow in Korean", 9, "meet→goodbye", ["social"]),
  list("laundry-day", "Laundry day steps in Korean", 10, "sort→fold", ["home"]),
  list("pc-setup", "New PC setup checklist in Korean", 12, "unbox→update", ["tech"]),
  list("camping-gear", "Camping gear list in Korean", 12, "pack essentials", ["outdoor"]),
  list("birthday-party", "Birthday party prep in Korean", 10, "plan→clean-up", ["social"]),
  list("language-exchange", "Language exchange session in Korean", 9, "hello→swap", ["study"]),
  list("bank-visit", "Bank visit steps in Korean", 10, "ticket→done", ["money"]),
  list("move-out", "Move-out checklist in Korean", 12, "clean→keys", ["home"]),
  list("photo-shoot", "Photo shoot steps in Korean", 9, "setup→edit", ["hobby"]),
  list("restaurant-host", "Hosting dinner steps in Korean", 10, "invite→goodbye", ["food"]),
  list("exam-week", "Exam week plan in Korean", 10, "schedule→review", ["school"]),
  list("car-wash", "Car wash steps in Korean", 9, "rinse→dry", ["daily"]),
  list("thrift-haul", "Thrift shopping flow in Korean", 9, "browse→pay", ["shopping"]),
  list("plant-care", "Plant care checklist in Korean", 10, "water→repot", ["home"]),
];

export const PIN_BALANCE_QUIZ: VocabBundle[] = [
  quiz(
    "borrow-money-vs-owe",
    "Borrow money quiz",
    'Which Korean word means "to owe (money)"?',
    [
      { hangul: "빌리다", romanization: "billida" },
      { hangul: "빚지다", romanization: "bitjida" },
      { hangul: "갚다", romanization: "gapda" },
      { hangul: "저축하다", romanization: "jeochukhada" },
    ],
    2,
    ["money"],
    "Borrow vs owe vs repay vs save",
  ),
  quiz(
    "reserve-vs-book",
    "Make a reservation quiz",
    'Which Korean word means "to make a reservation"?',
    [
      { hangul: "주문하다", romanization: "jumunhada" },
      { hangul: "예약하다", romanization: "yeyakhada" },
      { hangul: "신청하다", romanization: "sincheonghada" },
      { hangul: "취소하다", romanization: "chwisohada" },
    ],
    2,
    ["travel"],
    "Order vs reserve vs apply vs cancel",
  ),
  quiz(
    "spill-vs-pour",
    "Spill vs pour quiz",
    'Which Korean word means "to spill (by accident)"?',
    [
      { hangul: "붓다", romanization: "butda" },
      { hangul: "엎지르다", romanization: "eopjireuda" },
      { hangul: "따르다", romanization: "ttareuda" },
      { hangul: "흘리다", romanization: "heullida" },
    ],
    2,
    ["verbs"],
    "Pour vs spill vs pour carefully vs drip/shed",
  ),
  quiz(
    "hang-vs-put",
    "Hang up quiz",
    'Which Korean word means "to hang (clothes/picture)"?',
    [
      { hangul: "놓다", romanization: "nota" },
      { hangul: "걸다", romanization: "geolda" },
      { hangul: "붙이다", romanization: "buchida" },
      { hangul: "세우다", romanization: "seuda" },
    ],
    2,
    ["home"],
    "Put down vs hang vs stick vs stand up",
  ),
  quiz(
    "cheer-vs-encourage",
    "Cheer someone on quiz",
    'Which Korean word means "to cheer / root for"?',
    [
      { hangul: "응원하다", romanization: "eungwonhada" },
      { hangul: "축하하다", romanization: "chukahada" },
      { hangul: "위로하다", romanization: "wirohada" },
      { hangul: "칭찬하다", romanization: "chingchanhada" },
    ],
    1,
    ["social"],
    "Cheer vs congratulate vs comfort vs praise",
  ),
  quiz(
    "delay-vs-cancel",
    "Delay quiz",
    'Which Korean word means "to delay / postpone"?',
    [
      { hangul: "취소하다", romanization: "chwisohada" },
      { hangul: "미루다", romanization: "miruda" },
      { hangul: "앞당기다", romanization: "apdanggida" },
      { hangul: "완료하다", romanization: "wanryohada" },
    ],
    2,
    ["plans"],
    "Cancel vs postpone vs move earlier vs complete",
  ),
  quiz(
    "pack-vs-wrap",
    "Pack a bag quiz",
    'Which Korean word means "to pack (a bag/suitcase)"?',
    [
      { hangul: "싸다", romanization: "ssada" },
      { hangul: "챙기다", romanization: "chaenggida" },
      { hangul: "풀다", romanization: "pulda" },
      { hangul: "부치다", romanization: "buchida" },
    ],
    2,
    ["travel"],
    "Wrap vs pack/bring along vs unpack vs ship",
  ),
  quiz(
    "stir-vs-mix",
    "Stir quiz",
    'Which Korean word means "to stir (food)"?',
    [
      { hangul: "섞다", romanization: "seokda" },
      { hangul: "젓다", romanization: "jeotda" },
      { hangul: "치다", romanization: "chida" },
      { hangul: "굽다", romanization: "gupda" },
    ],
    2,
    ["food"],
    "Mix vs stir vs beat/hit vs grill",
  ),
  quiz(
    "lock-vs-close",
    "Lock the door quiz",
    'Which Korean word means "to lock"?',
    [
      { hangul: "닫다", romanization: "datda" },
      { hangul: "잠그다", romanization: "jamgeuda" },
      { hangul: "열다", romanization: "yeolda" },
      { hangul: "막다", romanization: "makda" },
    ],
    2,
    ["home"],
    "Close vs lock vs open vs block",
  ),
  quiz(
    "translate-vs-interpret",
    "Translate quiz",
    'Which Korean word means "to translate (written)"?',
    [
      { hangul: "통역하다", romanization: "tongyeokhada" },
      { hangul: "번역하다", romanization: "beonyeokhada" },
      { hangul: "설명하다", romanization: "seolmyeonghada" },
      { hangul: "요약하다", romanization: "yoyakhada" },
    ],
    2,
    ["study"],
    "Interpret speech vs translate text vs explain vs summarize",
  ),
  quiz(
    "complain-vs-suggest",
    "Complain quiz",
    'Which Korean word means "to complain"?',
    [
      { hangul: "제안하다", romanization: "jeanhada" },
      { hangul: "불평하다", romanization: "bulpyeonghada" },
      { hangul: "칭찬하다", romanization: "chingchanhada" },
      { hangul: "부탁하다", romanization: "butakhada" },
    ],
    2,
    ["social"],
    "Suggest vs complain vs praise vs request",
  ),
  quiz(
    "save-file-vs-keep",
    "Save a file quiz",
    'Which Korean word means "to save (a file)"?',
    [
      { hangul: "보관하다", romanization: "bogwanhada" },
      { hangul: "저장하다", romanization: "jeojanghada" },
      { hangul: "삭제하다", romanization: "sakjehada" },
      { hangul: "공유하다", romanization: "gongyuhada" },
    ],
    2,
    ["tech"],
    "Store/keep vs save file vs delete vs share",
  ),
  quiz(
    "stretch-vs-exercise",
    "Stretch quiz",
    'Which Korean word means "to stretch (body)"?',
    [
      { hangul: "운동하다", romanization: "undonghada" },
      { hangul: "스트레칭하다", romanization: "seuteurechinghada" },
      { hangul: "뛰다", romanization: "ttwida" },
      { hangul: "쉬다", romanization: "swida" },
    ],
    2,
    ["fitness"],
    "Work out vs stretch vs run vs rest",
  ),
  quiz(
    "taste-vs-smell",
    "Taste quiz",
    'Which Korean word means "to taste (try food)"?',
    [
      { hangul: "맡다", romanization: "matda" },
      { hangul: "맛보다", romanization: "matboda" },
      { hangul: "씹다", romanization: "ssipda" },
      { hangul: "삼키다", romanization: "samkida" },
    ],
    2,
    ["food"],
    "Smell vs taste vs chew vs swallow",
  ),
  quiz(
    "charge-vs-plug",
    "Charge phone quiz",
    'Which Korean word means "to charge (a battery)"?',
    [
      { hangul: "꽂다", romanization: "kkotda" },
      { hangul: "충전하다", romanization: "chungjeonhada" },
      { hangul: "켜다", romanization: "kyeoda" },
      { hangul: "끄다", romanization: "kkeuda" },
    ],
    2,
    ["tech"],
    "Plug in vs charge vs turn on vs turn off",
  ),
  quiz(
    "follow-vs-subscribe",
    "Follow on SNS quiz",
    'Which Korean word means "to follow (on social media)"?',
    [
      { hangul: "구독하다", romanization: "gudokhada" },
      { hangul: "팔로우하다", romanization: "pallouhada" },
      { hangul: "차단하다", romanization: "chadanhada" },
      { hangul: "공유하다", romanization: "gongyuhada" },
    ],
    2,
    ["social", "tech"],
    "Subscribe vs follow vs block vs share",
  ),
  quiz(
    "refund-vs-exchange",
    "Refund quiz",
    'Which Korean word means "to get a refund"?',
    [
      { hangul: "교환하다", romanization: "gyohwanhada" },
      { hangul: "환불하다", romanization: "hwanbulhada" },
      { hangul: "반품하다", romanization: "banpumhada" },
      { hangul: "결제하다", romanization: "gyeoljehada" },
    ],
    2,
    ["shopping"],
    "Exchange vs refund vs return item vs pay",
  ),
  quiz(
    "whisper-vs-shout",
    "Whisper quiz",
    'Which Korean word means "to whisper"?',
    [
      { hangul: "소리치다", romanization: "sorichida" },
      { hangul: "속삭이다", romanization: "soksagida" },
      { hangul: "말하다", romanization: "malhada" },
      { hangul: "부르다", romanization: "bureuda" },
    ],
    2,
    ["verbs"],
    "Shout vs whisper vs speak vs call",
  ),
];

export const PIN_BALANCE_TOPIK: VocabBundle[] = [
  topik("office-email-upgrade", "Office email: TOPIK I → II", [
    T("please confirm", "확인해 주세요", "hwaginhae juseyo", "확인 부탁드립니다", "hwagin butakdeurimnida"),
    T("attached file", "파일 보냈어요", "pail bonaesseoyo", "첨부드립니다", "cheombudeurimnida"),
    T("as discussed", "말씀드린 대로요", "malsseumdeurim daeroyo", "논의한 바와 같이", "nonuihan bawa gachi"),
    T("deadline", "언제까지예요?", "eonjekkajiyeyo?", "마감일이 언제인지요?", "magamiri eonjeinjiyo?"),
    T("I'll handle it", "제가 할게요", "jega halgeyo", "제가 처리하겠습니다", "jega cheorihagetseumnida"),
    T("thank you for your time", "시간 내주셔서요", "sigan naejusyeoseoyo", "시간을 내어 주셔서 감사합니다", "siganeul naeeo jusyeoseo gamsahamnida"),
  ], ["work"]),
  topik("customer-service-upgrade", "Customer service: TOPIK I → II", [
    T("I have a problem", "문제 있어요", "munje isseoyo", "문제가 발생했습니다", "munjega balsaenghaetseumnida"),
    T("it doesn't work", "안 돼요", "an dwaeyo", "작동하지 않습니다", "jakdonghaji anseumnida"),
    T("can you exchange", "바꿔 주세요", "bakkwo juseyo", "교환이 가능할까요?", "gyohwani ganeunghalkkayo?"),
    T("I want a refund", "환불해 주세요", "hwanbulhae juseyo", "환불을 요청드립니다", "hwanbureul yocheongdeurimnida"),
    T("when will it arrive", "언제 와요?", "eonje wayo?", "배송 예정일이 어떻게 됩니까?", "baesong yejeongiri eotteoke doemnikka?"),
    T("thanks for helping", "도와줘서 고마워요", "dowajwoseo gomawoyo", "도움에 감사드립니다", "doume gamsadeurimnida"),
  ], ["service"]),
  topik("housing-upgrade", "Housing: TOPIK I → II", [
    T("for rent", "세놓아요", "senohayo", "임대합니다", "imdaehamnida"),
    T("deposit", "보증금이요", "bojeunggeumiyo", "보증금이 필요합니다", "bojeunggeumi piryohamnida"),
    T("utilities included", "관리비 포함이에요", "gwanribi pohamieyo", "관리비가 포함되어 있습니다", "gwanribiga pohamdoeeo itseumnida"),
    T("noise", "시끄러워요", "sikkeureowoyo", "소음이 심합니다", "soeumi simhamnida"),
    T("lease ends", "계약 끝나요", "gyeyak kkeunnayo", "계약이 만료됩니다", "gyeyagi mallyodoemnida"),
    T("I'd like to view", "보고 싶어요", "bogo sipeoyo", "매물 확인을 희망합니다", "maemul hwagineul huimanghamnida"),
  ], ["home"]),
  topik("dating-soft-upgrade", "Dating soft talk: TOPIK I → II", [
    T("want to hang out", "만날래요?", "mannallaeyo?", "시간이 되시면 뵙고 싶습니다", "sigani doesimyeon boepgo sipseumnida"),
    T("I had fun", "재밌었어요", "jaemisseosseoyo", "즐거운 시간이었습니다", "jeulgeoun siganieotseumnida"),
    T("text me", "연락해요", "yeollakhaeyo", "연락 주시면 감사하겠습니다", "yeollak jusimyeon gamsahagetseumnida"),
    T("I'm busy this week", "이번 주 바빠요", "ibeon ju bappayo", "이번 주는 일정이 빠듯합니다", "ibeon juneun iljeongi ppadeuthamnida"),
    T("maybe later", "다음에 해요", "daeume haeyo", "추후에 다시 말씀드릴게요", "chuhoe dasi malsseumdeurilgeyo"),
    T("you look nice", "옷 예쁘네요", "ot yeppeuneyo", "차림이 정말 멋집니다", "charimi jeongmal meotjipseumnida"),
  ], ["social"]),
  topik("study-abroad-upgrade", "Study abroad: TOPIK I → II", [
    T("I study Korean", "한국어 공부해요", "hangugeo gongbuhaeyo", "한국어를 배우고 있습니다", "hangugeoreul baeugo itseumnida"),
    T("homework", "숙제 있어요", "sukje isseoyo", "과제가 있습니다", "gwajega itseumnida"),
    T("I don't understand", "모르겠어요", "moreugesseoyo", "이해하기 어렵습니다", "ihaehagi eoryeopseumnida"),
    T("can you repeat", "다시 말해 주세요", "dasi malhae juseyo", "다시 한번 말씀해 주시겠습니까", "dasi hanbeon malsseumhae jusigetseummikka"),
    T("exam soon", "시험 있어요", "siheom isseoyo", "시험이 예정되어 있습니다", "siheomi yejeongdoeeo itseumnida"),
    T("I passed", "합격했어요", "hapgyeokhaesseoyo", "합격했습니다", "hapgyeokhaetseumnida"),
  ], ["school"]),
  topik("fitness-upgrade", "Fitness: TOPIK I → II", [
    T("I work out", "운동해요", "undonghaeyo", "운동을 하고 있습니다", "undongeul hago itseumnida"),
    T("I'm sore", "근육통 있어요", "geunyuktong isseoyo", "근육통이 있습니다", "geunyuktongi itseumnida"),
    T("rest day", "쉬는 날이에요", "swineun narieyo", "휴식일입니다", "hyusigirimnida"),
    T("let's go together", "같이 가요", "gachi gayo", "함께하시겠어요?", "hamkkehasi getseoyo?"),
    T("too hard", "너무 힘들어요", "neomu himdeureoyo", "강도가 다소 높습니다", "gangdoga daso nopseumnida"),
    T("I feel better", "개운해요", "gaeunhaeyo", "컨디션이 좋아졌습니다", "keondisyeoni joajyeotseumnida"),
  ], ["fitness"]),
  topik("weather-chat-upgrade", "Weather chat: TOPIK I → II", [
    T("it's hot", "더워요", "deowoyo", "무더운 날씨입니다", "mudeoun nalssiimnida"),
    T("it's cold", "추워요", "chuwoyo", "기온이 낮습니다", "gioni natseumnida"),
    T("it's raining", "비 와요", "bi wayo", "비가 내리고 있습니다", "biga naerigo itseumnida"),
    T("bring an umbrella", "우산 가져가요", "usan gajyeogayo", "우산을 챙기시기 바랍니다", "usaneul chaenggisigi baramnida"),
    T("nice weather", "날씨 좋네요", "nalssi jotneyo", "날씨가 참 좋습니다", "nalssiga cham josteumnida"),
    T("dusty air", "미세먼지 많아요", "misemunji manayo", "대기질이 나쁩니다", "daegijiri nappeumnida"),
  ], ["weather"]),
  topik("money-talk-upgrade", "Money talk: TOPIK I → II", [
    T("it's expensive", "비싸요", "bissayo", "가격이 부담됩니다", "gagyeogi budamdoemnida"),
    T("it's cheap", "싸요", "ssayo", "저렴한 편입니다", "jeoryeomhan pyeonimnida"),
    T("split the bill", "더치페이 해요", "deochipei haeyo", "비용을 나누겠습니다", "biyonguel nanugetseumnida"),
    T("I got paid", "월급 나왔어요", "wolgeup nawasseoyo", "급여가 입금되었습니다", "geupyeoga ipgeumdoeeotseumnida"),
    T("I'm saving", "저축해요", "jeochukhaeyo", "저축하고 있습니다", "jeochukhago itseumnida"),
    T("too much", "너무 많아요", "neomu manayo", "예산 초과입니다", "yesan chogwaimnida"),
  ], ["money"]),
  topik("family-upgrade", "Family: TOPIK I → II", [
    T("my parents", "우리 부모님요", "uri bumonimyo", "부모님께서는", "bumonimkkeseoneun"),
    T("siblings", "형제 있어요", "hyeongje isseoyo", "형제자매가 있습니다", "hyeongjejamaega itseumnida"),
    T("I miss them", "보고 싶어요", "bogo sipeoyo", "그리운 마음입니다", "geuriun maeumimnida"),
    T("family dinner", "가족 저녁이요", "gajok jeonyeogiyo", "가족 식사 예정입니다", "gajok siksa yejeongimnida"),
    T("they're well", "잘 지내요", "jal jinaeyo", "건강히 지내고 계십니다", "geonganghi jinaego gyesimnida"),
    T("visit home", "집에 가요", "jibe gayo", "본가를 방문합니다", "bongareul bangmunhamnida"),
  ], ["family"]),
  topik("nightlife-soft-upgrade", "Night plans: TOPIK I → II", [
    T("want a drink", "한잔할래요?", "hanjanhallaeyo?", "가볍게 한잔하시겠어요?", "gabyeopge hanjanhasigetseoyo?"),
    T("I'm drunk", "취했어요", "chwihaesseoyo", "술이 많이 취했습니다", "suri mani chwihaetseumnida"),
    T("last train", "막차예요", "makchayeyo", "막차 시간입니다", "makcha siganimnida"),
    T("I should go", "이만 갈게요", "iman galgeyo", "이만 실례하겠습니다", "iman sillyehagetseumnida"),
    T("that was fun", "재밌었어요", "jaemisseosseoyo", "즐거운 밤이었습니다", "jeulgeoun bamieotseumnida"),
    T("get home safe", "조심히 가요", "josimhi gayo", "안전하게 들어가세요", "anjeonhage deureogaseyo"),
  ], ["social"]),
  topik("delivery-upgrade", "Delivery: TOPIK I → II", [
    T("where's my order", "배달 어디예요?", "baedal eodiyeyo?", "배송 현황이 궁금합니다", "baesong hyeonhwangi gunggeumhamnida"),
    T("leave at door", "문 앞에 놔 주세요", "mun ape nwa juseyo", "문앞에 비치해 주세요", "munape bichihae juseyo"),
    T("wrong order", "잘못된 주문이에요", "jalmotdoen jumunieyo", "주문 내용이 다릅니다", "jumun naeyongi dareumnida"),
    T("missing item", "빠진 게 있어요", "ppajin ge isseoyo", "누락된 품목이 있습니다", "nurakdoen pummogi itseumnida"),
    T("contact rider", "기사님 연결돼요?", "gisanim yeongyeoldwaeyo?", "배송 기사와 연결될 수 있을까요?", "baesong gisawa yeongyeoldoel su isseulkayo?"),
    T("thanks arrived", "잘 받았어요", "jal badasseoyo", "안전하게 수령했습니다", "anjeonhage suryeonghaetseumnida"),
  ], ["app"]),
  topik("hobby-upgrade", "Hobbies: TOPIK I → II", [
    T("my hobby is", "취미는요", "chwimineunyo", "제 취미는 ~입니다", "je chwimineun ~imnida"),
    T("I started recently", "요즘 시작했어요", "yojeum sijakhaesseoyo", "최근에 시작했습니다", "choegeune sijakhaetseumnida"),
    T("I'm not good yet", "아직 잘 못해요", "ajik jal mothaeyo", "아직 미숙합니다", "ajik misukhamnida"),
    T("want to join", "같이 할래요?", "gachi hallaeyo?", "함께하시겠습니까?", "hamkkehasi getseummnikka?"),
    T("recommend something", "추천해 줘요", "chucheonhae jwoyo", "추천 부탁드립니다", "chucheon butakdeurimnida"),
    T("I'm hooked", "빠져들었어요", "ppajyeodeureosseoyo", "완전히 몰입하고 있습니다", "wanjeonhi moriphago itseumnida"),
  ], ["hobby"]),
  topik("commute-upgrade", "Commute: TOPIK I → II", [
    T("crowded", "사람 많아요", "saram manayo", "혼잡합니다", "honjaphamnida"),
    T("delayed", "지연돼요", "jiyeondwaeyo", "운행이 지연되고 있습니다", "unhaengi jiyeondoego itseumnida"),
    T("transfer", "갈아타요", "garatayo", "환승합니다", "hwanseunghamnida"),
    T("missed it", "놓쳤어요", "nochyeosseoyo", "놓치고 말았습니다", "nochigo marasseumnida"),
    T("how long", "얼마나 걸려요?", "eolmana geollyeoyo?", "소요 시간이 어떻게 됩니까?", "soyo sigani eotteoke doemnikka?"),
    T("I'm almost there", "거의 다 왔어요", "geoui da wasseoyo", "곧 도착합니다", "got dochakhamnida"),
  ], ["travel"]),
  topik("pets-upgrade", "Pets: TOPIK I → II", [
    T("I have a dog", "강아지 키워요", "gangaji kiwoyo", "반려견을 키우고 있습니다", "ballyeogyeoneul kiugo itseumnida"),
    T("needs a walk", "산책해야 해요", "sanchaekhaeya haeyo", "산책이 필요합니다", "sanchaegi piryohamnida"),
    T("vet visit", "병원 가요", "byeongwon gayo", "동물병원에 방문합니다", "dongmulbyeongwone bangmunhamnida"),
    T("so cute", "너무 귀여워요", "neomu gwiyeowoyo", "정말 사랑스럽습니다", "jeongmal sarangseureopseumnida"),
    T("food time", "밥 줄 시간이에요", "bap jul siganieyo", "급여 시간입니다", "geupyeo siganimnida"),
    T("miss my pet", "보고 싶어요", "bogo sipeoyo", "보고 싶은 마음입니다", "bogo sipeun maeumimnida"),
  ], ["pet"]),
  topik("gaming-upgrade", "Gaming: TOPIK I → II", [
    T("want to play", "게임할래?", "geimhallaee?", "한 판 하실래요?", "han pan hasillaeyo?"),
    T("I'm bad", "나 못해요", "na mothaeyo", "실력이 부족합니다", "sillyeogi bujokhamnida"),
    T("one more", "한 판 더", "han pan deo", "한 판 더 하시겠어요?", "han pan deo hasigetseoyo?"),
    T("lagging", "렉 걸려요", "rek geollyeoyo", "지연이 심합니다", "jiyeoni simhamnida"),
    T("gg", "수고했어요", "sugohaesseoyo", "좋은 게임이었습니다", "joeun geimieotseumnida"),
    T("I'm logging off", "이만 끌게요", "iman kkeulgeyo", "이만 접속을 종료하겠습니다", "iman jeopsogeul jongryohagetseumnida"),
  ], ["hobby"]),
  topik("beauty-upgrade", "Beauty: TOPIK I → II", [
    T("this shade", "이 색이요", "i saegiyo", "이 색상을 원합니다", "i saeksangeul wonhamnida"),
    T("too dark", "너무 어두워요", "neomu eoduwoyo", "톤이 다소 어둡습니다", "toni daso eodupseumnida"),
    T("natural look", "자연스럽게요", "jayeonseureopgeyo", "자연스러운 연출을 원합니다", "jayeonseureoun yeonchureul wonhamnida"),
    T("sensitive skin", "피부 예민해요", "pibu yeminhaeyo", "피부가 민감합니다", "pibuga mingamhamnida"),
    T("recommend", "추천해 주세요", "chucheonhae juseyo", "추천 부탁드립니다", "chucheon butakdeurimnida"),
    T("I'll take it", "이걸로 할게요", "igeollo halgeyo", "이 제품으로 하겠습니다", "i jepumeuro hagetseumnida"),
  ], ["beauty"]),
  topik("kids-soft-upgrade", "Kids talk: TOPIK I → II", [
    T("be careful", "조심해", "josimhae", "다치지 않게 조심하세요", "dachiji anke josimhaseyo"),
    T("good job", "잘했어", "jalhaesseo", "정말 잘했어요", "jeongmal jalhaesseoyo"),
    T("time for bed", "자야 해", "jaya hae", "이제 잘 시간이에요", "ije jal siganieyo"),
    T("share please", "나눠 먹어", "nanwo meogeo", "사이좋게 나눠 먹어요", "saijoke nanwo meogeoyo"),
    T("don't cry", "울지 마", "ulji ma", "울지 않아도 돼요", "ulji anado dwaeyo"),
    T("I'm proud", "대견해", "daegyeonhae", "정말 대견해요", "jeongmal daegyeonhaeyo"),
  ], ["family"]),
  topik("remote-work-upgrade", "Remote work: TOPIK I → II", [
    T("on a call", "통화 중이에요", "tonghwa jungieyo", "회의 중입니다", "hoeui jungimnida"),
    T("camera on", "카메라 켜 주세요", "kamera kyeo juseyo", "카메라를 켜 주시겠습니까", "kamerareul kyeo jusigetseummikka"),
    T("you're muted", "음소거예요", "eumsogeoyeyo", "음소거 상태입니다", "eumsogeo sangtaeimnida"),
    T("share screen", "화면 공유해요", "hwamyeon gongyuhaeyo", "화면 공유 부탁드립니다", "hwamyeon gongyu butakdeurimnida"),
    T("bad connection", "끊겨요", "kkeunggyeoyo", "연결이 불안정합니다", "yeongyeori buranjeonghamnida"),
    T("talk later", "나중에 얘기해요", "najunge yaegihaeyo", "추후 논의하겠습니다", "chuho nonuihagetseumnida"),
  ], ["work"]),
];

export const PIN_BALANCE_HANJA: VocabBundle[] = [
  hub("dong-same", "동 (同) — same / together words", "동", "同", "same", [
    S("동의", "dongui", "agreement", "handshake"),
    S("동료", "dongnyo", "colleague", "two desks"),
    S("동시", "dongsi", "same time", "two clocks"),
    S("공동", "gongdong", "joint / shared", "shared key"),
    S("동일", "dongil", "identical", "two matching cards"),
    S("동기", "donggi", "classmate year", "cohort badge"),
  ], ["abstract"]),
  hub("bu-part", "부 (部) — department words", "부", "部", "section", [
    S("부서", "buseo", "department", "org chart"),
    S("부분", "bubun", "part", "puzzle piece"),
    S("부장", "bujang", "department head", "nameplate"),
    S("내부", "naebu", "inside / internal", "inside room"),
    S("외부", "oebu", "outside / external", "outside door"),
    S("전부", "jeonbu", "all / entire", "full checklist"),
  ], ["work"]),
  hub("gyeong-view", "경 (景) — scenery words", "경", "景", "scenery", [
    // Everyday only — drop pad/dictionary fluff (경물·경개·경승·정경…)
    S("경치", "gyeongchi", "scenery / view", "mountain lake view"),
    S("풍경", "punggyeong", "landscape", "wide landscape"),
    S("야경", "yagyeong", "night view", "city night lights"),
    S("배경", "baegyeong", "background", "photo backdrop"),
  ], ["nature"]),
  hub("mul-thing", "물 (物) — thing words", "물", "物", "thing", [
    S("물건", "mulgeon", "thing / item", "shopping bag items"),
    S("동물", "dongmul", "animal", "cute animal"),
    S("식물", "singmul", "plant", "potted plant"),
    S("선물", "seonmul", "gift", "wrapped gift"),
    S("물질", "muljil", "substance", "lab beaker"),
    S("생물", "saengmul", "living thing / biology", "leaf + cell soft"),
  ], ["noun"]),
  hub("hwa-change", "화 (化) — change / -ize words", "화", "化", "change", [
    S("문화", "munhwa", "culture", "palette"),
    S("변화", "byeonhwa", "change", "arrow morph"),
    S("화학", "hwahak", "chemistry", "flask"),
    S("소화", "sohwa", "digestion", "stomach soft"),
    S("미화", "mihwa", "beautification", "sparkle clean"),
    S("강화", "ganghwa", "strengthen", "shield up"),
  ], ["abstract"]),
  hub("jeom-point", "점 (點) — point words", "점", "點", "point", [
    S("점수", "jeomsu", "score", "scoreboard"),
    S("초점", "chojeom", "focus", "camera focus"),
    S("장점", "jangjeom", "strength", "thumbs up"),
    S("단점", "danjeom", "weakness", "small crack"),
    S("요점", "yojeom", "main point", "key bullet"),
    S("시점", "sijeom", "point in time", "timeline dot"),
  ], ["abstract"]),
  hub("bang-direction", "방 (方) — direction words", "방", "方", "direction", [
    S("방향", "banghyang", "direction", "compass"),
    S("방법", "bangbeop", "method", "steps list"),
    S("지방", "jibang", "region / countryside", "map region"),
    S("방안", "bangan", "plan / measure", "clipboard plan"),
    S("사방", "sabang", "all directions", "four arrows"),
    S("일방", "ilbang", "one-way", "one-way arrow"),
  ], ["abstract"]),
  hub("heo-allow", "허 (許) — allow words", "허", "許", "allow", [
    S("허락", "heorak", "permission", "stamp OK"),
    S("허용", "heoyong", "allowance", "open gate"),
    S("허가", "heoga", "permit", "official permit"),
    S("특허", "teukheo", "patent", "patent certificate"),
  ], ["formal"]),
  hub("rim-forest", "림 (林) — forest words", "림", "林", "forest", [
    S("산림", "sallim", "forest", "pine forest"),
    S("수림", "surim", "grove", "tree cluster"),
    S("밀림", "millim", "jungle", "dense trees"),
    S("임야", "imya", "woodland", "wooded hill"),
  ], ["nature"], ["임"]),
  hub("pyo-surface", "표 (表) — surface / show words", "표", "表", "show / surface", [
    S("표현", "pyohyeon", "expression", "speech bubble"),
    S("표시", "pyosi", "mark / display", "label sticker"),
    S("대표", "daepyo", "representative", "leader badge"),
    S("발표", "balpyo", "presentation", "stage mic"),
    S("표정", "pyojeong", "facial expression", "face emoji soft"),
    S("도표", "dopyo", "chart", "bar chart"),
  ], ["abstract"]),
  hub("won-circle", "원 (員) — staff / member words", "원", "員", "member", [
    S("직원", "jigwon", "employee", "ID badge"),
    S("회원", "hoewon", "member", "membership card"),
    S("인원", "inwon", "headcount / people", "people count"),
    S("사원", "sawon", "office worker", "desk worker"),
    S("임원", "imwon", "executive", "meeting room seat"),
    S("전원", "jeonwon", "everyone / all staff", "full room team"),
  ], ["work"]),
  hub("seon-line", "선 (線) — line words", "선", "線", "line", [
    S("노선", "noseon", "route", "subway map"),
    S("직선", "jikseon", "straight line", "ruler line"),
    S("곡선", "gokseon", "curve", "curved path"),
    S("시선", "siseon", "gaze", "eyes looking"),
    S("무선", "museon", "wireless", "wifi waves"),
    S("전선", "jeonseon", "electric wire", "cable"),
  ], ["noun"]),
  hub("jang-place", "장 (場) — place words", "장", "場", "place", [
    S("장소", "jangso", "place", "map pin place"),
    S("시장", "sijang", "market", "market stall"),
    S("운동장", "undongjang", "playground field", "sports field"),
    S("주차장", "juchajang", "parking lot", "P sign"),
    S("현장", "hyeonjang", "site / scene", "construction cone"),
    S("극장", "geukjang", "theater", "stage curtain"),
  ], ["place"]),
  hub("gi-machine", "기 (機) — machine words", "기", "機", "machine", [
    S("기계", "gigye", "machine", "gear machine"),
    S("비행기", "bihaenggi", "airplane", "airplane"),
    S("기회", "gihoe", "opportunity", "open door chance"),
    S("기능", "gineung", "function", "settings toggles"),
    S("기기", "gigi", "device", "gadgets"),
    S("위기", "wigi", "crisis", "warning triangle"),
  ], ["tech"]),
  hub("ryeok-power", "력 (力) — power words", "력", "力", "power", [
    S("노력", "noryeok", "effort", "climbing hill"),
    S("능력", "neungnyeok", "ability", "skill badge"),
    S("협력", "hyeomnyeok", "cooperation", "team hands"),
    S("체력", "cheryeok", "stamina", "running figure"),
    S("압력", "amnyeok", "pressure", "press gauge"),
    S("폭력", "pongnyeok", "violence", "crossed-out fist soft"),
  ], ["abstract"], ["력"]),
  hub("jeong-correct", "정 (正) — correct words", "정", "正", "correct", [
    S("정확", "jeonghwak", "accurate", "bullseye"),
    S("정답", "jeongdap", "correct answer", "checkmark"),
    S("정상", "jeongsang", "normal / summit", "mountain peak"),
    S("교정", "gyojeong", "correction", "red pen edit"),
    S("정의", "jeongui", "definition / justice", "balance scale"),
    S("정문", "jeongmun", "main gate", "school gate"),
  ], ["abstract"]),
  hub("an-safe", "안 (安) — safe / ease words", "안", "安", "safe", [
    S("안전", "anjeon", "safety", "helmet"),
    S("안녕", "annyeong", "hello / peace", "wave hello"),
    S("불안", "buran", "anxiety", "worried face soft"),
    S("안정", "anjeong", "stability", "steady block"),
    S("편안", "pyeonan", "comfort", "cozy chair"),
    S("안심", "ansim", "relief / peace of mind", "relieved smile"),
  ], ["daily"]),
  hub("yeo-travel", "여 (旅) — travel words", "여", "旅", "travel", [
    S("여행", "yeohaeng", "trip", "suitcase"),
    S("여정", "yeojeong", "itinerary", "route map"),
    S("여관", "yeogwan", "inn", "small inn"),
    S("여비", "yeobi", "travel funds", "wallet trip"),
    S("여객", "yeogaek", "passenger", "passenger with bag"),
    S("도보여행", "doboyeohaeng", "walking trip", "walking boots"),
  ], ["travel"]),
  hub("eum-sound", "음 (音) — sound words", "음", "音", "sound", [
    S("음악", "eumak", "music", "musical notes"),
    S("음성", "eumseong", "voice", "voice wave"),
    S("소음", "soeum", "noise", "loud speaker soft"),
    S("녹음", "nogeum", "recording", "mic record"),
    S("발음", "bareum", "pronunciation", "mouth speak"),
    S("음향", "eumhyang", "acoustics / sound", "speaker wave"),
  ], ["sound"]),
];

export const PIN_BALANCE_WAVE_BUNDLES: VocabBundle[] = [
  ...PIN_BALANCE_ANT,
  ...PIN_BALANCE_LIST,
  ...PIN_BALANCE_QUIZ,
  ...PIN_BALANCE_TOPIK,
  ...PIN_BALANCE_HANJA,
];

export const PIN_BALANCE_WAVE_ANT = PIN_BALANCE_ANT;
export const PIN_BALANCE_WAVE_LIST = PIN_BALANCE_LIST;
export const PIN_BALANCE_WAVE_QUIZ = PIN_BALANCE_QUIZ;
export const PIN_BALANCE_WAVE_TOPIK = PIN_BALANCE_TOPIK;
export const PIN_BALANCE_WAVE_HANJA = PIN_BALANCE_HANJA;
