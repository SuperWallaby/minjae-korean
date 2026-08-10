/**
 * Cute cast (3×3 mascot sticker grid) + even restock wave for depleted pin formats.
 * Merged into ALL_VOCAB_BUNDLES from bundle-catalog.ts.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";
type PhraseLine = { hangul: string; romanization: string; english: string };
type ConceptRow = { english: string; hangul: string; romanization: string; visual: string };
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
    level?: string;
    direction?: string;
    question: string;
    options: [QuizOption, QuizOption, QuizOption, QuizOption];
    correctIndex: 1 | 2 | 3 | 4;
  };
  cuteCast?: "capybara" | "otter";
  cuteCells?: CuteCell[];
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

function cute(
  slug: string,
  title: string,
  cast: "capybara" | "otter",
  cells: CuteCell[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  if (cells.length !== 9) throw new Error(`cute-${slug} needs exactly 9 cells`);
  return {
    id: `cute-${slug}`,
    format: "cute_cast",
    title,
    count: 9,
    fit:
      cast === "otter"
        ? "Cute 3×3 sticker grid — ALL pink otter (no capybara)"
        : "Cute 3×3 sticker grid — ALL blue-hat sidekick capybara (no otter)",
    priority,
    tags: ["cute", "mascot", "spoken", cast, ...tags],
    cuteCast: cast,
    cuteCells: cells,
    preview: cells.map((c) => c.english),
  };
}

function phrase(
  slug: string,
  title: string,
  lines: PhraseLine[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `phrase-${slug}`,
    format: "phrase_stack",
    title,
    count: lines.length,
    fit: `Polished ${lines.length}-phrase stack — spoken Korean`,
    priority,
    tags: ["phrase", "spoken", ...tags],
    phraseLines: lines,
    preview: lines.map((l) => l.english),
  };
}

function concept(
  slug: string,
  title: string,
  rows: ConceptRow[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `concept-${slug}`,
    format: "concept_rows",
    title,
    count: rows.length,
    fit: "Concept diagram panels — situation beats",
    priority,
    tags: ["concept", "grammar", ...tags],
    conceptRows: rows,
    preview: rows.map((r) => r.english),
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
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `sim-${slug}`,
    format: "similar_split",
    title: `${leftEnglish} vs ${rightEnglish}`,
    count: 2,
    fit: `Near-synonyms — ${theme}: ${leftNuance} / ${rightNuance}`,
    priority,
    tags: ["similar", theme],
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

function grid(
  slug: string,
  title: string,
  tags: string[],
  count: 4 | 9 | 16 = 9,
  priority: BundlePriority = "medium",
  preview?: string[],
): VocabBundle {
  return {
    id: `grid-${slug}`,
    format: "grid_cluster",
    title,
    count,
    fit: `Homogeneous ${count}-cell grid — same part of speech, one theme`,
    priority,
    tags,
    preview,
  };
}

function list(
  slug: string,
  title: string,
  count: number,
  orderKey: string,
  tags: string[],
  priority: BundlePriority = "medium",
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
  priority: BundlePriority = "medium",
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

/** —— Cute cast (new format) — whole pin is ONE cast —— */
export const CUTE_CAST_BUNDLES: VocabBundle[] = [
  // 6× all-capybara
  cute("filler-words", "Filler words in Korean", "capybara", [
    Cell("음", "eum", "Ummm…", "thinking, finger on chin"),
    Cell("그", "geu", "Uh… / that…", "hesitant wave"),
    Cell("저", "jeo", "Um… (polite)", "shy bow with blue hat"),
    Cell("뭐지", "mwoji", "What was it…", "confused with ?"),
    Cell("아니", "ani", "Wait, no…", "hands waving no"),
    Cell("아", "a", "Ah!", "surprised mouth O"),
    Cell("그래", "geurae", "Yeah…", "nodding chill"),
    Cell("그냥", "geunyang", "Just…", "shrugging cute"),
    Cell("글쎄", "geulsse", "Well… / hmm", "looking aside"),
  ], ["filler"]),
  cute("tiny-yes-no", "Tiny yes & no in Korean", "capybara", [
    Cell("응", "eung", "Yeah (casual)", "thumbs up"),
    Cell("네", "ne", "Yes (polite)", "polite nod"),
    Cell("어", "eo", "Uh-huh", "quick nod"),
    Cell("아니야", "aniya", "Nope", "X arms soft"),
    Cell("아니요", "aniyo", "No (polite)", "gentle head shake"),
    Cell("맞아", "maja", "That's right", "pointing yes"),
    Cell("그렇지", "geureochi", "Exactly", "smug blue hat"),
    Cell("그럼", "geureom", "Of course", "hands on hips"),
    Cell("괜찮아", "gwaenchana", "It's fine", "peace vibe"),
  ], ["yesno"]),
  cute("agreement-glue", "Agreement glue words in Korean", "capybara", [
    Cell("그치", "geuchi", "Right?", "checking-in smile"),
    Cell("그렇지 않아?", "geureochi ana?", "Isn't that so?", "lean-in"),
    Cell("맞아맞아", "majamaja", "Yeah yeah", "double nod"),
    Cell("인정", "injeong", "Facts", "fist pump tiny"),
    Cell("당연하지", "dangyeonhaji", "Obviously", "proud blue hat"),
    Cell("나도", "nado", "Me too", "point to self"),
    Cell("그치그치", "geuchigeuchi", "Totally", "bounce yes"),
    Cell("완전", "wanjeon", "Totally / so", "sparkle arms"),
    Cell("진짜로", "jinjjaro", "For real", "serious cute"),
  ], ["agreement"]),
  cute("chat-openers", "Chat openers in Korean", "capybara", [
    Cell("야", "ya", "Hey (close)", "calling out"),
    Cell("저기요", "jeogiyo", "Excuse me", "polite raise paw"),
    Cell("있잖아", "itjana", "You know…", "secretive lean"),
    Cell("그니까", "geunikka", "So yeah…", "continue story"),
    Cell("아 근데", "a geunde", "Oh but…", "topic shift"),
    Cell("그래서", "geuraeseo", "So then…", "story beat"),
    Cell("결국", "gyeolguk", "In the end…", "wrap-up pose"),
    Cell("아무튼", "amuteun", "Anyway…", "reset vibe"),
    Cell("일단은", "ildaneun", "First off…", "list finger"),
  ], ["chat"]),
  cute("drama-bits", "Tiny drama bits in Korean", "capybara", [
    Cell("설마", "seolma", "No way…", "disbelief"),
    Cell("역시", "yeoksi", "As expected", "knowing smile"),
    Cell("결국엔", "gyeolgugen", "In the end", "story end"),
    Cell("갑자기", "gapjagi", "Suddenly", "jump surprise"),
    Cell("드디어", "deudieo", "Finally!", "celebrate hat"),
    Cell("하필", "hapil", "Of all times…", "why-me face"),
    Cell("차라리", "charari", "I'd rather…", "choose pose"),
    Cell("결국", "gyeolguk", "Turns out…", "reveal"),
    Cell("어차피", "eochapi", "Anyway / either way", "shrug chill"),
  ], ["drama"]),
  cute("weather-moods", "Weather moods in Korean", "capybara", [
    Cell("맑다", "makda", "Clear/sunny", "sun pose"),
    Cell("흐리다", "heurida", "Cloudy", "under soft cloud"),
    Cell("비 와", "bi wa", "It's raining", "tiny umbrella"),
    Cell("눈 와", "nun wa", "It's snowing", "shiver cute"),
    Cell("바람 불어", "baram bureo", "Windy", "hat almost flying"),
    Cell("더워", "deowo", "It's hot", "sweat drop"),
    Cell("추워", "chuwo", "It's cold", "hug self"),
    Cell("습해", "seuphae", "Humid", "sticky ick"),
    Cell("쾌청하다", "kwaecheonghada", "Crisp clear", "deep breath happy"),
  ], ["weather"]),
  // 6× all-otter
  cute("soft-reactions", "Soft reactions in Korean", "otter", [
    Cell("진짜?", "jinjja?", "Really?", "eyes wide"),
    Cell("대박", "daebak", "Whoa!", "sparkle excitement"),
    Cell("헐", "heol", "No way", "hand on cheek"),
    Cell("오", "o", "Oh!", "small awe"),
    Cell("와", "wa", "Wow", "clapping"),
    Cell("아하", "aha", "Ahh I see", "lightbulb pose"),
    Cell("엥?", "eng?", "Huh?", "tilted head"),
    Cell("ㅋㅋ", "kk", "lol", "giggle cover mouth"),
    Cell("ㅠㅠ", "yuyu", "ugh / sad", "teary cute"),
  ], ["reaction"]),
  cute("thinking-aloud", "Thinking out loud in Korean", "otter", [
    Cell("잠깐", "jamkkan", "Wait a sec", "pause hand up"),
    Cell("어디 보자", "eodi boja", "Let's see…", "looking around"),
    Cell("생각이…", "saenggagi…", "I think…", "chin tap"),
    Cell("어떻게 하지", "eotteoke haji", "What should I do", "worried cute"),
    Cell("아 맞다", "a matda", "Oh right!", "snap finger"),
    Cell("그러니까", "geureonikka", "So like…", "explaining paws"),
    Cell("말하자면", "malhajamyeon", "How do I say…", "searching words"),
    Cell("음… 뭐랄까", "eum… mworalkka", "Hmm how to put it", "pondering"),
    Cell("알 것 같아", "al geot gata", "I think I get it", "aha nod"),
  ], ["filler", "thinking"]),
  cute("soft-hedges", "Soft hedges in Korean", "otter", [
    Cell("좀", "jom", "a bit…", "pinching fingers"),
    Cell("약간", "yakgan", "kinda", "wobble hand"),
    Cell("거의", "geoui", "almost", "near-miss pose"),
    Cell("아마", "ama", "maybe", "unsure shrug"),
    Cell("혹시", "hoksi", "by any chance", "polite ask"),
    Cell("일단", "ildan", "for now", "one finger up"),
    Cell("대충", "daechung", "roughly", "wavy gesture"),
    Cell("왠지", "waenji", "for some reason", "tilted wonder"),
    Cell("아무래도", "amuraedo", "probably…", "thinking hard"),
  ], ["hedge"]),
  cute("comfort-sounds", "Comfort sounds in Korean", "otter", [
    Cell("아이고", "aigo", "Oh dear", "sympathetic"),
    Cell("어머", "eomeo", "Oh my", "hand to mouth"),
    Cell("아이구", "aigu", "Aww / oof", "soft pity"),
    Cell("휴", "hyu", "Phew", "relieved wipe brow"),
    Cell("하…", "ha…", "Sigh", "exhale"),
    Cell("우와", "uwa", "Whoa", "sparkle eyes"),
    Cell("에구", "egu", "Aww (pity)", "pat air"),
    Cell("엣취", "etchwi", "Achoo!", "sneeze cute"),
    Cell("냠냠", "nyamnyam", "Nom nom", "eating snack"),
  ], ["sound"]),
  cute("polite-fillers", "Polite fillers in Korean", "otter", [
    Cell("글쎄요", "geulsseyo", "Well… (polite)", "polite ponder"),
    Cell("잠시만요", "jamsimanyo", "One moment", "wait finger"),
    Cell("그게…", "geuge…", "That's…", "hesitant polite"),
    Cell("사실요", "sasiryo", "Actually…", "soft confess"),
    Cell("아무래도요", "amuraedoyo", "I think maybe…", "careful guess"),
    Cell("죄송한데", "joesonghande", "Sorry but…", "bow tiny"),
    Cell("혹시요", "hoksiyo", "By chance…?", "polite ask"),
    Cell("그럼요", "geureomyo", "Of course", "warm yes"),
    Cell("알겠습니다", "algetseumnida", "Understood", "formal nod"),
  ], ["polite", "filler"]),
  cute("food-sounds", "Foodie sound words in Korean", "otter", [
    Cell("맛있다", "masitda", "Yum!", "holding fish/snack"),
    Cell("맵다", "maepda", "Spicy!", "fanning mouth"),
    Cell("뜨겁다", "tteugeopda", "Hot!", "blowing on food"),
    Cell("시원하다", "siwonhada", "Refreshing", "cool drink"),
    Cell("배고파", "baegopa", "I'm hungry", "rub tummy"),
    Cell("배불러", "baebulleo", "I'm full", "pat belly"),
    Cell("한입만", "hanimman", "Just one bite", "pleading paws"),
    Cell("더 주세요", "deo juseyo", "More please", "bowl empty"),
    Cell("최고야", "choegoya", "The best!", "heart eyes food"),
  ], ["food"]),
];

/** —— Even restock across depleted formats —— */
export const RESTOCK_GRID_BUNDLES: VocabBundle[] = [
  grid("kitchen-tools-basic", "Kitchen tools in Korean", ["kitchen", "home"], 9, "high", [
    "knife", "cutting board", "pot", "pan", "ladle", "spatula", "whisk", "peeler", "colander",
  ]),
  grid("bathroom-shelf", "Bathroom shelf words in Korean", ["home", "daily"], 9, "high", [
    "toothbrush", "toothpaste", "shampoo", "soap", "towel", "mirror", "toilet paper", "razor", "lotion",
  ]),
  grid("desk-stationery2", "Desk stationery in Korean", ["school", "work"], 9, "medium", [
    "stapler", "scissors", "tape", "glue stick", "highlighter", "sticky notes", "binder", "eraser", "ruler",
  ]),
  grid("commute-objects", "Commute objects in Korean", ["travel", "daily"], 9, "high", [
    "metro card", "earbuds", "backpack", "umbrella", "water bottle", "phone charger", "mask", "book", "coffee cup",
  ]),
  grid("cafe-orders-nouns", "Café order nouns in Korean", ["cafe", "food"], 9, "high", [
    "americano", "latte", "cold brew", "croissant", "bagel", "scone", "whipped cream", "syrup", "ice",
  ]),
  grid("emotion-faces", "Emotion faces in Korean", ["emotion", "adjective"], 9, "high", [
    "happy", "sad", "angry", "surprised", "scared", "shy", "proud", "tired", "excited",
  ]),
  grid("body-care", "Body care words in Korean", ["beauty", "daily"], 9, "medium", [
    "sunscreen", "moisturizer", "toner", "serum", "mask pack", "lip balm", "cotton pad", "cleanser", "hand cream",
  ]),
  grid("pet-care-verbs-nouns", "Pet care words in Korean", ["pet", "daily"], 9, "medium", [
    "leash", "litter box", "pet food", "treat", "grooming brush", "carrier", "toy", "water bowl", "vet",
  ]),
  grid("hotel-room", "Hotel room words in Korean", ["travel"], 9, "medium", [
    "key card", "minibar", "bathrobe", "slippers", "safe", "hair dryer", "room service", "balcony", "view",
  ]),
  grid("gym-gear", "Gym gear in Korean", ["fitness"], 9, "medium", [
    "dumbbell", "mat", "resistance band", "kettlebell", "treadmill", "jump rope", "foam roller", "gloves", "shaker bottle",
  ]),
  grid("rainy-day-kit", "Rainy day kit in Korean", ["weather", "daily"], 9, "medium", [
    "umbrella", "raincoat", "boots", "towel", "hot pack", "thermos", "socks", "cap", "waterproof bag",
  ]),
  grid("snack-aisle", "Snack aisle words in Korean", ["food", "snack"], 9, "high", [
    "chips", "cookies", "chocolate", "candy", "jelly", "nuts", "rice crackers", "ice cream bar", "pudding",
  ]),
];

export const RESTOCK_LIST_BUNDLES: VocabBundle[] = [
  list("korean-counters-basic", "Korean counters (basic) in Korean", 12, "counter types", ["numbers", "grammar"], "high"),
  list("store-aisles", "Store aisle words in Korean", 12, "supermarket zones", ["shopping"], "high"),
  list("email-signoffs", "Email sign-offs in Korean", 10, "formal→casual", ["work", "phrase"], "medium"),
  list("subway-line-words", "Subway & transfer words in Korean", 12, "station flow", ["travel"], "high"),
  list("cooking-steps", "Cooking step words in Korean", 12, "recipe order", ["food", "verb"], "medium"),
  list("meeting-agenda", "Meeting agenda words in Korean", 10, "meeting flow", ["work"], "medium"),
  list("packing-list-travel", "Travel packing list in Korean", 14, "pack order", ["travel"], "high"),
  list("skincare-steps", "Skincare steps in Korean", 10, "AM/PM order", ["beauty"], "medium"),
  list("complaint-levels", "Complaint soft→strong in Korean", 9, "politeness scale", ["phrase", "grammar"], "high"),
  list("study-session-flow", "Study session flow in Korean", 10, "study cycle", ["school"], "medium"),
  list("first-aid-kit", "First aid kit words in Korean", 12, "kit contents", ["health"], "medium"),
  list("apartment-checklist", "Apartment move-in checklist in Korean", 12, "move-in order", ["home"], "medium"),
];

export const RESTOCK_ANT_BUNDLES: VocabBundle[] = [
  ant("tidy-messy", "Tidy", "Messy", "home", "high"),
  ant("early-late-night", "Early night", "Late night", "habit", "medium"),
  ant("open-secret", "Open", "Secret", "space", "medium"),
  ant("temporary-permanent", "Temporary", "Permanent", "time", "medium"),
  ant("include-exclude", "Include", "Exclude", "set", "medium"),
  ant("accept-reject", "Accept", "Reject", "decision", "high"),
  ant("increase-decrease", "Increase", "Decrease", "change", "high"),
  ant("come-in-go-out", "Come in", "Go out", "motion", "high"),
  ant("borrow-lend", "Borrow", "Lend", "transfer", "high"),
  ant("remember-forget", "Remember", "Forget", "memory", "high"),
  ant("show-up-head-out", "Show up", "Head out", "travel", "high"),
  ant("ask-answer", "Ask", "Answer", "conversation", "medium"),
];

export const RESTOCK_QUIZ_BUNDLES: VocabBundle[] = [
  quiz(
    "put-in-vs-insert",
    "Put in vs insert quiz",
    'Which Korean word means "to put something into" (general)?',
    [
      { hangul: "넣다", romanization: "neota" },
      { hangul: "꽂다", romanization: "kkotda" },
      { hangul: "담다", romanization: "damda" },
      { hangul: "채우다", romanization: "chaeuda" },
    ],
    1,
    ["verbs"],
    "Put in vs plug in vs put into a container vs fill",
  ),
  quiz(
    "slice-vs-cut",
    "Slice vs cut quiz",
    'Which Korean word means "to slice / chop (food)"?',
    [
      { hangul: "자르다", romanization: "jareuda" },
      { hangul: "썰다", romanization: "sseolda" },
      { hangul: "찢다", romanization: "jjitda" },
      { hangul: "깨다", romanization: "kkaeda" },
    ],
    2,
    ["verbs", "food"],
    "Cut vs slice food vs tear vs break",
  ),
  quiz(
    "borrow-vs-lend-q",
    "Borrow vs lend quiz",
    'Which Korean word means "to lend / let someone borrow"?',
    [
      { hangul: "빌리다", romanization: "billida" },
      { hangul: "빌려주다", romanization: "billyeojuda" },
      { hangul: "주다", romanization: "juda" },
      { hangul: "받다", romanization: "batda" },
    ],
    2,
    ["verbs"],
    "Borrow vs lend vs give vs receive",
  ),
  quiz(
    "wear-vs-put-on",
    "Wear clothes quiz",
    'Which Korean word means "to wear (clothes on the body)"?',
    [
      { hangul: "신다", romanization: "sinda" },
      { hangul: "쓰다", romanization: "sseuda" },
      { hangul: "입다", romanization: "ipda" },
      { hangul: "끼다", romanization: "kkida" },
    ],
    3,
    ["verbs"],
    "Wear shoes vs wear hat vs wear clothes vs wear ring",
  ),
  quiz(
    "hear-listen-focus",
    "Listen carefully quiz",
    'Which Korean word means "to listen carefully / pay attention"?',
    [
      { hangul: "듣다", romanization: "deutda" },
      { hangul: "경청하다", romanization: "gyeongcheonghada" },
      { hangul: "들리다", romanization: "deullida" },
      { hangul: "말하다", romanization: "malhada" },
    ],
    2,
    ["verbs"],
    "Hear vs listen carefully vs be heard vs speak",
  ),
  quiz(
    "meet-vs-see-person",
    "Meet someone quiz",
    'Which Korean word means "to meet (someone)"?',
    [
      { hangul: "보다", romanization: "boda" },
      { hangul: "만나다", romanization: "mannada" },
      { hangul: "찾다", romanization: "chatda" },
      { hangul: "부르다", romanization: "bureuda" },
    ],
    2,
    ["verbs"],
    "See vs meet vs find vs call",
  ),
  quiz(
    "close-vs-turn-off",
    "Close vs turn off quiz",
    'Which Korean word means "to turn off (a device/light)"?',
    [
      { hangul: "닫다", romanization: "datda" },
      { hangul: "끄다", romanization: "kkeuda" },
      { hangul: "열다", romanization: "yeolda" },
      { hangul: "켜다", romanization: "kyeoda" },
    ],
    2,
    ["verbs"],
    "Close vs turn off vs open vs turn on",
  ),
  quiz(
    "bring-vs-take",
    "Bring vs take quiz",
    'Which Korean word means "to bring (toward here)"?',
    [
      { hangul: "가져가다", romanization: "gajyeogada" },
      { hangul: "가져오다", romanization: "gajyeooda" },
      { hangul: "보내다", romanization: "bonaeda" },
      { hangul: "남기다", romanization: "namgida" },
    ],
    2,
    ["verbs"],
    "Take away vs bring vs send vs leave behind",
  ),
  quiz(
    "wash-vs-rinse",
    "Wash vs rinse quiz",
    'Which Korean word means "to wash (dishes/laundry)"?',
    [
      { hangul: "닦다", romanization: "dakda" },
      { hangul: "씻다", romanization: "ssitda" },
      { hangul: "헹구다", romanization: "hengguda" },
      { hangul: "적시다", romanization: "jeoksida" },
    ],
    2,
    ["verbs", "home"],
    "Wipe vs wash vs rinse vs wet",
  ),
  quiz(
    "remember-vs-memorize",
    "Remember vs memorize quiz",
    'Which Korean word means "to memorize / learn by heart"?',
    [
      { hangul: "기억하다", romanization: "gieokhada" },
      { hangul: "외우다", romanization: "oeuda" },
      { hangul: "생각하다", romanization: "saenggakhada" },
      { hangul: "알다", romanization: "alda" },
    ],
    2,
    ["verbs", "study"],
    "Remember vs memorize vs think vs know",
  ),
  quiz(
    "pay-vs-buy",
    "Pay vs buy quiz",
    'Which Korean word means "to pay (money)"?',
    [
      { hangul: "사다", romanization: "sada" },
      { hangul: "내다", romanization: "naeda" },
      { hangul: "팔다", romanization: "palda" },
      { hangul: "고르다", romanization: "goreuda" },
    ],
    2,
    ["verbs", "money"],
    "Buy vs pay vs sell vs choose",
  ),
  quiz(
    "fix-vs-fix",
    "Fix vs form quiz",
    'Which Korean word means "to fix / repair"?',
    [
      { hangul: "만들다", romanization: "mandeulda" },
      { hangul: "고치다", romanization: "gochida" },
      { hangul: "바꾸다", romanization: "bakkuda" },
      { hangul: "정리하다", romanization: "jeongnihada" },
    ],
    2,
    ["verbs"],
    "Make vs fix vs change vs organize",
  ),
];

export const RESTOCK_PHRASE_BUNDLES: VocabBundle[] = [
  phrase("rain-check", "Rain check phrases in Korean", [
    L("다음에 해요", "daeume haeyo", "Let's do it next time"),
    L("오늘은 힘들 것 같아요", "oneureun himdeul geot gatayo", "Today might be hard"),
    L("비 와서요", "bi waseoyo", "Because of the rain"),
    L("일정 미룰까요?", "iljeong mirulkkayo?", "Shall we postpone?"),
    L("다른 날 어때요?", "dareun nal eottaeyo?", "How about another day?"),
    L("죄송해요 갑작스럽게", "joesonghaeyo gapjakseureopge", "Sorry for the short notice"),
    L("괜찮으시면요", "gwaenchaneusimyeonyo", "If you're okay with it…"),
    L("다시 연락할게요", "dasi yeollakhalgeyo", "I'll contact you again"),
  ], ["plans"]),
  phrase("food-delivery-chat", "Food delivery chat phrases in Korean", [
    L("배달 가능해요?", "baedal ganeunghaeyo?", "Do you deliver?"),
    L("문 앞에 놓아 주세요", "mun ape noa juseyo", "Leave it at the door"),
    L("벨 누르지 마세요", "bel nureuji maseyo", "Please don't ring the bell"),
    L("도착했어요", "dochakhaesseoyo", "I've arrived"),
    L("영수증 필요 없어요", "yeongsujeung piryo eopseoyo", "No receipt needed"),
    L("수저 빼 주세요", "sujeo ppae juseyo", "No utensils please"),
    L("덜 맵게 해 주세요", "deol maepge hae juseyo", "Make it less spicy"),
    L("예상 시간 얼마예요?", "yesang sigan eolmayeyo?", "What's the ETA?"),
  ], ["food", "app"]),
  phrase("group-chat", "Group chat phrases in Korean", [
    L("읽씹 미안", "ilkssip mian", "Sorry I left you on read"),
    L("단톡에 올려줘", "dantoge ollyeojwo", "Post it in the group chat"),
    L("투표하자", "tupiohaja", "Let's vote"),
    L("나 빠질게", "na ppajilge", "I'm dropping out"),
    L("일정 확정됐어?", "iljeong hwakjeong dwaesseo?", "Is the schedule locked?"),
    L("장소 공유해줘", "jangso gongyuhaejwo", "Share the location"),
    L("지각할 듯", "jigakhal deut", "I might be late"),
    L("취소 미안", "chwiso mian", "Sorry for canceling"),
  ], ["chat"]),
  phrase("apt-neighbor-chat", "Apartment neighbor phrases in Korean", [
    L("층간소음 조심해요", "cheunggansoeum josimhaeyo", "Please mind the noise"),
    L("택배 맡겼어요", "taekbae matgyeosseoyo", "I left a package with you"),
    L("관리비 냈나요?", "gwanribi naennayo?", "Did you pay maintenance?"),
    L("엘리베이터 고장이에요", "ellibeiteo gojangieyo", "The elevator is broken"),
    L("분리수거 날이에요", "bunrisugeo narieyo", "It's recycling day"),
    L("비밀번호 바꿨어요", "bimilbeonho bakkwosseoyo", "I changed the door code"),
    L("수도 끊겼어요", "sudo kkeunggyeosseoyo", "The water is out"),
    L("도와주실 수 있어요?", "dowajusil su isseoyo?", "Could you help me?"),
  ], ["home"]),
  phrase("soft-no", "Soft no phrases in Korean", [
    L("이번에는 힘들 것 같아요", "ibeoneun himdeul geot gatayo", "This time might be hard"),
    L("마음이 좀 복잡해요", "maeumi jom bokjaphaeyo", "I'm a bit conflicted"),
    L("다음에 꼭요", "daeume kkogyo", "Definitely next time"),
    L("지금은 여유가 없어요", "jigeumeun yeoyuga eopseoyo", "I don't have bandwidth now"),
    L("다른 분께 부탁드려도 될까요?", "dareun bunkke butakdeuryeodo doelkkayo?", "Could someone else take it?"),
    L("제 선에서 어려워요", "je seonese eoryeowoyo", "It's beyond what I can do"),
    L("조금만 생각해 볼게요", "jogeumman saenggakhae bolgeyo", "Let me think a bit"),
    L("그건 좀 곤란해요", "geugeon jom gollanhaeyo", "That's a bit difficult"),
  ], ["polite"]),
  phrase("celebration", "Celebration phrases in Korean", [
    L("축하해요", "chukahaeyo", "Congratulations"),
    L("생일 축하해요", "saengil chukahaeyo", "Happy birthday"),
    L("건배해요", "geonbaehaeyo", "Cheers"),
    L("오늘 기념일이에요", "oneul ginyeomirieyo", "Today's an anniversary"),
    L("케이크 자를까요?", "keikeu jareulkkayo?", "Shall we cut the cake?"),
    L("선물 있어요", "seonmul isseoyo", "I have a gift"),
    L("사진 찍어요", "sajin jjigeoyo", "Let's take a photo"),
    L("즐거웠어요", "jeulgeowosseoyo", "That was fun"),
  ], ["social"]),
  phrase("tech-support", "Tech support phrases in Korean", [
    L("재부팅 해 봤어요", "jaebuting hae bwasseoyo", "I tried rebooting"),
    L("와이파이 안 돼요", "waipai an dwaeyo", "Wi-Fi isn't working"),
    L("앱이 강제 종료돼요", "aebi gangje jongryodwaeyo", "The app keeps crashing"),
    L("업데이트가 필요해요", "eopdeiteuga piryohaeyo", "It needs an update"),
    L("로그인이 안 돼요", "rogeuini an dwaeyo", "I can't log in"),
    L("화면이 멈춰요", "hwamyeoni meomchwoyo", "The screen freezes"),
    L("배터리가 빨리 닳아요", "baeteoriga ppalli darahayo", "Battery drains fast"),
    L("초기화해도 될까요?", "chogihwahaeedo doelkkayo?", "Is a factory reset okay?"),
  ], ["tech"]),
  phrase("desk-neighbor-chat", "Desk neighbor small talk in Korean", [
    L("점심 뭐 드실래요?", "jeomsim mwo deusillaeyo?", "What will you have for lunch?"),
    L("커피 하실래요?", "keopi hasillaeyo?", "Want coffee?"),
    L("오늘 바쁜가요?", "oneul bappeungayo?", "Busy today?"),
    L("주말 잘 보내세요", "jumal jal bonaeseyo", "Have a good weekend"),
    L("회의 곧 시작해요", "hoeui got sijakhaeyo", "The meeting starts soon"),
    L("자료 공유할게요", "jaryo gongyuhalgeyo", "I'll share the file"),
    L("피드백 부탁드려요", "pideubaek butakdeuryeoyo", "Feedback please"),
    L("수고하셨어요", "sugohasyeosseoyo", "Thanks for your hard work"),
  ], ["work"]),
];

export const RESTOCK_CONCEPT_BUNDLES: VocabBundle[] = [
  concept("already-yet-still", "Already / yet / still in Korean", [
    C("already", "벌써", "beolsseo", "clock shows early finish; baby capybara surprised"),
    C("not yet", "아직 안", "ajik an", "pink otter waiting; empty plate"),
    C("still", "아직", "ajik", "capybara still working at desk"),
    C("anymore", "더 이상", "deo isang", "otter shaking head; crossed-out habit"),
  ], ["grammar"]),
  concept("must-should-can", "Must / should / can in Korean", [
    C("must", "해야 해요", "haeya haeyo", "capybara with checklist — required"),
    C("should", "하는 게 좋아요", "haneun ge joayo", "otter giving soft advice"),
    C("can", "할 수 있어요", "hal su isseoyo", "capybara thumbs up able"),
    C("can't", "못해요", "mothaeyo", "otter blocked by little barrier"),
  ], ["grammar"]),
  concept("try-it-out", "Try it out grammar in Korean", [
    C("do it", "해요", "haeyo", "otter just doing the task"),
    C("try doing", "해 봐요", "hae bwayo", "capybara testing carefully"),
    C("have you tried?", "해 봤어요?", "hae bwasseoyo?", "otter asking with ?"),
    C("I'll try", "해 볼게요", "hae bolgeyo", "capybara determined blue hat"),
  ], ["grammar"]),
  concept("seem-feel-look", "Seem / feel / look in Korean", [
    C("seems like", "것 같아요", "geot gatayo", "otter guessing with thought bubble"),
    C("feels…", "느껴져요", "neukkyeojyeoyo", "capybara hand on heart"),
    C("looks…", "보여요", "boyeoyo", "otter pointing at appearance"),
    C("sounds like", "들려요", "deullyeoyo", "capybara ear perk"),
  ], ["grammar"]),
  concept("want-hope-wish", "Want / hope / wish in Korean", [
    C("want", "싶어요", "sipeoyo", "otter reaching for snack"),
    C("hope", "바라요", "barayo", "capybara gentle prayer paws"),
    C("I wish", "했으면 좋겠어요", "haesseumyeon jokesseoyo", "otter wishing on star"),
    C("I'd like to", "하고 싶은데요", "hago sipeundeyo", "capybara polite request"),
  ], ["grammar"]),
  concept("before-after-while", "Before / after / while in Korean", [
    C("before", "전에", "jeone", "timeline left; capybara early"),
    C("after", "후에", "hue", "timeline right; otter later"),
    C("while", "면서", "myeonseo", "otter multitasking two actions"),
    C("as soon as", "자마자", "jamaja", "capybara instantaneous zap"),
  ], ["grammar"]),
  concept("too-only-even", "Too / only / even in Korean", [
    C("too / also", "도", "do", "two otters both included"),
    C("only", "만", "man", "one tiny item highlighted"),
    C("even", "조차", "jocha", "surprising last straw prop"),
    C("from A to B", "부터…까지", "buteo…kkaji", "path A→B with capybara walking"),
  ], ["grammar"]),
  concept("give-receive-favor", "Give / receive / favor in Korean", [
    C("give", "주다", "juda", "capybara handing gift"),
    C("receive", "받다", "batda", "otter receiving gift"),
    C("do for me", "해 주세요", "hae juseyo", "otter polite request bow"),
    C("I'll do it for you", "해 줄게요", "hae julgeyo", "capybara helping pose"),
  ], ["grammar"]),
];

export const RESTOCK_SIM_BUNDLES: VocabBundle[] = [
  similar("put-담다-넣다", "Put in (container)", "Put in (general)", "담다", "넣다", "damda", "neota", "into a bowl/bag", "into a space/slot", "verbs"),
  similar("cut-자르다-썰다", "Cut", "Slice (food)", "자르다", "썰다", "jareuda", "sseolda", "general cut/scissors", "chop food with knife", "food"),
  similar("wash-씻다-닦다", "Wash", "Wipe/clean", "씻다", "닦다", "ssitda", "dakda", "with water", "wipe surface dry/clean", "home"),
  similar("see-보다-구경하다", "See/watch", "Sightsee", "보다", "구경하다", "boda", "gugyeonghada", "look/watch generally", "look around for fun", "travel"),
  similar("ask-묻다-부탁하다", "Ask (question)", "Ask a favor", "묻다", "부탁하다", "mutda", "butakhada", "ask for info", "request help", "social"),
  similar("start-시작하다-출발하다", "Start", "Depart", "시작하다", "출발하다", "sijakhada", "chulbalhada", "begin an activity", "leave / set off", "travel"),
  similar("end-끝내다-마치다", "Finish", "Conclude", "끝내다", "마치다", "kkeunnaeda", "machida", "stop/finish something", "bring to a close (more formal)", "work"),
  similar("help-도와주다-돕다", "Help (give)", "Help (verb)", "도와주다", "돕다", "dowajuda", "dopda", "help someone (favor feel)", "help (base verb)", "social"),
];

export const RESTOCK_TOPIK_BUNDLES: VocabBundle[] = [
  topik("apologies-upgrade", "Apologies: TOPIK I → II", [
    T("sorry", "미안해요", "mianhaeyo", "죄송합니다", "joesonghamnida"),
    T("really sorry", "정말 미안해요", "jeongmal mianhaeyo", "진심으로 사과드립니다", "jinsimeuro sagwadeurimnida"),
    T("my bad", "제가 실수했어요", "jega silsuhaesseoyo", "제 불찰입니다", "je bulcharimnida"),
    T("won't happen again", "다시는 안 할게요", "dasineun an halgeyo", "재발하지 않도록 하겠습니다", "jaebalhaji antorok hagetseumnida"),
    T("please understand", "이해해 주세요", "ihaehae juseyo", "양해 부탁드립니다", "yanghae butakdeurimnida"),
    T("excuse me", "잠시만요", "jamsimanyo", "실례합니다", "sillyehamnida"),
  ], ["polite"]),
  topik("requests-upgrade", "Requests: TOPIK I → II", [
    T("please help", "도와 주세요", "dowa juseyo", "도움 부탁드립니다", "doum butakdeurimnida"),
    T("please wait", "기다려 주세요", "gidaryeo juseyo", "잠시만 기다려 주시겠습니까", "jamsiman gidaryeo jusigetseummikka"),
    T("please check", "확인해 주세요", "hwaginhae juseyo", "검토 부탁드립니다", "geomto butakdeurimnida"),
    T("please send", "보내 주세요", "bonae juseyo", "송부 부탁드립니다", "songbu butakdeurimnida"),
    T("please reply", "답장 주세요", "dapjang juseyo", "회신 부탁드립니다", "hoesin butakdeurimnida"),
    T("please join", "같이 가요", "gachi gayo", "참석 부탁드립니다", "chamseok butakdeurimnida"),
  ], ["work"]),
  topik("opinions-upgrade2", "Opinions: TOPIK I → II", [
    T("I think", "같아요", "gatayo", "것으로 보입니다", "geoseuro boimnida"),
    T("in my view", "제 생각엔", "je saenggagen", "제 견해로는", "je gyeonhaeroneun"),
    T("I agree", "동의해요", "donguihaeyo", "동의합니다", "donguihamnida"),
    T("I disagree", "반대예요", "bandaeyeyo", "동의하기 어렵습니다", "donguihagi eoryeopseumnida"),
    T("maybe", "아마요", "amayo", "아마도 ~일 것입니다", "amado ~il geosimnida"),
    T("for example", "예를 들면", "yereul deulmyeon", "예컨대", "yeukondae"),
  ], ["opinion"]),
  topik("plans-upgrade", "Plans: TOPIK I → II", [
    T("I'm going to", "할 거예요", "hal geoyeyo", "할 예정입니다", "hal yejeongimnida"),
    T("I plan to", "계획이에요", "gyehoeegieyo", "계획하고 있습니다", "gyehoekago itseumnida"),
    T("I decided", "정했어요", "jeonghaesseoyo", "결정했습니다", "gyeoljeonghaetseumnida"),
    T("I'll try", "해 볼게요", "hae bolgeyo", "시도해 보겠습니다", "sidohae bogetseumnida"),
    T("cancel", "취소할게요", "chwisohalgeyo", "취소하고자 합니다", "chwisohagoja hamnida"),
    T("reschedule", "미룰게요", "mirulgeyo", "일정을 조정하겠습니다", "iljeongeul jojeonghagetseumnida"),
  ], ["plans"]),
  topik("mood-check-upgrade", "Mood check: TOPIK I → II", [
    T("I'm tired", "피곤해요", "pigonhaeyo", "피로합니다", "pirogamnida"),
    T("I'm busy", "바빠요", "bappayo", "일정이 빠듯합니다", "iljeongi ppadeuthamnida"),
    T("I'm okay", "괜찮아요", "gwaenchanayo", "문제없습니다", "munjeeopseumnida"),
    T("I'm worried", "걱정돼요", "geokjeongdwaeyo", "우려됩니다", "uryodoemnida"),
    T("I'm glad", "기뻐요", "gippeoyo", "기쁩니다", "gippeumnida"),
    T("I'm sorry to hear", "안타까워요", "antakkawoyo", "유감입니다", "yugamimnida"),
  ], ["emotion"]),
  topik("shopping-upgrade", "Shopping: TOPIK I → II", [
    T("how much", "얼마예요?", "eolmayeyo?", "가격이 어떻게 됩니까?", "gagyeogi eotteoke doemnikka?"),
    T("discount", "할인돼요?", "harindwaeyo?", "할인 적용이 가능한가요?", "harin jeogyongi ganeunghangayo?"),
    T("too expensive", "너무 비싸요", "neomu bissayo", "예산보다 높습니다", "yesanboda nopseumnida"),
    T("I'll take this", "이걸로 할게요", "igeollo halgeyo", "이것으로 하겠습니다", "igeoseuro hagetseumnida"),
    T("receipt please", "영수증 주세요", "yeongsujeung juseyo", "영수증 부탁드립니다", "yeongsujeung butakdeurimnida"),
    T("can I return", "환불돼요?", "hwanbuldwaeyo?", "반품이 가능한지요?", "banpumi ganeunghanjiyo?"),
  ], ["shopping"]),
  topik("travel-upgrade2", "Travel: TOPIK I → II", [
    T("where's…", "어디예요?", "eodiyeyo?", "어디에 있습니까?", "eodie itseumnikka?"),
    T("how long", "얼마나 걸려요?", "eolmana geollyeoyo?", "소요 시간이 어떻게 됩니까?", "soyo sigani eotteoke doemnikka?"),
    T("ticket please", "표 주세요", "pyo juseyo", "승차권 부탁드립니다", "seungchagwon butakdeurimnida"),
    T("I'm lost", "길을 잃었어요", "gireul ireosseoyo", "길을 잃었습니다", "gireul ireotseumnida"),
    T("platform", "몇 번 타요?", "myeot beon tayo?", "몇 번 승강장입니까?", "myeot beon seunggangjangimnikka?"),
    T("reservation", "예약했어요", "yeyakhaesseoyo", "예약이 되어 있습니다", "yeyagi doeeo itseumnida"),
  ], ["travel"]),
  topik("health-upgrade", "Health: TOPIK I → II", [
    T("I feel sick", "아파요", "apayo", "몸이 좋지 않습니다", "momi jochi anseumnida"),
    T("headache", "머리 아파요", "meori apayo", "두통이 있습니다", "dutongi itseumnida"),
    T("medicine", "약 먹었어요", "yak meogeosseoyo", "복용했습니다", "bogyonghaetseumnida"),
    T("appointment", "진료 예약이요", "jillyo yeyagiyo", "진료 예약을 요청합니다", "jillyo yeyageul yocheonghamnida"),
    T("allergy", "알레르기 있어요", "allereugi isseoyo", "알레르기가 있습니다", "allereugiga itseumnida"),
    T("rest", "쉬어야 해요", "swieoya haeyo", "휴식이 필요합니다", "hyusigi piryohamnida"),
  ], ["health"]),
];

export const CUTE_RESTOCK_WAVE_BUNDLES: VocabBundle[] = [
  ...CUTE_CAST_BUNDLES,
  ...RESTOCK_GRID_BUNDLES,
  ...RESTOCK_LIST_BUNDLES,
  ...RESTOCK_ANT_BUNDLES,
  ...RESTOCK_QUIZ_BUNDLES,
  ...RESTOCK_PHRASE_BUNDLES,
  ...RESTOCK_CONCEPT_BUNDLES,
  ...RESTOCK_SIM_BUNDLES,
  ...RESTOCK_TOPIK_BUNDLES,
];

export const CUTE_RESTOCK_WAVE_CUTE = CUTE_CAST_BUNDLES;
export const CUTE_RESTOCK_WAVE_GRID = RESTOCK_GRID_BUNDLES;
export const CUTE_RESTOCK_WAVE_LIST = RESTOCK_LIST_BUNDLES;
export const CUTE_RESTOCK_WAVE_ANT = RESTOCK_ANT_BUNDLES;
export const CUTE_RESTOCK_WAVE_QUIZ = RESTOCK_QUIZ_BUNDLES;
export const CUTE_RESTOCK_WAVE_PHRASE = RESTOCK_PHRASE_BUNDLES;
export const CUTE_RESTOCK_WAVE_CONCEPT = RESTOCK_CONCEPT_BUNDLES;
export const CUTE_RESTOCK_WAVE_SIM = RESTOCK_SIM_BUNDLES;
export const CUTE_RESTOCK_WAVE_TOPIK = RESTOCK_TOPIK_BUNDLES;
