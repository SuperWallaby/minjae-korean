/**
 * Thin-format restock — compound / grammar / pronunciation / cute.
 * Target: lift critically low Pinterest pin formats toward ~40–60 ready each.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

/* ── compound_word ─────────────────────────────────────────────── */

type CompoundPart = {
  hangul: string;
  romanization: string;
  english: string;
  icon: string;
};

type CompoundWordData = {
  left: CompoundPart;
  right: CompoundPart;
  resultHangul: string;
  resultRomanization: string;
  resultMeaning: string;
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
  compoundWord?: CompoundWordData;
  grammarSpotlight?: GrammarSpotlightData;
  pronunciationUnit?: {
    hangulUnit: string;
    romanUnit: string;
    unitLabel: string;
    cells: PronunciationCell[];
  };
  cuteCast?: "capybara" | "otter";
  cuteCells?: CuteCell[];
};

function part(
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): CompoundPart {
  return { hangul, romanization, english, icon };
}

function c(
  slug: string,
  data: CompoundWordData,
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `cmp-${slug}`,
    format: "compound_word",
    title: `${data.left.hangul} + ${data.right.hangul} = ${data.resultHangul}`,
    count: 3,
    fit: `Compound equation — ${data.left.english} + ${data.right.english} → ${data.resultHangul}`,
    priority,
    tags: ["compound", "word-blend", "vocabulary", data.resultHangul],
    preview: [
      data.left.hangul,
      data.right.hangul,
      data.resultHangul,
      data.resultMeaning,
    ],
    compoundWord: data,
  };
}

const COMPOUND_RESTOCK: VocabBundle[] = [
  c("son-mok", {
    left: part("손", "son", "Hand", "open hand"),
    right: part("목", "mok", "Neck", "simple neck silhouette"),
    resultHangul: "손목",
    resultRomanization: "son-mok",
    resultMeaning: "Wrist — where your hand meets your arm/neck area.",
  }),
  c("bal-mok", {
    left: part("발", "bal", "Foot", "simple foot"),
    right: part("목", "mok", "Neck", "ankle joint doodle"),
    resultHangul: "발목",
    resultRomanization: "bal-mok",
    resultMeaning: "Ankle — the neck of the foot.",
  }),
  c("nun-mul", {
    left: part("눈", "nun", "Eye", "cute eye"),
    right: part("물", "mul", "Water", "water drop"),
    resultHangul: "눈물",
    resultRomanization: "nun-mul",
    resultMeaning: "Tears — water from the eyes.",
  }),
  c("ip-sul", {
    left: part("입", "ip", "Mouth", "smiling mouth"),
    right: part("술", "sul", "Edge / tip", "soft edge curve"),
    resultHangul: "입술",
    resultRomanization: "ip-sul",
    resultMeaning: "Lips — the edges of the mouth.",
  }),
  c("son-garak", {
    left: part("손", "son", "Hand", "open hand"),
    right: part("가락", "garak", "Digit / stick", "thin stick"),
    resultHangul: "손가락",
    resultRomanization: "son-garak",
    resultMeaning: "Finger — a digit of the hand.",
  }),
  c("bal-garak", {
    left: part("발", "bal", "Foot", "simple foot"),
    right: part("가락", "garak", "Digit / stick", "thin stick"),
    resultHangul: "발가락",
    resultRomanization: "bal-garak",
    resultMeaning: "Toe — a digit of the foot.",
  }),
  c("bit-mul", {
    left: part("빗", "bit", "Rain (bound)", "rain cloud"),
    right: part("물", "mul", "Water", "water drop"),
    resultHangul: "빗물",
    resultRomanization: "bit-mul",
    resultMeaning: "Rainwater.",
  }),
  c("hae-bit", {
    left: part("해", "hae", "Sun", "bright sun"),
    right: part("빛", "bit", "Light", "light rays"),
    resultHangul: "햇빛",
    resultRomanization: "hae-bit",
    resultMeaning: "Sunlight.",
  }),
  c("dal-bit", {
    left: part("달", "dal", "Moon", "crescent moon"),
    right: part("빛", "bit", "Light", "soft glow"),
    resultHangul: "달빛",
    resultRomanization: "dal-bit",
    resultMeaning: "Moonlight.",
  }),
  c("byeol-bit", {
    left: part("별", "byeol", "Star", "twinkling star"),
    right: part("빛", "bit", "Light", "sparkle"),
    resultHangul: "별빛",
    resultRomanization: "byeol-bit",
    resultMeaning: "Starlight.",
  }),
  c("chot-bul", {
    left: part("촛", "chot", "Candle (bound)", "candle stick"),
    right: part("불", "bul", "Fire", "small flame"),
    resultHangul: "촛불",
    resultRomanization: "chot-bul",
    resultMeaning: "Candlelight — fire of a candle.",
  }),
  c("chaek-sang", {
    left: part("책", "chaek", "Book", "closed book"),
    right: part("상", "sang", "Table", "simple table"),
    resultHangul: "책상",
    resultRomanization: "chaek-sang",
    resultMeaning: "Desk — a table for books.",
  }),
  c("mul-byeong", {
    left: part("물", "mul", "Water", "water drop"),
    right: part("병", "byeong", "Bottle", "bottle silhouette"),
    resultHangul: "물병",
    resultRomanization: "mul-byeong",
    resultMeaning: "Water bottle.",
  }),
  c("kkot-byeong", {
    left: part("꽃", "kkot", "Flower", "simple flower"),
    right: part("병", "byeong", "Bottle / vase", "vase silhouette"),
    resultHangul: "꽃병",
    resultRomanization: "kkot-byeong",
    resultMeaning: "Vase — a bottle for flowers.",
  }),
  c("kkot-ip", {
    left: part("꽃", "kkot", "Flower", "simple flower"),
    right: part("잎", "ip", "Leaf", "green leaf"),
    resultHangul: "꽃잎",
    resultRomanization: "kkot-ip",
    resultMeaning: "Petal — a leaf of a flower.",
  }),
  c("chi-yak", {
    left: part("치", "chi", "Teeth (bound)", "tooth"),
    right: part("약", "yak", "Medicine", "toothpaste tube"),
    resultHangul: "치약",
    resultRomanization: "chi-yak",
    resultMeaning: "Toothpaste — medicine for teeth.",
  }),
  c("chi-sol", {
    left: part("치", "chi", "Teeth (bound)", "tooth"),
    right: part("솔", "sol", "Brush", "toothbrush"),
    resultHangul: "칫솔",
    resultRomanization: "chi-sol",
    resultMeaning: "Toothbrush.",
  }),
  c("u-san", {
    left: part("우", "u", "Rain (bound)", "rain cloud"),
    right: part("산", "san", "Cover / shade", "umbrella canopy"),
    resultHangul: "우산",
    resultRomanization: "u-san",
    resultMeaning: "Umbrella — cover for rain.",
  }),
  c("an-gyeong", {
    left: part("안", "an", "Eye (bound)", "eye"),
    right: part("경", "gyeong", "Mirror / lens", "round lens"),
    resultHangul: "안경",
    resultRomanization: "an-gyeong",
    resultMeaning: "Glasses — lenses for the eyes.",
  }),
  c("gang-aji", {
    left: part("강", "gang", "Puppy root", "tiny puppy"),
    right: part("아지", "aji", "Baby animal suffix", "soft baby sparkles"),
    resultHangul: "강아지",
    resultRomanization: "gang-aji",
    resultMeaning: "Puppy — a baby dog.",
  }),
  c("byeong-ari", {
    left: part("병", "byeong", "Chick root", "yellow chick"),
    right: part("아리", "ari", "Baby bird suffix", "soft feathers"),
    resultHangul: "병아리",
    resultRomanization: "byeong-ari",
    resultMeaning: "Chick — a baby chicken.",
  }),
  c("yang-mal", {
    left: part("양", "yang", "Western / sheep-root", "soft sock yarn"),
    right: part("말", "mal", "Socks root", "ankle sock"),
    resultHangul: "양말",
    resultRomanization: "yang-mal",
    resultMeaning: "Socks.",
  }),
  c("jang-gap", {
    left: part("장", "jang", "Leather / palm root", "leather scrap"),
    right: part("갑", "gap", "Cover", "glove cover"),
    resultHangul: "장갑",
    resultRomanization: "jang-gap",
    resultMeaning: "Gloves — covers for the hands.",
  }),
  c("gwi-geori", {
    left: part("귀", "gwi", "Ear", "cute ear"),
    right: part("걸이", "geori", "Hanger / hook", "small hook"),
    resultHangul: "귀걸이",
    resultRomanization: "gwi-geori",
    resultMeaning: "Earring — something that hangs on the ear.",
  }),
  c("mok-geori", {
    left: part("목", "mok", "Neck", "neck silhouette"),
    right: part("걸이", "geori", "Hanger / hook", "necklace chain"),
    resultHangul: "목걸이",
    resultRomanization: "mok-geori",
    resultMeaning: "Necklace — something that hangs on the neck.",
  }),
];

/* ── grammar_spotlight ─────────────────────────────────────────── */

type GrammarSpotlightData = {
  grammarLabel: string;
  grammarEnglish: string;
  koreanBefore: string;
  koreanHighlight: string;
  koreanAfter: string;
  englishBefore: string;
  englishHighlight: string;
  englishAfter: string;
  scene: string;
};

function g(
  slug: string,
  data: GrammarSpotlightData,
  priority: BundlePriority = "high",
): VocabBundle {
  const ko = `${data.koreanBefore}${data.koreanHighlight}${data.koreanAfter}`.trim();
  return {
    id: `gram-${slug}`,
    format: "grammar_spotlight",
    title: `${data.grammarLabel} — ${data.grammarEnglish}`,
    count: 1,
    fit: `Grammar spotlight — ${data.grammarLabel} (${data.grammarEnglish})`,
    priority,
    tags: ["grammar", "spotlight", "sentence", data.grammarLabel],
    preview: [
      ko,
      `${data.englishBefore}${data.englishHighlight}${data.englishAfter}`.trim(),
    ],
    grammarSpotlight: data,
  };
}

const GRAMMAR_RESTOCK: VocabBundle[] = [
  g("can-do", {
    grammarLabel: "-ㄹ/을 수 있다",
    grammarEnglish: "can / be able to",
    koreanBefore: "한국어를 ",
    koreanHighlight: "할 수 있어요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "can speak",
    englishAfter: " Korean.",
    scene:
      "cute capybara holding a Korean textbook with a confident spark — cream pastel doodle, no text",
  }),
  g("cannot-do", {
    grammarLabel: "-ㄹ/을 수 없다",
    grammarEnglish: "cannot",
    koreanBefore: "지금은 ",
    koreanHighlight: "갈 수 없어요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "can't go",
    englishAfter: " right now.",
    scene:
      "cute character looking at a closed door with soft rain outside — cream pastel, no text",
  }),
  g("like-to", {
    grammarLabel: "-는 것을 좋아하다",
    grammarEnglish: "like doing",
    koreanBefore: "책을 ",
    koreanHighlight: "읽는 것을 좋아해요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "like reading",
    englishAfter: " books.",
    scene:
      "cute otter curled up with an open book and warm lamp — cream pastel, no text",
  }),
  g("after-doing", {
    grammarLabel: "-고 나서",
    grammarEnglish: "after doing",
    koreanBefore: "밥을 ",
    koreanHighlight: "먹고 나서",
    koreanAfter: " 산책해요.",
    englishBefore: "",
    englishHighlight: "After eating",
    englishAfter: ", I take a walk.",
    scene:
      "cute empty rice bowl next to walking shoes by the door — cream pastel, no text",
  }),
  g("while-doing", {
    grammarLabel: "-으면서",
    grammarEnglish: "while doing",
    koreanBefore: "음악을 ",
    koreanHighlight: "들으면서",
    koreanAfter: " 공부해요.",
    englishBefore: "I study ",
    englishHighlight: "while listening",
    englishAfter: " to music.",
    scene:
      "cute desk with headphones and notebook side by side — cream pastel, no text",
  }),
  g("if-when", {
    grammarLabel: "-으면",
    grammarEnglish: "if / when",
    koreanBefore: "시간이 ",
    koreanHighlight: "있으면",
    koreanAfter: " 만나요.",
    englishBefore: "",
    englishHighlight: "If you have time",
    englishAfter: ", let's meet.",
    scene:
      "cute calendar with a free afternoon circled and two coffee cups — cream pastel, no text",
  }),
  g("too-also", {
    grammarLabel: "-도",
    grammarEnglish: "also / too",
    koreanBefore: "저도 ",
    koreanHighlight: "가고 싶어요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "want to go too",
    englishAfter: ".",
    scene:
      "cute small character raising a hand to join a group — cream pastel, no text",
  }),
  g("only", {
    grammarLabel: "-만",
    grammarEnglish: "only",
    koreanBefore: "물 ",
    koreanHighlight: "만",
    koreanAfter: " 주세요.",
    englishBefore: "",
    englishHighlight: "Only water",
    englishAfter: ", please.",
    scene:
      "cute glass of water alone on a café table — cream pastel, no text",
  }),
  g("more-than", {
    grammarLabel: "-보다",
    grammarEnglish: "more than",
    koreanBefore: "커피",
    koreanHighlight: "보다",
    koreanAfter: " 차를 좋아해요.",
    englishBefore: "I like tea ",
    englishHighlight: "more than",
    englishAfter: " coffee.",
    scene:
      "cute tea cup glowing brighter than a coffee cup beside it — cream pastel, no text",
  }),
  g("became", {
    grammarLabel: "-아/어지다",
    grammarEnglish: "become / get",
    koreanBefore: "날씨가 ",
    koreanHighlight: "추워졌어요",
    koreanAfter: ".",
    englishBefore: "The weather ",
    englishHighlight: "got cold",
    englishAfter: ".",
    scene:
      "cute scarf and falling leaves by a window — cream pastel, no text",
  }),
  g("seems-like", {
    grammarLabel: "-ㄴ/은 것 같다",
    grammarEnglish: "it seems like",
    koreanBefore: "비가 ",
    koreanHighlight: "올 것 같아요",
    koreanAfter: ".",
    englishBefore: "It ",
    englishHighlight: "seems like",
    englishAfter: " it will rain.",
    scene:
      "cute gray cloud peeking over a soft sky — cream pastel, no text",
  }),
  g("intend-to", {
    grammarLabel: "-려고 하다",
    grammarEnglish: "intend to / plan to",
    koreanBefore: "내년에 한국에 ",
    koreanHighlight: "가려고 해요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "plan to go",
    englishAfter: " to Korea next year.",
    scene:
      "cute passport and boarding pass with a tiny plane — cream pastel, no text",
  }),
  g("even-though", {
    grammarLabel: "-아도/어도",
    grammarEnglish: "even if / even though",
    koreanBefore: "바빠도 ",
    koreanHighlight: "운동해요",
    koreanAfter: ".",
    englishBefore: "",
    englishHighlight: "Even if I'm busy",
    englishAfter: ", I exercise.",
    scene:
      "cute character jogging past a busy desk clock — cream pastel, no text",
  }),
  g("as-soon-as", {
    grammarLabel: "-자마자",
    grammarEnglish: "as soon as",
    koreanBefore: "집에 ",
    koreanHighlight: "오자마자",
    koreanAfter: " 씻어요.",
    englishBefore: "",
    englishHighlight: "As soon as I come home",
    englishAfter: ", I wash up.",
    scene:
      "cute door opening with slippers and a towel waiting — cream pastel, no text",
  }),
  g("because-of", {
    grammarLabel: "-때문에",
    grammarEnglish: "because of",
    koreanBefore: "일 ",
    koreanHighlight: "때문에",
    koreanAfter: " 못 갔어요.",
    englishBefore: "",
    englishHighlight: "Because of work",
    englishAfter: ", I couldn't go.",
    scene:
      "cute laptop with a calendar X over a party invite — cream pastel, no text",
  }),
  g("lets", {
    grammarLabel: "-자 / -ㅂ시다",
    grammarEnglish: "let's",
    koreanBefore: "같이 ",
    koreanHighlight: "먹자",
    koreanAfter: "!",
    englishBefore: "",
    englishHighlight: "Let's eat",
    englishAfter: " together!",
    scene:
      "cute two characters sharing a steaming pot of food — cream pastel, no text",
  }),
  g("should", {
    grammarLabel: "-ㄹ/을까요?",
    grammarEnglish: "shall we? / I wonder",
    koreanBefore: "뭐 ",
    koreanHighlight: "먹을까요",
    koreanAfter: "?",
    englishBefore: "",
    englishHighlight: "What shall we eat",
    englishAfter: "?",
    scene:
      "cute menu board with a thinking sparkle — cream pastel, no text",
  }),
  g("used-to", {
    grammarLabel: "-곤 했다",
    grammarEnglish: "used to",
    koreanBefore: "매일 커피를 ",
    koreanHighlight: "마시곤 했어요",
    koreanAfter: ".",
    englishBefore: "I ",
    englishHighlight: "used to drink",
    englishAfter: " coffee every day.",
    scene:
      "cute faded coffee cup with a soft memory glow — cream pastel, no text",
  }),
  g("have-ever", {
    grammarLabel: "-아/어 본 적 있다",
    grammarEnglish: "have ever done",
    koreanBefore: "김치를 ",
    koreanHighlight: "만들어 본 적 있어요",
    koreanAfter: "?",
    englishBefore: "Have you ",
    englishHighlight: "ever made",
    englishAfter: " kimchi?",
    scene:
      "cute jar of kimchi with a curious tasting spoon — cream pastel, no text",
  }),
  g("instead-of", {
    grammarLabel: "-지 말고",
    grammarEnglish: "instead of / don't… do",
    koreanBefore: "늦지 ",
    koreanHighlight: "말고",
    koreanAfter: " 일찍 오세요.",
    englishBefore: "",
    englishHighlight: "Don't be late",
    englishAfter: " — come early.",
    scene:
      "cute clock pointing early with a welcoming door mat — cream pastel, no text",
  }),
];

/* ── pronunciation_grid ────────────────────────────────────────── */

type PronunciationCell = {
  hangul: string;
  romanization: string;
  english: string;
  icon: string;
};

type CuteCell = {
  hangul: string;
  romanization: string;
  english: string;
  pose: string;
};

function Cell(
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): PronunciationCell {
  return { hangul, romanization, english, icon };
}

function pron(
  slug: string,
  title: string,
  unit: NonNullable<VocabBundle["pronunciationUnit"]>,
  tags: string[] = [],
  priority: BundlePriority = "high",
): VocabBundle {
  if (unit.cells.length !== 8) {
    throw new Error(`pron-${slug}: need exactly 8 cells (got ${unit.cells.length})`);
  }
  return {
    id: `pron-${slug}`,
    format: "pronunciation_grid",
    title,
    count: 8,
    fit: `2×4 flashcards — all words share ${unit.hangulUnit} (${unit.unitLabel})`,
    priority,
    tags: ["pronunciation", "hangul", "flashcard", "sound-batch", ...tags],
    preview: unit.cells.slice(0, 4).map((c) => c.hangul),
    pronunciationUnit: unit,
  };
}

const PRON_RESTOCK: VocabBundle[] = [
  pron(
    "d-sound",
    "ㄷ words in Korean",
    {
      hangulUnit: "ㄷ",
      romanUnit: "D · d",
      unitLabel: "D/T sound",
      cells: [
        Cell("다리", "dari", "leg / bridge", "bridge"),
        Cell("달", "dal", "moon", "crescent moon"),
        Cell("돈", "don", "money", "coin stack"),
        Cell("도시", "dosi", "city", "skyline"),
        Cell("동물", "dongmul", "animal", "cute animal"),
        Cell("도서관", "doseogwan", "library", "bookshelf"),
        Cell("동생", "dongsaeng", "younger sibling", "small sibling"),
        Cell("두부", "dubu", "tofu", "tofu block"),
      ],
    },
    ["consonant", "ㄷ"],
  ),
  pron(
    "r-sound",
    "ㄹ words in Korean",
    {
      hangulUnit: "ㄹ",
      romanUnit: "R/L · r/l",
      unitLabel: "R/L sound",
      cells: [
        Cell("라면", "ramyeon", "ramen", "ramen bowl"),
        Cell("로봇", "robot", "robot", "cute robot"),
        Cell("라디오", "radio", "radio", "radio set"),
        Cell("레몬", "remon", "lemon", "lemon"),
        Cell("로켓", "roket", "rocket", "rocket"),
        Cell("롤러", "rolleo", "roller", "roller skate"),
        Cell("리본", "ribon", "ribbon", "ribbon bow"),
        Cell("룸", "rum", "room", "hotel room"),
      ],
    },
    ["consonant", "ㄹ"],
  ),
  pron(
    "k-sound",
    "ㅋ words in Korean",
    {
      hangulUnit: "ㅋ",
      romanUnit: "K · k",
      unitLabel: "K aspirated",
      cells: [
        Cell("코", "ko", "nose", "cute nose"),
        Cell("카메라", "kamera", "camera", "camera"),
        Cell("커피", "keopi", "coffee", "coffee cup"),
        Cell("코트", "koteu", "coat", "winter coat"),
        Cell("쿠키", "kuki", "cookie", "cookie"),
        Cell("카드", "kadeu", "card", "credit card"),
        Cell("케이크", "keikeu", "cake", "slice of cake"),
        Cell("키", "ki", "key / height", "key"),
      ],
    },
    ["consonant", "ㅋ"],
  ),
  pron(
    "t-sound",
    "ㅌ words in Korean",
    {
      hangulUnit: "ㅌ",
      romanUnit: "T · t",
      unitLabel: "T aspirated",
      cells: [
        Cell("타요", "tayo", "ride / take", "bus ride"),
        Cell("태양", "taeyang", "sun", "bright sun"),
        Cell("토끼", "tokki", "rabbit", "rabbit"),
        Cell("토마토", "tomato", "tomato", "tomato"),
        Cell("택시", "taeksi", "taxi", "taxi cab"),
        Cell("티셔츠", "tisyeocheu", "T-shirt", "t-shirt"),
        Cell("텔레비전", "tellebijeon", "TV", "TV set"),
        Cell("터널", "teoneol", "tunnel", "tunnel"),
      ],
    },
    ["consonant", "ㅌ"],
  ),
  pron(
    "p-sound",
    "ㅍ words in Korean",
    {
      hangulUnit: "ㅍ",
      romanUnit: "P · p",
      unitLabel: "P aspirated",
      cells: [
        Cell("피자", "pija", "pizza", "pizza slice"),
        Cell("펜", "pen", "pen", "pen"),
        Cell("포도", "podo", "grape", "grapes"),
        Cell("펭귄", "penggwin", "penguin", "penguin"),
        Cell("파티", "pati", "party", "party hat"),
        Cell("팬케이크", "paenkeikeu", "pancake", "pancake stack"),
        Cell("파란색", "paransaek", "blue", "blue paint"),
        Cell("표", "pyo", "ticket", "ticket stub"),
      ],
    },
    ["consonant", "ㅍ"],
  ),
  pron(
    "kk-tense",
    "ㄲ words in Korean",
    {
      hangulUnit: "ㄲ",
      romanUnit: "Kk · kk",
      unitLabel: "tense K",
      cells: [
        Cell("꼬리", "kkori", "tail", "animal tail"),
        Cell("꽃", "kkot", "flower", "flower"),
        Cell("꿈", "kkum", "dream", "cloud dream"),
        Cell("꿀", "kkul", "honey", "honey jar"),
        Cell("까마귀", "kkamagwi", "crow", "crow"),
        Cell("껌", "kkeom", "gum", "gum pack"),
        Cell("끝", "kkeut", "end", "finish flag"),
        Cell("깨끗하다", "kkaekkeuthada", "clean", "sparkle clean"),
      ],
    },
    ["consonant", "ㄲ"],
  ),
  pron(
    "tt-tense",
    "ㄸ words in Korean",
    {
      hangulUnit: "ㄸ",
      romanUnit: "Tt · tt",
      unitLabel: "tense T",
      cells: [
        Cell("딸기", "ttalgi", "strawberry", "strawberry"),
        Cell("떡", "tteok", "rice cake", "rice cake"),
        Cell("또", "tto", "again", "loop arrow"),
        Cell("땅", "ttang", "ground / earth", "soil patch"),
        Cell("뜨겁다", "tteugeopda", "hot", "steam cup"),
        Cell("뛰다", "ttwida", "run / jump", "running shoes"),
        Cell("따뜻하다", "ttatteuthada", "warm", "cozy scarf"),
        Cell("뚜껑", "ttukkeong", "lid", "pot lid"),
      ],
    },
    ["consonant", "ㄸ"],
  ),
  pron(
    "pp-tense",
    "ㅃ words in Korean",
    {
      hangulUnit: "ㅃ",
      romanUnit: "Pp · pp",
      unitLabel: "tense P",
      cells: [
        Cell("빵", "ppang", "bread", "bread loaf"),
        Cell("뼈", "ppyeo", "bone", "bone"),
        Cell("뿌리다", "ppurida", "sprinkle", "salt sprinkle"),
        Cell("뽀뽀", "ppoppo", "kiss", "kiss mark"),
        Cell("빨래", "ppallae", "laundry", "laundry basket"),
        Cell("빠르다", "ppareuda", "fast", "running shoes"),
        Cell("뽑다", "ppopda", "pull out", "lottery ticket"),
        Cell("빵집", "ppangjip", "bakery", "bakery shop"),
      ],
    },
    ["consonant", "ㅃ"],
  ),
  pron(
    "ss-tense",
    "ㅆ words in Korean",
    {
      hangulUnit: "ㅆ",
      romanUnit: "Ss · ss",
      unitLabel: "tense S",
      cells: [
        Cell("싸다", "ssada", "cheap / wrap", "price tag"),
        Cell("쓰다", "sseuda", "write / wear / bitter", "pencil"),
        Cell("씨", "ssi", "Mr/Ms / seed", "seed"),
        Cell("싸움", "ssaum", "fight", "crossed sticks soft"),
        Cell("쓰레기", "sseuregi", "trash", "trash bin"),
        Cell("쌀", "ssal", "rice (uncooked)", "rice grains"),
        Cell("쏘다", "ssoda", "shoot", "toy dart"),
        Cell("쑥", "ssuk", "mugwort", "green herb"),
      ],
    },
    ["consonant", "ㅆ"],
  ),
  pron(
    "jj-tense",
    "ㅉ words in Korean",
    {
      hangulUnit: "ㅉ",
      romanUnit: "Jj · jj",
      unitLabel: "tense J",
      cells: [
        Cell("짜다", "jjada", "salty / squeeze", "salt shaker"),
        Cell("찌개", "jjigae", "stew", "stew pot"),
        Cell("쪽", "jjok", "side / page", "page corner"),
        Cell("찍다", "jjikda", "take (photo)", "camera click"),
        Cell("짧다", "jjalbda", "short", "short ruler"),
        Cell("찌다", "jjida", "steam / gain weight", "steam basket"),
        Cell("짝", "jjak", "pair / partner", "pair of socks"),
        Cell("찜", "jjim", "steam dish", "steamed bun"),
      ],
    },
    ["consonant", "ㅉ"],
  ),
  pron(
    "eo-vowel",
    "ㅓ words in Korean",
    {
      hangulUnit: "ㅓ",
      romanUnit: "Eo · eo",
      unitLabel: "EO vowel",
      cells: [
        Cell("언니", "eonni", "older sister", "big sister"),
        Cell("어디", "eodi", "where", "map pin"),
        Cell("엄마", "eomma", "mom", "mom figure"),
        Cell("버스", "beoseu", "bus", "bus"),
        Cell("저녁", "jeonyeok", "evening / dinner", "dinner plate"),
        Cell("선물", "seonmul", "gift", "gift box"),
        Cell("겨울", "gyeoul", "winter", "snowflake"),
        Cell("편지", "pyeonji", "letter", "envelope"),
      ],
    },
    ["vowel", "ㅓ"],
  ),
  pron(
    "o-vowel",
    "ㅗ words in Korean",
    {
      hangulUnit: "ㅗ",
      romanUnit: "O · o",
      unitLabel: "O vowel",
      cells: [
        Cell("오빠", "oppa", "older brother", "big brother"),
        Cell("오이", "oi", "cucumber", "cucumber"),
        Cell("모자", "moja", "hat", "hat"),
        Cell("포도", "podo", "grape", "grapes"),
        Cell("고양이", "goyangi", "cat", "cat"),
        Cell("노을", "noeul", "sunset", "sunset sky"),
        Cell("도로", "doro", "road", "road"),
        Cell("소파", "sopha", "sofa", "sofa"),
      ],
    },
    ["vowel", "ㅗ"],
  ),
  pron(
    "u-vowel",
    "ㅜ words in Korean",
    {
      hangulUnit: "ㅜ",
      romanUnit: "U · u",
      unitLabel: "U vowel",
      cells: [
        Cell("우유", "uyu", "milk", "milk carton"),
        Cell("우산", "usan", "umbrella", "umbrella"),
        Cell("구름", "gureum", "cloud", "cloud"),
        Cell("수업", "sueop", "class", "classroom"),
        Cell("구두", "gudu", "dress shoes", "dress shoe"),
        Cell("우표", "upyo", "stamp", "postage stamp"),
        Cell("친구", "chingu", "friend", "two friends"),
        Cell("수박", "subak", "watermelon", "watermelon"),
      ],
    },
    ["vowel", "ㅜ"],
  ),
  pron(
    "eu-vowel",
    "ㅡ words in Korean",
    {
      hangulUnit: "ㅡ",
      romanUnit: "Eu · eu",
      unitLabel: "EU vowel",
      cells: [
        Cell("음식", "eumsik", "food", "meal tray"),
        Cell("이름", "ireum", "name", "name tag"),
        Cell("음악", "eumak", "music", "music note"),
        Cell("느낌", "neukkim", "feeling", "heart pulse"),
        Cell("그림", "geurim", "picture", "framed drawing"),
        Cell("근육", "geunyuk", "muscle", "flex arm soft"),
        Cell("그릇", "geureut", "bowl", "bowl"),
        Cell("스무", "seumu", "twenty", "number 20"),
      ],
    },
    ["vowel", "ㅡ"],
  ),
  pron(
    "i-vowel",
    "ㅣ words in Korean",
    {
      hangulUnit: "ㅣ",
      romanUnit: "I · i",
      unitLabel: "I vowel",
      cells: [
        Cell("이름", "ireum", "name", "name badge"),
        Cell("시계", "sigye", "clock", "clock"),
        Cell("비", "bi", "rain", "rain drop"),
        Cell("김치", "gimchi", "kimchi", "kimchi jar"),
        Cell("피리", "piri", "flute", "flute"),
        Cell("기지개", "gijigae", "stretch", "morning stretch"),
        Cell("기차", "gicha", "train", "train"),
        Cell("미소", "miso", "smile", "smile"),
      ],
    },
    ["vowel", "ㅣ"],
  ),
];

/* ── cute_cast top-up ──────────────────────────────────────────── */

const CuteCellFn = (
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

const CUTE_RESTOCK: VocabBundle[] = [
  cute("rainy-day", "Rainy day words in Korean", "capybara", [
    CuteCellFn("비 와", "bi wa", "It's raining", "look at sky"),
    CuteCellFn("우산 챙겼어?", "usan chaenggyeosseo?", "Got an umbrella?", "umbrella lift"),
    CuteCellFn("젖었어", "jeojeosseo", "I'm soaked", "drip shake"),
    CuteCellFn("미끄러워", "mikkeureowo", "Slippery", "careful step"),
    CuteCellFn("장마야", "jangmaya", "Monsoon season", "heavy cloud"),
    CuteCellFn("빗소리 좋아", "bitsori joa", "Love rain sounds", "ear perk"),
    CuteCellFn("창밖 봐", "changbak bwa", "Look outside", "window gaze"),
    CuteCellFn("온수 샤워", "onsu syawo", "Hot shower", "steam hug"),
    CuteCellFn("집에서 쉴래", "jibeseo swillae", "Staying in", "cozy blanket"),
  ], ["weather"]),
  cute("market-run", "Market run words in Korean", "capybara", [
    CuteCellFn("장 보러 가", "jang boreo ga", "Going grocery shopping", "tote bag"),
    CuteCellFn("신선해", "sinseonhae", "Fresh", "sniff produce"),
    CuteCellFn("얼마예요?", "eolmayeyo?", "How much?", "price ask"),
    CuteCellFn("덤 주세요", "deom juseyo", "Extra please", "hopeful eyes"),
    CuteCellFn("봉지 하나", "bongji hana", "One bag", "plastic bag"),
    CuteCellFn("계산이요", "gyesaniyo", "Checkout please", "cart push"),
    CuteCellFn("카드로요", "kadeuroyo", "By card", "tap card"),
    CuteCellFn("무거워", "mugeowo", "Heavy", "strain lift"),
    CuteCellFn("집에 갈게", "jibe galge", "Heading home", "full bags"),
  ], ["daily"]),
  cute("study-grind", "Study grind words in Korean", "otter", [
    CuteCellFn("집중해", "jipjunghae", "Focus", "serious face"),
    CuteCellFn("한 장 더", "han jang deo", "One more page", "flip page"),
    CuteCellFn("모르는 단어", "moreuneun dan-eo", "Unknown word", "dictionary"),
    CuteCellFn("복습 타임", "bokseup taim", "Review time", "highlight"),
    CuteCellFn("타이머 돌려", "taimeo dollyeo", "Start timer", "timer"),
    CuteCellFn("졸려…", "jollyeo…", "Sleepy…", "yawn"),
    CuteCellFn("커피 땡겨", "keopi ttaenggyeo", "Need coffee", "mug sip"),
    CuteCellFn("거의 다 했어", "geoui da haesseo", "Almost done", "fist pump"),
    CuteCellFn("오늘 충분해", "oneul chungbunhae", "Enough for today", "close book"),
  ], ["study"]),
  cute("travel-pack", "Travel packing words in Korean", "otter", [
    CuteCellFn("여권 챙겼어?", "yeogwon chaenggyeosseo?", "Passport packed?", "passport"),
    CuteCellFn("충전기!", "chungjeogi!", "Charger!", "cable panic"),
    CuteCellFn("짐 싸자", "jim ssaja", "Let's pack", "suitcase"),
    CuteCellFn("무게 초과?", "muge chogwa?", "Overweight?", "scale worry"),
    CuteCellFn("비행기표", "bihaenggipyo", "Plane ticket", "boarding pass"),
    CuteCellFn("환전했어", "hwanjeonhaesseo", "Exchanged money", "cash fan"),
    CuteCellFn("체크인", "chekeuin", "Check-in", "counter"),
    CuteCellFn("창가 자리", "changga jari", "Window seat", "window seat"),
    CuteCellFn("출발이다!", "chulbalida!", "We're off!", "cheer wave"),
  ], ["travel"]),
  cute("food-order", "Food order words in Korean", "capybara", [
    CuteCellFn("메뉴 주세요", "menyu juseyo", "Menu please", "menu hand"),
    CuteCellFn("추천해 주세요", "chucheonhae juseyo", "Any recommendations?", "curious"),
    CuteCellFn("덜 맵게", "deol maepge", "Less spicy", "mild hand"),
    CuteCellFn("공기밥 추가", "gonggibap chuga", "Extra rice", "rice bowl"),
    CuteCellFn("포장 가능해요?", "pojang ganeunghaeyo?", "Can I get it to go?", "box"),
    CuteCellFn("계산서 주세요", "gyesanseo juseyo", "Check please", "bill"),
    CuteCellFn("맛있어요!", "masisseoyo!", "Delicious!", "sparkle eat"),
    CuteCellFn("배불러", "baebulleo", "I'm full", "happy belly"),
    CuteCellFn("또 올게요", "tto olgeyo", "I'll come again", "bow exit"),
  ], ["food"]),
  cute("weather-mood", "Weather mood words in Korean", "otter", [
    CuteCellFn("맑아", "malga", "Clear skies", "sun stretch"),
    CuteCellFn("흐려", "heuryeo", "Cloudy", "soft cloud"),
    CuteCellFn("더워 죽겠어", "deowo jukgesseo", "So hot", "fan self"),
    CuteCellFn("추워", "chuwo", "Cold", "shiver"),
    CuteCellFn("바람 세다", "baram seda", "Windy", "hair blow"),
    CuteCellFn("습해", "seuphae", "Humid", "sticky face"),
    CuteCellFn("상쾌해", "sangkwaehae", "Refreshing", "deep breath"),
    CuteCellFn("미세먼지", "misemunji", "Fine dust", "mask on"),
    CuteCellFn("날씨 좋다", "nalssi jota", "Nice weather", "arms open"),
  ], ["weather"]),
  cute("pet-care", "Pet day care words in Korean", "capybara", [
    CuteCellFn("산책 갈까?", "sanchaek galkka?", "Wanna walk?", "leash"),
    CuteCellFn("밥 줄까?", "bap julkka?", "Want food?", "bowl fill"),
    CuteCellFn("착하지", "chakhaji", "Good pet", "head pat"),
    CuteCellFn("기다려", "gidaryeo", "Wait", "palm stop"),
    CuteCellFn("이리 와", "iri wa", "Come here", "wave in"),
    CuteCellFn("목욕하자", "mogyokhaja", "Bath time", "soap bubble"),
    CuteCellFn("간식!", "gansik!", "Treat!", "treat toss"),
    CuteCellFn("병원 가자", "byeongwon gaja", "Vet time", "carrier"),
    CuteCellFn("잘 자", "jal ja", "Sleep well", "pet bed"),
  ], ["pets"]),
  cute("self-care", "Self-care words in Korean", "otter", [
    CuteCellFn("물 마셔", "mul masyeo", "Drink water", "bottle sip"),
    CuteCellFn("스트레칭해", "seuteurechinghae", "Stretch", "stretch"),
    CuteCellFn("눈 좀 쉬어", "nun jom swieo", "Rest your eyes", "eye close"),
    CuteCellFn("산책하자", "sanchaekhaja", "Let's walk", "step out"),
    CuteCellFn("일찍 자자", "iljjik jaja", "Early bedtime", "yawn"),
    CuteCellFn("폰 내려", "pon naeryeo", "Put the phone down", "phone away"),
    CuteCellFn("심호흡", "simhoheup", "Deep breath", "breathe"),
    CuteCellFn("칭찬해 줘", "chingchanhae jwo", "Give yourself credit", "mirror smile"),
    CuteCellFn("충분해", "chungbunhae", "You're enough", "soft hug self"),
  ], ["wellness"]),
];

export const THIN_RESTOCK_WAVE_BUNDLES: VocabBundle[] = [
  ...COMPOUND_RESTOCK,
  ...GRAMMAR_RESTOCK,
  ...PRON_RESTOCK,
  ...CUTE_RESTOCK,
];

export const THIN_RESTOCK_COMPOUND = COMPOUND_RESTOCK;
export const THIN_RESTOCK_GRAMMAR = GRAMMAR_RESTOCK;
export const THIN_RESTOCK_PRON = PRON_RESTOCK;
export const THIN_RESTOCK_CUTE = CUTE_RESTOCK;
