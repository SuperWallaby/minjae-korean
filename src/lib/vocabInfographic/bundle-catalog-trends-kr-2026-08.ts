/**
 * Monthly Pinterest Trends → Korean vocab pins (kajakorean formats).
 * Aug 2026 US All Trends angles × format rotation. Target ~100 bundles.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";
type PhraseLine = { hangul: string; romanization: string; english: string };
type ConceptRow = {
  english: string;
  hangul: string;
  romanization: string;
  visual: string;
};
type QuizOption = { hangul: string; romanization: string };
type CuteCell = {
  hangul: string;
  romanization: string;
  english: string;
  pose: string;
};
type CompoundPart = {
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
  similarPair?: {
    leftEnglish: string;
    rightEnglish: string;
    leftHangul: string;
    rightHangul: string;
    leftRom: string;
    rightRom: string;
    leftNuance: string;
    rightNuance: string;
  };
  quiz?: {
    badge?: string;
    direction?: string;
    question: string;
    options: [QuizOption, QuizOption, QuizOption, QuizOption];
    correctIndex: 1 | 2 | 3 | 4;
  };
  cuteCast?: "capybara" | "otter";
  cuteCells?: CuteCell[];
  compoundWord?: {
    left: CompoundPart;
    right: CompoundPart;
    resultHangul: string;
    resultRomanization: string;
    resultMeaning: string;
  };
};

const TREND = "trends-2026-08";
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
const Cell = (
  hangul: string,
  romanization: string,
  english: string,
  pose: string,
): CuteCell => ({ hangul, romanization, english, pose });
const part = (
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): CompoundPart => ({ hangul, romanization, english, icon });

function ant(slug: string, left: string, right: string, theme: string): VocabBundle {
  return {
    id: `tr-ant-${slug}`,
    format: "antonym_split",
    title: `${left} vs ${right}`,
    count: 2,
    fit: `Trend antonym — ${theme}`,
    priority: "high",
    tags: ["antonym", theme, TREND],
  };
}

function list(
  slug: string,
  title: string,
  count: number,
  orderKey: string,
  tags: string[],
  preview?: string[],
): VocabBundle {
  return {
    id: `tr-list-${slug}`,
    format: "super_list",
    title,
    count,
    fit: `Trend list — ${orderKey}`,
    priority: "high",
    tags: [...tags, TREND],
    preview,
  };
}

function grid(
  slug: string,
  title: string,
  preview: string[],
  tags: string[],
): VocabBundle {
  return {
    id: `tr-grid-${slug}`,
    format: "grid_cluster",
    title,
    count: 9,
    fit: "Trend 3×3 grid",
    priority: "high",
    tags: [...tags, TREND],
    preview,
  };
}

function phrase(
  slug: string,
  title: string,
  lines: PhraseLine[],
  tags: string[],
): VocabBundle {
  return {
    id: `tr-phrase-${slug}`,
    format: "phrase_stack",
    title,
    count: lines.length,
    fit: `Trend phrase stack — ${lines.length} lines`,
    priority: "high",
    tags: ["phrase", "spoken", ...tags, TREND],
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
    id: `tr-concept-${slug}`,
    format: "concept_rows",
    title,
    count: rows.length,
    fit: "Trend concept panels",
    priority: "high",
    tags: ["concept", ...tags, TREND],
    conceptRows: rows,
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
    id: `tr-sim-${slug}`,
    format: "similar_split",
    title: `${leftEnglish} vs ${rightEnglish}`,
    count: 2,
    fit: `Trend similar — ${theme}`,
    priority: "high",
    tags: ["similar", theme, TREND],
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
): VocabBundle {
  return {
    id: `tr-quiz-${slug}`,
    format: "quiz_comment",
    title,
    count: 4,
    fit: "Trend 4-choice quiz",
    priority: "high",
    tags: ["quiz", ...tags, TREND],
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
  if (cells.length !== 9) throw new Error(`tr-cute-${slug} needs 9`);
  return {
    id: `tr-cute-${slug}`,
    format: "cute_cast",
    title,
    count: 9,
    fit:
      cast === "otter"
        ? "Trend cute grid — ALL pink otter"
        : "Trend cute grid — ALL blue-hat capybara",
    priority: "high",
    tags: ["cute", "mascot", cast, ...tags, TREND],
    cuteCast: cast,
    cuteCells: cells,
    preview: cells.map((c) => c.english),
  };
}

function cmp(
  slug: string,
  left: CompoundPart,
  right: CompoundPart,
  resultHangul: string,
  resultRomanization: string,
  resultMeaning: string,
): VocabBundle {
  return {
    id: `tr-cmp-${slug}`,
    format: "compound_word",
    title: `${left.hangul} + ${right.hangul} = ${resultHangul}`,
    count: 3,
    fit: `Trend compound — ${resultHangul}`,
    priority: "high",
    tags: ["compound", TREND],
    preview: [left.hangul, right.hangul, resultHangul],
    compoundWord: {
      left,
      right,
      resultHangul,
      resultRomanization,
      resultMeaning,
    },
  };
}

/* ── Trends angles (US All, Aug 2026) ─────────────────────────── */

const ANT: VocabBundle[] = [
  ant("hot-iced-coffee", "Hot coffee", "Iced coffee", "cafe-drinks"),
  ant("summer-fall", "Summer", "Fall", "season"),
  ant("open-closed-store", "Open", "Closed", "back-to-school"),
  ant("day-night-party", "Day party", "Night party", "halloween"),
  ant("sweet-savory-bowl", "Sweet", "Savory", "yogurt-bowl"),
  ant("indoor-outdoor-fall", "Indoor", "Outdoor", "fall-activities"),
  ant("cheap-fancy-gift", "Cheap gift", "Fancy gift", "christmas"),
  ant("quiet-loud-cafe", "Quiet cafe", "Loud cafe", "starbucks"),
  ant("early-late-class", "Early class", "Late class", "back-to-school"),
  ant("fresh-stale-snack", "Fresh", "Stale", "snacks"),
  ant("light-dark-nails", "Light nails", "Dark nails", "august-nails"),
  ant("big-small-bag", "Big bag", "Small bag", "backpacks"),
];

const LIST: VocabBundle[] = [
  list("nail-colors", "Nail colors in Korean", 10, "red→chrome", ["beauty", "nails"], [
    "red", "pink", "nude", "white", "black", "blue", "green", "purple", "gold", "silver",
  ]),
  list("school-bag", "School bag words in Korean", 9, "bag→bottle", ["school"], [
    "backpack", "pencil", "notebook", "eraser", "ruler", "scissors", "glue", "lunchbox", "water bottle",
  ]),
  list("halloween", "Halloween words in Korean", 10, "pumpkin→treat", ["halloween"], [
    "pumpkin", "candy", "costume", "ghost", "witch", "spider", "bat", "skeleton", "candy bag", "scary",
  ]),
  list("thanksgiving-foods", "Thanksgiving foods in Korean", 10, "turkey→pie", ["thanksgiving"], [
    "turkey", "gravy", "mashed potatoes", "stuffing", "cranberry", "pie", "corn", "rolls", "salad", "sweet potato",
  ]),
  list("christmas", "Christmas words in Korean", 9, "tree→bell", ["christmas"], [
    "tree", "gift", "snow", "Santa", "stocking", "lights", "ornament", "cookie", "bell",
  ]),
  list("cafe-drinks", "Cafe drinks in Korean", 10, "espresso→frappe", ["cafe"], [
    "espresso", "americano", "latte", "cappuccino", "matcha", "mocha", "lemonade", "smoothie", "iced tea", "hot chocolate",
  ]),
  list("fall-flowers", "Fall flower words in Korean", 9, "rose→garden", ["flowers"], [
    "rose", "sunflower", "daisy", "tulip", "leaf", "vase", "bouquet", "petal", "garden",
  ]),
  list("bags", "Bag words in Korean", 10, "backpack→zipper", ["shopping"], [
    "backpack", "handbag", "tote", "wallet", "purse", "suitcase", "duffel", "pouch", "strap", "zipper",
  ]),
  list("snacks", "Snack words in Korean", 9, "chips→juice", ["food"], [
    "chips", "popcorn", "cookie", "candy", "pretzel", "nuts", "fruit", "juice", "sandwich",
  ]),
  list("fall-clothes", "Fall clothes in Korean", 10, "sweater→boots", ["fashion", "fall"], [
    "sweater", "jacket", "scarf", "boots", "beanie", "coat", "hoodie", "jeans", "socks", "gloves",
  ]),
  list("august-calendar", "August calendar words in Korean", 9, "month→weekend", ["calendar"], [
    "August", "weekday", "weekend", "holiday", "plan", "reminder", "birthday", "deadline", "vacation",
  ]),
  list("party-decor", "Party decoration words in Korean", 9, "balloon→banner", ["halloween", "party"], [
    "balloon", "banner", "candle", "streamer", "confetti", "tablecloth", "plate", "cup", "photo booth",
  ]),
];

const GRID: VocabBundle[] = [
  grid("school-supplies", "School supplies in Korean", [
    "pencil", "pen", "eraser", "notebook", "highlighter", "stapler", "folder", "calculator", "glue stick",
  ], ["school"]),
  grid("nail-tools", "Nail tools in Korean", [
    "nail polish", "file", "clipper", "brush", "remover", "base coat", "top coat", "glitter", "stickers",
  ], ["beauty"]),
  grid("pumpkin-spice", "Pumpkin season words in Korean", [
    "pumpkin", "cinnamon", "latte", "pie", "candle", "orange", "spice", "cozy", "scarf",
  ], ["fall"]),
  grid("craft-studio", "Craft studio words in Korean", [
    "paint", "brush", "clay", "pottery", "glue", "scissors", "paper", "palette", "apron",
  ], ["diy"]),
  grid("breakfast-bowl", "Breakfast bowl words in Korean", [
    "yogurt", "granola", "honey", "banana", "berry", "oats", "milk", "nuts", "bowl",
  ], ["food"]),
  grid("winter-prep", "Winter prep words in Korean", [
    "heater", "blanket", "hot pack", "boots", "coat", "gloves", "humidifier", "tea", "socks",
  ], ["season"]),
  grid("gift-wrap", "Gift wrap words in Korean", [
    "gift", "box", "ribbon", "tape", "card", "wrapping paper", "bow", "tag", "bag",
  ], ["christmas"]),
  grid("costume-kit", "Costume kit words in Korean", [
    "mask", "wig", "cape", "makeup", "wand", "hat", "gloves", "boots", "prop",
  ], ["halloween"]),
];

const PHRASE: VocabBundle[] = [
  phrase("cafe-order", "Cafe order phrases in Korean", [
    L("아메리카노 주세요", "amerikano juseyo", "Americano please"),
    L("아이스로요", "aiseuroyo", "Iced please"),
    L("덜 달게 해주세요", "deol dalge haejuseyo", "Less sweet please"),
    L("오트 밀크로요", "oteu milkeuroyo", "With oat milk"),
    L("포장이요", "pojangiyo", "To go"),
    L("여기서 마실게요", "yeogiseo masilgeyo", "For here"),
    L("샷 추가해 주세요", "syat chugahae juseyo", "Extra shot please"),
    L("휘핑 빼 주세요", "hwiping ppae juseyo", "No whipped cream"),
  ], ["cafe"]),
  phrase("fall-hangout", "Fall hangout phrases in Korean", [
    L("단풍 보러 갈래?", "danpung boreo gallae?", "Want to see fall leaves?"),
    L("날씨 쌀쌀하다", "nalssi ssalssalhada", "It's chilly"),
    L("핫초코 땡긴다", "hatchoko ttaengginda", "Craving hot cocoa"),
    L("산책하기 좋다", "sanchaekhagi jota", "Nice for a walk"),
    L("사진 찍자", "sajin jjikja", "Let's take a photo"),
    L("저녁에 보자", "jeonyeoge boja", "See you tonight"),
    L("배고프다", "baegopeuda", "I'm hungry"),
    L("집 갈래", "jip gallae", "Wanna go home"),
  ], ["fall"]),
  phrase("halloween-party", "Halloween party phrases in Korean", [
    L("코스튬 뭐야?", "koseutyum mwoya?", "What's your costume?"),
    L("진짜 무섭다", "jinjja museopda", "So scary"),
    L("사탕 주세요", "satang juseyo", "Candy please"),
    L("사진 찍어도 돼?", "sajin jjigeodo dwae?", "Can I take a photo?"),
    L("파티 재밌다", "pati jaemitda", "This party is fun"),
    L("분장 잘했다", "bunjang jalhaetda", "Great makeup"),
    L("같이 가자", "gachi gaja", "Let's go together"),
    L("해피 할로윈!", "haepi halloween!", "Happy Halloween!"),
  ], ["halloween"]),
  phrase("back-to-school", "Back to school phrases in Korean", [
    L("개강이야", "gaegangiya", "Classes start"),
    L("가방 챙겼어?", "gabang chaenggyeosseo?", "Packed your bag?"),
    L("숙제 많네", "sukje manne", "Lots of homework"),
    L("지각할 뻔", "jigakhal ppeon", "Almost late"),
    L("같이 공부하자", "gachi gongbuhaja", "Let's study together"),
    L("시험 언제야?", "siheom eonjeya?", "When's the test?"),
    L("급식 뭐야?", "geupsik mwoya?", "What's for lunch?"),
    L("집에 갈게", "jibe galge", "Heading home"),
  ], ["school"]),
  phrase("gift-thanks", "Gift thank-you phrases in Korean", [
    L("선물 고마워", "seonmul gomawo", "Thanks for the gift"),
    L("마음에 들어", "maeume deureo", "I love it"),
    L("열어봐도 돼?", "yeoreobwado dwae?", "Can I open it?"),
    L("직접 골랐어?", "jikjeop gollasseo?", "Did you pick it yourself?"),
    L("너무 비싸", "neomu bissa", "This is too expensive"),
    L("포장 예쁘다", "pojang yeppeuda", "The wrapping is pretty"),
    L("보답할게", "bodapalge", "I'll return the favor"),
    L("정말 감사해요", "jeongmal gamsahaeyo", "Thank you so much"),
  ], ["christmas"]),
  phrase("pottery-class", "Pottery class phrases in Korean", [
    L("물레 처음이야", "mulle cheoeumiya", "First time on the wheel"),
    L("천천히 해봐", "cheoncheonhi haebwa", "Try slowly"),
    L("손 더러워졌어", "son deoreowojyeosseo", "My hands got dirty"),
    L("예쁘게 나왔다", "yeppeuge nawatda", "It came out pretty"),
    L("말려야 해", "mallyeoya hae", "It needs to dry"),
    L("색 뭘로 할까?", "saek mwollo halkka?", "Which color?"),
    L("조심해", "josimhae", "Be careful"),
    L("완성!", "wanseong!", "Done!"),
  ], ["diy"]),
];

const CONCEPT: VocabBundle[] = [
  concept("open-close-school", "Open vs close at school", [
    C("Open the book", "책을 열다", "chaeg-eul yeolda", "open book"),
    C("Close the book", "책을 닫다", "chaeg-eul datda", "closed book"),
    C("Open the door", "문을 열다", "mun-eul yeolda", "door opening"),
    C("Close the door", "문을 닫다", "mun-eul datda", "closed door"),
  ], ["school"]),
  concept("hot-cold-drinks", "Hot vs cold drinks", [
    C("Hot coffee", "뜨거운 커피", "tteugeoun keopi", "steaming cup"),
    C("Iced coffee", "아이스 커피", "aiseu keopi", "ice cubes cup"),
    C("Hot chocolate", "핫초코", "hatchoko", "cocoa mug"),
    C("Iced tea", "아이스티", "aiseuti", "iced tea glass"),
  ], ["cafe"]),
  concept("put-on-take-off-fall", "Put on vs take off (fall)", [
    C("Put on a coat", "코트를 입다", "koteu-reul ipda", "putting coat on"),
    C("Take off a coat", "코트를 벗다", "koteu-reul beotda", "taking coat off"),
    C("Put on a scarf", "목도리를 하다", "mokdori-reul hada", "wrapping scarf"),
    C("Take off a scarf", "목도리를 풀다", "mokdori-reul pulda", "unwrapping scarf"),
  ], ["fall"]),
  concept("buy-return-gift", "Buy vs return a gift", [
    C("Buy a gift", "선물을 사다", "seonmul-eul sada", "shopping bag"),
    C("Return a gift", "선물을 환불하다", "seonmul-eul hwanbulhada", "return desk"),
    C("Wrap a gift", "선물을 포장하다", "seonmul-eul pojanghada", "wrapping"),
    C("Open a gift", "선물을 뜯다", "seonmul-eul tteutda", "opening box"),
  ], ["christmas"]),
];

const SIM: VocabBundle[] = [
  similar("sneakers-boots", "Sneakers", "Boots", "운동화", "부츠", "undonghwa", "bucheu", "sporty daily", "fall/winter footwear", "shoes"),
  similar("bag-backpack", "Bag", "Backpack", "가방", "백팩", "gabang", "baekpaek", "general bag", "school/travel pack", "school"),
  similar("candy-chocolate", "Candy", "Chocolate", "사탕", "초콜릿", "satang", "chokollit", "hard/soft candy", "cocoa treat", "halloween"),
  similar("pie-cake", "Pie", "Cake", "파이", "케이크", "pai", "keikeu", "filled pastry", "frosted dessert", "thanksgiving"),
  similar("jacket-coat", "Jacket", "Coat", "재킷", "코트", "jaekit", "koteu", "lighter layer", "heavier outerwear", "fall"),
  similar("latte-americano", "Latte", "Americano", "라떼", "아메리카노", "latte", "amerikano", "milky espresso", "espresso + water", "cafe"),
  similar("ghost-monster", "Ghost", "Monster", "유령", "괴물", "yuryeong", "goemul", "spirit sheet", "scary creature", "halloween"),
  similar("gift-souvenir", "Gift", "Souvenir", "선물", "기념품", "seonmul", "ginyeompum", "something you give", "travel keepsake", "christmas"),
];

const QUIZ: VocabBundle[] = [
  quiz("which-drink", "Which drink is this?", "Milky espresso with foam art", [
    { hangul: "라떼", romanization: "latte" },
    { hangul: "에스프레소", romanization: "eseupeureso" },
    { hangul: "녹차", romanization: "nokcha" },
    { hangul: "레모네이드", romanization: "remoneideu" },
  ], 1, ["cafe"]),
  quiz("which-halloween", "Which Halloween word?", "Orange vegetable you carve", [
    { hangul: "호박", romanization: "hobak" },
    { hangul: "사탕", romanization: "satang" },
    { hangul: "유령", romanization: "yuryeong" },
    { hangul: "마녀", romanization: "manyeo" },
  ], 1, ["halloween"]),
  quiz("which-school", "Which school item?", "You wear it on your back", [
    { hangul: "가방", romanization: "gabang" },
    { hangul: "지우개", romanization: "jiugae" },
    { hangul: "자", romanization: "ja" },
    { hangul: "풀", romanization: "pul" },
  ], 1, ["school"]),
  quiz("which-fall", "Which fall word?", "Hot sweet cocoa drink", [
    { hangul: "핫초코", romanization: "hatchoko" },
    { hangul: "아이스", romanization: "aiseu" },
    { hangul: "주스", romanization: "juseu" },
    { hangul: "물", romanization: "mul" },
  ], 1, ["fall"]),
  quiz("which-flower", "Which flower?", "Tall yellow flower", [
    { hangul: "해바라기", romanization: "haebaragi" },
    { hangul: "장미", romanization: "jangmi" },
    { hangul: "튤립", romanization: "tyullip" },
    { hangul: "데이지", romanization: "deiji" },
  ], 1, ["flowers"]),
  quiz("which-snack", "Which snack?", "Fluffy movie theater treat", [
    { hangul: "팝콘", romanization: "papkon" },
    { hangul: "감자칩", romanization: "gamjachip" },
    { hangul: "쿠키", romanization: "kuki" },
    { hangul: "프레첼", romanization: "peurechel" },
  ], 1, ["snacks"]),
];

const CUTE: VocabBundle[] = [
  cute("halloween-night", "Halloween night words in Korean", "capybara", [
    Cell("호박이다", "hobagida", "It's a pumpkin", "hold pumpkin"),
    Cell("사탕 줘", "satang jwo", "Give me candy", "candy beg"),
    Cell("무서워", "museowo", "I'm scared", "hide eyes"),
    Cell("유령이야!", "yuryeongiya!", "A ghost!", "jump scare"),
    Cell("분장하자", "bunjanghaja", "Let's do makeup", "brush face"),
    Cell("코스튬 어때?", "koseutyum eottae?", "How's my costume?", "pose cape"),
    Cell("사진 찍자", "sajin jjikja", "Photo time", "camera pose"),
    Cell("파티 가자", "pati gaja", "Let's party", "dance"),
    Cell("해피 할로윈", "haepi halloween", "Happy Halloween", "wave wand"),
  ], ["halloween"]),
  cute("cafe-run", "Cafe run words in Korean", "otter", [
    Cell("커피 어때?", "keopi eottae?", "How about coffee?", "menu point"),
    Cell("줄 길다", "jul gilda", "Long line", "wait patiently"),
    Cell("주문할게", "jumunhalge", "I'll order", "counter"),
    Cell("아이스로", "aiseuro", "Iced", "ice cub"),
    Cell("달달해", "daldalhae", "So sweet", "happy sip"),
    Cell("자리 있어?", "jari isseo?", "Is there a seat?", "look around"),
    Cell("공부하자", "gongbuhaja", "Let's study", "laptop"),
    Cell("충전기 있어?", "chungjeogi isseo?", "Got a charger?", "cable"),
    Cell("계산할게", "gyesanhalge", "I'll pay", "card tap"),
  ], ["cafe"]),
  cute("fall-walk", "Fall walk words in Korean", "capybara", [
    Cell("바람 선선해", "baram seonseonhae", "Cool breeze", "feel wind"),
    Cell("낙엽이다", "nagyeobida", "Fallen leaves", "kick leaves"),
    Cell("사진 찍자", "sajin jjikja", "Take a photo", "pose"),
    Cell("배고파", "baegopa", "Hungry", "tummy"),
    Cell("핫초코 먹자", "hatchoko meokja", "Let's get cocoa", "mug"),
    Cell("손 시려", "son siryeo", "Cold hands", "rub hands"),
    Cell("코트 입어", "koteu ibeo", "Wear a coat", "zip coat"),
    Cell("산책 좋다", "sanchaek jota", "Nice walk", "stroll"),
    Cell("집에 가자", "jibe gaja", "Let's go home", "wave bye"),
  ], ["fall"]),
  cute("school-morning", "School morning words in Korean", "otter", [
    Cell("알람이다", "allamida", "Alarm!", "wake up"),
    Cell("늦었어", "neujeosseo", "I'm late", "run"),
    Cell("가방 챙겼어?", "gabang chaenggyeosseo?", "Bag packed?", "backpack"),
    Cell("버스 타자", "beoseu taja", "Catch the bus", "bus stop"),
    Cell("출석!", "chulseok!", "Present!", "hand raise"),
    Cell("집중해", "jipjunghae", "Focus", "study face"),
    Cell("급식 시간", "geupsik sigan", "Lunch time", "tray"),
    Cell("숙제 했어?", "sukje haesseo?", "Homework done?", "notebook"),
    Cell("하교하자", "hagyohaja", "School's out", "freedom"),
  ], ["school"]),
  cute("craft-day", "Craft day words in Korean", "capybara", [
    Cell("그려볼까", "geuryeobolkka", "Shall we draw?", "brush up"),
    Cell("풀 어디 있지?", "pul eodi itji?", "Where's the glue?", "search"),
    Cell("색 고르자", "saek goreuja", "Pick a color", "palette"),
    Cell("조심해", "josimhae", "Careful", "scissors"),
    Cell("말리자", "mallija", "Let it dry", "wait"),
    Cell("예쁘다", "yeppeuda", "Pretty!", "sparkle eyes"),
    Cell("한 번 더", "han beon deo", "One more try", "retry"),
    Cell("전시하자", "jeonsihaja", "Let's display it", "show off"),
    Cell("정리하자", "jeongnihaja", "Clean up", "tidy table"),
  ], ["diy"]),
  cute("snack-raid", "Snack raid words in Korean", "otter", [
    Cell("배고파", "baegopa", "Hungry", "tummy rumble"),
    Cell("과자 어디?", "gwaja eodi?", "Where are snacks?", "open cabinet"),
    Cell("팝콘 먹자", "papkon meokja", "Popcorn time", "popcorn"),
    Cell("나눠 먹자", "nanwo meokja", "Let's share", "offer"),
    Cell("달다!", "dalda!", "Sweet!", "happy chew"),
    Cell("목이 마르다", "mogi mareuda", "Thirsty", "juice"),
    Cell("한 입만", "han imunman", "Just one bite", "tiny bite"),
    Cell("남았어?", "namasseo?", "Any left?", "peek bag"),
    Cell("배불러", "baebulleo", "Full", "pat belly"),
  ], ["snacks"]),
  cute("gift-wrap", "Gift wrap words in Korean", "capybara", [
    Cell("선물이야", "seonmuriya", "It's a gift", "hold box"),
    Cell("포장하자", "pojanghaja", "Let's wrap", "paper roll"),
    Cell("리본 예쁘다", "ribon yeppeuda", "Cute ribbon", "tie bow"),
    Cell("카드 쓸까?", "kadeu sseulkka?", "Write a card?", "pen"),
    Cell("비밀이야", "bimiriya", "It's a secret", "shh"),
    Cell("두근거려", "dugeungeoryeo", "I'm excited", "heart eyes"),
    Cell("받아줘", "badajwo", "Please take it", "offer gift"),
    Cell("열어봐!", "yeoreobwa!", "Open it!", "bounce"),
    Cell("마음에 들어?", "maeume deureo?", "Do you like it?", "hopeful"),
  ], ["christmas"]),
  cute("thanksgiving-table", "Thanksgiving table words in Korean", "otter", [
    Cell("배고파", "baegopa", "Hungry", "sniff food"),
    Cell("칠면조다", "chilmyeonjoda", "Turkey!", "point turkey"),
    Cell("맛있겠다", "masitgetda", "Looks delicious", "drool cute"),
    Cell("더 주세요", "deo juseyo", "More please", "plate up"),
    Cell("고마워요", "gomawoyo", "Thank you", "bow"),
    Cell("사진 찍자", "sajin jjikja", "Family photo", "group pose"),
    Cell("배불러", "baebulleo", "So full", "lean back"),
    Cell("파이 먹자", "pai meokja", "Pie time", "pie slice"),
    Cell("행복해", "haengbokhae", "I'm happy", "warm hug"),
  ], ["thanksgiving"]),
];

const CMP: VocabBundle[] = [
  cmp("nun-mul-tr", part("눈", "nun", "Eye", "eye"), part("물", "mul", "Water", "drop"), "눈물", "nunmul", "Tears — water from the eyes."),
  cmp("ip-sul-tr", part("입", "ip", "Mouth", "mouth"), part("술", "sul", "Edge", "edge"), "입술", "ipsul", "Lips — edges of the mouth."),
  cmp("bal-mok-tr", part("발", "bal", "Foot", "foot"), part("목", "mok", "Neck", "joint"), "발목", "balmok", "Ankle — neck of the foot."),
  cmp("son-mok-tr", part("손", "son", "Hand", "hand"), part("목", "mok", "Neck", "joint"), "손목", "sonmok", "Wrist — neck of the hand."),
  cmp("son-garak-tr", part("손", "son", "Hand", "hand"), part("가락", "garak", "Digit", "stick"), "손가락", "songarak", "Finger — a digit of the hand."),
  cmp("bal-garak-tr", part("발", "bal", "Foot", "foot"), part("가락", "garak", "Digit", "stick"), "발가락", "balgarak", "Toe — a digit of the foot."),
  cmp("bi-mul", part("비", "bi", "Rain", "rain"), part("물", "mul", "Water", "water"), "비물", "bimul", "Rainwater — water from rain."),
  cmp("kkot-byeong", part("꽃", "kkot", "Flower", "flower"), part("병", "byeong", "Bottle/vase", "vase"), "꽃병", "kkotbyeong", "Vase — flower bottle."),
];

const PAD_GRID: VocabBundle[] = [
  grid("nye-party", "New Year party words in Korean", [
    "party", "countdown", "firework", "toast", "resolution", "kiss", "clock", "champagne", "friend",
  ], ["nye"]),
  grid("valentine-prep", "Valentine prep words in Korean", [
    "chocolate", "card", "rose", "date", "heart", "letter", "ribbon", "candle", "dessert",
  ], ["valentine"]),
  grid("hanukkah-lights", "Holiday light words in Korean", [
    "candle", "light", "flame", "night", "family", "song", "table", "gift", "warm",
  ], ["hanukkah"]),
  grid("messenger-bag", "Messenger bag words in Korean", [
    "strap", "buckle", "pocket", "laptop", "charger", "keys", "wallet", "umbrella", "bottle",
  ], ["bags"]),
  grid("august-nails-2", "August nail ideas in Korean", [
    "french tip", "ombre", "glitter", "matte", "chrome", "heart", "star", "flower", "stripe",
  ], ["nails"]),
  grid("fall-activities-2", "Fall activity words in Korean", [
    "apple picking", "picnic", "hike", "campfire", "movie", "bake", "read", "market", "photo",
  ], ["fall"]),
  grid("costume-shop", "Costume shop words in Korean", [
    "size", "mirror", "try on", "rental", "accessory", "wig", "shoes", "receipt", "bag",
  ], ["halloween"]),
  grid("study-desk", "Study desk words in Korean", [
    "lamp", "chair", "monitor", "keyboard", "mouse", "mug", "sticky note", "calendar", "headset",
  ], ["school"]),
  grid("thanksgiving-sides", "Thanksgiving sides in Korean", [
    "gravy", "corn", "rolls", "salad", "beans", "stuffing", "cranberry", "potato", "pie",
  ], ["thanksgiving"]),
  grid("christmas-kitchen", "Christmas kitchen words in Korean", [
    "oven", "cookie", "flour", "sugar", "butter", "mixing bowl", "tray", "icing", "sprinkles",
  ], ["christmas"]),
];

const PAD_ANT: VocabBundle[] = [
  ant("thick-thin-nails", "Thick nails", "Thin nails", "nails"),
  ant("matte-glossy", "Matte", "Glossy", "nails"),
  ant("left-right-bag", "Left pocket", "Right pocket", "bags"),
  ant("morning-evening-study", "Morning study", "Evening study", "school"),
  ant("solo-group-party", "Solo", "Group", "halloween"),
  ant("homemade-storebought", "Homemade", "Store-bought", "thanksgiving"),
  ant("short-long-scarf", "Short scarf", "Long scarf", "fall"),
  ant("paper-digital-invite", "Paper invite", "Digital invite", "party"),
  ant("buy-borrow-costume", "Buy costume", "Borrow costume", "halloween"),
  ant("early-late-nye", "Early night", "Late night", "nye"),
];

const PAD_LIST: VocabBundle[] = [
  list("office-desk", "Office desk words in Korean", 9, "monitor→mug", ["work"], [
    "monitor", "keyboard", "mouse", "notebook", "sticky note", "pen", "mug", "headset", "charger",
  ]),
  list("rainy-commute", "Rainy commute words in Korean", 9, "umbrella→boots", ["weather"], [
    "umbrella", "raincoat", "boots", "puddle", "bus", "subway", "towel", "hot pack", "coffee",
  ]),
  list("movie-night", "Movie night words in Korean", 9, "sofa→credits", ["hobby"], [
    "sofa", "blanket", "popcorn", "remote", "movie", "subtitle", "volume", "pause", "credits",
  ]),
  list("market-run", "Market run words in Korean", 9, "cart→bag", ["shopping"], [
    "cart", "basket", "apple", "bread", "milk", "egg", "receipt", "coupon", "bag",
  ]),
];

const PAD_PHRASE: VocabBundle[] = [
  phrase("photo-spot", "Photo spot phrases in Korean", [
    L("여기서 찍자", "yeogiseo jjikja", "Let's take it here"),
    L("웃어봐", "useobwa", "Smile"),
    L("하나 둘 셋", "hana dul set", "One two three"),
    L("다시 찍자", "dasi jjikja", "Retake"),
    L("필터 뭐야?", "pilteo mwoya?", "What filter is that?"),
    L("태그해줘", "taegeuhaejwo", "Tag me"),
    L("스토리 올릴게", "seutori ollilge", "I'll post a story"),
    L("예쁘게 나왔다", "yeppeuge nawatda", "It came out pretty"),
  ], ["social"]),
  phrase("fitting-room", "Fitting room phrases in Korean", [
    L("피팅룸 어디예요?", "pitingrum eodieyoyo?", "Where is the fitting room?"),
    L("사이즈 있어요?", "saijeu isseoyo?", "Do you have my size?"),
    L("조금 커요", "jogeum keoyo", "A bit big"),
    L("다른 색 있어요?", "dareun saek isseoyo?", "Other colors?"),
    L("입어봐도 돼요?", "ibeobwado dwaeyo?", "Can I try it on?"),
    L("이걸로 할게요", "igeollo halgeyo", "I'll take this"),
    L("계산이요", "gyesaniyo", "Checkout please"),
    L("영수증 주세요", "yeongsujeung juseyo", "Receipt please"),
  ], ["shopping"]),
  phrase("late-summer", "Late summer phrases in Korean", [
    L("아직도 더워", "ajikdo deowo", "Still hot"),
    L("선풍기 틀자", "seonpunggi teulja", "Turn on the fan"),
    L("아이스 커피 땡겨", "aiseu keopi ttaenggyeo", "Craving iced coffee"),
    L("저녁에 바람 좋다", "jeonyeoge baram jota", "Nice evening breeze"),
    L("벌레 많다", "beolle manta", "Lots of bugs"),
    L("수영 갈래?", "suyeong gallae?", "Wanna swim?"),
    L("휴가 끝이다", "hyuga kkeutida", "Vacation's over"),
    L("가을 오네", "gaeul one", "Fall is coming"),
  ], ["summer"]),
  phrase("group-project", "Group project phrases in Korean", [
    L("역할 나누자", "yeokhal nanuja", "Let's split roles"),
    L("자료 보냈어", "jaryo bonaesseo", "I sent the files"),
    L("회의 언제 해?", "hoeui eonje hae?", "When's the meeting?"),
    L("마감이 언제야?", "magami eonjeya?", "When's the deadline?"),
    L("내가 발표할게", "naega balpyohalge", "I'll present"),
    L("피드백 줘", "pideubaek jwo", "Give feedback"),
    L("거의 다 됐어", "geoui da dwaesseo", "Almost done"),
    L("제출하자", "jechulhaja", "Let's submit"),
  ], ["school"]),
];

export const TRENDS_KR_2026_08_BUNDLES: VocabBundle[] = [
  ...ANT,
  ...LIST,
  ...GRID,
  ...PHRASE,
  ...CONCEPT,
  ...SIM,
  ...QUIZ,
  ...CUTE,
  ...CMP,
  ...PAD_GRID,
  ...PAD_ANT,
  ...PAD_LIST,
  ...PAD_PHRASE,
];

export const TRENDS_KR_2026_08_COUNT = TRENDS_KR_2026_08_BUNDLES.length;
